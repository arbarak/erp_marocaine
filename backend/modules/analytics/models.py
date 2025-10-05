"""
Advanced Analytics models for business intelligence and predictive analytics.
"""
import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from simple_history.models import HistoricalRecords

from core.companies.models import Company

User = get_user_model()


class AnalyticsDataSource(models.Model):
    """Data source configuration for analytics."""
    
    SOURCE_TYPES = [
        ('DATABASE', _('Database Table')),
        ('API', _('External API')),
        ('FILE', _('File Upload')),
        ('WEBHOOK', _('Webhook')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='analytics_data_sources',
        verbose_name=_('company')
    )
    
    name = models.CharField(max_length=200, verbose_name=_('name'))
    description = models.TextField(blank=True, verbose_name=_('description'))
    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_TYPES,
        verbose_name=_('source type')
    )
    
    # Configuration
    connection_string = models.TextField(blank=True, verbose_name=_('connection string'))
    query_template = models.TextField(blank=True, verbose_name=_('query template'))
    refresh_interval = models.PositiveIntegerField(
        default=3600,  # 1 hour
        verbose_name=_('refresh interval (seconds)')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('is active'))
    last_refresh = models.DateTimeField(null=True, blank=True, verbose_name=_('last refresh'))
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('updated at'))
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_analytics_sources',
        verbose_name=_('created by')
    )
    
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Analytics Data Source')
        verbose_name_plural = _('Analytics Data Sources')
        unique_together = ['company', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.company.name})"


class AnalyticsMetric(models.Model):
    """Business metric definition for analytics."""
    
    METRIC_TYPES = [
        ('COUNT', _('Count')),
        ('SUM', _('Sum')),
        ('AVERAGE', _('Average')),
        ('PERCENTAGE', _('Percentage')),
        ('RATIO', _('Ratio')),
        ('TREND', _('Trend')),
    ]
    
    AGGREGATION_PERIODS = [
        ('DAILY', _('Daily')),
        ('WEEKLY', _('Weekly')),
        ('MONTHLY', _('Monthly')),
        ('QUARTERLY', _('Quarterly')),
        ('YEARLY', _('Yearly')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='analytics_metrics',
        verbose_name=_('company')
    )
    data_source = models.ForeignKey(
        AnalyticsDataSource,
        on_delete=models.CASCADE,
        related_name='metrics',
        verbose_name=_('data source')
    )
    
    # Basic Information
    name = models.CharField(max_length=200, verbose_name=_('name'))
    description = models.TextField(blank=True, verbose_name=_('description'))
    metric_type = models.CharField(
        max_length=20,
        choices=METRIC_TYPES,
        verbose_name=_('metric type')
    )
    
    # Calculation
    calculation_formula = models.TextField(verbose_name=_('calculation formula'))
    aggregation_period = models.CharField(
        max_length=20,
        choices=AGGREGATION_PERIODS,
        default='MONTHLY',
        verbose_name=_('aggregation period')
    )
    
    # Display
    unit = models.CharField(max_length=50, blank=True, verbose_name=_('unit'))
    decimal_places = models.PositiveSmallIntegerField(default=2, verbose_name=_('decimal places'))
    
    # Thresholds
    target_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('target value')
    )
    warning_threshold = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('warning threshold')
    )
    critical_threshold = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('critical threshold')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('is active'))
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('updated at'))
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_analytics_metrics',
        verbose_name=_('created by')
    )
    
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Analytics Metric')
        verbose_name_plural = _('Analytics Metrics')
        unique_together = ['company', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.company.name})"


