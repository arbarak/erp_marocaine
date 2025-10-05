"""
Admin configuration for inventory app.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from simple_history.admin import SimpleHistoryAdmin
from .models import (
    Warehouse, LocationType, Location, StockQuant,
    StockMove, StockMoveLine
)


@admin.register(Warehouse)
class WarehouseAdmin(SimpleHistoryAdmin):
    """Admin for Warehouse model."""
    
    list_display = ['code', 'name', 'city', 'is_active', 'is_default', 'created_at']
    list_filter = ['is_active', 'is_default', 'country', 'created_at']
    search_fields = ['name', 'code', 'city', 'address_line1']
    ordering = ['code']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('company', 'name', 'code', 'description')
        }),
        (_('Address'), {
            'fields': (
                'address_line1', 'address_line2', 'city',
                'postal_code', 'state_province', 'country'
            )
        }),
        (_('Contact'), {
            'fields': ('phone', 'email')
        }),
        (_('Settings'), {
            'fields': ('is_active', 'is_default')
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


@admin.register(LocationType)
class LocationTypeAdmin(admin.ModelAdmin):
    """Admin for LocationType model."""
    
    list_display = ['code', 'name', 'usage', 'is_active', 'created_at']
    list_filter = ['usage', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['code']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('company', 'name', 'code', 'usage', 'description')
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


@admin.register(Location)
class LocationAdmin(SimpleHistoryAdmin):
    """Admin for Location model."""
    
    list_display = ['code', 'name', 'warehouse', 'location_type', 'parent', 'is_active']
    list_filter = ['warehouse', 'location_type', 'is_active', 'is_scrap_location', 'is_return_location']
    search_fields = ['name', 'code', 'barcode']
    ordering = ['warehouse', 'code']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('warehouse', 'location_type', 'name', 'code', 'description')
        }),
        (_('Hierarchy'), {
            'fields': ('parent',)
        }),
        (_('Physical'), {
            'fields': ('barcode',)
        }),
        (_('Settings'), {
            'fields': ('is_active', 'is_scrap_location', 'is_return_location')
        }),
    )
    
    def get_queryset(self, request):
        """Filter by user's current company."""
        qs = super().get_queryset(request)
        if hasattr(request.user, 'current_company') and request.user.current_company:
            return qs.filter(warehouse__company=request.user.current_company)
        return qs.none()


@admin.register(StockQuant)
class StockQuantAdmin(admin.ModelAdmin):
    """Admin for StockQuant model."""
    
    list_display = [
        'product', 'location', 'quantity', 'reserved_quantity',
        'available_quantity', 'cost_price', 'total_value'
    ]
    list_filter = ['location__warehouse', 'location', 'product__category']
    search_fields = [
        'product__name', 'product__internal_reference',
        'lot_number', 'serial_number'
    ]
    ordering = ['product', 'location']
    
    fieldsets = (
        (_('Product & Location'), {
            'fields': ('product', 'location')
        }),
        (_('Quantities'), {
            'fields': ('quantity', 'reserved_quantity', 'cost_price', 'total_value')
        }),
        (_('Lot/Serial Tracking'), {
            'fields': ('lot_number', 'serial_number', 'expiry_date')
        }),
    )
    
    readonly_fields = ['total_value']
    
    def get_queryset(self, request):
        """Filter by user's current company."""
        qs = super().get_queryset(request)
        if hasattr(request.user, 'current_company') and request.user.current_company:
            return qs.filter(location__warehouse__company=request.user.current_company)
        return qs.none()
    
    def available_quantity(self, obj):
        """Display available quantity."""
        return obj.available_quantity
    available_quantity.short_description = _('Available Quantity')


class StockMoveLineInline(admin.TabularInline):
    """Inline for StockMoveLine."""
    
    model = StockMoveLine
    extra = 0
    fields = [
        'product', 'quantity_planned', 'quantity_done',
        'unit_cost', 'lot_number', 'serial_number', 'state'
    ]
    readonly_fields = ['state']


@admin.register(StockMove)
class StockMoveAdmin(SimpleHistoryAdmin):
    """Admin for StockMove model."""
    
    list_display = [
        'name', 'move_type', 'state', 'scheduled_date',
        'source_location', 'destination_location', 'created_by'
    ]
    list_filter = ['move_type', 'state', 'scheduled_date', 'created_at']
    search_fields = ['name', 'origin_document', 'origin_reference']
    ordering = ['-created_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'company', 'name', 'move_type', 'state',
                'scheduled_date', 'effective_date'
            )
        }),
        (_('Origin'), {
            'fields': ('origin_document', 'origin_reference')
        }),
        (_('Locations'), {
            'fields': ('source_location', 'destination_location')
        }),
        (_('Users'), {
            'fields': ('created_by', 'confirmed_by')
        }),
        (_('Notes'), {
            'fields': ('notes',)
        }),
    )
    
    readonly_fields = ['company', 'state', 'effective_date', 'created_by', 'confirmed_by']
    inlines = [StockMoveLineInline]
    
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


@admin.register(StockMoveLine)
class StockMoveLineAdmin(admin.ModelAdmin):
    """Admin for StockMoveLine model."""
    
    list_display = [
        'move', 'product', 'quantity_planned', 'quantity_done',
        'unit_cost', 'state'
    ]
    list_filter = ['state', 'move__move_type', 'product__category']
    search_fields = [
        'move__name', 'product__name', 'product__internal_reference',
        'lot_number', 'serial_number'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        (_('Move & Product'), {
            'fields': ('move', 'product')
        }),
        (_('Quantities'), {
            'fields': ('quantity_planned', 'quantity_done', 'unit_cost')
        }),
        (_('Lot/Serial'), {
            'fields': ('lot_number', 'serial_number')
        }),
        (_('Status'), {
            'fields': ('state',)
        }),
    )
    
    readonly_fields = ['state']
    
    def get_queryset(self, request):
        """Filter by user's current company."""
        qs = super().get_queryset(request)
        if hasattr(request.user, 'current_company') and request.user.current_company:
            return qs.filter(move__company=request.user.current_company)
        return qs.none()
