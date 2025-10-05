"""
Serializers for inventory app.
"""
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from .models import Warehouse, LocationType, Location, StockQuant, StockMove, StockMoveLine
from .valuation import StockValuation, StockValuationLayer, StockValuationMethod


class WarehouseSerializer(serializers.ModelSerializer):
    """Serializer for Warehouse model."""
    
    locations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Warehouse
        fields = [
            'id', 'name', 'code', 'description', 'address_line1',
            'address_line2', 'city', 'postal_code', 'state_province',
            'country', 'phone', 'email', 'is_active', 'is_default',
            'locations_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_locations_count(self, obj):
        """Get count of locations in this warehouse."""
        return obj.locations.filter(is_active=True).count()


class LocationTypeSerializer(serializers.ModelSerializer):
    """Serializer for LocationType model."""
    
    class Meta:
        model = LocationType
        fields = [
            'id', 'name', 'code', 'usage', 'description',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LocationSerializer(serializers.ModelSerializer):
    """Serializer for Location model."""
    
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    location_type_name = serializers.CharField(source='location_type.name', read_only=True)
    full_path = serializers.ReadOnlyField()
    
    class Meta:
        model = Location
        fields = [
            'id', 'warehouse', 'warehouse_name', 'location_type',
            'location_type_name', 'name', 'code', 'description',
            'parent', 'barcode', 'is_active', 'is_scrap_location',
            'is_return_location', 'full_path', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StockQuantSerializer(serializers.ModelSerializer):
    """Serializer for StockQuant model."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)
    location_name = serializers.CharField(source='location.full_path', read_only=True)
    available_quantity = serializers.ReadOnlyField()
    
    class Meta:
        model = StockQuant
        fields = [
            'id', 'product', 'product_name', 'product_reference',
            'location', 'location_name', 'quantity', 'reserved_quantity',
            'available_quantity', 'cost_price', 'total_value',
            'lot_number', 'serial_number', 'expiry_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_value', 'created_at', 'updated_at']


class StockMoveLineSerializer(serializers.ModelSerializer):
    """Serializer for StockMoveLine model."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.internal_reference', read_only=True)
    
    class Meta:
        model = StockMoveLine
        fields = [
            'id', 'product', 'product_name', 'product_reference',
            'quantity_planned', 'quantity_done', 'unit_cost',
            'lot_number', 'serial_number', 'state',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'state', 'created_at', 'updated_at']
    
    def validate_quantity_planned(self, value):
        """Validate planned quantity is positive."""
        if value <= 0:
            raise serializers.ValidationError(_('Planned quantity must be positive'))
        return value


class StockMoveSerializer(serializers.ModelSerializer):
    """Serializer for StockMove model."""
    
    source_location_name = serializers.CharField(source='source_location.full_path', read_only=True)
    destination_location_name = serializers.CharField(source='destination_location.full_path', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    confirmed_by_name = serializers.CharField(source='confirmed_by.get_full_name', read_only=True)
    lines = StockMoveLineSerializer(many=True, read_only=True)
    
    class Meta:
        model = StockMove
        fields = [
            'id', 'name', 'move_type', 'state', 'scheduled_date',
            'effective_date', 'origin_document', 'origin_reference',
            'source_location', 'source_location_name',
            'destination_location', 'destination_location_name',
            'created_by', 'created_by_name', 'confirmed_by',
            'confirmed_by_name', 'notes', 'lines',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'state', 'effective_date', 'created_by',
            'confirmed_by', 'created_at', 'updated_at'
        ]


class StockMoveCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating stock moves."""
    
    lines = StockMoveLineSerializer(many=True)
    
    class Meta:
        model = StockMove
        fields = [
            'name', 'move_type', 'scheduled_date', 'origin_document',
            'origin_reference', 'source_location', 'destination_location',
            'notes', 'lines'
        ]
    
    def create(self, validated_data):
        """Create stock move with lines."""
        lines_data = validated_data.pop('lines')
        
        # Set company and created_by
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        
        # Generate name if not provided
        if not validated_data.get('name'):
            from core.sequences.services import SequenceService
            _, formatted_number = SequenceService.get_next_number(
                company=validated_data['company'],
                document_type='INTERNAL',  # Default for stock moves
                user=validated_data['created_by']
            )
            validated_data['name'] = formatted_number
        
        stock_move = StockMove.objects.create(**validated_data)
        
        # Create move lines
        for line_data in lines_data:
            StockMoveLine.objects.create(move=stock_move, **line_data)
        
        return stock_move
    
    def validate(self, data):
        """Validate stock move data."""
        if not data.get('lines'):
            raise serializers.ValidationError(_('At least one move line is required'))
        
        # Validate locations based on move type
        source_location = data['source_location']
        destination_location = data['destination_location']
        
        if source_location == destination_location:
            raise serializers.ValidationError(
                _('Source and destination locations cannot be the same')
            )
        
        return data


class InventoryAdjustmentSerializer(serializers.Serializer):
    """Serializer for inventory adjustments."""
    
    product = serializers.UUIDField()
    location = serializers.UUIDField()
    new_quantity = serializers.DecimalField(
        max_digits=15,
        decimal_places=6,
        min_value=Decimal('0')
    )
    reason = serializers.CharField(max_length=200)
    lot_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    serial_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    def validate_product(self, value):
        """Validate product exists and belongs to company."""
        from modules.catalog.models import Product
        
        try:
            product = Product.objects.get(
                id=value,
                company=self.context['request'].user.current_company
            )
            if not product.track_inventory:
                raise serializers.ValidationError(
                    _('This product does not track inventory')
                )
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError(_('Product not found'))
    
    def validate_location(self, value):
        """Validate location exists and belongs to company."""
        try:
            location = Location.objects.get(
                id=value,
                warehouse__company=self.context['request'].user.current_company
            )
            return value
        except Location.DoesNotExist:
            raise serializers.ValidationError(_('Location not found'))


class StockTransferSerializer(serializers.Serializer):
    """Serializer for stock transfers."""
    
    product = serializers.UUIDField()
    source_location = serializers.UUIDField()
    destination_location = serializers.UUIDField()
    quantity = serializers.DecimalField(
        max_digits=15,
        decimal_places=6,
        min_value=Decimal('0.000001')
    )
    reason = serializers.CharField(max_length=200, required=False, allow_blank=True)
    lot_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    serial_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate transfer data."""
        if data['source_location'] == data['destination_location']:
            raise serializers.ValidationError(
                _('Source and destination locations cannot be the same')
            )
        
        # Validate sufficient stock
        from modules.catalog.models import Product
        
        try:
            product = Product.objects.get(
                id=data['product'],
                company=self.context['request'].user.current_company
            )
        except Product.DoesNotExist:
            raise serializers.ValidationError({'product': _('Product not found')})
        
        try:
            source_location = Location.objects.get(
                id=data['source_location'],
                warehouse__company=self.context['request'].user.current_company
            )
        except Location.DoesNotExist:
            raise serializers.ValidationError({'source_location': _('Source location not found')})
        
        # Check available stock
        available_stock = product.get_available_stock(source_location)
        if data['quantity'] > available_stock:
            raise serializers.ValidationError(
                _('Insufficient stock. Available: {}').format(available_stock)
            )
        
        return data


class InventoryReportSerializer(serializers.Serializer):
    """Serializer for inventory reports."""

    product_id = serializers.UUIDField()
    product_name = serializers.CharField()
    internal_reference = serializers.CharField()
    category_name = serializers.CharField()
    warehouse_name = serializers.CharField()
    location_name = serializers.CharField()
    quantity = serializers.DecimalField(max_digits=15, decimal_places=6)
    reserved_quantity = serializers.DecimalField(max_digits=15, decimal_places=6)
    available_quantity = serializers.DecimalField(max_digits=15, decimal_places=6)
    cost_price = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    lot_number = serializers.CharField(allow_blank=True)
    serial_number = serializers.CharField(allow_blank=True)
    last_updated = serializers.DateTimeField()


class StockValuationSerializer(serializers.ModelSerializer):
    """Serializer for StockValuation model."""

    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.internal_reference', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    method_display = serializers.CharField(source='get_valuation_method_display', read_only=True)

    class Meta:
        model = StockValuation
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'warehouse', 'warehouse_name', 'location', 'location_name',
            'valuation_date', 'valuation_method', 'method_display',
            'quantity_on_hand', 'unit_cost', 'total_value',
            'stock_move', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'product_name', 'product_sku', 'warehouse_name',
            'location_name', 'method_display', 'created_at', 'updated_at'
        ]


class StockValuationLayerSerializer(serializers.ModelSerializer):
    """Serializer for StockValuationLayer model."""

    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.internal_reference', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    source_move_reference = serializers.CharField(source='source_move.reference', read_only=True)

    class Meta:
        model = StockValuationLayer
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'warehouse', 'warehouse_name', 'location', 'location_name',
            'layer_date', 'unit_cost', 'original_quantity', 'remaining_quantity',
            'original_value', 'remaining_value', 'source_move', 'source_move_reference',
            'is_exhausted', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'product_name', 'product_sku', 'warehouse_name',
            'location_name', 'source_move_reference', 'original_value',
            'remaining_value', 'is_exhausted', 'created_at', 'updated_at'
        ]


class ValuationMethodSerializer(serializers.Serializer):
    """Serializer for valuation method choices."""

    code = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField(required=False)


class ValuationComparisonSerializer(serializers.Serializer):
    """Serializer for valuation comparison data."""

    product_id = serializers.UUIDField()
    product_name = serializers.CharField()
    product_sku = serializers.CharField()
    warehouse_name = serializers.CharField()
    location_name = serializers.CharField()
    quantity = serializers.DecimalField(max_digits=15, decimal_places=3)

    # Method-specific valuations
    fifo_unit_cost = serializers.DecimalField(max_digits=15, decimal_places=4, required=False)
    fifo_total_value = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    lifo_unit_cost = serializers.DecimalField(max_digits=15, decimal_places=4, required=False)
    lifo_total_value = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    weighted_avg_unit_cost = serializers.DecimalField(max_digits=15, decimal_places=4, required=False)
    weighted_avg_total_value = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    standard_unit_cost = serializers.DecimalField(max_digits=15, decimal_places=4, required=False)
    standard_total_value = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)


class ValuationSummarySerializer(serializers.Serializer):
    """Serializer for valuation summary data."""

    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_items = serializers.IntegerField()
    method = serializers.CharField()
    valuation_date = serializers.DateTimeField()

    # Breakdown by category
    category_breakdown = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )

    # Breakdown by warehouse
    warehouse_breakdown = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )


class RevaluationRequestSerializer(serializers.Serializer):
    """Serializer for inventory revaluation requests."""

    product_id = serializers.UUIDField(required=False)
    warehouse_id = serializers.UUIDField(required=False)
    location_id = serializers.UUIDField(required=False)
    method = serializers.ChoiceField(
        choices=StockValuationMethod.choices,
        default=StockValuationMethod.WEIGHTED_AVERAGE
    )
    effective_date = serializers.DateTimeField(required=False)
    reason = serializers.CharField(max_length=500, required=False)


class ValuationHistorySerializer(serializers.Serializer):
    """Serializer for valuation history data."""

    product_name = serializers.CharField()
    warehouse_name = serializers.CharField()
    location_name = serializers.CharField()

    valuations = serializers.ListField(
        child=serializers.DictField()
    )
