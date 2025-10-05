from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class AIModel(models.Model):
    """Base model for all AI/ML models in the system"""
    
    MODEL_TYPES = [
        ('neural_network', 'Neural Network'),
        ('cnn', 'Convolutional Neural Network'),
        ('rnn', 'Recurrent Neural Network'),
        ('lstm', 'Long Short-Term Memory'),
        ('transformer', 'Transformer'),
        ('gan', 'Generative Adversarial Network'),
        ('autoencoder', 'Autoencoder'),
        ('reinforcement', 'Reinforcement Learning'),
        ('statistical', 'Statistical Model'),
        ('time_series', 'Time Series'),
        ('regression', 'Regression'),
        ('clustering', 'Clustering'),
        ('optimization', 'Optimization'),
        ('simulation', 'Simulation'),
    ]
    
    STATUS_CHOICES = [
        ('designing', 'Designing'),
        ('training', 'Training'),
        ('validating', 'Validating'),
        ('deployed', 'Deployed'),
        ('failed', 'Failed'),
        ('archived', 'Archived'),
        ('idle', 'Idle'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('scheduled', 'Scheduled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    model_type = models.CharField(max_length=50, choices=MODEL_TYPES)
    algorithm = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='designing')
    version = models.CharField(max_length=50, default='1.0.0')
    
    # Model configuration
    parameters = JSONField(default=dict, help_text="Model parameters and configuration")
    architecture = JSONField(default=dict, help_text="Model architecture details")
    
    # Performance metrics
    accuracy = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True
    )
    precision = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True
    )
    recall = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True
    )
    f1_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True
    )
    
    # Resource usage
    compute_time = models.FloatField(null=True, blank=True, help_text="Compute time in seconds")
    memory_usage = models.IntegerField(null=True, blank=True, help_text="Memory usage in MB")
    cpu_usage = models.FloatField(null=True, blank=True, help_text="CPU usage percentage")
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_models')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_run = models.DateTimeField(null=True, blank=True)
    next_run = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'ai_models'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['model_type', 'status']),
            models.Index(fields=['created_by', 'status']),
            models.Index(fields=['last_run']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.model_type})"


class TrainingJob(models.Model):
    """Training job for AI/ML models"""
    
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('initializing', 'Initializing'),
        ('training', 'Training'),
        ('validating', 'Validating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='training_jobs')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='queued')
    
    # Training configuration
    epochs = models.IntegerField(default=100)
    batch_size = models.IntegerField(default=32)
    learning_rate = models.FloatField(default=0.001)
    optimizer = models.CharField(max_length=50, default='adam')
    
    # Progress tracking
    progress = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        default=0.0
    )
    current_epoch = models.IntegerField(default=0)
    
    # Metrics
    training_metrics = JSONField(default=dict, help_text="Training metrics by epoch")
    validation_metrics = JSONField(default=dict, help_text="Validation metrics by epoch")
    
    # Resource usage
    resource_usage = JSONField(default=dict, help_text="Resource usage during training")
    
    # Logs
    logs = JSONField(default=list, help_text="Training logs")
    error_message = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'training_jobs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['model', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Training Job {self.id} - {self.model.name}"


