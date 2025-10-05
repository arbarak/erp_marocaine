"""
Serializers for purchasing app.
"""
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from .models import (
    Supplier, SupplierContact, SupplierPriceList, SupplierCategory,
    RequestForQuotation, RFQLine, RFQSupplierInvitation,
    SupplierQuotation, SupplierQuotationLine,
    PurchaseOrder, PurchaseOrderLine,
    GoodsReceipt, GoodsReceiptLine
)


class SupplierContactSerializer(serializers.ModelSerializer):
    """Serializer for SupplierContact model."""
    
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = SupplierContact
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'title',
            'department', 'contact_type', 'email', 'phone', 'mobile',
            'is_primary', 'is_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SupplierPriceListSerializer(serializers.ModelSerializer):
    """Serializer for SupplierPriceList model."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)
    
    class Meta:
        model = SupplierPriceList
        fields = [
            'id', 'product', 'product_name', 'product_reference',
            'supplier_product_code', 'supplier_product_name',
            'unit_price', 'currency', 'minimum_quantity',
            'valid_from', 'valid_to', 'lead_time_days',
            'quality_rating', 'is_active', 'is_preferred',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SupplierListSerializer(serializers.ModelSerializer):
    """Simplified serializer for supplier list view."""
    
    contacts_count = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'supplier_code', 'name', 'supplier_type',
            'email', 'phone', 'city', 'country',
            'payment_terms', 'is_active', 'is_approved',
            'rating', 'contacts_count', 'outstanding_balance'
        ]
    
    def get_contacts_count(self, obj):
        """Get count of active contacts."""
        return obj.contacts.filter(is_active=True).count()
    
    def get_outstanding_balance(self, obj):
        """Get outstanding balance."""
        return obj.get_outstanding_balance()


class SupplierDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for supplier CRUD operations."""
    
    contacts = SupplierContactSerializer(many=True, read_only=True)
    price_lists = SupplierPriceListSerializer(many=True, read_only=True)
    full_address = serializers.ReadOnlyField()
    outstanding_balance = serializers.SerializerMethodField()
    total_purchases = serializers.SerializerMethodField()
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'supplier_code', 'name', 'supplier_type',
            'ice', 'if_number', 'rc', 'email', 'phone', 'mobile',
            'fax', 'website', 'address_line1', 'address_line2',
            'city', 'postal_code', 'state_province', 'country',
            'full_address', 'payment_terms', 'credit_limit', 'currency',
            'is_subject_to_vat', 'vat_rate', 'is_subject_to_withholding',
            'withholding_rate', 'rating', 'is_active', 'is_approved',
            'approved_by', 'approved_at', 'notes', 'contacts',
            'price_lists', 'outstanding_balance', 'total_purchases',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'approved_by', 'approved_at', 'created_at', 'updated_at'
        ]
    
    def get_outstanding_balance(self, obj):
        """Get outstanding balance."""
        return obj.get_outstanding_balance()
    
    def get_total_purchases(self, obj):
        """Get total purchases this year."""
        return obj.get_total_purchases()
    
    def validate_supplier_code(self, value):
        """Validate supplier code uniqueness."""
        company = self.context['request'].user.current_company
        
        queryset = Supplier.objects.filter(
            company=company,
            supplier_code=value
        )
        
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                _('Supplier with this code already exists')
            )
        
        return value


