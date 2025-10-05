from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
import json

from .models import (
    AIModel, TrainingJob, ModelPrediction, BiasDetectionResult,
    GovernancePolicy, PolicyViolation, StreamingDataSource, StreamingEvent
)


@admin.register(AIModel)
class AIModelAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'model_type', 'algorithm', 'status', 'accuracy_display',
        'created_by', 'created_at', 'last_run'
    ]
    list_filter = ['model_type', 'status', 'created_at', 'created_by']
    search_fields = ['name', 'description', 'algorithm']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'description', 'model_type', 'algorithm', 'status', 'version')
        }),
        ('Configuration', {
            'fields': ('parameters', 'architecture'),
            'classes': ('collapse',)
        }),
        ('Performance Metrics', {
            'fields': ('accuracy', 'precision', 'recall', 'f1_score')
        }),
        ('Resource Usage', {
            'fields': ('compute_time', 'memory_usage', 'cpu_usage')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at', 'last_run', 'next_run'),
            'classes': ('collapse',)
        })
    )
    
    def accuracy_display(self, obj):
        if obj.accuracy:
            color = 'green' if obj.accuracy > 0.8 else 'orange' if obj.accuracy > 0.6 else 'red'
            return format_html(
                '<span style="color: {};">{:.1%}</span>',
                color, obj.accuracy
            )
        return '-'
    accuracy_display.short_description = 'Accuracy'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')


@admin.register(TrainingJob)
class TrainingJobAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'model_link', 'status', 'progress_display', 'current_epoch',
        'total_epochs', 'created_at', 'duration_display'
    ]
    list_filter = ['status', 'optimizer', 'created_at']
    search_fields = ['model__name', 'id']
    readonly_fields = ['id', 'created_at', 'started_at', 'completed_at', 'progress', 'current_epoch']
    fieldsets = (
        ('Job Information', {
            'fields': ('id', 'model', 'status', 'progress', 'current_epoch')
        }),
        ('Training Configuration', {
            'fields': ('epochs', 'batch_size', 'learning_rate', 'optimizer')
        }),
        ('Metrics & Logs', {
            'fields': ('training_metrics', 'validation_metrics', 'resource_usage', 'logs'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'started_at', 'completed_at'),
            'classes': ('collapse',)
        })
    )
    
    def model_link(self, obj):
        url = reverse('admin:ai_ml_aimodel_change', args=[obj.model.id])
        return format_html('<a href="{}">{}</a>', url, obj.model.name)
    model_link.short_description = 'Model'
    
    def progress_display(self, obj):
        if obj.progress:
            return format_html(
                '<div style="width: 100px; background-color: #f0f0f0; border-radius: 3px;">'
                '<div style="width: {}%; background-color: #007cba; height: 20px; border-radius: 3px;"></div>'
                '</div> {:.1f}%',
                obj.progress, obj.progress
            )
        return '-'
    progress_display.short_description = 'Progress'
    
    def total_epochs(self, obj):
        return obj.epochs
    total_epochs.short_description = 'Total Epochs'
    
    def duration_display(self, obj):
        if obj.started_at and obj.completed_at:
            duration = obj.completed_at - obj.started_at
            return str(duration).split('.')[0]  # Remove microseconds
        return '-'
    duration_display.short_description = 'Duration'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('model')