class ModelPrediction(models.Model):
    """Store model predictions for tracking and analysis"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='predictions')
    
    # Input data
    input_data = JSONField(help_text="Input data for prediction")
    
    # Prediction results
    prediction = JSONField(help_text="Model prediction output")
    confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True
    )
    
    # Explanation data
    explanation = JSONField(default=dict, help_text="Prediction explanation data")
    feature_importance = JSONField(default=dict, help_text="Feature importance for this prediction")
    
    # Metadata
    prediction_time = models.FloatField(help_text="Time taken for prediction in seconds")
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        db_table = 'model_predictions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['model', 'created_at']),
            models.Index(fields=['confidence']),
        ]
    
    def __str__(self):
        return f"Prediction {self.id} - {self.model.name}"


class BiasDetectionResult(models.Model):
    """Store bias detection results for models"""
    
    DETECTION_METHODS = [
        ('statistical', 'Statistical'),
        ('fairness_metrics', 'Fairness Metrics'),
        ('adversarial', 'Adversarial'),
        ('causal', 'Causal'),
    ]
    
    BIAS_TYPES = [
        ('demographic', 'Demographic'),
        ('historical', 'Historical'),
        ('representation', 'Representation'),
        ('measurement', 'Measurement'),
        ('evaluation', 'Evaluation'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='bias_results')
    
    detection_method = models.CharField(max_length=50, choices=DETECTION_METHODS)
    overall_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    
    # Bias details
    bias_types = JSONField(default=list, help_text="Detected bias types with details")
    affected_groups = JSONField(default=list, help_text="Groups affected by bias")
    metrics = JSONField(default=dict, help_text="Bias detection metrics")
    
    # Recommendations
    recommendation = models.TextField()
    mitigation_actions = JSONField(default=list, help_text="Suggested mitigation actions")
    
    # Metadata
    detected_at = models.DateTimeField(auto_now_add=True)
    confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    
    class Meta:
        db_table = 'bias_detection_results'
        ordering = ['-detected_at']
        indexes = [
            models.Index(fields=['model', 'overall_score']),
            models.Index(fields=['detected_at']),
        ]
    
    def __str__(self):
        return f"Bias Detection {self.id} - {self.model.name}"


class GovernancePolicy(models.Model):
    """AI governance policies"""
    
    POLICY_TYPES = [
        ('data_usage', 'Data Usage'),
        ('model_development', 'Model Development'),
        ('deployment', 'Deployment'),
        ('monitoring', 'Monitoring'),
        ('incident_response', 'Incident Response'),
    ]
    
    SCOPE_CHOICES = [
        ('all_models', 'All Models'),
        ('high_risk', 'High Risk'),
        ('customer_facing', 'Customer Facing'),
        ('internal_only', 'Internal Only'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('deprecated', 'Deprecated'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    policy_type = models.CharField(max_length=50, choices=POLICY_TYPES)
    scope = models.CharField(max_length=50, choices=SCOPE_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    version = models.CharField(max_length=50, default='1.0.0')
    
    # Policy content
    requirements = JSONField(default=list, help_text="Policy requirements")
    enforcement = JSONField(default=dict, help_text="Enforcement mechanisms")
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='governance_policies')
    approved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_policies'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    next_review = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'governance_policies'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['policy_type', 'status']),
            models.Index(fields=['scope', 'status']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.policy_type})"


class PolicyViolation(models.Model):
    """Track policy violations"""
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('accepted_risk', 'Accepted Risk'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    policy = models.ForeignKey(GovernancePolicy, on_delete=models.CASCADE, related_name='violations')
    model = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='policy_violations')
    
    severity = models.CharField(max_length=50, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='open')
    description = models.TextField()
    
    # Resolution
    resolution = models.TextField(blank=True, null=True)
    resolved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='resolved_violations'
    )
    
    # Timestamps
    detected_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Responsible person
    responsible = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='assigned_violations'
    )
    
    class Meta:
        db_table = 'policy_violations'
        ordering = ['-detected_at']
        indexes = [
            models.Index(fields=['policy', 'status']),
            models.Index(fields=['model', 'severity']),
            models.Index(fields=['responsible', 'status']),
        ]
    
    def __str__(self):
        return f"Violation {self.id} - {self.policy.name}"


class StreamingDataSource(models.Model):
    """Configuration for real-time streaming data sources"""
    
    SOURCE_TYPES = [
        ('websocket', 'WebSocket'),
        ('kafka', 'Apache Kafka'),
        ('rabbitmq', 'RabbitMQ'),
        ('redis', 'Redis'),
        ('sse', 'Server-Sent Events'),
        ('polling', 'HTTP Polling'),
    ]
    
    STATUS_CHOICES = [
        ('connected', 'Connected'),
        ('disconnected', 'Disconnected'),
        ('error', 'Error'),
        ('reconnecting', 'Reconnecting'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    source_type = models.CharField(max_length=50, choices=SOURCE_TYPES)
    endpoint = models.URLField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='disconnected')
    
    # Configuration
    config = JSONField(default=dict, help_text="Source-specific configuration")
    filters = JSONField(default=list, help_text="Data filters")
    
    # Metrics
    data_rate = models.FloatField(default=0.0, help_text="Messages per second")
    total_messages = models.BigIntegerField(default=0)
    error_count = models.IntegerField(default=0)
    last_message_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='streaming_sources')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'streaming_data_sources'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['source_type', 'status']),
            models.Index(fields=['status', 'last_message_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.source_type})"


class StreamingEvent(models.Model):
    """Store streaming events for analysis"""
    
    EVENT_TYPES = [
        ('user_action', 'User Action'),
        ('system_event', 'System Event'),
        ('business_metric', 'Business Metric'),
        ('alert', 'Alert'),
        ('error', 'Error'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source = models.ForeignKey(StreamingDataSource, on_delete=models.CASCADE, related_name='events')
    
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    category = models.CharField(max_length=100)
    severity = models.CharField(max_length=50, choices=SEVERITY_CHOICES, default='low')
    
    # Event data
    data = JSONField(help_text="Event data payload")
    tags = JSONField(default=list, help_text="Event tags")
    
    # Processing
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'streaming_events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['source', 'event_type']),
            models.Index(fields=['timestamp', 'severity']),
            models.Index(fields=['processed', 'created_at']),
        ]
    
    def __str__(self):
        return f"Event {self.id} - {self.event_type}"
