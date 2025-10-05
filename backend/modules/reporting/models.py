"""
Reporting models for advanced financial reporting and compliance.
"""
import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from simple_history.models import HistoricalRecords

from core.companies.models import Company

User = get_user_model()


class ReportTemplate(models.Model):
    """Template for generating reports."""
    
    REPORT_TYPES = [
        ('FINANCIAL', _('Financial Report')),
        ('TAX', _('Tax Report')),
        ('MANAGEMENT', _('Management Report')),
        ('COMPLIANCE', _('Compliance Report')),
        ('ANALYTICS', _('Analytics Report')),
    ]
    
    FORMATS = [
        ('PDF', _('PDF')),
        ('EXCEL', _('Excel')),
        ('CSV', _('CSV')),
        ('JSON', _('JSON')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='report_templates',
        verbose_name=_('company')
    )
    
    # Basic Information
    name = models.CharField(max_length=200, verbose_name=_('name'))
    description = models.TextField(blank=True, verbose_name=_('description'))
    report_type = models.CharField(
        max_length=20,
        choices=REPORT_TYPES,
        verbose_name=_('report type')
    )
    
    # Template Configuration
    template_config = models.JSONField(
        default=dict,
        verbose_name=_('template configuration'),
        help_text=_('JSON configuration for report generation')
    )
    default_format = models.CharField(
        max_length=10,
        choices=FORMATS,
        default='PDF',
        verbose_name=_('default format')
    )
    
    # Permissions and Access
    is_public = models.BooleanField(
        default=False,
        verbose_name=_('is public'),
        help_text=_('Whether this template is available to all users')
    )
    allowed_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='allowed_report_templates',
        verbose_name=_('allowed users')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('is active'))
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('updated at'))
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_report_templates',
        verbose_name=_('created by')
    )
    
    # History
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Report Template')
        verbose_name_plural = _('Report Templates')
        unique_together = [['company', 'name']]
        indexes = [
            models.Index(fields=['company', 'report_type']),
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['is_public']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_report_type_display()})"


class ReportExecution(models.Model):
    """Track report execution and results."""
    
    STATUSES = [
        ('PENDING', _('Pending')),
        ('RUNNING', _('Running')),
        ('COMPLETED', _('Completed')),
        ('FAILED', _('Failed')),
        ('CANCELLED', _('Cancelled')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='report_executions',
        verbose_name=_('company')
    )
    
    # Report Information
    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.CASCADE,
        related_name='executions',
        verbose_name=_('template')
    )
    name = models.CharField(max_length=200, verbose_name=_('execution name'))
    
    # Execution Parameters
    parameters = models.JSONField(
        default=dict,
        verbose_name=_('parameters'),
        help_text=_('Parameters used for report generation')
    )
    format = models.CharField(
        max_length=10,
        choices=ReportTemplate.FORMATS,
        verbose_name=_('format')
    )
    
    # Execution Status
    status = models.CharField(
        max_length=20,
        choices=STATUSES,
        default='PENDING',
        verbose_name=_('status')
    )
    progress = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('progress percentage')
    )
    
    # Results
    file_path = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_('file path'),
        help_text=_('Path to generated report file')
    )
    file_size = models.BigIntegerField(
        null=True,
        blank=True,
        verbose_name=_('file size (bytes)')
    )
    
    # Timing
    started_at = models.DateTimeField(null=True, blank=True, verbose_name=_('started at'))
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name=_('completed at'))
    
    # Error Information
    error_message = models.TextField(blank=True, verbose_name=_('error message'))
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('updated at'))
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='report_executions',
        verbose_name=_('created by')
    )
    
    # History
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Report Execution')
        verbose_name_plural = _('Report Executions')
        indexes = [
            models.Index(fields=['company', 'template', 'status']),
            models.Index(fields=['company', 'created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['created_by']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"
    
    @property
    def duration(self):
        """Calculate execution duration."""
        if self.started_at and self.completed_at:
            return self.completed_at - self.started_at
        return None


class Dashboard(models.Model):
    """Dashboard configuration for management reporting."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='dashboards',
        verbose_name=_('company')
    )
    
    # Basic Information
    name = models.CharField(max_length=200, verbose_name=_('name'))
    description = models.TextField(blank=True, verbose_name=_('description'))
    
    # Configuration
    layout_config = models.JSONField(
        default=dict,
        verbose_name=_('layout configuration'),
        help_text=_('Dashboard layout and widget configuration')
    )
    refresh_interval = models.IntegerField(
        default=300,  # 5 minutes
        validators=[MinValueValidator(60)],  # Minimum 1 minute
        verbose_name=_('refresh interval (seconds)')
    )
    
    # Permissions
    is_default = models.BooleanField(
        default=False,
        verbose_name=_('is default dashboard')
    )
    allowed_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='allowed_dashboards',
        verbose_name=_('allowed users')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('is active'))
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('updated at'))
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_dashboards',
        verbose_name=_('created by')
    )
    
    # History
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Dashboard')
        verbose_name_plural = _('Dashboards')
        unique_together = [['company', 'name']]
        indexes = [
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['is_default']),
        ]
    
    def __str__(self):
        return self.name


class AuditLog(models.Model):
    """Audit log for tracking user actions and system events."""
    
    ACTION_TYPES = [
        ('CREATE', _('Create')),
        ('UPDATE', _('Update')),
        ('DELETE', _('Delete')),
        ('VIEW', _('View')),
        ('EXPORT', _('Export')),
        ('IMPORT', _('Import')),
        ('LOGIN', _('Login')),
        ('LOGOUT', _('Logout')),
        ('SYSTEM', _('System Event')),
    ]
    
    SEVERITY_LEVELS = [
        ('LOW', _('Low')),
        ('MEDIUM', _('Medium')),
        ('HIGH', _('High')),
        ('CRITICAL', _('Critical')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='audit_logs',
        verbose_name=_('company'),
        null=True,
        blank=True
    )
    
    # Action Information
    action_type = models.CharField(
        max_length=20,
        choices=ACTION_TYPES,
        verbose_name=_('action type')
    )
    description = models.TextField(verbose_name=_('description'))
    
    # Target Object
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name=_('content type')
    )
    object_id = models.CharField(max_length=255, null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # User and Session
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        verbose_name=_('user')
    )
    session_key = models.CharField(
        max_length=40,
        blank=True,
        verbose_name=_('session key')
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_('IP address')
    )
    user_agent = models.TextField(blank=True, verbose_name=_('user agent'))
    
    # Additional Data
    old_values = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_('old values'),
        help_text=_('Previous values before change')
    )
    new_values = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_('new values'),
        help_text=_('New values after change')
    )
    
    # Severity and Status
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_LEVELS,
        default='LOW',
        verbose_name=_('severity')
    )
    
    # Timing
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name=_('timestamp'))
    
    class Meta:
        verbose_name = _('Audit Log')
        verbose_name_plural = _('Audit Logs')
        indexes = [
            models.Index(fields=['company', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action_type', 'timestamp']),
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['severity']),
        ]
        ordering = ['-timestamp']
    
    def __str__(self):
        user_str = self.user.get_full_name() if self.user else 'System'
        return f"{user_str} - {self.get_action_type_display()} - {self.timestamp}"
