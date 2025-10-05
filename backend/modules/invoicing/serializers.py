"""
DRF serializers for invoicing module.
"""
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.core.files.uploadedfile import InMemoryUploadedFile
from decimal import Decimal
import uuid

from .models import Invoice, InvoiceLine, Payment, InvoicePayment
from modules.sales.serializers import CustomerListSerializer, SalesOrderSerializer
from modules.purchasing.serializers import SupplierListSerializer, PurchaseOrderSerializer
from modules.catalog.serializers import ProductListSerializer


class InvoiceLineSerializer(serializers.ModelSerializer):
    """Serializer for invoice lines."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.code', read_only=True)
    total_price = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    tax_amount = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = InvoiceLine
        fields = [
            'id', 'product', 'product_name', 'product_code', 'description',
            'quantity', 'unit_price', 'discount_percent', 'discount_amount',
            'tax_rate', 'tax_amount', 'total_price'
        ]
    
    def validate_quantity(self, value):
        """Validate quantity is positive."""
        if value <= 0:
            raise serializers.ValidationError(_('Quantity must be positive'))
        return value
    
    def validate_unit_price(self, value):
        """Validate unit price is not negative."""
        if value < 0:
            raise serializers.ValidationError(_('Unit price cannot be negative'))
        return value


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for invoices."""
    
    lines = InvoiceLineSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    party_name = serializers.SerializerMethodField()
    state_display = serializers.CharField(source='get_state_display', read_only=True)
    invoice_type_display = serializers.CharField(source='get_invoice_type_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'invoice_type', 'invoice_type_display',
            'state', 'state_display', 'customer', 'customer_name',
            'supplier', 'supplier_name', 'party_name', 'sales_order',
            'purchase_order', 'invoice_date', 'due_date', 'payment_terms_days',
            'subtotal', 'tax_amount', 'total_amount', 'paid_amount',
            'outstanding_amount', 'supplier_invoice_number', 'supplier_invoice_date',
            'reference', 'description', 'notes', 'is_overdue', 'days_overdue',
            'created_at', 'updated_at', 'lines'
        ]
        read_only_fields = [
            'id', 'invoice_number', 'subtotal', 'tax_amount', 'total_amount',
            'paid_amount', 'outstanding_amount', 'created_at', 'updated_at'
        ]
    
    def get_party_name(self, obj):
        """Get the name of the invoice party."""
        return obj.get_party_name()
    
    def validate(self, data):
        """Validate invoice data."""
        invoice_type = data.get('invoice_type')
        customer = data.get('customer')
        supplier = data.get('supplier')
        
        if invoice_type in ['CUSTOMER', 'CREDIT_NOTE'] and not customer:
            raise serializers.ValidationError(_('Customer is required for customer invoices'))
        
        if invoice_type in ['SUPPLIER', 'DEBIT_NOTE'] and not supplier:
            raise serializers.ValidationError(_('Supplier is required for supplier invoices'))
        
        if customer and supplier:
            raise serializers.ValidationError(_('Invoice cannot have both customer and supplier'))
        
        return data


class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating invoices with lines."""
    
    lines = InvoiceLineSerializer(many=True)
    
    class Meta:
        model = Invoice
        fields = [
            'invoice_type', 'customer', 'supplier', 'sales_order',
            'purchase_order', 'invoice_date', 'payment_terms_days',
            'supplier_invoice_number', 'supplier_invoice_date',
            'reference', 'description', 'notes', 'lines'
        ]
    
    def create(self, validated_data):
        """Create invoice with lines."""
        lines_data = validated_data.pop('lines')
        invoice = Invoice.objects.create(**validated_data)
        
        for line_data in lines_data:
            InvoiceLine.objects.create(invoice=invoice, **line_data)
        
        # Calculate totals
        invoice.calculate_totals()
        
        return invoice


class InvoiceAttachmentSerializer(serializers.Serializer):
    """Serializer for invoice file attachments."""

    file = serializers.FileField()
    description = serializers.CharField(max_length=255, required=False)

    def validate_file(self, value):
        """Validate uploaded file."""
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError(_('File size cannot exceed 10MB'))

        # Check file type
        allowed_types = [
            'application/pdf', 'image/jpeg', 'image/png', 'image/gif',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]

        if hasattr(value, 'content_type') and value.content_type not in allowed_types:
            raise serializers.ValidationError(_('File type not allowed'))

        return value


class InvoiceEmailSerializer(serializers.Serializer):
    """Serializer for sending invoices via email."""

    to_emails = serializers.ListField(
        child=serializers.EmailField(),
        min_length=1,
        help_text=_('List of recipient email addresses')
    )
    cc_emails = serializers.ListField(
        child=serializers.EmailField(),
        required=False,
        help_text=_('List of CC email addresses')
    )
    subject = serializers.CharField(
        max_length=255,
        required=False,
        help_text=_('Email subject (auto-generated if not provided)')
    )
    message = serializers.CharField(
        required=False,
        help_text=_('Email message body')
    )
    include_pdf = serializers.BooleanField(
        default=True,
        help_text=_('Include PDF attachment')
    )
    send_copy_to_self = serializers.BooleanField(
        default=False,
        help_text=_('Send copy to current user')
    )


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments."""
    
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    party_name = serializers.SerializerMethodField()
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    state_display = serializers.CharField(source='get_state_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_number', 'payment_type', 'payment_type_display',
            'state', 'state_display', 'amount', 'payment_date',
            'payment_method', 'payment_method_display', 'customer',
            'customer_name', 'supplier', 'supplier_name', 'party_name',
            'check_number', 'bank_reference', 'reference', 'description',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'payment_number', 'created_at', 'updated_at'
        ]
    
    def get_party_name(self, obj):
        """Get the name of the payment party."""
        return obj.get_party_name()
    
    def validate(self, data):
        """Validate payment data."""
        payment_type = data.get('payment_type')
        customer = data.get('customer')
        supplier = data.get('supplier')
        
        if payment_type in ['CUSTOMER_PAYMENT', 'REFUND'] and not customer:
            raise serializers.ValidationError(_('Customer is required for customer payments'))
        
        if payment_type in ['SUPPLIER_PAYMENT', 'ADVANCE'] and not supplier:
            raise serializers.ValidationError(_('Supplier is required for supplier payments'))
        
        if customer and supplier:
            raise serializers.ValidationError(_('Payment cannot have both customer and supplier'))
        
        return data


