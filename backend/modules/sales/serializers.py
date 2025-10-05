"""
Serializers for sales app.
"""
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from .models import (
    Customer, CustomerContact, CustomerPriceList,
    SalesQuotation, SalesQuotationLine,
    SalesOrder, SalesOrderLine,
    DeliveryNote, DeliveryNoteLine,
    ReturnNote, ReturnNoteLine
)


class CustomerContactSerializer(serializers.ModelSerializer):
    """Serializer for CustomerContact model."""
    
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = CustomerContact
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'title',
            'department', 'contact_type', 'email', 'phone', 'mobile',
            'is_primary', 'is_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerPriceListSerializer(serializers.ModelSerializer):
    """Serializer for CustomerPriceList model."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)
    
    class Meta:
        model = CustomerPriceList
        fields = [
            'id', 'product', 'product_name', 'product_reference',
            'unit_price', 'currency', 'minimum_quantity',
            'valid_from', 'valid_to', 'is_active',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerListSerializer(serializers.ModelSerializer):
    """Simplified serializer for customer list view."""
    
    contacts_count = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()
    sales_person_name = serializers.CharField(source='sales_person.get_full_name', read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'customer_code', 'name', 'customer_type',
            'email', 'phone', 'city', 'country',
            'payment_terms', 'is_active', 'is_approved',
            'rating', 'sales_person', 'sales_person_name',
            'contacts_count', 'outstanding_balance'
        ]
    
    def get_contacts_count(self, obj):
        """Get count of active contacts."""
        return obj.contacts.filter(is_active=True).count()
    
    def get_outstanding_balance(self, obj):
        """Get outstanding balance."""
        return obj.get_outstanding_balance()


class CustomerDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for customer CRUD operations."""
    
    contacts = CustomerContactSerializer(many=True, read_only=True)
    price_lists = CustomerPriceListSerializer(many=True, read_only=True)
    full_address = serializers.ReadOnlyField()
    outstanding_balance = serializers.SerializerMethodField()
    total_sales = serializers.SerializerMethodField()
    credit_available = serializers.SerializerMethodField()
    sales_person_name = serializers.CharField(source='sales_person.get_full_name', read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'customer_code', 'name', 'customer_type',
            'ice', 'if_number', 'rc', 'email', 'phone', 'mobile',
            'fax', 'website', 'address_line1', 'address_line2',
            'city', 'postal_code', 'state_province', 'country',
            'full_address', 'payment_terms', 'credit_limit', 'currency',
            'is_subject_to_vat', 'vat_rate', 'is_subject_to_withholding',
            'withholding_rate', 'sales_person', 'sales_person_name',
            'price_list', 'rating', 'is_active', 'is_approved',
            'approved_by', 'approved_at', 'notes', 'contacts',
            'price_lists', 'outstanding_balance', 'total_sales',
            'credit_available', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'approved_by', 'approved_at', 'created_at', 'updated_at'
        ]
    
    def get_outstanding_balance(self, obj):
        """Get outstanding balance."""
        return obj.get_outstanding_balance()
    
    def get_total_sales(self, obj):
        """Get total sales this year."""
        return obj.get_total_sales()
    
    def get_credit_available(self, obj):
        """Get available credit."""
        return obj.get_credit_available()
    
    def validate_customer_code(self, value):
        """Validate customer code uniqueness."""
        company = self.context['request'].user.current_company
        
        queryset = Customer.objects.filter(
            company=company,
            customer_code=value
        )
        
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                _('Customer with this code already exists')
            )
        
        return value


