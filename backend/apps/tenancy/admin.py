# Tenant Admin Interface

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.db import models
from django.forms import TextInput, Textarea

from .models import Tenant, TenantUser, TenantConfiguration, TenantInvitation


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    """Admin interface for Tenant model"""
    
    list_display = [
        'name', 'subdomain', 'domain', 'plan', 'is_active', 'is_trial',
        'user_count', 'created_at', 'trial_status'
    ]
    list_filter = [
        'is_active', 'is_trial', 'plan', 'created_at'
    ]
    search_fields = ['name', 'subdomain', 'domain']
    readonly_fields = [
        'id', 'schema_name', 'created_at', 'updated_at', 'full_domain',
        'is_trial_expired', 'user_count'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'slug', 'subdomain', 'domain', 'full_domain')
        }),
        ('Schema & Database', {
            'fields': ('schema_name',)
        }),
        ('Status & Plan', {
            'fields': ('is_active', 'is_trial', 'trial_ends_at', 'is_trial_expired', 'plan')
        }),
        ('Limits', {
            'fields': ('max_users', 'max_companies', 'user_count')
        }),
        ('Configuration', {
            'fields': ('settings', 'features'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    formfield_overrides = {
        models.JSONField: {'widget': Textarea(attrs={'rows': 4, 'cols': 80})},
    }
    
    def user_count(self, obj):
        """Get active user count"""
        count = obj.tenant_users.filter(is_active=True).count()
        url = reverse('admin:tenancy_tenantuser_changelist') + f'?tenant__id__exact={obj.id}'
        return format_html('<a href="{}">{}</a>', url, count)
    user_count.short_description = 'Active Users'
    
    def trial_status(self, obj):
        """Get trial status with color coding"""
        if not obj.is_trial:
            return format_html('<span style="color: green;">Not Trial</span>')
        
        if obj.is_trial_expired:
            return format_html('<span style="color: red;">Expired</span>')
        
        days_left = (obj.trial_ends_at - timezone.now()).days
        if days_left <= 3:
            color = 'red'
        elif days_left <= 7:
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="color: {};">{} days left</span>',
            color, days_left
        )
    trial_status.short_description = 'Trial Status'
    
    actions = ['activate_tenants', 'deactivate_tenants', 'extend_trial']
    
    def activate_tenants(self, request, queryset):
        """Activate selected tenants"""
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} tenants activated.')
    activate_tenants.short_description = 'Activate selected tenants'
    
    def deactivate_tenants(self, request, queryset):
        """Deactivate selected tenants"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} tenants deactivated.')
    deactivate_tenants.short_description = 'Deactivate selected tenants'
    
    def extend_trial(self, request, queryset):
        """Extend trial by 30 days"""
        from datetime import timedelta
        
        count = 0
        for tenant in queryset.filter(is_trial=True):
            if tenant.trial_ends_at:
                tenant.trial_ends_at += timedelta(days=30)
            else:
                tenant.trial_ends_at = timezone.now() + timedelta(days=30)
            tenant.save()
            count += 1
        
        self.message_user(request, f'Extended trial for {count} tenants.')
    extend_trial.short_description = 'Extend trial by 30 days'


class TenantUserInline(admin.TabularInline):
    """Inline for TenantUser in Tenant admin"""
    model = TenantUser
    extra = 0
    readonly_fields = ['invited_at', 'joined_at', 'last_accessed']
    fields = ['user', 'role', 'is_active', 'invited_at', 'joined_at', 'last_accessed']


@admin.register(TenantUser)
class TenantUserAdmin(admin.ModelAdmin):
    """Admin interface for TenantUser model"""
    
    list_display = [
        'user', 'tenant', 'role', 'is_active', 'joined_at', 'last_accessed'
    ]
    list_filter = ['role', 'is_active', 'joined_at', 'tenant']
    search_fields = ['user__username', 'user__email', 'tenant__name']
    readonly_fields = ['id', 'invited_at', 'joined_at', 'last_accessed']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'tenant', 'user', 'role', 'is_active')
        }),
        ('Permissions', {
            'fields': ('permissions',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('invited_at', 'joined_at', 'last_accessed'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related('user', 'tenant')


@admin.register(TenantConfiguration)
class TenantConfigurationAdmin(admin.ModelAdmin):
    """Admin interface for TenantConfiguration model"""
    
    list_display = ['tenant', 'category', 'key', 'is_system', 'updated_at']
    list_filter = ['category', 'is_system', 'tenant']
    search_fields = ['tenant__name', 'category', 'key']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'tenant', 'category', 'key', 'is_system')
        }),
        ('Configuration', {
            'fields': ('value', 'description')
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    formfield_overrides = {
        models.JSONField: {'widget': Textarea(attrs={'rows': 4, 'cols': 80})},
    }


@admin.register(TenantInvitation)
class TenantInvitationAdmin(admin.ModelAdmin):
    """Admin interface for TenantInvitation model"""
    
    list_display = [
        'email', 'tenant', 'role', 'status', 'invited_by',
        'created_at', 'expires_at', 'is_expired'
    ]
    list_filter = ['status', 'role', 'created_at', 'tenant']
    search_fields = ['email', 'tenant__name', 'invited_by__username']
    readonly_fields = [
        'id', 'token', 'created_at', 'accepted_at', 'accepted_by', 'is_expired'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'tenant', 'email', 'role', 'status')
        }),
        ('Invitation Details', {
            'fields': ('token', 'expires_at', 'is_expired', 'message')
        }),
        ('Audit', {
            'fields': ('created_at', 'invited_by', 'accepted_at', 'accepted_by'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related(
            'tenant', 'invited_by', 'accepted_by'
        )
    
    actions = ['resend_invitations', 'expire_invitations']
    
    def resend_invitations(self, request, queryset):
        """Resend selected invitations"""
        from datetime import timedelta
        
        count = 0
        for invitation in queryset.filter(status='pending'):
            invitation.expires_at = timezone.now() + timedelta(days=7)
            invitation.save()
            # Send email (implement as needed)
            count += 1
        
        self.message_user(request, f'Resent {count} invitations.')
    resend_invitations.short_description = 'Resend selected invitations'
    
    def expire_invitations(self, request, queryset):
        """Expire selected invitations"""
        count = queryset.filter(status='pending').update(status='expired')
        self.message_user(request, f'Expired {count} invitations.')
    expire_invitations.short_description = 'Expire selected invitations'


# Add inlines to TenantAdmin
TenantAdmin.inlines = [TenantUserInline]


# Custom admin site configuration
admin.site.site_header = 'ERP Multi-Tenant Administration'
admin.site.site_title = 'ERP Admin'
admin.site.index_title = 'Multi-Tenant Management'
