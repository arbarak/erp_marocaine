"""
Serializers for catalog app.
"""
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Category, UnitOfMeasure, Product


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    
    full_path = serializers.ReadOnlyField()
    children_count = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'code', 'parent',
            'image', 'is_active', 'sort_order', 'full_path',
            'children_count', 'products_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_children_count(self, obj):
        """Get count of child categories."""
        return obj.children.filter(is_active=True).count()
    
    def get_products_count(self, obj):
        """Get count of products in this category."""
        return obj.products.filter(is_active=True).count()
    
    def validate_parent(self, value):
        """Validate parent category."""
        if value and self.instance:
            # Prevent circular references
            if value == self.instance:
                raise serializers.ValidationError(_('Category cannot be its own parent'))
            
            # Check if the parent is a descendant
            descendants = self.instance.get_descendants()
            if value in descendants:
                raise serializers.ValidationError(_('Cannot set descendant as parent'))
        
        return value


class CategoryTreeSerializer(serializers.ModelSerializer):
    """Serializer for category tree structure."""
    
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'code', 'sort_order', 'children']
    
    def get_children(self, obj):
        """Get child categories."""
        children = obj.children.filter(is_active=True).order_by('sort_order', 'name')
        return CategoryTreeSerializer(children, many=True).data


class UnitOfMeasureSerializer(serializers.ModelSerializer):
    """Serializer for UnitOfMeasure model."""
    
    base_unit_name = serializers.CharField(source='base_unit.name', read_only=True)
    
    class Meta:
        model = UnitOfMeasure
        fields = [
            'id', 'name', 'symbol', 'type', 'base_unit', 'base_unit_name',
            'conversion_factor', 'is_active', 'rounding_precision',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_conversion_factor(self, value):
        """Validate conversion factor."""
        if value <= 0:
            raise serializers.ValidationError(_('Conversion factor must be positive'))
        return value


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product list view."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    uom_symbol = serializers.CharField(source='uom.symbol', read_only=True)
    current_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'internal_reference', 'barcode',
            'category_name', 'product_type', 'uom_symbol',
            'list_price', 'cost_price', 'current_stock',
            'is_active', 'can_be_sold', 'can_be_purchased'
        ]
    
    def get_current_stock(self, obj):
        """Get current stock quantity."""
        if obj.track_inventory:
            return obj.get_current_stock()
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for product CRUD operations."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    uom_name = serializers.CharField(source='uom.name', read_only=True)
    purchase_uom_name = serializers.CharField(source='purchase_uom.name', read_only=True)
    tax_profile_name = serializers.CharField(source='tax_profile.name', read_only=True)
    current_stock = serializers.SerializerMethodField()
    available_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'internal_reference', 'barcode',
            'category', 'category_name', 'product_type', 'uom', 'uom_name',
            'purchase_uom', 'purchase_uom_name', 'list_price', 'cost_price',
            'tax_profile', 'tax_profile_name', 'track_inventory', 'image',
            'is_active', 'can_be_sold', 'can_be_purchased', 'current_stock',
            'available_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_current_stock(self, obj):
        """Get current stock quantity."""
        if obj.track_inventory:
            return obj.get_current_stock()
        return None
    
    def get_available_stock(self, obj):
        """Get available stock quantity."""
        if obj.track_inventory:
            return obj.get_available_stock()
        return None
    
    def validate_internal_reference(self, value):
        """Validate internal reference uniqueness."""
        company = self.context['request'].user.current_company
        
        queryset = Product.objects.filter(
            company=company,
            internal_reference=value
        )
        
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                _('Product with this internal reference already exists')
            )
        
        return value
    
    def validate_barcode(self, value):
        """Validate barcode uniqueness."""
        if not value:
            return value
        
        company = self.context['request'].user.current_company
        
        queryset = Product.objects.filter(
            company=company,
            barcode=value
        )
        
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                _('Product with this barcode already exists')
            )
        
        return value


class ProductCreateSerializer(ProductDetailSerializer):
    """Serializer for creating products."""
    
    def create(self, validated_data):
        """Create product with company context."""
        validated_data['company'] = self.context['request'].user.current_company
        return super().create(validated_data)


class ProductStockSerializer(serializers.Serializer):
    """Serializer for product stock information."""
    
    product_id = serializers.UUIDField()
    product_name = serializers.CharField()
    internal_reference = serializers.CharField()
    location_id = serializers.UUIDField()
    location_name = serializers.CharField()
    quantity = serializers.DecimalField(max_digits=15, decimal_places=6)
    reserved_quantity = serializers.DecimalField(max_digits=15, decimal_places=6)
    available_quantity = serializers.DecimalField(max_digits=15, decimal_places=6)
    cost_price = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    lot_number = serializers.CharField(allow_blank=True)
    serial_number = serializers.CharField(allow_blank=True)


class ProductValuationSerializer(serializers.Serializer):
    """Serializer for product valuation information."""
    
    product_id = serializers.UUIDField()
    product_name = serializers.CharField()
    internal_reference = serializers.CharField()
    category_name = serializers.CharField()
    total_quantity = serializers.DecimalField(max_digits=15, decimal_places=6)
    average_cost = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    costing_method = serializers.CharField()
    last_updated = serializers.DateTimeField()
