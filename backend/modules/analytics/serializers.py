"""
Serializers for analytics module.
"""
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

from .models import (
    AnalyticsDataSource, AnalyticsMetric, MetricValue,
    PredictiveModel, Prediction, BusinessIntelligenceDashboard
)


class AnalyticsDataSourceSerializer(serializers.ModelSerializer):
    """Serializer for AnalyticsDataSource."""
    
    class Meta:
        model = AnalyticsDataSource
        fields = [
            'id', 'name', 'description', 'source_type',
            'refresh_interval', 'is_active', 'last_refresh',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'last_refresh', 'created_at', 'updated_at', 'created_by']


class AnalyticsDataSourceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating AnalyticsDataSource."""
    
    class Meta:
        model = AnalyticsDataSource
        fields = [
            'name', 'description', 'source_type',
            'connection_string', 'query_template', 'refresh_interval'
        ]
    
    def create(self, validated_data):
        """Create data source with company context."""
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AnalyticsMetricSerializer(serializers.ModelSerializer):
    """Serializer for AnalyticsMetric."""
    
    data_source_name = serializers.CharField(source='data_source.name', read_only=True)
    current_value = serializers.SerializerMethodField()
    
    class Meta:
        model = AnalyticsMetric
        fields = [
            'id', 'name', 'description', 'metric_type',
            'calculation_formula', 'aggregation_period',
            'unit', 'decimal_places', 'target_value',
            'warning_threshold', 'critical_threshold',
            'is_active', 'data_source', 'data_source_name',
            'current_value', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_current_value(self, obj):
        """Get the most recent metric value."""
        latest_value = obj.values.order_by('-period_start').first()
        if latest_value:
            return {
                'value': latest_value.value,
                'period_start': latest_value.period_start,
                'period_end': latest_value.period_end
            }
        return None


class AnalyticsMetricCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating AnalyticsMetric."""
    
    class Meta:
        model = AnalyticsMetric
        fields = [
            'name', 'description', 'metric_type', 'data_source',
            'calculation_formula', 'aggregation_period',
            'unit', 'decimal_places', 'target_value',
            'warning_threshold', 'critical_threshold'
        ]
    
    def create(self, validated_data):
        """Create metric with company context."""
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class MetricValueSerializer(serializers.ModelSerializer):
    """Serializer for MetricValue."""
    
    metric_name = serializers.CharField(source='metric.name', read_only=True)
    metric_unit = serializers.CharField(source='metric.unit', read_only=True)
    
    class Meta:
        model = MetricValue
        fields = [
            'id', 'value', 'period_start', 'period_end',
            'dimensions', 'calculated_at',
            'metric', 'metric_name', 'metric_unit'
        ]
        read_only_fields = ['id', 'calculated_at']


class PredictiveModelSerializer(serializers.ModelSerializer):
    """Serializer for PredictiveModel."""
    
    target_metric_name = serializers.CharField(source='target_metric.name', read_only=True)
    latest_prediction = serializers.SerializerMethodField()
    
    class Meta:
        model = PredictiveModel
        fields = [
            'id', 'name', 'description', 'model_type',
            'target_metric', 'target_metric_name', 'features',
            'hyperparameters', 'accuracy_score', 'training_data_size',
            'status', 'is_active', 'trained_at', 'deployed_at',
            'latest_prediction', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = [
            'id', 'accuracy_score', 'training_data_size', 'status',
            'trained_at', 'deployed_at', 'created_at', 'updated_at', 'created_by'
        ]
    
    def get_latest_prediction(self, obj):
        """Get the most recent prediction."""
        latest_prediction = obj.predictions.order_by('-prediction_date').first()
        if latest_prediction:
            return {
                'predicted_value': latest_prediction.predicted_value,
                'confidence_score': latest_prediction.confidence_score,
                'prediction_date': latest_prediction.prediction_date,
                'target_period_start': latest_prediction.target_period_start
            }
        return None


class PredictiveModelCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating PredictiveModel."""
    
    class Meta:
        model = PredictiveModel
        fields = [
            'name', 'description', 'model_type',
            'target_metric', 'features', 'hyperparameters'
        ]
    
    def create(self, validated_data):
        """Create model with company context."""
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PredictionSerializer(serializers.ModelSerializer):
    """Serializer for Prediction."""
    
    model_name = serializers.CharField(source='model.name', read_only=True)
    accuracy_error = serializers.SerializerMethodField()
    
    class Meta:
        model = Prediction
        fields = [
            'id', 'predicted_value', 'confidence_score',
            'prediction_date', 'target_period_start', 'target_period_end',
            'input_features', 'actual_value', 'accuracy_error',
            'model', 'model_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_accuracy_error(self, obj):
        """Calculate prediction accuracy error if actual value is available."""
        if obj.actual_value is not None:
            error = abs(obj.predicted_value - obj.actual_value)
            error_percentage = (error / obj.actual_value) * 100 if obj.actual_value != 0 else 0
            return {
                'absolute_error': error,
                'percentage_error': error_percentage
            }
        return None


class BusinessIntelligenceDashboardSerializer(serializers.ModelSerializer):
    """Serializer for BusinessIntelligenceDashboard."""
    
    allowed_users_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BusinessIntelligenceDashboard
        fields = [
            'id', 'name', 'description', 'dashboard_type',
            'layout_config', 'widget_config', 'refresh_interval',
            'is_public', 'allowed_users', 'allowed_users_count',
            'is_active', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_allowed_users_count(self, obj):
        """Get count of allowed users."""
        return obj.allowed_users.count()


class BusinessIntelligenceDashboardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating BusinessIntelligenceDashboard."""
    
    class Meta:
        model = BusinessIntelligenceDashboard
        fields = [
            'name', 'description', 'dashboard_type',
            'layout_config', 'widget_config', 'refresh_interval',
            'is_public', 'allowed_users'
        ]
    
    def create(self, validated_data):
        """Create dashboard with company context."""
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class MetricCalculationParametersSerializer(serializers.Serializer):
    """Serializer for metric calculation parameters."""
    
    period_start = serializers.DateTimeField()
    period_end = serializers.DateTimeField()
    metric_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text=_('List of metric IDs to calculate. If empty, all active metrics will be calculated.')
    )


class ModelTrainingParametersSerializer(serializers.Serializer):
    """Serializer for model training parameters."""
    
    model_id = serializers.UUIDField()
    retrain = serializers.BooleanField(
        default=False,
        help_text=_('Whether to retrain an already trained model')
    )


class PredictionParametersSerializer(serializers.Serializer):
    """Serializer for prediction parameters."""
    
    model_id = serializers.UUIDField()
    target_date = serializers.DateTimeField()
    input_features = serializers.JSONField(
        required=False,
        default=dict,
        help_text=_('Additional input features for prediction')
    )


class DashboardDataSerializer(serializers.Serializer):
    """Serializer for dashboard data response."""
    
    dashboard_type = serializers.CharField()
    period = serializers.DictField()
    key_metrics = serializers.DictField()
    trends = serializers.DictField()
    alerts = serializers.ListField()
    generated_at = serializers.DateTimeField()


class AnalyticsInsightSerializer(serializers.Serializer):
    """Serializer for analytics insights."""
    
    insight_type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    severity = serializers.ChoiceField(choices=['INFO', 'WARNING', 'CRITICAL'])
    metrics = serializers.ListField()
    recommendations = serializers.ListField()
    generated_at = serializers.DateTimeField()