class CustomerCreateSerializer(CustomerDetailSerializer):
    """Serializer for creating customers."""
    
    def create(self, validated_data):
        """Create customer with company context."""
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class SalesQuotationLineSerializer(serializers.ModelSerializer):
    """Serializer for SalesQuotationLine model."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)
    uom_symbol = serializers.CharField(source='uom.symbol', read_only=True)
    
    class Meta:
        model = SalesQuotationLine
        fields = [
            'id', 'product', 'product_name', 'product_reference',
            'description', 'quantity', 'uom', 'uom_symbol',
            'unit_price', 'discount_percent', 'discount_amount',
            'total_price', 'expected_delivery_date', 'tax_rate',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_price', 'created_at', 'updated_at']


class SalesQuotationSerializer(serializers.ModelSerializer):
    """Serializer for SalesQuotation model."""
    
    lines = SalesQuotationLineSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_code = serializers.CharField(source='customer.customer_code', read_only=True)
    delivery_location_name = serializers.CharField(source='delivery_location.full_path', read_only=True)
    sales_person_name = serializers.CharField(source='sales_person.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = SalesQuotation
        fields = [
            'id', 'quotation_number', 'customer', 'customer_name',
            'customer_code', 'quotation_date', 'valid_until', 'state',
            'delivery_location', 'delivery_location_name', 'delivery_address',
            'expected_delivery_date', 'payment_terms', 'delivery_terms',
            'currency', 'subtotal', 'discount_amount', 'tax_amount',
            'total_amount', 'sales_person', 'sales_person_name',
            'created_by', 'created_by_name', 'confirmed_by_customer',
            'customer_confirmation_date', 'customer_reference',
            'notes', 'terms_and_conditions', 'lines',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'state', 'subtotal', 'tax_amount', 'total_amount',
            'confirmed_by_customer', 'customer_confirmation_date',
            'created_by', 'created_at', 'updated_at'
        ]


class SalesQuotationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating sales quotations."""
    
    lines = SalesQuotationLineSerializer(many=True)
    
    class Meta:
        model = SalesQuotation
        fields = [
            'quotation_number', 'customer', 'quotation_date',
            'valid_until', 'delivery_location', 'delivery_address',
            'expected_delivery_date', 'payment_terms', 'delivery_terms',
            'currency', 'discount_amount', 'sales_person',
            'notes', 'terms_and_conditions', 'lines'
        ]
    
    def create(self, validated_data):
        """Create quotation with lines."""
        lines_data = validated_data.pop('lines')
        
        # Set company and created_by
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        
        # Generate quotation number if not provided
        if not validated_data.get('quotation_number'):
            from core.sequences.services import SequenceService
            _, formatted_number = SequenceService.get_next_number(
                company=validated_data['company'],
                document_type='QUOTE',
                user=validated_data['created_by']
            )
            validated_data['quotation_number'] = formatted_number
        
        quotation = SalesQuotation.objects.create(**validated_data)
        
        # Create quotation lines
        for line_data in lines_data:
            SalesQuotationLine.objects.create(quotation=quotation, **line_data)
        
        # Calculate totals
        quotation.calculate_totals()
        
        return quotation
    
    def validate(self, data):
        """Validate quotation data."""
        if not data.get('lines'):
            raise serializers.ValidationError(_('At least one quotation line is required'))
        
        return data


class SalesOrderLineSerializer(serializers.ModelSerializer):
    """Serializer for SalesOrderLine model."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)
    uom_symbol = serializers.CharField(source='uom.symbol', read_only=True)
    quantity_remaining = serializers.ReadOnlyField()
    is_fully_delivered = serializers.ReadOnlyField()
    
    class Meta:
        model = SalesOrderLine
        fields = [
            'id', 'product', 'product_name', 'product_reference',
            'description', 'quantity', 'uom', 'uom_symbol',
            'unit_price', 'discount_percent', 'discount_amount',
            'total_price', 'quantity_delivered', 'quantity_pending',
            'quantity_remaining', 'is_fully_delivered',
            'requested_delivery_date', 'tax_rate', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_price', 'quantity_delivered', 'quantity_pending',
            'created_at', 'updated_at'
        ]


class SalesOrderSerializer(serializers.ModelSerializer):
    """Serializer for SalesOrder model."""
    
    lines = SalesOrderLineSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_code = serializers.CharField(source='customer.customer_code', read_only=True)
    quotation_number = serializers.CharField(source='quotation.quotation_number', read_only=True)
    delivery_location_name = serializers.CharField(source='delivery_location.full_path', read_only=True)
    sales_person_name = serializers.CharField(source='sales_person.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = SalesOrder
        fields = [
            'id', 'order_number', 'customer', 'customer_name',
            'customer_code', 'quotation', 'quotation_number',
            'customer_reference', 'order_date', 'requested_delivery_date',
            'confirmed_delivery_date', 'state', 'delivery_location',
            'delivery_location_name', 'delivery_address', 'shipping_method',
            'payment_terms', 'delivery_terms', 'currency',
            'subtotal', 'discount_amount', 'tax_amount', 'total_amount',
            'sales_person', 'sales_person_name', 'created_by',
            'created_by_name', 'notes', 'terms_and_conditions',
            'lines', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'state', 'confirmed_delivery_date', 'subtotal',
            'tax_amount', 'total_amount', 'created_by',
            'created_at', 'updated_at'
        ]


class SalesOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating sales orders."""
    
    lines = SalesOrderLineSerializer(many=True)
    
    class Meta:
        model = SalesOrder
        fields = [
            'order_number', 'customer', 'quotation', 'customer_reference',
            'order_date', 'requested_delivery_date', 'delivery_location',
            'delivery_address', 'shipping_method', 'payment_terms',
            'delivery_terms', 'currency', 'discount_amount',
            'sales_person', 'notes', 'terms_and_conditions', 'lines'
        ]
    
    def create(self, validated_data):
        """Create sales order with lines."""
        lines_data = validated_data.pop('lines')
        
        # Set company and created_by
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        
        # Generate order number if not provided
        if not validated_data.get('order_number'):
            from core.sequences.services import SequenceService
            _, formatted_number = SequenceService.get_next_number(
                company=validated_data['company'],
                document_type='SO',
                user=validated_data['created_by']
            )
            validated_data['order_number'] = formatted_number
        
        sales_order = SalesOrder.objects.create(**validated_data)
        
        # Create SO lines
        for line_data in lines_data:
            SalesOrderLine.objects.create(sales_order=sales_order, **line_data)
        
        # Calculate totals
        sales_order.calculate_totals()
        
        return sales_order
    
    def validate(self, data):
        """Validate sales order data."""
        if not data.get('lines'):
            raise serializers.ValidationError(_('At least one sales order line is required'))
        
        return data


