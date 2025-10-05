"""
Admin configuration for analytics module.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import (
    AnalyticsDataSource, AnalyticsMetric, MetricValue,
    PredictiveModel, Prediction, BusinessIntelligenceDashboard
)


@admin.register(AnalyticsDataSource)
class AnalyticsDataSourceAdmin(admin.ModelAdmin):
    """Admin for AnalyticsDataSource."""
    
    list_display = [
        'name', 'company', 'source_type', 'is_active',
        'last_refresh', 'created_at'
    ]
    list_filter = ['source_type', 'is_active', 'company']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'last_refresh', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'company', 'source_type')
        }),
        (_('Configuration'), {
            'fields': ('connection_string', 'query_template', 'refresh_interval')
        }),
        (_('Status'), {
            'fields': ('is_active', 'last_refresh')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AnalyticsMetric)
class AnalyticsMetricAdmin(admin.ModelAdmin):
    """Admin for AnalyticsMetric."""
    
    list_display = [
        'name', 'company', 'metric_type', 'aggregation_period',
        'is_active', 'created_at'
    ]
    list_filter = ['metric_type', 'aggregation_period', 'is_active', 'company']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'company', 'data_source')
        }),
        (_('Calculation'), {
            'fields': ('metric_type', 'calculation_formula', 'aggregation_period')
        }),
        (_('Display'), {
            'fields': ('unit', 'decimal_places')
        }),
        (_('Thresholds'), {
            'fields': ('target_value', 'warning_threshold', 'critical_threshold')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MetricValue)
class MetricValueAdmin(admin.ModelAdmin):
    """Admin for MetricValue."""
    
    list_display = [
        'metric', 'value', 'period_start', 'period_end', 'calculated_at'
    ]
    list_filter = ['metric', 'calculated_at']
    readonly_fields = ['id', 'calculated_at']
    date_hierarchy = 'period_start'
    
    fieldsets = (
        (_('Metric'), {
            'fields': ('metric',)
        }),
        (_('Value'), {
            'fields': ('value', 'period_start', 'period_end')
        }),
        (_('Context'), {
            'fields': ('dimensions',)
        }),
        (_('Metadata'), {
            'fields': ('id', 'calculated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PredictiveModel)
class PredictiveModelAdmin(admin.ModelAdmin):
    """Admin for PredictiveModel."""
    
    list_display = [
        'name', 'company', 'model_type', 'status',
        'accuracy_score', 'trained_at', 'is_active'
    ]
    list_filter = ['model_type', 'status', 'is_active', 'company']
    search_fields = ['name', 'description']
    readonly_fields = [
        'id', 'accuracy_score', 'training_data_size', 'status',
        'trained_at', 'deployed_at', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'company', 'model_type')
        }),
        (_('Configuration'), {
            'fields': ('target_metric', 'features', 'hyperparameters')
        }),
        (_('Performance'), {
            'fields': ('accuracy_score', 'training_data_size'),
            'classes': ('collapse',)
        }),
        (_('Status'), {
            'fields': ('status', 'is_active', 'trained_at', 'deployed_at')
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    """Admin for Prediction."""
    
    list_display = [
        'model', 'predicted_value', 'confidence_score',
        'target_period_start', 'prediction_date'
    ]
    list_filter = ['model', 'prediction_date']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'prediction_date'
    
    fieldsets = (
        (_('Model'), {
            'fields': ('model',)
        }),
        (_('Prediction'), {
            'fields': ('predicted_value', 'confidence_score')
        }),
        (_('Time Context'), {
            'fields': ('prediction_date', 'target_period_start', 'target_period_end')
        }),
        (_('Features'), {
            'fields': ('input_features',)
        }),
        (_('Validation'), {
            'fields': ('actual_value',)
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BusinessIntelligenceDashboard)
class BusinessIntelligenceDashboardAdmin(admin.ModelAdmin):
    """Admin for BusinessIntelligenceDashboard."""
    
    list_display = [
        'name', 'company', 'dashboard_type', 'is_public',
        'is_active', 'created_at'
    ]
    list_filter = ['dashboard_type', 'is_public', 'is_active', 'company']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    filter_horizontal = ['allowed_users']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'company', 'dashboard_type')
        }),
        (_('Configuration'), {
            'fields': ('layout_config', 'widget_config', 'refresh_interval')
        }),
        (_('Access Control'), {
            'fields': ('is_public', 'allowed_users')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('Metadata'), {
            'fields': ('id', 'created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