class SupplierCreateSerializer(SupplierDetailSerializer):
    """Serializer for creating suppliers."""
    
    def create(self, validated_data):
        """Create supplier with company context."""
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class RFQLineSerializer(serializers.ModelSerializer):
    """Serializer for RFQLine model."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)
    uom_symbol = serializers.CharField(source='uom.symbol', read_only=True)
    
    class Meta:
        model = RFQLine
        fields = [
            'id', 'product', 'product_name', 'product_reference',
            'description', 'quantity', 'uom', 'uom_symbol',
            'specifications', 'quality_requirements',
            'required_delivery_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RFQSupplierInvitationSerializer(serializers.ModelSerializer):
    """Serializer for RFQSupplierInvitation model."""
    
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    supplier_code = serializers.CharField(source='supplier.supplier_code', read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
    
    class Meta:
        model = RFQSupplierInvitation
        fields = [
            'id', 'supplier', 'supplier_name', 'supplier_code',
            'invited_by', 'invited_by_name', 'invited_at',
            'response_received', 'response_date',
            'invitation_notes', 'response_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'invited_by', 'invited_at', 'response_received',
            'response_date', 'created_at', 'updated_at'
        ]


class RequestForQuotationSerializer(serializers.ModelSerializer):
    """Serializer for RequestForQuotation model."""
    
    lines = RFQLineSerializer(many=True, read_only=True)
    supplier_invitations = RFQSupplierInvitationSerializer(many=True, read_only=True)
    delivery_location_name = serializers.CharField(source='delivery_location.full_path', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = RequestForQuotation
        fields = [
            'id', 'rfq_number', 'title', 'description', 'state',
            'rfq_date', 'deadline', 'delivery_location',
            'delivery_location_name', 'requested_delivery_date',
            'payment_terms', 'currency', 'created_by', 'created_by_name',
            'approved_by', 'approved_by_name', 'approved_at',
            'notes', 'terms_and_conditions', 'lines',
            'supplier_invitations', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'state', 'created_by', 'approved_by', 'approved_at',
            'created_at', 'updated_at'
        ]


class RFQCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating RFQs."""
    
    lines = RFQLineSerializer(many=True)
    
    class Meta:
        model = RequestForQuotation
        fields = [
            'rfq_number', 'title', 'description', 'rfq_date',
            'deadline', 'delivery_location', 'requested_delivery_date',
            'payment_terms', 'currency', 'notes',
            'terms_and_conditions', 'lines'
        ]
    
    def create(self, validated_data):
        """Create RFQ with lines."""
        lines_data = validated_data.pop('lines')
        
        # Set company and created_by
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        
        # Generate RFQ number if not provided
        if not validated_data.get('rfq_number'):
            from core.sequences.services import SequenceService
            _, formatted_number = SequenceService.get_next_number(
                company=validated_data['company'],
                document_type='RFQ',
                user=validated_data['created_by']
            )
            validated_data['rfq_number'] = formatted_number
        
        rfq = RequestForQuotation.objects.create(**validated_data)
        
        # Create RFQ lines
        for line_data in lines_data:
            RFQLine.objects.create(rfq=rfq, **line_data)
        
        return rfq
    
    def validate(self, data):
        """Validate RFQ data."""
        if not data.get('lines'):
            raise serializers.ValidationError(_('At least one RFQ line is required'))
        
        return data


