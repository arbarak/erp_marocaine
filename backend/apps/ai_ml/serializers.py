from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    AIModel, TrainingJob, ModelPrediction, BiasDetectionResult,
    GovernancePolicy, PolicyViolation, StreamingDataSource, StreamingEvent
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['id']


class AIModelSerializer(serializers.ModelSerializer):
    """Serializer for AI Model"""
    
    created_by = UserSerializer(read_only=True)
    training_jobs_count = serializers.SerializerMethodField()
    predictions_count = serializers.SerializerMethodField()
    latest_training_job = serializers.SerializerMethodField()
    
    class Meta:
        model = AIModel
        fields = [
            'id', 'name', 'description', 'model_type', 'algorithm', 'status', 'version',
            'parameters', 'architecture', 'accuracy', 'precision', 'recall', 'f1_score',
            'compute_time', 'memory_usage', 'cpu_usage', 'created_by', 'created_at',
            'updated_at', 'last_run', 'next_run', 'training_jobs_count', 'predictions_count',
            'latest_training_job'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_training_jobs_count(self, obj):
        return obj.training_jobs.count()
    
    def get_predictions_count(self, obj):
        return obj.predictions.count()
    
    def get_latest_training_job(self, obj):
        latest_job = obj.training_jobs.first()
        if latest_job:
            return TrainingJobSerializer(latest_job).data
        return None
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TrainingJobSerializer(serializers.ModelSerializer):
    """Serializer for Training Job"""
    
    model_name = serializers.CharField(source='model.name', read_only=True)
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingJob
        fields = [
            'id', 'model', 'model_name', 'status', 'epochs', 'batch_size',
            'learning_rate', 'optimizer', 'progress', 'current_epoch',
            'training_metrics', 'validation_metrics', 'resource_usage',
            'logs', 'error_message', 'created_at', 'started_at', 'completed_at',
            'duration'
        ]
        read_only_fields = ['id', 'created_at', 'progress', 'current_epoch']
    
    def get_duration(self, obj):
        if obj.started_at and obj.completed_at:
            return (obj.completed_at - obj.started_at).total_seconds()
        return None


class ModelPredictionSerializer(serializers.ModelSerializer):
    """Serializer for Model Prediction"""
    
    model_name = serializers.CharField(source='model.name', read_only=True)
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ModelPrediction
        fields = [
            'id', 'model', 'model_name', 'input_data', 'prediction', 'confidence',
            'explanation', 'feature_importance', 'prediction_time', 'created_at',
            'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']
    
    def create(self, validated_data):
        if self.context['request'].user.is_authenticated:
            validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class BiasDetectionResultSerializer(serializers.ModelSerializer):
    """Serializer for Bias Detection Result"""
    
    model_name = serializers.CharField(source='model.name', read_only=True)
    bias_count = serializers.SerializerMethodField()
    high_severity_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BiasDetectionResult
        fields = [
            'id', 'model', 'model_name', 'detection_method', 'overall_score',
            'bias_types', 'affected_groups', 'metrics', 'recommendation',
            'mitigation_actions', 'detected_at', 'confidence', 'bias_count',
            'high_severity_count'
        ]
        read_only_fields = ['id', 'detected_at']
    
    def get_bias_count(self, obj):
        return len(obj.bias_types) if obj.bias_types else 0
    
    def get_high_severity_count(self, obj):
        if not obj.bias_types:
            return 0
        return len([bias for bias in obj.bias_types if bias.get('severity') in ['high', 'critical']])


class GovernancePolicySerializer(serializers.ModelSerializer):
    """Serializer for Governance Policy"""
    
    created_by = UserSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)
    violations_count = serializers.SerializerMethodField()
    active_violations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = GovernancePolicy
        fields = [
            'id', 'name', 'description', 'policy_type', 'scope', 'status', 'version',
            'requirements', 'enforcement', 'created_by', 'approved_by', 'created_at',
            'updated_at', 'approved_at', 'next_review', 'violations_count',
            'active_violations_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_violations_count(self, obj):
        return obj.violations.count()
    
    def get_active_violations_count(self, obj):
        return obj.violations.filter(status__in=['open', 'in_progress']).count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PolicyViolationSerializer(serializers.ModelSerializer):
    """Serializer for Policy Violation"""
    
    policy_name = serializers.CharField(source='policy.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    responsible = UserSerializer(read_only=True)
    resolved_by = UserSerializer(read_only=True)
    days_open = serializers.SerializerMethodField()
    
    class Meta:
        model = PolicyViolation
        fields = [
            'id', 'policy', 'policy_name', 'model', 'model_name', 'severity',
            'status', 'description', 'resolution', 'responsible', 'resolved_by',
            'detected_at', 'resolved_at', 'days_open'
        ]
        read_only_fields = ['id', 'detected_at']
    
    def get_days_open(self, obj):
        from django.utils import timezone
        if obj.resolved_at:
            return (obj.resolved_at - obj.detected_at).days
        return (timezone.now() - obj.detected_at).days


class StreamingDataSourceSerializer(serializers.ModelSerializer):
    """Serializer for Streaming Data Source"""
    
    created_by = UserSerializer(read_only=True)
    events_count = serializers.SerializerMethodField()
    recent_events_count = serializers.SerializerMethodField()
    uptime_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = StreamingDataSource
        fields = [
            'id', 'name', 'description', 'source_type', 'endpoint', 'status',
            'config', 'filters', 'data_rate', 'total_messages', 'error_count',
            'last_message_at', 'created_by', 'created_at', 'updated_at',
            'events_count', 'recent_events_count', 'uptime_percentage'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_events_count(self, obj):
        return obj.events.count()
    
    def get_recent_events_count(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        last_hour = timezone.now() - timedelta(hours=1)
        return obj.events.filter(timestamp__gte=last_hour).count()
    
    def get_uptime_percentage(self, obj):
        # Calculate uptime based on error count and total messages
        if obj.total_messages == 0:
            return 0.0
        return ((obj.total_messages - obj.error_count) / obj.total_messages) * 100
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class StreamingEventSerializer(serializers.ModelSerializer):
    """Serializer for Streaming Event"""
    
    source_name = serializers.CharField(source='source.name', read_only=True)
    age_seconds = serializers.SerializerMethodField()
    
    class Meta:
        model = StreamingEvent
        fields = [
            'id', 'source', 'source_name', 'event_type', 'category', 'severity',
            'data', 'tags', 'processed', 'processed_at', 'timestamp', 'created_at',
            'age_seconds'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_age_seconds(self, obj):
        from django.utils import timezone
        return (timezone.now() - obj.timestamp).total_seconds()


# Analytics and Statistics Serializers

class ModelPerformanceStatsSerializer(serializers.Serializer):
    """Serializer for model performance statistics"""
    
    total_models = serializers.IntegerField()
    active_models = serializers.IntegerField()
    training_models = serializers.IntegerField()
    deployed_models = serializers.IntegerField()
    failed_models = serializers.IntegerField()
    average_accuracy = serializers.FloatField()
    average_compute_time = serializers.FloatField()
    total_predictions = serializers.IntegerField()
    predictions_today = serializers.IntegerField()


class BiasAnalyticsSerializer(serializers.Serializer):
    """Serializer for bias analytics"""
    
    total_scans = serializers.IntegerField()
    models_with_bias = serializers.IntegerField()
    critical_bias_issues = serializers.IntegerField()
    average_bias_score = serializers.FloatField()
    bias_by_type = serializers.DictField()
    bias_trends = serializers.ListField()


class GovernanceMetricsSerializer(serializers.Serializer):
    """Serializer for governance metrics"""
    
    total_policies = serializers.IntegerField()
    active_policies = serializers.IntegerField()
    total_violations = serializers.IntegerField()
    open_violations = serializers.IntegerField()
    critical_violations = serializers.IntegerField()
    compliance_score = serializers.FloatField()
    policy_coverage = serializers.FloatField()


class StreamingAnalyticsSerializer(serializers.Serializer):
    """Serializer for streaming analytics"""
    
    total_sources = serializers.IntegerField()
    active_sources = serializers.IntegerField()
    total_events = serializers.IntegerField()
    events_per_second = serializers.FloatField()
    error_rate = serializers.FloatField()
    average_latency = serializers.FloatField()
    events_by_type = serializers.DictField()
    events_by_severity = serializers.DictField()


# Prediction Request/Response Serializers

class PredictionRequestSerializer(serializers.Serializer):
    """Serializer for prediction requests"""
    
    model_id = serializers.UUIDField()
    input_data = serializers.JSONField()
    include_explanation = serializers.BooleanField(default=False)
    include_confidence = serializers.BooleanField(default=True)


class PredictionResponseSerializer(serializers.Serializer):
    """Serializer for prediction responses"""
    
    prediction_id = serializers.UUIDField()
    prediction = serializers.JSONField()
    confidence = serializers.FloatField(required=False)
    explanation = serializers.JSONField(required=False)
    feature_importance = serializers.JSONField(required=False)
    prediction_time = serializers.FloatField()
    model_info = serializers.DictField()


# Training Request Serializers

class TrainingRequestSerializer(serializers.Serializer):
    """Serializer for training requests"""
    
    model_id = serializers.UUIDField()
    epochs = serializers.IntegerField(min_value=1, max_value=10000, default=100)
    batch_size = serializers.IntegerField(min_value=1, max_value=1024, default=32)
    learning_rate = serializers.FloatField(min_value=0.0001, max_value=1.0, default=0.001)
    optimizer = serializers.ChoiceField(
        choices=['adam', 'sgd', 'rmsprop', 'adagrad'],
        default='adam'
    )
    validation_split = serializers.FloatField(min_value=0.1, max_value=0.5, default=0.2)
    early_stopping = serializers.BooleanField(default=True)
    save_checkpoints = serializers.BooleanField(default=True)


class BiasDetectionRequestSerializer(serializers.Serializer):
    """Serializer for bias detection requests"""
    
    model_id = serializers.UUIDField()
    detection_method = serializers.ChoiceField(
        choices=['statistical', 'fairness_metrics', 'adversarial', 'causal'],
        default='fairness_metrics'
    )
    protected_attributes = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    fairness_metrics = serializers.ListField(
        child=serializers.CharField(),
        default=['demographic_parity', 'equalized_odds', 'calibration']
    )
    threshold = serializers.FloatField(min_value=0.0, max_value=1.0, default=0.8)


# Bulk Operations Serializers

class BulkModelUpdateSerializer(serializers.Serializer):
    """Serializer for bulk model updates"""
    
    model_ids = serializers.ListField(child=serializers.UUIDField())
    status = serializers.ChoiceField(
        choices=AIModel.STATUS_CHOICES,
        required=False
    )
    parameters = serializers.JSONField(required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)


class BulkPolicyApplicationSerializer(serializers.Serializer):
    """Serializer for bulk policy application"""
    
    policy_id = serializers.UUIDField()
    model_ids = serializers.ListField(child=serializers.UUIDField())
    force_apply = serializers.BooleanField(default=False)
    notify_users = serializers.BooleanField(default=True)
