"""
Django admin configuration for invoicing module.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import Invoice, InvoiceLine, Payment, InvoicePayment


class InvoiceLineInline(admin.TabularInline):
    """Inline admin for invoice lines."""
    model = InvoiceLine
    extra = 0
    fields = [
        'product', 'description', 'quantity', 'unit_price',
        'discount_percent', 'discount_amount', 'tax_rate',
        'total_price', 'tax_amount'
    ]
    readonly_fields = ['total_price', 'tax_amount']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """Admin interface for invoices."""
    
    list_display = [
        'invoice_number', 'invoice_type', 'party_name', 'invoice_date',
        'due_date', 'total_amount', 'outstanding_amount', 'state',
        'is_overdue_display'
    ]
    list_filter = [
        'invoice_type', 'state', 'invoice_date', 'due_date',
        'company', 'created_at'
    ]
    search_fields = [
        'invoice_number', 'reference', 'description',
        'customer__name', 'supplier__name'
    ]
    readonly_fields = [
        'id', 'invoice_number', 'subtotal', 'tax_amount',
        'total_amount', 'paid_amount', 'outstanding_amount',
        'is_overdue', 'days_overdue', 'created_at', 'updated_at'
    ]
    fieldsets = [
        (_('Basic Information'), {
            'fields': [
                'id', 'invoice_number', 'invoice_type', 'state',
                'customer', 'supplier', 'sales_order', 'purchase_order'
            ]
        }),
        (_('Dates'), {
            'fields': [
                'invoice_date', 'due_date', 'payment_terms_days'
            ]
        }),
        (_('Amounts'), {
            'fields': [
                'subtotal', 'tax_amount', 'total_amount',
                'paid_amount', 'outstanding_amount'
            ]
        }),
        (_('French Compliance'), {
            'fields': [
                'supplier_invoice_number', 'supplier_invoice_date'
            ]
        }),
        (_('Additional Information'), {
            'fields': [
                'reference', 'description', 'notes'
            ]
        }),
        (_('Status'), {
            'fields': [
                'is_overdue', 'days_overdue'
            ]
        }),
        (_('Audit'), {
            'fields': [
                'created_at', 'updated_at', 'created_by'
            ]
        })
    ]
    inlines = [InvoiceLineInline]
    date_hierarchy = 'invoice_date'
    
    def party_name(self, obj):
        """Get party name for display."""
        return obj.get_party_name()
    party_name.short_description = _('Party')
    
    def is_overdue_display(self, obj):
        """Display overdue status with color."""
        if obj.is_overdue():
            return format_html(
                '<span style="color: red; font-weight: bold;">⚠ {} days</span>',
                obj.days_overdue()
            )
        return format_html('<span style="color: green;">✓ Current</span>')
    is_overdue_display.short_description = _('Overdue Status')
    
    def get_queryset(self, request):
        """Filter by company if user is not superuser."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser and hasattr(request.user, 'company'):
            qs = qs.filter(company=request.user.company)
        return qs.select_related('customer', 'supplier', 'sales_order', 'purchase_order')
    
    def save_model(self, request, obj, form, change):
        """Set company and created_by on save."""
        if not change:  # Creating new object
            if hasattr(request.user, 'company'):
                obj.company = request.user.company
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class InvoicePaymentInline(admin.TabularInline):
    """Inline admin for invoice payment allocations."""
    model = InvoicePayment
    extra = 0
    fields = [
        'invoice', 'allocated_amount', 'allocation_date', 'notes'
    ]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin interface for payments."""
    
    list_display = [
        'payment_number', 'payment_type', 'party_name', 'amount',
        'payment_date', 'payment_method', 'state'
    ]
    list_filter = [
        'payment_type', 'state', 'payment_method', 'payment_date',
        'company', 'created_at'
    ]
    search_fields = [
        'payment_number', 'reference', 'description',
        'customer__name', 'supplier__name', 'check_number',
        'bank_reference'
    ]
    readonly_fields = [
        'id', 'payment_number', 'created_at', 'updated_at',
        'confirmed_at', 'confirmed_by'
    ]
    fieldsets = [
        (_('Basic Information'), {
            'fields': [
                'id', 'payment_number', 'payment_type', 'state',
                'customer', 'supplier'
            ]
        }),
        (_('Payment Details'), {
            'fields': [
                'amount', 'payment_date', 'payment_method'
            ]
        }),
        (_('Payment Instrument'), {
            'fields': [
                'check_number', 'bank_reference'
            ]
        }),
        (_('Additional Information'), {
            'fields': [
                'reference', 'description', 'notes'
            ]
        }),
        (_('Confirmation'), {
            'fields': [
                'confirmed_by', 'confirmed_at'
            ]
        }),
        (_('Audit'), {
            'fields': [
                'created_at', 'updated_at', 'created_by'
            ]
        })
    ]
    inlines = [InvoicePaymentInline]
    date_hierarchy = 'payment_date'
    
    def party_name(self, obj):
        """Get party name for display."""
        return obj.get_party_name()
    party_name.short_description = _('Party')
    
    def get_queryset(self, request):
        """Filter by company if user is not superuser."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser and hasattr(request.user, 'company'):
            qs = qs.filter(company=request.user.company)
        return qs.select_related('customer', 'supplier')
    
    def save_model(self, request, obj, form, change):
        """Set company and created_by on save."""
        if not change:  # Creating new object
            if hasattr(request.user, 'company'):
                obj.company = request.user.company
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(InvoiceLine)
class InvoiceLineAdmin(admin.ModelAdmin):
    """Admin interface for invoice lines."""
    
    list_display = [
        'invoice', 'product', 'description', 'quantity',
        'unit_price', 'total_price', 'tax_amount'
    ]
    list_filter = [
        'invoice__invoice_type', 'invoice__state',
        'invoice__company', 'product__category'
    ]
    search_fields = [
        'invoice__invoice_number', 'product__name',
        'product__code', 'description'
    ]
    readonly_fields = ['total_price', 'tax_amount']
    
    def get_queryset(self, request):
        """Filter by company if user is not superuser."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser and hasattr(request.user, 'company'):
            qs = qs.filter(invoice__company=request.user.company)
        return qs.select_related('invoice', 'product')


@admin.register(InvoicePayment)
class InvoicePaymentAdmin(admin.ModelAdmin):
    """Admin interface for invoice payment allocations."""
    
    list_display = [
        'invoice', 'payment', 'allocated_amount',
        'allocation_date'
    ]
    list_filter = [
        'allocation_date', 'invoice__company'
    ]
    search_fields = [
        'invoice__invoice_number', 'payment__payment_number'
    ]
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        """Filter by company if user is not superuser."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser and hasattr(request.user, 'company'):
            qs = qs.filter(invoice__company=request.user.company)
        return qs.select_related('invoice', 'payment')
    
    def save_model(self, request, obj, form, change):
        """Set created_by on save."""
        if not change:  # Creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