class SupplierQuotationLineSerializer(serializers.ModelSerializer):
    """Serializer for SupplierQuotationLine model."""
    
    product_name = serializers.CharField(source='rfq_line.product.name', read_only=True)
    product_reference = serializers.CharField(source='rfq_line.product.internal_reference', read_only=True)
    
    class Meta:
        model = SupplierQuotationLine
        fields = [
            'id', 'rfq_line', 'product_name', 'product_reference',
            'unit_price', 'quantity', 'total_price',
            'lead_time_days', 'delivery_date',
            'supplier_product_code', 'supplier_product_name',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_price', 'created_at', 'updated_at']


class SupplierQuotationSerializer(serializers.ModelSerializer):
    """Serializer for SupplierQuotation model."""
    
    lines = SupplierQuotationLineSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='rfq_invitation.supplier.name', read_only=True)
    rfq_number = serializers.CharField(source='rfq_invitation.rfq.rfq_number', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    
    class Meta:
        model = SupplierQuotation
        fields = [
            'id', 'rfq_invitation', 'supplier_name', 'rfq_number',
            'quotation_number', 'quotation_date', 'valid_until', 'state',
            'payment_terms', 'delivery_terms', 'warranty_terms',
            'subtotal', 'tax_amount', 'total_amount', 'currency',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at',
            'review_notes', 'notes', 'lines',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'subtotal', 'tax_amount', 'total_amount',
            'reviewed_by', 'reviewed_at', 'created_at', 'updated_at'
        ]


class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    """Serializer for PurchaseOrderLine model."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)
    uom_symbol = serializers.CharField(source='uom.symbol', read_only=True)
    quantity_remaining = serializers.ReadOnlyField()
    is_fully_received = serializers.ReadOnlyField()
    
    class Meta:
        model = PurchaseOrderLine
        fields = [
            'id', 'product', 'product_name', 'product_reference',
            'description', 'supplier_product_code', 'supplier_product_name',
            'quantity', 'uom', 'uom_symbol', 'unit_price', 'total_price',
            'quantity_received', 'quantity_pending', 'quantity_remaining',
            'is_fully_received', 'expected_delivery_date', 'tax_rate',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_price', 'quantity_received', 'quantity_pending',
            'created_at', 'updated_at'
        ]


class PurchaseOrderSerializer(serializers.ModelSerializer):
    """Serializer for PurchaseOrder model."""
    
    lines = PurchaseOrderLineSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    delivery_location_name = serializers.CharField(source='delivery_location.full_path', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'supplier', 'supplier_name',
            'rfq', 'supplier_quotation', 'order_date',
            'expected_delivery_date', 'confirmed_delivery_date',
            'state', 'approval_state', 'delivery_location',
            'delivery_location_name', 'delivery_address',
            'payment_terms', 'delivery_terms', 'currency',
            'subtotal', 'tax_amount', 'total_amount',
            'created_by', 'created_by_name', 'approved_by',
            'approved_by_name', 'approved_at', 'notes',
            'terms_and_conditions', 'lines',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'state', 'approval_state', 'confirmed_delivery_date',
            'subtotal', 'tax_amount', 'total_amount',
            'created_by', 'approved_by', 'approved_at',
            'created_at', 'updated_at'
        ]


class PurchaseOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating purchase orders."""
    
    lines = PurchaseOrderLineSerializer(many=True)
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'po_number', 'supplier', 'rfq', 'supplier_quotation',
            'order_date', 'expected_delivery_date', 'delivery_location',
            'delivery_address', 'payment_terms', 'delivery_terms',
            'currency', 'notes', 'terms_and_conditions', 'lines'
        ]
    
    def create(self, validated_data):
        """Create purchase order with lines."""
        lines_data = validated_data.pop('lines')
        
        # Set company and created_by
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        
        # Generate PO number if not provided
        if not validated_data.get('po_number'):
            from core.sequences.services import SequenceService
            _, formatted_number = SequenceService.get_next_number(
                company=validated_data['company'],
                document_type='PO',
                user=validated_data['created_by']
            )
            validated_data['po_number'] = formatted_number
        
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        # Create PO lines
        for line_data in lines_data:
            PurchaseOrderLine.objects.create(purchase_order=purchase_order, **line_data)
        
        # Calculate totals
        purchase_order.calculate_totals()
        
        return purchase_order
    
    def validate(self, data):
        """Validate purchase order data."""
        if not data.get('lines'):
            raise serializers.ValidationError(_('At least one purchase order line is required'))
        
        return data


class GoodsReceiptLineSerializer(serializers.ModelSerializer):
    """Serializer for GoodsReceiptLine model."""

    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)

    class Meta:
        model = GoodsReceiptLine
        fields = [
            'id', 'po_line', 'product', 'product_name', 'product_reference',
            'quantity_ordered', 'quantity_received', 'quantity_accepted',
            'quantity_rejected', 'quality_status', 'quality_notes',
            'lot_number', 'serial_number', 'expiry_date',
            'damage_description', 'defect_type', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'product', 'created_at', 'updated_at']


