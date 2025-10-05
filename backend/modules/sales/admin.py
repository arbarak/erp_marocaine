"""
Admin configuration for sales app.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from simple_history.admin import SimpleHistoryAdmin

from .models import (
    Customer, CustomerContact, CustomerPriceList,
    SalesQuotation, SalesQuotationLine,
    SalesOrder, SalesOrderLine,
    DeliveryNote, DeliveryNoteLine,
    ReturnNote, ReturnNoteLine
)


class CustomerContactInline(admin.TabularInline):
    """Inline admin for customer contacts."""
    model = CustomerContact
    extra = 1
    fields = ['first_name', 'last_name', 'title', 'contact_type', 'email', 'phone', 'is_primary', 'is_active']


class CustomerPriceListInline(admin.TabularInline):
    """Inline admin for customer price lists."""
    model = CustomerPriceList
    extra = 0
    fields = ['product', 'unit_price', 'currency', 'minimum_quantity', 'valid_from', 'valid_to', 'is_active']
    readonly_fields = ['created_by', 'created_at']


@admin.register(Customer)
class CustomerAdmin(SimpleHistoryAdmin):
    """Admin for Customer model."""
    
    list_display = [
        'customer_code', 'name', 'customer_type', 'city', 'country',
        'payment_terms', 'credit_limit', 'is_active', 'is_approved',
        'sales_person', 'created_at'
    ]
    list_filter = [
        'customer_type', 'is_active', 'is_approved', 'payment_terms',
        'country', 'sales_person', 'created_at'
    ]
    search_fields = ['customer_code', 'name', 'email', 'ice', 'if_number', 'rc']
    readonly_fields = ['created_by', 'approved_by', 'approved_at', 'created_at', 'updated_at']
    
    fieldsets = [
        (_('Basic Information'), {
            'fields': [
                'customer_code', 'name', 'customer_type',
                'sales_person', 'is_active', 'is_approved'
            ]
        }),
        (_('Moroccan Compliance'), {
            'fields': ['ice', 'if_number', 'rc']
        }),
        (_('Contact Information'), {
            'fields': [
                'email', 'phone', 'mobile', 'fax', 'website',
                'address_line1', 'address_line2', 'city',
                'postal_code', 'state_province', 'country'
            ]
        }),
        (_('Business Terms'), {
            'fields': [
                'payment_terms', 'credit_limit', 'currency',
                'price_list', 'rating'
            ]
        }),
        (_('Tax Information'), {
            'fields': [
                'is_subject_to_vat', 'vat_rate',
                'is_subject_to_withholding', 'withholding_rate'
            ]
        }),
        (_('Approval'), {
            'fields': ['approved_by', 'approved_at']
        }),
        (_('Notes'), {
            'fields': ['notes']
        }),
        (_('Audit'), {
            'fields': ['created_by', 'created_at', 'updated_at']
        })
    ]
    
    inlines = [CustomerContactInline, CustomerPriceListInline]
    
    def save_model(self, request, obj, form, change):
        """Set created_by on create."""
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class SalesQuotationLineInline(admin.TabularInline):
    """Inline admin for sales quotation lines."""
    model = SalesQuotationLine
    extra = 1
    fields = [
        'product', 'description', 'quantity', 'uom', 'unit_price',
        'discount_percent', 'total_price', 'expected_delivery_date'
    ]
    readonly_fields = ['total_price']


@admin.register(SalesQuotation)
class SalesQuotationAdmin(SimpleHistoryAdmin):
    """Admin for SalesQuotation model."""
    
    list_display = [
        'quotation_number', 'customer', 'quotation_date', 'valid_until',
        'state', 'total_amount', 'sales_person', 'created_at'
    ]
    list_filter = [
        'state', 'quotation_date', 'valid_until', 'sales_person',
        'payment_terms', 'created_at'
    ]
    search_fields = ['quotation_number', 'customer__name', 'customer__customer_code']
    readonly_fields = [
        'state', 'subtotal', 'tax_amount', 'total_amount',
        'confirmed_by_customer', 'customer_confirmation_date',
        'created_by', 'created_at', 'updated_at'
    ]
    
    fieldsets = [
        (_('Basic Information'), {
            'fields': [
                'quotation_number', 'customer', 'quotation_date',
                'valid_until', 'state', 'sales_person'
            ]
        }),
        (_('Delivery Information'), {
            'fields': [
                'delivery_location', 'delivery_address',
                'expected_delivery_date'
            ]
        }),
        (_('Terms'), {
            'fields': ['payment_terms', 'delivery_terms', 'currency']
        }),
        (_('Financial'), {
            'fields': [
                'subtotal', 'discount_amount', 'tax_amount', 'total_amount'
            ]
        }),
        (_('Customer Confirmation'), {
            'fields': [
                'confirmed_by_customer', 'customer_confirmation_date',
                'customer_reference'
            ]
        }),
        (_('Notes'), {
            'fields': ['notes', 'terms_and_conditions']
        }),
        (_('Audit'), {
            'fields': ['created_by', 'created_at', 'updated_at']
        })
    ]
    
    inlines = [SalesQuotationLineInline]
    
    def save_model(self, request, obj, form, change):
        """Set created_by on create."""
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class SalesOrderLineInline(admin.TabularInline):
    """Inline admin for sales order lines."""
    model = SalesOrderLine
    extra = 0
    fields = [
        'product', 'description', 'quantity', 'uom', 'unit_price',
        'discount_percent', 'total_price', 'quantity_delivered',
        'quantity_pending', 'requested_delivery_date'
    ]
    readonly_fields = ['total_price', 'quantity_delivered', 'quantity_pending']


@admin.register(SalesOrder)
class SalesOrderAdmin(SimpleHistoryAdmin):
    """Admin for SalesOrder model."""
    
    list_display = [
        'order_number', 'customer', 'order_date', 'requested_delivery_date',
        'state', 'total_amount', 'sales_person', 'created_at'
    ]
    list_filter = [
        'state', 'order_date', 'requested_delivery_date',
        'sales_person', 'payment_terms', 'created_at'
    ]
    search_fields = ['order_number', 'customer__name', 'customer__customer_code', 'customer_reference']
    readonly_fields = [
        'state', 'confirmed_delivery_date', 'subtotal', 'tax_amount',
        'total_amount', 'created_by', 'created_at', 'updated_at'
    ]
    
    fieldsets = [
        (_('Basic Information'), {
            'fields': [
                'order_number', 'customer', 'quotation', 'customer_reference',
                'order_date', 'requested_delivery_date', 'confirmed_delivery_date',
                'state', 'sales_person'
            ]
        }),
        (_('Delivery Information'), {
            'fields': [
                'delivery_location', 'delivery_address', 'shipping_method'
            ]
        }),
        (_('Terms'), {
            'fields': ['payment_terms', 'delivery_terms', 'currency']
        }),
        (_('Financial'), {
            'fields': [
                'subtotal', 'discount_amount', 'tax_amount', 'total_amount'
            ]
        }),
        (_('Notes'), {
            'fields': ['notes', 'terms_and_conditions']
        }),
        (_('Audit'), {
            'fields': ['created_by', 'created_at', 'updated_at']
        })
    ]
    
    inlines = [SalesOrderLineInline]
    
    def save_model(self, request, obj, form, change):
        """Set created_by on create."""
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class DeliveryNoteLineInline(admin.TabularInline):
    """Inline admin for delivery note lines."""
    model = DeliveryNoteLine
    extra = 0
    fields = [
        'so_line', 'product', 'quantity_ordered', 'quantity_to_deliver',
        'quantity_delivered', 'lot_number', 'serial_number'
    ]
    readonly_fields = ['product', 'quantity_ordered']


@admin.register(DeliveryNote)
class DeliveryNoteAdmin(SimpleHistoryAdmin):
    """Admin for DeliveryNote model."""
    
    list_display = [
        'delivery_number', 'sales_order', 'customer', 'delivery_date',
        'state', 'prepared_by', 'delivered_by', 'created_at'
    ]
    list_filter = [
        'state', 'delivery_date', 'actual_delivery_date',
        'prepared_by', 'delivered_by', 'created_at'
    ]
    search_fields = [
        'delivery_number', 'sales_order__order_number',
        'customer__name', 'tracking_number'
    ]
    readonly_fields = [
        'state', 'actual_delivery_date', 'prepared_by', 'delivered_by',
        'delivery_confirmation_date', 'created_at', 'updated_at'
    ]
    
    fieldsets = [
        (_('Basic Information'), {
            'fields': [
                'delivery_number', 'sales_order', 'customer',
                'delivery_date', 'actual_delivery_date', 'state'
            ]
        }),
        (_('Delivery Details'), {
            'fields': [
                'delivery_address', 'shipping_method', 'tracking_number',
                'carrier', 'vehicle_number', 'driver_name', 'driver_phone'
            ]
        }),
        (_('Location'), {
            'fields': ['source_location']
        }),
        (_('Personnel'), {
            'fields': ['prepared_by', 'delivered_by']
        }),
        (_('Customer Confirmation'), {
            'fields': [
                'received_by_customer', 'customer_signature',
                'delivery_confirmation_date'
            ]
        }),
        (_('Notes'), {
            'fields': ['notes', 'delivery_instructions']
        }),
        (_('Audit'), {
            'fields': ['created_at', 'updated_at']
        })
    ]
    
    inlines = [DeliveryNoteLineInline]


class ReturnNoteLineInline(admin.TabularInline):
    """Inline admin for return note lines."""
    model = ReturnNoteLine
    extra = 0
    fields = [
        'delivery_line', 'product', 'quantity_delivered', 'quantity_returned',
        'quantity_accepted', 'quantity_rejected', 'quality_status',
        'return_reason', 'lot_number', 'serial_number'
    ]
    readonly_fields = ['product', 'quantity_delivered']


@admin.register(ReturnNote)
class ReturnNoteAdmin(SimpleHistoryAdmin):
    """Admin for ReturnNote model."""
    
    list_display = [
        'return_number', 'customer', 'return_date', 'return_reason',
        'state', 'quality_check_required', 'quality_check_passed',
        'received_by', 'created_at'
    ]
    list_filter = [
        'state', 'return_reason', 'return_date', 'quality_check_required',
        'quality_check_passed', 'received_by', 'quality_check_by', 'created_at'
    ]
    search_fields = [
        'return_number', 'sales_order__order_number',
        'delivery_note__delivery_number', 'customer__name'
    ]
    readonly_fields = [
        'state', 'quality_check_passed', 'quality_check_by',
        'quality_check_date', 'posted_by', 'posted_at',
        'created_at', 'updated_at'
    ]
    
    fieldsets = [
        (_('Basic Information'), {
            'fields': [
                'return_number', 'sales_order', 'delivery_note',
                'customer', 'return_date', 'return_reason', 'state'
            ]
        }),
        (_('Return Details'), {
            'fields': ['return_description', 'return_location']
        }),
        (_('Quality Control'), {
            'fields': [
                'quality_check_required', 'quality_check_passed',
                'quality_check_by', 'quality_check_date', 'quality_notes'
            ]
        }),
        (_('Personnel'), {
            'fields': ['received_by', 'posted_by', 'posted_at']
        }),
        (_('Notes'), {
            'fields': ['notes', 'rejection_reason']
        }),
        (_('Audit'), {
            'fields': ['created_at', 'updated_at']
        })
    ]
    
    inlines = [ReturnNoteLineInline]