class MetricValue(models.Model):
    """Historical values for analytics metrics."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    metric = models.ForeignKey(
        AnalyticsMetric,
        on_delete=models.CASCADE,
        related_name='values',
        verbose_name=_('metric')
    )
    
    # Value
    value = models.DecimalField(
        max_digits=15,
        decimal_places=6,
        verbose_name=_('value')
    )
    period_start = models.DateTimeField(verbose_name=_('period start'))
    period_end = models.DateTimeField(verbose_name=_('period end'))
    
    # Context
    dimensions = models.JSONField(default=dict, verbose_name=_('dimensions'))
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True, verbose_name=_('calculated at'))
    
    class Meta:
        verbose_name = _('Metric Value')
        verbose_name_plural = _('Metric Values')
        unique_together = ['metric', 'period_start', 'period_end']
        indexes = [
            models.Index(fields=['metric', 'period_start']),
            models.Index(fields=['metric', 'calculated_at']),
        ]
    
    def __str__(self):
        return f"{self.metric.name}: {self.value} ({self.period_start.date()})"


class PredictiveModel(models.Model):
    """Machine learning model for predictive analytics."""
    
    MODEL_TYPES = [
        ('LINEAR_REGRESSION', _('Linear Regression')),
        ('TIME_SERIES', _('Time Series Forecasting')),
        ('CLASSIFICATION', _('Classification')),
        ('CLUSTERING', _('Clustering')),
    ]
    
    MODEL_STATUS = [
        ('TRAINING', _('Training')),
        ('TRAINED', _('Trained')),
        ('DEPLOYED', _('Deployed')),
        ('FAILED', _('Failed')),
        ('DEPRECATED', _('Deprecated')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='predictive_models',
        verbose_name=_('company')
    )
    
    # Basic Information
    name = models.CharField(max_length=200, verbose_name=_('name'))
    description = models.TextField(blank=True, verbose_name=_('description'))
    model_type = models.CharField(
        max_length=30,
        choices=MODEL_TYPES,
        verbose_name=_('model type')
    )
    
    # Configuration
    target_metric = models.ForeignKey(
        AnalyticsMetric,
        on_delete=models.CASCADE,
        related_name='predictive_models',
        verbose_name=_('target metric')
    )
    features = models.JSONField(default=list, verbose_name=_('features'))
    hyperparameters = models.JSONField(default=dict, verbose_name=_('hyperparameters'))
    
    # Model Performance
    accuracy_score = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        verbose_name=_('accuracy score')
    )
    training_data_size = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_('training data size')
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=MODEL_STATUS,
        default='TRAINING',
        verbose_name=_('status')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('is active'))
    
    # Metadata
    trained_at = models.DateTimeField(null=True, blank=True, verbose_name=_('trained at'))
    deployed_at = models.DateTimeField(null=True, blank=True, verbose_name=_('deployed at'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('updated at'))
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_predictive_models',
        verbose_name=_('created by')
    )
    
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Predictive Model')
        verbose_name_plural = _('Predictive Models')
        unique_together = ['company', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.company.name})"


class Prediction(models.Model):
    """Prediction results from machine learning models."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model = models.ForeignKey(
        PredictiveModel,
        on_delete=models.CASCADE,
        related_name='predictions',
        verbose_name=_('model')
    )
    
    # Prediction
    predicted_value = models.DecimalField(
        max_digits=15,
        decimal_places=6,
        verbose_name=_('predicted value')
    )
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        verbose_name=_('confidence score')
    )
    
    # Time Context
    prediction_date = models.DateTimeField(verbose_name=_('prediction date'))
    target_period_start = models.DateTimeField(verbose_name=_('target period start'))
    target_period_end = models.DateTimeField(verbose_name=_('target period end'))
    
    # Input Features
    input_features = models.JSONField(default=dict, verbose_name=_('input features'))
    
    # Validation (if actual value becomes available)
    actual_value = models.DecimalField(
        max_digits=15,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name=_('actual value')
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    
    class Meta:
        verbose_name = _('Prediction')
        verbose_name_plural = _('Predictions')
        indexes = [
            models.Index(fields=['model', 'prediction_date']),
            models.Index(fields=['model', 'target_period_start']),
        ]
    
    def __str__(self):
        return f"{self.model.name}: {self.predicted_value} ({self.target_period_start.date()})"


class BusinessIntelligenceDashboard(models.Model):
    """Business Intelligence dashboard configuration."""

    DASHBOARD_TYPES = [
        ('EXECUTIVE', _('Executive Dashboard')),
        ('OPERATIONAL', _('Operational Dashboard')),
        ('FINANCIAL', _('Financial Dashboard')),
        ('SALES', _('Sales Dashboard')),
        ('INVENTORY', _('Inventory Dashboard')),
        ('CUSTOM', _('Custom Dashboard')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='bi_dashboards',
        verbose_name=_('company')
    )

    # Basic Information
    name = models.CharField(max_length=200, verbose_name=_('name'))
    description = models.TextField(blank=True, verbose_name=_('description'))
    dashboard_type = models.CharField(
        max_length=20,
        choices=DASHBOARD_TYPES,
        verbose_name=_('dashboard type')
    )

    # Configuration
    layout_config = models.JSONField(default=dict, verbose_name=_('layout configuration'))
    widget_config = models.JSONField(default=list, verbose_name=_('widget configuration'))
    refresh_interval = models.PositiveIntegerField(
        default=300,  # 5 minutes
        verbose_name=_('refresh interval (seconds)')
    )

    # Access Control
    is_public = models.BooleanField(default=False, verbose_name=_('is public'))
    allowed_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='accessible_bi_dashboards',
        verbose_name=_('allowed users')
    )

    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('is active'))

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('updated at'))
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_bi_dashboards',
        verbose_name=_('created by')
    )

    history = HistoricalRecords()

    class Meta:
        verbose_name = _('BI Dashboard')
        verbose_name_plural = _('BI Dashboards')
        unique_together = ['company', 'name']

    def __str__(self):
        return f"{self.name} ({self.company.name})"
