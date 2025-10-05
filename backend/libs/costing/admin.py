"""
Admin configuration for costing app.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import CostLayer, StockValuation, CostAdjustment, CostAdjustmentLine


@admin.register(CostLayer)
class CostLayerAdmin(admin.ModelAdmin):
    """Admin for CostLayer model."""
    
    list_display = [
        'product', 'location', 'layer_date', 'unit_cost',
        'original_quantity', 'remaining_quantity', 'remaining_value'
    ]
    list_filter = ['layer_date', 'location__warehouse', 'product__category']
    search_fields = [
        'product__name', 'product__internal_reference',
        'lot_number', 'serial_number'
    ]
    ordering = ['-layer_date']
    
    fieldsets = (
        (_('Product & Location'), {
            'fields': ('product', 'location')
        }),
        (_('Layer Information'), {
            'fields': ('layer_date', 'unit_cost', 'source_move_line')
        }),
        (_('Quantities'), {
            'fields': ('original_quantity', 'remaining_quantity')
        }),
        (_('Lot/Serial'), {
            'fields': ('lot_number', 'serial_number')
        }),
    )
    
    readonly_fields = ['source_move_line']
    
    def get_queryset(self, request):
        """Filter by user's current company."""
        qs = super().get_queryset(request)
        if hasattr(request.user, 'current_company') and request.user.current_company:
            return qs.filter(location__warehouse__company=request.user.current_company)
        return qs.none()
    
    def remaining_value(self, obj):
        """Display remaining value."""
        return obj.remaining_value
    remaining_value.short_description = _('Remaining Value')


@admin.register(StockValuation)
class StockValuationAdmin(admin.ModelAdmin):
    """Admin for StockValuation model."""
    
    list_display = [
        'product', 'location', 'valuation_date', 'quantity',
        'unit_cost', 'total_value', 'costing_method'
    ]
    list_filter = ['valuation_date', 'costing_method', 'location__warehouse', 'product__category']
    search_fields = ['product__name', 'product__internal_reference']
    ordering = ['-valuation_date']
    
    fieldsets = (
        (_('Product & Location'), {
            'fields': ('company', 'product', 'location')
        }),
        (_('Valuation'), {
            'fields': ('valuation_date', 'quantity', 'unit_cost', 'total_value')
        }),
        (_('Method'), {
            'fields': ('costing_method',)
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


class CostAdjustmentLineInline(admin.TabularInline):
    """Inline for CostAdjustmentLine."""
    
    model = CostAdjustmentLine
    extra = 0
    fields = [
        'product', 'location', 'quantity',
        'old_unit_cost', 'new_unit_cost', 'adjustment_amount'
    ]
    readonly_fields = ['adjustment_amount']


@admin.register(CostAdjustment)
class CostAdjustmentAdmin(admin.ModelAdmin):
    """Admin for CostAdjustment model."""
    
    list_display = [
        'reference', 'adjustment_type', 'adjustment_date',
        'created_by', 'is_posted', 'posted_at'
    ]
    list_filter = ['adjustment_type', 'is_posted', 'adjustment_date', 'created_at']
    search_fields = ['reference', 'description', 'reason']
    ordering = ['-adjustment_date']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'company', 'reference', 'adjustment_type',
                'adjustment_date', 'description', 'reason'
            )
        }),
        (_('Status'), {
            'fields': ('is_posted', 'posted_at')
        }),
        (_('User'), {
            'fields': ('created_by',)
        }),
    )
    
    readonly_fields = ['company', 'posted_at', 'created_by']
    inlines = [CostAdjustmentLineInline]
    
    def get_queryset(self, request):
        """Filter by user's current company."""
        qs = super().get_queryset(request)
        if hasattr(request.user, 'current_company') and request.user.current_company:
            return qs.filter(company=request.user.current_company)
        return qs.none()
    
    def save_model(self, request, obj, form, change):
        """Set company and created_by when saving."""
        if not change:
            if hasattr(request.user, 'current_company'):
                obj.company = request.user.current_company
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(CostAdjustmentLine)
class CostAdjustmentLineAdmin(admin.ModelAdmin):
    """Admin for CostAdjustmentLine model."""
    
    list_display = [
        'adjustment', 'product', 'location', 'quantity',
        'old_unit_cost', 'new_unit_cost', 'adjustment_amount'
    ]
    list_filter = ['adjustment__adjustment_type', 'product__category']
    search_fields = [
        'adjustment__reference', 'product__name', 'product__internal_reference'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        (_('Adjustment & Product'), {
            'fields': ('adjustment', 'product', 'location')
        }),
        (_('Quantities & Costs'), {
            'fields': ('quantity', 'old_unit_cost', 'new_unit_cost', 'adjustment_amount')
        }),
    )
    
    readonly_fields = ['adjustment_amount']
    
    def get_queryset(self, request):
        """Filter by user's current company."""
        qs = super().get_queryset(request)
        if hasattr(request.user, 'current_company') and request.user.current_company:
            return qs.filter(adjustment__company=request.user.current_company)
        return qs.none()