class GoodsReceiptSerializer(serializers.ModelSerializer):
    """Serializer for GoodsReceipt model."""

    lines = GoodsReceiptLineSerializer(many=True, read_only=True)
    purchase_order_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    receiving_location_name = serializers.CharField(source='receiving_location.full_path', read_only=True)
    received_by_name = serializers.CharField(source='received_by.get_full_name', read_only=True)
    quality_check_by_name = serializers.CharField(source='quality_check_by.get_full_name', read_only=True)
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True)

    class Meta:
        model = GoodsReceipt
        fields = [
            'id', 'grn_number', 'purchase_order', 'purchase_order_number',
            'supplier', 'supplier_name', 'receipt_date',
            'delivery_note_number', 'vehicle_number', 'driver_name',
            'state', 'receiving_location', 'receiving_location_name',
            'quality_check_required', 'quality_check_passed',
            'quality_check_by', 'quality_check_by_name',
            'quality_check_date', 'quality_notes',
            'received_by', 'received_by_name', 'posted_by',
            'posted_by_name', 'posted_at', 'notes',
            'rejection_reason', 'lines', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'state', 'quality_check_passed', 'quality_check_by',
            'quality_check_date', 'posted_by', 'posted_at',
            'created_at', 'updated_at'
        ]


class GoodsReceiptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating goods receipts."""

    lines = GoodsReceiptLineSerializer(many=True)

    class Meta:
        model = GoodsReceipt
        fields = [
            'grn_number', 'purchase_order', 'receipt_date',
            'delivery_note_number', 'vehicle_number', 'driver_name',
            'receiving_location', 'quality_check_required',
            'notes', 'lines'
        ]

    def create(self, validated_data):
        """Create goods receipt with lines."""
        lines_data = validated_data.pop('lines')

        # Set company, supplier, and received_by
        purchase_order = validated_data['purchase_order']
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['supplier'] = purchase_order.supplier
        validated_data['received_by'] = self.context['request'].user

        # Generate GRN number if not provided
        if not validated_data.get('grn_number'):
            from core.sequences.services import SequenceService
            _, formatted_number = SequenceService.get_next_number(
                company=validated_data['company'],
                document_type='GRN',
                user=validated_data['received_by']
            )
            validated_data['grn_number'] = formatted_number

        goods_receipt = GoodsReceipt.objects.create(**validated_data)

        # Create GRN lines
        for line_data in lines_data:
            # Get PO line and product information
            po_line = line_data['po_line']
            line_data['product'] = po_line.product
            line_data['quantity_ordered'] = po_line.quantity

            GoodsReceiptLine.objects.create(goods_receipt=goods_receipt, **line_data)

        # Set initial state based on quality check requirement
        if goods_receipt.quality_check_required:
            goods_receipt.state = 'QUALITY_CHECK'
        else:
            goods_receipt.state = 'RECEIVED'
        goods_receipt.save()

        return goods_receipt

    def validate(self, data):
        """Validate goods receipt data."""
        if not data.get('lines'):
            raise serializers.ValidationError(_('At least one receipt line is required'))

        # Validate that all lines belong to the same PO
        purchase_order = data['purchase_order']
        for line_data in data['lines']:
            po_line = line_data['po_line']
            if po_line.purchase_order != purchase_order:
                raise serializers.ValidationError(
                    _('All lines must belong to the same purchase order')
                )

        return data


class PurchaseAnalyticsSerializer(serializers.Serializer):
    """Serializer for purchase analytics data."""

    supplier_id = serializers.UUIDField()
    supplier_name = serializers.CharField()
    supplier_code = serializers.CharField()
    total_orders = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    average_order_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    on_time_delivery_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    quality_rating = serializers.IntegerField()
    last_order_date = serializers.DateField()


class SupplierPerformanceSerializer(serializers.Serializer):
    """Serializer for supplier performance metrics."""

    supplier_id = serializers.UUIDField()
    supplier_name = serializers.CharField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    total_orders = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    orders_on_time = serializers.IntegerField()
    orders_late = serializers.IntegerField()
    on_time_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_lead_time = serializers.DecimalField(max_digits=10, decimal_places=2)
    quality_issues = serializers.IntegerField()
    quality_score = serializers.DecimalField(max_digits=5, decimal_places=2)
