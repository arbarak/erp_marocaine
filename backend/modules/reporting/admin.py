"""
Admin interface for reporting module.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from .models import ReportTemplate, ReportExecution, Dashboard, AuditLog


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    """Admin interface for ReportTemplate model."""
    
    list_display = [
        'name', 'report_type', 'default_format', 'is_public',
        'is_active', 'created_by', 'created_at'
    ]
    list_filter = [
        'report_type', 'default_format', 'is_public', 'is_active',
        'created_at', 'company'
    ]
    search_fields = ['name', 'description', 'created_by__email']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['allowed_users']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('company', 'name', 'description', 'report_type')
        }),
        (_('Configuration'), {
            'fields': ('template_config', 'default_format')
        }),
        (_('Permissions'), {
            'fields': ('is_public', 'allowed_users', 'is_active')
        }),
        (_('Audit'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter by company if user is not superuser."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser and hasattr(request.user, 'current_company'):
            qs = qs.filter(company=request.user.current_company)
        return qs
    
    def save_model(self, request, obj, form, change):
        """Set created_by and company on save."""
        if not change:
            obj.created_by = request.user
            if hasattr(request.user, 'current_company'):
                obj.company = request.user.current_company
        super().save_model(request, obj, form, change)


@admin.register(ReportExecution)
class ReportExecutionAdmin(admin.ModelAdmin):
    """Admin interface for ReportExecution model."""
    
    list_display = [
        'name', 'template', 'status', 'format', 'progress',
        'file_size_display', 'duration_display', 'created_at'
    ]
    list_filter = [
        'status', 'format', 'template__report_type',
        'created_at', 'started_at', 'completed_at', 'company'
    ]
    search_fields = ['name', 'template__name', 'created_by__email']
    readonly_fields = [
        'status', 'progress', 'file_path', 'file_size',
        'started_at', 'completed_at', 'error_message',
        'created_at', 'updated_at', 'duration_display'
    ]
    
    fieldsets = (
        (_('Execution Information'), {
            'fields': ('company', 'template', 'name', 'format')
        }),
        (_('Parameters'), {
            'fields': ('parameters',)
        }),
        (_('Status'), {
            'fields': ('status', 'progress', 'error_message')
        }),
        (_('Results'), {
            'fields': ('file_path', 'file_size', 'file_size_display')
        }),
        (_('Timing'), {
            'fields': ('started_at', 'completed_at', 'duration_display')
        }),
        (_('Audit'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter by company if user is not superuser."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser and hasattr(request.user, 'current_company'):
            qs = qs.filter(company=request.user.current_company)
        return qs
    
    def file_size_display(self, obj):
        """Display file size in human readable format."""
        if obj.file_size:
            if obj.file_size < 1024:
                return f"{obj.file_size} B"
            elif obj.file_size < 1024 * 1024:
                return f"{obj.file_size / 1024:.1f} KB"
            else:
                return f"{obj.file_size / (1024 * 1024):.1f} MB"
        return "-"
    file_size_display.short_description = _('File Size')
    
    def duration_display(self, obj):
        """Display execution duration."""
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f"{hours}h {minutes}m {seconds}s"
            elif minutes > 0:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        return "-"
    duration_display.short_description = _('Duration')


@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    """Admin interface for Dashboard model."""
    
    list_display = [
        'name', 'is_default', 'refresh_interval', 'allowed_users_count',
        'is_active', 'created_by', 'created_at'
    ]
    list_filter = [
        'is_default', 'is_active', 'refresh_interval',
        'created_at', 'company'
    ]
    search_fields = ['name', 'description', 'created_by__email']
    readonly_fields = ['created_at', 'updated_at', 'allowed_users_count']
    filter_horizontal = ['allowed_users']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('company', 'name', 'description')
        }),
        (_('Configuration'), {
            'fields': ('layout_config', 'refresh_interval', 'is_default')
        }),
        (_('Permissions'), {
            'fields': ('allowed_users', 'is_active')
        }),
        (_('Statistics'), {
            'fields': ('allowed_users_count',)
        }),
        (_('Audit'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter by company if user is not superuser."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser and hasattr(request.user, 'current_company'):
            qs = qs.filter(company=request.user.current_company)
        return qs
    
    def allowed_users_count(self, obj):
        """Get count of allowed users."""
        return obj.allowed_users.count()
    allowed_users_count.short_description = _('Allowed Users')
    
    def save_model(self, request, obj, form, change):
        """Set created_by and company on save."""
        if not change:
            obj.created_by = request.user
            if hasattr(request.user, 'current_company'):
                obj.company = request.user.current_company
        super().save_model(request, obj, form, change)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin interface for AuditLog model."""
    
    list_display = [
        'timestamp', 'user', 'action_type', 'severity',
        'description_short', 'ip_address', 'company'
    ]
    list_filter = [
        'action_type', 'severity', 'timestamp',
        'content_type', 'company'
    ]
    search_fields = [
        'description', 'user__email', 'user__first_name',
        'user__last_name', 'ip_address'
    ]
    readonly_fields = [
        'timestamp', 'user', 'action_type', 'description',
        'content_type', 'object_id', 'session_key', 'ip_address',
        'user_agent', 'old_values', 'new_values', 'severity'
    ]
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        (_('Action Information'), {
            'fields': ('timestamp', 'user', 'action_type', 'description', 'severity')
        }),
        (_('Target Object'), {
            'fields': ('content_type', 'object_id')
        }),
        (_('Session Information'), {
            'fields': ('session_key', 'ip_address', 'user_agent')
        }),
        (_('Change Details'), {
            'fields': ('old_values', 'new_values'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter by company if user is not superuser."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser and hasattr(request.user, 'current_company'):
            qs = qs.filter(company=request.user.current_company)
        return qs
    
    def description_short(self, obj):
        """Display shortened description."""
        if len(obj.description) > 50:
            return f"{obj.description[:50]}..."
        return obj.description
    description_short.short_description = _('Description')
    
    def has_add_permission(self, request):
        """Disable adding audit logs through admin."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable changing audit logs through admin."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Disable deleting audit logs through admin."""
        return False


# Customize admin site
admin.site.site_header = _('ERP Reporting Administration')
admin.site.site_title = _('ERP Reporting Admin')
admin.site.index_title = _('Reporting Module Administration')