class InvoicePaymentSerializer(serializers.ModelSerializer):
    """Serializer for invoice payment allocations."""
    
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    payment_number = serializers.CharField(source='payment.payment_number', read_only=True)
    invoice_total = serializers.DecimalField(
        source='invoice.total_amount',
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    invoice_outstanding = serializers.DecimalField(
        source='invoice.outstanding_amount',
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = InvoicePayment
        fields = [
            'id', 'invoice', 'invoice_number', 'invoice_total',
            'invoice_outstanding', 'payment', 'payment_number',
            'allocated_amount', 'allocation_date', 'notes',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_allocated_amount(self, value):
        """Validate allocated amount."""
        if value <= 0:
            raise serializers.ValidationError(_('Allocated amount must be positive'))
        return value


class PaymentAllocationSerializer(serializers.Serializer):
    """Serializer for payment allocation requests."""
    
    payment_id = serializers.UUIDField()
    allocations = serializers.ListField(
        child=serializers.DictField(
            child=serializers.DecimalField(max_digits=15, decimal_places=2)
        )
    )
    
    def validate_allocations(self, value):
        """Validate allocation data."""
        for allocation in value:
            if 'invoice_id' not in allocation:
                raise serializers.ValidationError(_('Each allocation must have an invoice_id'))
            if 'amount' not in allocation:
                raise serializers.ValidationError(_('Each allocation must have an amount'))
            if allocation['amount'] <= 0:
                raise serializers.ValidationError(_('Allocation amount must be positive'))
        return value


class InvoiceGenerationSerializer(serializers.Serializer):
    """Serializer for invoice generation from orders."""

    order_id = serializers.UUIDField()
    invoice_date = serializers.DateField(required=False)
    partial_lines = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    supplier_invoice_number = serializers.CharField(max_length=50, required=False)
    supplier_invoice_date = serializers.DateField(required=False)

    def validate_partial_lines(self, value):
        """Validate partial lines data."""
        if value:
            for line in value:
                if 'order_line_id' not in line:
                    raise serializers.ValidationError(_('Each partial line must have an order_line_id'))
                if 'quantity' not in line:
                    raise serializers.ValidationError(_('Each partial line must have a quantity'))
                if line['quantity'] <= 0:
                    raise serializers.ValidationError(_('Partial line quantity must be positive'))
        return value


class CreditNoteSerializer(serializers.Serializer):
    """Serializer for credit note creation."""
    
    original_invoice_id = serializers.UUIDField()
    credit_lines = serializers.ListField(
        child=serializers.DictField(
            child=serializers.DecimalField(max_digits=15, decimal_places=2)
        )
    )
    reason = serializers.CharField(max_length=500, required=False)
    
    def validate_credit_lines(self, value):
        """Validate credit lines data."""
        for line in value:
            if 'invoice_line_id' not in line:
                raise serializers.ValidationError(_('Each credit line must have an invoice_line_id'))
            if 'quantity' not in line:
                raise serializers.ValidationError(_('Each credit line must have a quantity'))
            if line['quantity'] <= 0:
                raise serializers.ValidationError(_('Credit line quantity must be positive'))
        return value


class InvoiceValidationSerializer(serializers.Serializer):
    """Serializer for invoice validation requests."""
    
    invoice_ids = serializers.ListField(
        child=serializers.UUIDField()
    )


class AgingReportSerializer(serializers.Serializer):
    """Serializer for aging report requests."""
    
    report_type = serializers.ChoiceField(choices=['AR', 'AP'])
    as_of_date = serializers.DateField(required=False)
    party_id = serializers.UUIDField(required=False)


class CustomerStatementSerializer(serializers.Serializer):
    """Serializer for customer statement requests."""
    
    customer_id = serializers.UUIDField()
    from_date = serializers.DateField()
    to_date = serializers.DateField()
    
    def validate(self, data):
        """Validate date range."""
        if data['from_date'] > data['to_date']:
            raise serializers.ValidationError(_('From date must be before to date'))
        return data


class CashFlowForecastSerializer(serializers.Serializer):
    """Serializer for cash flow forecast requests."""

    from_date = serializers.DateField()
    to_date = serializers.DateField()

    def validate(self, data):
        """Validate date range."""
        if data['from_date'] > data['to_date']:
            raise serializers.ValidationError(_('From date must be before to date'))
        return data


class RecurringInvoiceSerializer(serializers.Serializer):
    """Serializer for creating recurring invoices."""

    FREQUENCY_CHOICES = [
        ('WEEKLY', _('Weekly')),
        ('MONTHLY', _('Monthly')),
        ('QUARTERLY', _('Quarterly')),
        ('YEARLY', _('Yearly')),
    ]

    template_invoice_id = serializers.UUIDField(
        help_text=_('Invoice to use as template')
    )
    frequency = serializers.ChoiceField(
        choices=FREQUENCY_CHOICES,
        help_text=_('Billing frequency')
    )
    start_date = serializers.DateField(
        help_text=_('Start date for recurring billing')
    )
    end_date = serializers.DateField(
        required=False,
        help_text=_('End date for recurring billing (optional)')
    )
    max_occurrences = serializers.IntegerField(
        required=False,
        min_value=1,
        help_text=_('Maximum number of invoices to generate')
    )
    auto_send = serializers.BooleanField(
        default=False,
        help_text=_('Automatically send invoices when generated')
    )

    def validate(self, data):
        """Validate recurring invoice data."""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError(_('End date must be after start date'))

        if not data.get('end_date') and not data.get('max_occurrences'):
            raise serializers.ValidationError(_('Either end_date or max_occurrences must be specified'))

        return data


class InvoiceTemplateSerializer(serializers.Serializer):
    """Serializer for invoice templates."""

    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False)
    template_data = serializers.JSONField(
        help_text=_('Template configuration in JSON format')
    )
    is_default = serializers.BooleanField(default=False)

    def validate_template_data(self, value):
        """Validate template data structure."""
        required_fields = ['header', 'footer', 'styling']

        if not isinstance(value, dict):
            raise serializers.ValidationError(_('Template data must be a JSON object'))

        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(_(f'Template data must include {field}'))

        return value


class InvoiceApprovalSerializer(serializers.Serializer):
    """Serializer for invoice approval workflow."""

    ACTION_CHOICES = [
        ('APPROVE', _('Approve')),
        ('REJECT', _('Reject')),
        ('REQUEST_CHANGES', _('Request Changes')),
    ]

    action = serializers.ChoiceField(choices=ACTION_CHOICES)
    comments = serializers.CharField(
        required=False,
        help_text=_('Approval comments')
    )

    def validate(self, data):
        """Validate approval data."""
        if data['action'] in ['REJECT', 'REQUEST_CHANGES'] and not data.get('comments'):
            raise serializers.ValidationError(_('Comments are required for rejection or change requests'))

        return data


class BulkInvoiceActionSerializer(serializers.Serializer):
    """Serializer for bulk invoice operations."""

    ACTION_CHOICES = [
        ('VALIDATE', _('Validate')),
        ('POST', _('Post')),
        ('CANCEL', _('Cancel')),
        ('SEND_EMAIL', _('Send Email')),
        ('EXPORT_PDF', _('Export PDF')),
    ]

    invoice_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        help_text=_('List of invoice IDs')
    )
    action = serializers.ChoiceField(choices=ACTION_CHOICES)
    parameters = serializers.JSONField(
        required=False,
        help_text=_('Additional parameters for the action')
    )

    def validate_invoice_ids(self, value):
        """Validate invoice IDs."""
        if len(value) > 100:
            raise serializers.ValidationError(_('Cannot process more than 100 invoices at once'))

        return value


class AdvancedInvoiceFilterSerializer(serializers.Serializer):
    """Serializer for advanced invoice filtering."""

    date_range_start = serializers.DateField(required=False)
    date_range_end = serializers.DateField(required=False)
    amount_min = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    amount_max = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    overdue_only = serializers.BooleanField(default=False)
    days_overdue_min = serializers.IntegerField(required=False, min_value=0)
    payment_status = serializers.ChoiceField(
        choices=[
            ('UNPAID', _('Unpaid')),
            ('PARTIALLY_PAID', _('Partially Paid')),
            ('FULLY_PAID', _('Fully Paid')),
        ],
        required=False
    )
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False
    )

    def validate(self, data):
        """Validate filter parameters."""
        if data.get('date_range_start') and data.get('date_range_end'):
            if data['date_range_start'] > data['date_range_end']:
                raise serializers.ValidationError(_('Start date must be before end date'))

        if data.get('amount_min') and data.get('amount_max'):
            if data['amount_min'] > data['amount_max']:
                raise serializers.ValidationError(_('Minimum amount must be less than maximum amount'))

        return data
