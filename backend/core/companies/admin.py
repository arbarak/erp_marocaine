"""
Admin configuration for companies app.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Company, CompanySettings


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Admin interface for Company model."""
    
    list_display = [
        'name', 'ice', 'if_number', 'city', 'currency', 
        'is_active', 'created_at'
    ]
    list_filter = [
        'currency', 'locale', 'is_active', 'created_at',
        'fiscal_year_start_month'
    ]
    search_fields = [
        'name', 'legal_name', 'ice', 'if_number', 'rc',
        'email', 'city'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'name', 'legal_name', 'is_active'
            )
        }),
        (_('Moroccan Business Identifiers'), {
            'fields': (
                'ice', 'if_number', 'rc', 'vat_number'
            )
        }),
        (_('Contact Information'), {
            'fields': (
                'email', 'phone', 'fax', 'website'
            )
        }),
        (_('Address'), {
            'fields': (
                'address_line1', 'address_line2', 'city',
                'postal_code', 'state_province', 'country'
            )
        }),
        (_('Business Settings'), {
            'fields': (
                'currency', 'locale', 'fiscal_year_start_month',
                'tax_rounding_method', 'inclusive_taxes'
            )
        }),
        (_('Branding'), {
            'fields': ('logo',)
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset for admin list view."""
        return super().get_queryset(request).select_related()


@admin.register(CompanySettings)
class CompanySettingsAdmin(admin.ModelAdmin):
    """Admin interface for CompanySettings model."""
    
    list_display = [
        'company', 'invoice_prefix', 'default_payment_terms',
        'default_costing_method', 'updated_at'
    ]
    list_filter = [
        'default_costing_method', 'default_payment_terms',
        'created_at'
    ]
    search_fields = ['company__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Document Numbering'), {
            'fields': (
                'invoice_prefix', 'quote_prefix', 
                'po_prefix', 'so_prefix'
            )
        }),
        (_('Default Terms'), {
            'fields': (
                'default_payment_terms', 'default_quote_validity'
            )
        }),
        (_('Email Settings'), {
            'fields': ('email_signature',)
        }),
        (_('Inventory Settings'), {
            'fields': ('default_costing_method',)
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset for admin list view."""
        return super().get_queryset(request).select_related('company')
