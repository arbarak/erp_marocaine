"""
Django admin configuration for accounting module.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import AccountType, Account, Journal, JournalEntry, JournalEntryLine


@admin.register(AccountType)
class AccountTypeAdmin(admin.ModelAdmin):
    """Admin interface for AccountType model."""
    
    list_display = [
        'code', 'name', 'name_arabic', 'category', 'normal_balance',
        'parent', 'level', 'allow_posting', 'is_active'
    ]
    list_filter = ['category', 'normal_balance', 'allow_posting', 'is_active', 'company']
    search_fields = ['code', 'name', 'name_arabic']
    ordering = ['code']
    readonly_fields = ['level', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('company', 'code', 'name', 'name_arabic', 'category', 'normal_balance')
        }),
        (_('Hierarchy'), {
            'fields': ('parent', 'level')
        }),
        (_('Configuration'), {
            'fields': ('allow_posting', 'require_reconciliation', 'is_active')
        }),
        (_('Additional Information'), {
            'fields': ('description',)
        }),
        (_('Audit Information'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter by company if user has company context."""
        qs = super().get_queryset(request)
        if hasattr(request, 'company') and request.company:
            qs = qs.filter(company=request.company)
        return qs


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    """Admin interface for Account model."""
    
    list_display = [
        'code', 'name', 'account_type', 'current_balance_display',
        'allow_posting', 'is_active'
    ]
    list_filter = ['account_type', 'currency', 'allow_posting', 'is_active', 'company']
    search_fields = ['code', 'name', 'name_arabic']
    ordering = ['code']
    readonly_fields = ['level', 'current_balance', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('company', 'code', 'name', 'name_arabic', 'account_type')
        }),
        (_('Hierarchy'), {
            'fields': ('parent', 'level')
        }),
        (_('Financial Information'), {
            'fields': ('currency', 'opening_balance', 'current_balance')
        }),
        (_('Configuration'), {
            'fields': ('allow_posting', 'require_reconciliation', 'is_active')
        }),
        (_('Additional Information'), {
            'fields': ('description',)
        }),
        (_('Audit Information'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def current_balance_display(self, obj):
        """Display formatted current balance."""
        balance = obj.current_balance
        if balance >= 0:
            color = 'green' if obj.normal_balance == 'DEBIT' else 'blue'
            symbol = 'DR' if obj.normal_balance == 'DEBIT' else 'CR'
        else:
            color = 'red'
            symbol = 'CR' if obj.normal_balance == 'DEBIT' else 'DR'
            balance = abs(balance)
        
        return format_html(
            '<span style="color: {};">{:,.2f} {}</span>',
            color, balance, symbol
        )
    current_balance_display.short_description = _('Current Balance')
    
    def get_queryset(self, request):
        """Filter by company if user has company context."""
        qs = super().get_queryset(request)
        if hasattr(request, 'company') and request.company:
            qs = qs.filter(company=request.company)
        return qs.select_related('account_type', 'parent')


@admin.register(Journal)
class JournalAdmin(admin.ModelAdmin):
    """Admin interface for Journal model."""
    
    list_display = [
        'code', 'name', 'journal_type', 'auto_sequence',
        'sequence_prefix', 'is_active'
    ]
    list_filter = ['journal_type', 'auto_sequence', 'is_active', 'company']
    search_fields = ['code', 'name']
    ordering = ['code']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('company', 'code', 'name', 'journal_type')
        }),
        (_('Configuration'), {
            'fields': ('is_active', 'auto_sequence', 'sequence_prefix')
        }),
        (_('Default Accounts'), {
            'fields': ('default_debit_account', 'default_credit_account')
        }),
        (_('Additional Information'), {
            'fields': ('description',)
        }),
        (_('Audit Information'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter by company if user has company context."""
        qs = super().get_queryset(request)
        if hasattr(request, 'company') and request.company:
            qs = qs.filter(company=request.company)
        return qs


class JournalEntryLineInline(admin.TabularInline):
    """Inline admin for JournalEntryLine model."""
    
    model = JournalEntryLine
    extra = 0
    readonly_fields = ['reconciled', 'reconciled_at', 'reconciled_by']
    
    fields = [
        'sequence', 'account', 'description', 'debit_amount',
        'credit_amount', 'reference', 'reconciled'
    ]


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    """Admin interface for JournalEntry model."""
    
    list_display = [
        'entry_number', 'journal', 'date', 'state', 'total_debit',
        'total_credit', 'is_balanced_display', 'posted_at'
    ]
    list_filter = ['state', 'entry_type', 'journal', 'date', 'company']
    search_fields = ['entry_number', 'description', 'reference']
    ordering = ['-date', '-created_at']
    readonly_fields = [
        'entry_number', 'total_debit', 'total_credit', 'posted_at',
        'posted_by', 'created_at', 'updated_at'
    ]
    inlines = [JournalEntryLineInline]
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('company', 'entry_number', 'journal', 'date', 'entry_type', 'state')
        }),
        (_('Amounts'), {
            'fields': ('total_debit', 'total_credit')
        }),
        (_('Details'), {
            'fields': ('description', 'reference')
        }),
        (_('Source Document'), {
            'fields': ('source_document_type', 'source_document_id'),
            'classes': ('collapse',)
        }),
        (_('Reversal Information'), {
            'fields': ('reversed_entry', 'reversal_reason'),
            'classes': ('collapse',)
        }),
        (_('Posting Information'), {
            'fields': ('posted_at', 'posted_by'),
            'classes': ('collapse',)
        }),
        (_('Audit Information'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_balanced_display(self, obj):
        """Display if journal entry is balanced."""
        is_balanced = obj.is_balanced()
        if is_balanced:
            return format_html('<span style="color: green;">✓ Balanced</span>')
        else:
            return format_html('<span style="color: red;">✗ Unbalanced</span>')
    is_balanced_display.short_description = _('Balanced')
    
    def get_queryset(self, request):
        """Filter by company if user has company context."""
        qs = super().get_queryset(request)
        if hasattr(request, 'company') and request.company:
            qs = qs.filter(company=request.company)
        return qs.select_related('journal', 'posted_by', 'created_by')
    
    def has_change_permission(self, request, obj=None):
        """Only allow changes to draft entries."""
        if obj and obj.state != 'DRAFT':
            return False
        return super().has_change_permission(request, obj)
    
    def has_delete_permission(self, request, obj=None):
        """Only allow deletion of draft entries."""
        if obj and obj.state != 'DRAFT':
            return False
        return super().has_delete_permission(request, obj)


@admin.register(JournalEntryLine)
class JournalEntryLineAdmin(admin.ModelAdmin):
    """Admin interface for JournalEntryLine model."""
    
    list_display = [
        'journal_entry', 'sequence', 'account', 'description',
        'debit_amount', 'credit_amount', 'reconciled'
    ]
    list_filter = ['reconciled', 'journal_entry__state', 'journal_entry__journal']
    search_fields = ['description', 'reference', 'account__code', 'account__name']
    ordering = ['journal_entry', 'sequence']
    readonly_fields = ['reconciled_at', 'reconciled_by']
    
    def get_queryset(self, request):
        """Filter by company if user has company context."""
        qs = super().get_queryset(request)
        if hasattr(request, 'company') and request.company:
            qs = qs.filter(journal_entry__company=request.company)
        return qs.select_related('journal_entry', 'account')
    
    def has_change_permission(self, request, obj=None):
        """Only allow changes to lines of draft entries."""
        if obj and obj.journal_entry.state != 'DRAFT':
            return False
        return super().has_change_permission(request, obj)
    
    def has_delete_permission(self, request, obj=None):
        """Only allow deletion of lines of draft entries."""
        if obj and obj.journal_entry.state != 'DRAFT':
            return False
        return super().has_delete_permission(request, obj)