class DeliveryNoteLineSerializer(serializers.ModelSerializer):
    """Serializer for DeliveryNoteLine model."""

    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)

    class Meta:
        model = DeliveryNoteLine
        fields = [
            'id', 'so_line', 'product', 'product_name', 'product_reference',
            'quantity_ordered', 'quantity_to_deliver', 'quantity_delivered',
            'lot_number', 'serial_number', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'product', 'quantity_ordered', 'created_at', 'updated_at']


class DeliveryNoteSerializer(serializers.ModelSerializer):
    """Serializer for DeliveryNote model."""

    lines = DeliveryNoteLineSerializer(many=True, read_only=True)
    sales_order_number = serializers.CharField(source='sales_order.order_number', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    source_location_name = serializers.CharField(source='source_location.full_path', read_only=True)
    prepared_by_name = serializers.CharField(source='prepared_by.get_full_name', read_only=True)
    delivered_by_name = serializers.CharField(source='delivered_by.get_full_name', read_only=True)

    class Meta:
        model = DeliveryNote
        fields = [
            'id', 'delivery_number', 'sales_order', 'sales_order_number',
            'customer', 'customer_name', 'delivery_date', 'actual_delivery_date',
            'delivery_address', 'state', 'shipping_method', 'tracking_number',
            'carrier', 'vehicle_number', 'driver_name', 'driver_phone',
            'source_location', 'source_location_name', 'prepared_by',
            'prepared_by_name', 'delivered_by', 'delivered_by_name',
            'received_by_customer', 'customer_signature',
            'delivery_confirmation_date', 'notes', 'delivery_instructions',
            'lines', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'state', 'actual_delivery_date', 'prepared_by',
            'delivered_by', 'delivery_confirmation_date',
            'created_at', 'updated_at'
        ]


class DeliveryNoteCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating delivery notes."""

    lines = DeliveryNoteLineSerializer(many=True)

    class Meta:
        model = DeliveryNote
        fields = [
            'delivery_number', 'sales_order', 'delivery_date',
            'delivery_address', 'shipping_method', 'tracking_number',
            'carrier', 'vehicle_number', 'driver_name', 'driver_phone',
            'source_location', 'notes', 'delivery_instructions', 'lines'
        ]

    def create(self, validated_data):
        """Create delivery note with lines."""
        lines_data = validated_data.pop('lines')

        # Set company, customer, and prepared_by
        sales_order = validated_data['sales_order']
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['customer'] = sales_order.customer
        validated_data['prepared_by'] = self.context['request'].user

        # Generate delivery number if not provided
        if not validated_data.get('delivery_number'):
            from core.sequences.services import SequenceService
            _, formatted_number = SequenceService.get_next_number(
                company=validated_data['company'],
                document_type='DELIVERY',
                user=validated_data['prepared_by']
            )
            validated_data['delivery_number'] = formatted_number

        delivery_note = DeliveryNote.objects.create(**validated_data)

        # Create delivery lines
        for line_data in lines_data:
            # Get SO line and product information
            so_line = line_data['so_line']
            line_data['product'] = so_line.product
            line_data['quantity_ordered'] = so_line.quantity

            DeliveryNoteLine.objects.create(delivery_note=delivery_note, **line_data)

        return delivery_note

    def validate(self, data):
        """Validate delivery note data."""
        if not data.get('lines'):
            raise serializers.ValidationError(_('At least one delivery line is required'))

        # Validate that all lines belong to the same SO
        sales_order = data['sales_order']
        for line_data in data['lines']:
            so_line = line_data['so_line']
            if so_line.sales_order != sales_order:
                raise serializers.ValidationError(
                    _('All lines must belong to the same sales order')
                )

        return data


class ReturnNoteLineSerializer(serializers.ModelSerializer):
    """Serializer for ReturnNoteLine model."""

    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)

    class Meta:
        model = ReturnNoteLine
        fields = [
            'id', 'delivery_line', 'product', 'product_name', 'product_reference',
            'quantity_delivered', 'quantity_returned', 'quantity_accepted',
            'quantity_rejected', 'quality_status', 'quality_notes',
            'lot_number', 'serial_number', 'return_reason',
            'damage_description', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'product', 'quantity_delivered', 'created_at', 'updated_at']


class ReturnNoteSerializer(serializers.ModelSerializer):
    """Serializer for ReturnNote model."""

    lines = ReturnNoteLineSerializer(many=True, read_only=True)
    sales_order_number = serializers.CharField(source='sales_order.order_number', read_only=True)
    delivery_number = serializers.CharField(source='delivery_note.delivery_number', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    return_location_name = serializers.CharField(source='return_location.full_path', read_only=True)
    received_by_name = serializers.CharField(source='received_by.get_full_name', read_only=True)
    quality_check_by_name = serializers.CharField(source='quality_check_by.get_full_name', read_only=True)
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True)

    class Meta:
        model = ReturnNote
        fields = [
            'id', 'return_number', 'sales_order', 'sales_order_number',
            'delivery_note', 'delivery_number', 'customer', 'customer_name',
            'return_date', 'return_reason', 'return_description', 'state',
            'return_location', 'return_location_name', 'quality_check_required',
            'quality_check_passed', 'quality_check_by', 'quality_check_by_name',
            'quality_check_date', 'quality_notes', 'received_by',
            'received_by_name', 'posted_by', 'posted_by_name', 'posted_at',
            'notes', 'rejection_reason', 'lines', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'state', 'quality_check_passed', 'quality_check_by',
            'quality_check_date', 'posted_by', 'posted_at',
            'created_at', 'updated_at'
        ]


class ReturnNoteCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ReturnNote."""

    lines = ReturnNoteLineSerializer(many=True)

    class Meta:
        model = ReturnNote
        fields = [
            'sales_order', 'delivery_note', 'return_date', 'return_reason',
            'return_description', 'return_location', 'quality_check_required',
            'notes', 'lines'
        ]

    def create(self, validated_data):
        """Create return note with lines."""
        lines_data = validated_data.pop('lines')
        return_note = ReturnNote.objects.create(**validated_data)

        for line_data in lines_data:
            ReturnNoteLine.objects.create(return_note=return_note, **line_data)

        return return_note


class SalesAnalyticsSerializer(serializers.Serializer):
    """Serializer for sales analytics data."""

    period = serializers.CharField()
    total_sales = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_orders = serializers.IntegerField()
    average_order_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    top_products = serializers.ListField(child=serializers.DictField())
    top_customers = serializers.ListField(child=serializers.DictField())


class CustomerPerformanceSerializer(serializers.Serializer):
    """Serializer for customer performance data."""

    customer_id = serializers.UUIDField()
    customer_name = serializers.CharField()
    total_orders = serializers.IntegerField()
    total_sales = serializers.DecimalField(max_digits=15, decimal_places=2)
    average_order_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    last_order_date = serializers.DateField()
    payment_terms_compliance = serializers.DecimalField(max_digits=5, decimal_places=2)