@admin.register(ModelPrediction)
class ModelPredictionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'model_link', 'confidence_display', 'prediction_time',
        'created_by', 'created_at'
    ]
    list_filter = ['model', 'created_at', 'created_by']
    search_fields = ['model__name', 'id']
    readonly_fields = ['id', 'created_at']
    fieldsets = (
        ('Prediction Information', {
            'fields': ('id', 'model', 'confidence', 'prediction_time')
        }),
        ('Data', {
            'fields': ('input_data', 'prediction', 'explanation', 'feature_importance'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',)
        })
    )
    
    def model_link(self, obj):
        url = reverse('admin:ai_ml_aimodel_change', args=[obj.model.id])
        return format_html('<a href="{}">{}</a>', url, obj.model.name)
    model_link.short_description = 'Model'
    
    def confidence_display(self, obj):
        if obj.confidence:
            color = 'green' if obj.confidence > 0.8 else 'orange' if obj.confidence > 0.6 else 'red'
            return format_html(
                '<span style="color: {};">{:.1%}</span>',
                color, obj.confidence
            )
        return '-'
    confidence_display.short_description = 'Confidence'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('model', 'created_by')


@admin.register(BiasDetectionResult)
class BiasDetectionResultAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'model_link', 'detection_method', 'overall_score_display',
        'bias_count', 'detected_at'
    ]
    list_filter = ['detection_method', 'detected_at']
    search_fields = ['model__name', 'id']
    readonly_fields = ['id', 'detected_at']
    fieldsets = (
        ('Detection Information', {
            'fields': ('id', 'model', 'detection_method', 'overall_score', 'confidence')
        }),
        ('Bias Details', {
            'fields': ('bias_types', 'affected_groups', 'metrics'),
            'classes': ('collapse',)
        }),
        ('Recommendations', {
            'fields': ('recommendation', 'mitigation_actions'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('detected_at',),
            'classes': ('collapse',)
        })
    )
    
    def model_link(self, obj):
        url = reverse('admin:ai_ml_aimodel_change', args=[obj.model.id])
        return format_html('<a href="{}">{}</a>', url, obj.model.name)
    model_link.short_description = 'Model'
    
    def overall_score_display(self, obj):
        color = 'green' if obj.overall_score > 0.8 else 'orange' if obj.overall_score > 0.6 else 'red'
        return format_html(
            '<span style="color: {};">{:.1%}</span>',
            color, obj.overall_score
        )
    overall_score_display.short_description = 'Overall Score'
    
    def bias_count(self, obj):
        return len(obj.bias_types) if obj.bias_types else 0
    bias_count.short_description = 'Bias Types'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('model')


@admin.register(GovernancePolicy)
class GovernancePolicyAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'policy_type', 'scope', 'status', 'version',
        'created_by', 'approved_by', 'created_at'
    ]
    list_filter = ['policy_type', 'scope', 'status', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'approved_at']
    fieldsets = (
        ('Policy Information', {
            'fields': ('id', 'name', 'description', 'policy_type', 'scope', 'status', 'version')
        }),
        ('Policy Content', {
            'fields': ('requirements', 'enforcement'),
            'classes': ('collapse',)
        }),
        ('Approval & Review', {
            'fields': ('created_by', 'approved_by', 'approved_at', 'next_review')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by', 'approved_by')


@admin.register(PolicyViolation)
class PolicyViolationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'policy_link', 'model_link', 'severity_display',
        'status', 'responsible', 'detected_at', 'days_open'
    ]
    list_filter = ['severity', 'status', 'detected_at', 'responsible']
    search_fields = ['policy__name', 'model__name', 'description']
    readonly_fields = ['id', 'detected_at', 'resolved_at']
    fieldsets = (
        ('Violation Information', {
            'fields': ('id', 'policy', 'model', 'severity', 'status')
        }),
        ('Description & Resolution', {
            'fields': ('description', 'resolution')
        }),
        ('Assignment & Timeline', {
            'fields': ('responsible', 'resolved_by', 'detected_at', 'resolved_at')
        })
    )
    
    def policy_link(self, obj):
        url = reverse('admin:ai_ml_governancepolicy_change', args=[obj.policy.id])
        return format_html('<a href="{}">{}</a>', url, obj.policy.name)
    policy_link.short_description = 'Policy'
    
    def model_link(self, obj):
        url = reverse('admin:ai_ml_aimodel_change', args=[obj.model.id])
        return format_html('<a href="{}">{}</a>', url, obj.model.name)
    model_link.short_description = 'Model'
    
    def severity_display(self, obj):
        colors = {
            'low': 'green',
            'medium': 'orange',
            'high': 'red',
            'critical': 'darkred'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.severity, 'black'), obj.severity.upper()
        )
    severity_display.short_description = 'Severity'
    
    def days_open(self, obj):
        from django.utils import timezone
        if obj.resolved_at:
            return (obj.resolved_at - obj.detected_at).days
        return (timezone.now() - obj.detected_at).days
    days_open.short_description = 'Days Open'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('policy', 'model', 'responsible', 'resolved_by')


@admin.register(StreamingDataSource)
class StreamingDataSourceAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'source_type', 'status_display', 'data_rate',
        'total_messages', 'error_count', 'last_message_at'
    ]
    list_filter = ['source_type', 'status', 'created_at']
    search_fields = ['name', 'description', 'endpoint']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_message_at']
    fieldsets = (
        ('Source Information', {
            'fields': ('id', 'name', 'description', 'source_type', 'endpoint', 'status')
        }),
        ('Configuration', {
            'fields': ('config', 'filters'),
            'classes': ('collapse',)
        }),
        ('Metrics', {
            'fields': ('data_rate', 'total_messages', 'error_count', 'last_message_at')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def status_display(self, obj):
        colors = {
            'connected': 'green',
            'disconnected': 'gray',
            'error': 'red',
            'reconnecting': 'orange'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'), obj.status.upper()
        )
    status_display.short_description = 'Status'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')


@admin.register(StreamingEvent)
class StreamingEventAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'source_link', 'event_type', 'category', 'severity_display',
        'processed', 'timestamp'
    ]
    list_filter = ['event_type', 'severity', 'processed', 'timestamp']
    search_fields = ['source__name', 'category']
    readonly_fields = ['id', 'timestamp', 'created_at', 'processed_at']
    fieldsets = (
        ('Event Information', {
            'fields': ('id', 'source', 'event_type', 'category', 'severity')
        }),
        ('Event Data', {
            'fields': ('data', 'tags'),
            'classes': ('collapse',)
        }),
        ('Processing', {
            'fields': ('processed', 'processed_at')
        }),
        ('Timestamps', {
            'fields': ('timestamp', 'created_at'),
            'classes': ('collapse',)
        })
    )
    
    def source_link(self, obj):
        url = reverse('admin:ai_ml_streamingdatasource_change', args=[obj.source.id])
        return format_html('<a href="{}">{}</a>', url, obj.source.name)
    source_link.short_description = 'Source'
    
    def severity_display(self, obj):
        colors = {
            'low': 'green',
            'medium': 'orange',
            'high': 'red',
            'critical': 'darkred'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.severity, 'black'), obj.severity.upper()
        )
    severity_display.short_description = 'Severity'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('source')


# Custom admin site configuration
admin.site.site_header = 'ERP AI/ML Administration'
admin.site.site_title = 'AI/ML Admin'
admin.site.index_title = 'AI/ML Management'
