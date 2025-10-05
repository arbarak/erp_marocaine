"""
Admin configuration for purchasing app.
"""
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from .models import (
    Supplier, SupplierContact, SupplierPriceList, SupplierCategory,
    RequestForQuotation, RFQLine, RFQSupplierInvitation,
    SupplierQuotation, SupplierQuotationLine,
    PurchaseOrder, PurchaseOrderLine,
    GoodsReceipt, GoodsReceiptLine
)


class SupplierContactInline(admin.TabularInline):
    """Inline admin for supplier contacts."""
    model = SupplierContact
    extra = 0
    fields = ['first_name', 'last_name', 'contact_type', 'email', 'phone', 'is_primary', 'is_active']


class SupplierPriceListInline(admin.TabularInline):
    """Inline admin for supplier price lists."""
    model = SupplierPriceList
    extra = 0
    fields = ['product', 'unit_price', 'currency', 'minimum_quantity', 'valid_from', 'valid_to', 'is_active']


@admin.register(Supplier)
class SupplierAdmin(SimpleHistoryAdmin):
    """Admin for Supplier model."""
    
    list_display = [
        'supplier_code', 'name', 'supplier_type', 'city', 'country',
        'payment_terms', 'is_active', 'is_approved', 'rating', 'created_at'
    ]
    list_filter = [
        'supplier_type', 'is_active', 'is_approved', 'payment_terms',
        'country', 'created_at'
    ]
    search_fields = ['supplier_code', 'name', 'ice', 'if_number', 'email']
    readonly_fields = ['created_at', 'updated_at', 'approved_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'supplier_code', 'name', 'supplier_type',
                'is_active', 'is_approved', 'approved_by', 'approved_at'
            )
        }),
        ('Moroccan Business Identifiers', {
            'fields': ('ice', 'if_number', 'rc')
        }),
        ('Contact Information', {
            'fields': (
                'email', 'phone', 'mobile', 'fax', 'website'
            )
        }),
        ('Address', {
            'fields': (
                'address_line1', 'address_line2', 'city',
                'postal_code', 'state_province', 'country'
            )
        }),
        ('Business Terms', {
            'fields': (
                'payment_terms', 'credit_limit', 'currency'
            )
        }),
        ('Tax Information', {
            'fields': (
                'is_subject_to_vat', 'vat_rate',
                'is_subject_to_withholding', 'withholding_rate'
            )
        }),
        ('Performance', {
            'fields': ('rating',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [SupplierContactInline, SupplierPriceListInline]


@admin.register(SupplierContact)
class SupplierContactAdmin(admin.ModelAdmin):
    """Admin for SupplierContact model."""
    
    list_display = [
        'supplier', 'first_name', 'last_name', 'contact_type',
        'email', 'phone', 'is_primary', 'is_active'
    ]
    list_filter = ['contact_type', 'is_primary', 'is_active']
    search_fields = ['first_name', 'last_name', 'email', 'supplier__name']


@admin.register(SupplierPriceList)
class SupplierPriceListAdmin(admin.ModelAdmin):
    """Admin for SupplierPriceList model."""
    
    list_display = [
        'supplier', 'product', 'unit_price', 'currency',
        'minimum_quantity', 'valid_from', 'valid_to',
        'is_active', 'is_preferred'
    ]
    list_filter = ['currency', 'is_active', 'is_preferred', 'valid_from']
    search_fields = ['supplier__name', 'product__name', 'supplier_product_code']


@admin.register(SupplierCategory)
class SupplierCategoryAdmin(admin.ModelAdmin):
    """Admin for SupplierCategory model."""
    
    list_display = ['code', 'name', 'parent', 'is_active', 'sort_order']
    list_filter = ['is_active', 'parent']
    search_fields = ['code', 'name']


class RFQLineInline(admin.TabularInline):
    """Inline admin for RFQ lines."""
    model = RFQLine
    extra = 0
    fields = ['product', 'quantity', 'uom', 'required_delivery_date', 'specifications']


class RFQSupplierInvitationInline(admin.TabularInline):
    """Inline admin for RFQ supplier invitations."""
    model = RFQSupplierInvitation
    extra = 0
    fields = ['supplier', 'invited_by', 'invited_at', 'response_received', 'response_date']
    readonly_fields = ['invited_at', 'response_date']


@admin.register(RequestForQuotation)
class RequestForQuotationAdmin(SimpleHistoryAdmin):
    """Admin for RequestForQuotation model."""
    
    list_display = [
        'rfq_number', 'title', 'state', 'rfq_date',
        'deadline', 'created_by', 'created_at'
    ]
    list_filter = ['state', 'rfq_date', 'deadline']
    search_fields = ['rfq_number', 'title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'approved_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'rfq_number', 'title', 'description', 'state'
            )
        }),
        ('Dates', {
            'fields': ('rfq_date', 'deadline', 'requested_delivery_date')
        }),
        ('Delivery', {
            'fields': ('delivery_location',)
        }),
        ('Terms', {
            'fields': ('payment_terms', 'currency')
        }),
        ('Approval', {
            'fields': ('created_by', 'approved_by', 'approved_at')
        }),
        ('Notes', {
            'fields': ('notes', 'terms_and_conditions')
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [RFQLineInline, RFQSupplierInvitationInline]


@admin.register(RFQLine)
class RFQLineAdmin(admin.ModelAdmin):
    """Admin for RFQLine model."""
    
    list_display = ['rfq', 'product', 'quantity', 'uom', 'required_delivery_date']
    list_filter = ['required_delivery_date']
    search_fields = ['rfq__rfq_number', 'product__name']


class SupplierQuotationLineInline(admin.TabularInline):
    """Inline admin for supplier quotation lines."""
    model = SupplierQuotationLine
    extra = 0
    fields = ['rfq_line', 'unit_price', 'quantity', 'total_price', 'lead_time_days', 'delivery_date']
    readonly_fields = ['total_price']


@admin.register(SupplierQuotation)
class SupplierQuotationAdmin(admin.ModelAdmin):
    """Admin for SupplierQuotation model."""
    
    list_display = [
        'quotation_number', 'rfq_invitation', 'quotation_date',
        'valid_until', 'state', 'total_amount', 'currency'
    ]
    list_filter = ['state', 'quotation_date', 'valid_until', 'currency']
    search_fields = ['quotation_number', 'rfq_invitation__supplier__name']
    readonly_fields = ['subtotal', 'tax_amount', 'total_amount', 'reviewed_at']
    
    inlines = [SupplierQuotationLineInline]


class PurchaseOrderLineInline(admin.TabularInline):
    """Inline admin for purchase order lines."""
    model = PurchaseOrderLine
    extra = 0
    fields = [
        'product', 'quantity', 'uom', 'unit_price', 'total_price',
        'quantity_received', 'quantity_pending', 'expected_delivery_date'
    ]
    readonly_fields = ['total_price', 'quantity_pending']


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(SimpleHistoryAdmin):
    """Admin for PurchaseOrder model."""
    
    list_display = [
        'po_number', 'supplier', 'state', 'approval_state',
        'order_date', 'expected_delivery_date', 'total_amount', 'currency'
    ]
    list_filter = ['state', 'approval_state', 'order_date', 'currency']
    search_fields = ['po_number', 'supplier__name']
    readonly_fields = [
        'subtotal', 'tax_amount', 'total_amount',
        'approved_at', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'po_number', 'supplier', 'state', 'approval_state'
            )
        }),
        ('Reference Documents', {
            'fields': ('rfq', 'supplier_quotation')
        }),
        ('Dates', {
            'fields': (
                'order_date', 'expected_delivery_date', 'confirmed_delivery_date'
            )
        }),
        ('Delivery', {
            'fields': ('delivery_location', 'delivery_address')
        }),
        ('Terms', {
            'fields': ('payment_terms', 'delivery_terms', 'currency')
        }),
        ('Financial', {
            'fields': ('subtotal', 'tax_amount', 'total_amount')
        }),
        ('Approval', {
            'fields': ('created_by', 'approved_by', 'approved_at')
        }),
        ('Notes', {
            'fields': ('notes', 'terms_and_conditions')
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [PurchaseOrderLineInline]


class GoodsReceiptLineInline(admin.TabularInline):
    """Inline admin for goods receipt lines."""
    model = GoodsReceiptLine
    extra = 0
    fields = [
        'po_line', 'product', 'quantity_ordered', 'quantity_received',
        'quantity_accepted', 'quantity_rejected', 'quality_status',
        'lot_number', 'serial_number'
    ]
    readonly_fields = ['product', 'quantity_ordered']


@admin.register(GoodsReceipt)
class GoodsReceiptAdmin(SimpleHistoryAdmin):
    """Admin for GoodsReceipt model."""
    
    list_display = [
        'grn_number', 'purchase_order', 'supplier', 'state',
        'receipt_date', 'quality_check_passed', 'received_by'
    ]
    list_filter = ['state', 'receipt_date', 'quality_check_required', 'quality_check_passed']
    search_fields = ['grn_number', 'purchase_order__po_number', 'supplier__name']
    readonly_fields = [
        'quality_check_passed', 'quality_check_date', 'posted_at',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'grn_number', 'purchase_order', 'supplier', 'state'
            )
        }),
        ('Receipt Information', {
            'fields': (
                'receipt_date', 'delivery_note_number',
                'vehicle_number', 'driver_name'
            )
        }),
        ('Location', {
            'fields': ('receiving_location',)
        }),
        ('Quality Control', {
            'fields': (
                'quality_check_required', 'quality_check_passed',
                'quality_check_by', 'quality_check_date', 'quality_notes'
            )
        }),
        ('Users', {
            'fields': ('received_by', 'posted_by', 'posted_at')
        }),
        ('Notes', {
            'fields': ('notes', 'rejection_reason')
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [GoodsReceiptLineInline]


@admin.register(GoodsReceiptLine)
class GoodsReceiptLineAdmin(admin.ModelAdmin):
    """Admin for GoodsReceiptLine model."""
    
    list_display = [
        'goods_receipt', 'product', 'quantity_ordered',
        'quantity_received', 'quantity_accepted', 'quality_status'
    ]
    list_filter = ['quality_status', 'goods_receipt__receipt_date']
    search_fields = ['goods_receipt__grn_number', 'product__name']
