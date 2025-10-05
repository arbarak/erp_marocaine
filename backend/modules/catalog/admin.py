"""
Admin configuration for catalog app.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from simple_history.admin import SimpleHistoryAdmin
from .models import Category, UnitOfMeasure, Product


@admin.register(Category)
class CategoryAdmin(SimpleHistoryAdmin):
    """Admin for Category model."""
    
    list_display = ['code', 'name', 'parent', 'is_active', 'sort_order', 'created_at']
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['sort_order', 'name']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('company', 'name', 'code', 'description', 'parent')
        }),
        (_('Display'), {
            'fields': ('image', 'sort_order', 'is_active')
        }),
    )
    
    readonly_fields = ['company']
    
    def get_queryset(self, request):
        """Filter by user's current company."""
        qs = super().get_queryset(request)
        if hasattr(request.user, 'current_company') and request.user.current_company:
            return qs.filter(company=request.user.current_company)
        return qs.none()
    
    def save_model(self, request, obj, form, change):
        """Set company when saving."""
        if not change and hasattr(request.user, 'current_company'):
            obj.company = request.user.current_company
        super().save_model(request, obj, form, change)


@admin.register(UnitOfMeasure)
class UnitOfMeasureAdmin(SimpleHistoryAdmin):
    """Admin for UnitOfMeasure model."""
    
    list_display = ['name', 'symbol', 'type', 'base_unit', 'conversion_factor', 'is_active']
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['name', 'symbol']
    ordering = ['type', 'name']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('company', 'name', 'symbol', 'type')
        }),
        (_('Conversion'), {
            'fields': ('base_unit', 'conversion_factor', 'rounding_precision')
        }),
        (_('Settings'), {
            'fields': ('is_active',)
        }),
    )
    
    readonly_fields = ['company']
    
    def get_queryset(self, request):
        """Filter by user's current company."""
        qs = super().get_queryset(request)
        if hasattr(request.user, 'current_company') and request.user.current_company:
            return qs.filter(company=request.user.current_company)
        return qs.none()
    
    def save_model(self, request, obj, form, change):
        """Set company when saving."""
        if not change and hasattr(request.user, 'current_company'):
            obj.company = request.user.current_company
        super().save_model(request, obj, form, change)


@admin.register(Product)
class ProductAdmin(SimpleHistoryAdmin):
    """Admin for Product model."""
    
    list_display = [
        'internal_reference', 'name', 'category', 'product_type',
        'list_price', 'cost_price', 'is_active', 'can_be_sold', 'can_be_purchased'
    ]
    list_filter = [
        'product_type', 'is_active', 'can_be_sold', 'can_be_purchased',
        'track_inventory', 'category', 'created_at'
    ]
    search_fields = ['name', 'internal_reference', 'barcode', 'description']
    ordering = ['internal_reference']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'company', 'name', 'description', 'internal_reference',
                'barcode', 'category', 'product_type'
            )
        }),
        (_('Units of Measure'), {
            'fields': ('uom', 'purchase_uom')
        }),
        (_('Pricing'), {
            'fields': ('list_price', 'cost_price')
        }),
        (_('Tax & Accounting'), {
            'fields': ('tax_profile',)
        }),
        (_('Inventory'), {
            'fields': ('track_inventory',)
        }),
        (_('Sales & Purchase'), {
            'fields': ('can_be_sold', 'can_be_purchased')
        }),
        (_('Display'), {
            'fields': ('image', 'is_active')
        }),
    )
    
    readonly_fields = ['company']
    
    def get_queryset(self, request):
        """Filter by user's current company."""
        qs = super().get_queryset(request)
        if hasattr(request.user, 'current_company') and request.user.current_company:
            return qs.filter(company=request.user.current_company)
        return qs.none()
    
    def save_model(self, request, obj, form, change):
        """Set company when saving."""
        if not change and hasattr(request.user, 'current_company'):
            obj.company = request.user.current_company
        super().save_model(request, obj, form, change)
