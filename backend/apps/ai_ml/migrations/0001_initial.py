# Generated migration for AI/ML models

from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion
import uuid
import django.core.validators


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AIModel',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('model_type', models.CharField(choices=[('neural_network', 'Neural Network'), ('cnn', 'Convolutional Neural Network'), ('rnn', 'Recurrent Neural Network'), ('lstm', 'Long Short-Term Memory'), ('transformer', 'Transformer'), ('gan', 'Generative Adversarial Network'), ('autoencoder', 'Autoencoder'), ('reinforcement', 'Reinforcement Learning'), ('statistical', 'Statistical Model'), ('time_series', 'Time Series'), ('regression', 'Regression'), ('clustering', 'Clustering'), ('optimization', 'Optimization'), ('simulation', 'Simulation')], max_length=50)),
                ('algorithm', models.CharField(max_length=255)),
                ('status', models.CharField(choices=[('designing', 'Designing'), ('training', 'Training'), ('validating', 'Validating'), ('deployed', 'Deployed'), ('failed', 'Failed'), ('archived', 'Archived'), ('idle', 'Idle'), ('running', 'Running'), ('completed', 'Completed'), ('scheduled', 'Scheduled')], default='designing', max_length=50)),
                ('version', models.CharField(default='1.0.0', max_length=50)),
                ('parameters', django.contrib.postgres.fields.JSONField(default=dict, help_text='Model parameters and configuration')),
                ('architecture', django.contrib.postgres.fields.JSONField(default=dict, help_text='Model architecture details')),
                ('accuracy', models.FloatField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(1.0)])),
                ('precision', models.FloatField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(1.0)])),
                ('recall', models.FloatField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(1.0)])),
                ('f1_score', models.FloatField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(1.0)])),
                ('compute_time', models.FloatField(blank=True, help_text='Compute time in seconds', null=True)),
                ('memory_usage', models.IntegerField(blank=True, help_text='Memory usage in MB', null=True)),
                ('cpu_usage', models.FloatField(blank=True, help_text='CPU usage percentage', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('last_run', models.DateTimeField(blank=True, null=True)),
                ('next_run', models.DateTimeField(blank=True, null=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_models', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ai_models',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='GovernancePolicy',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('policy_type', models.CharField(choices=[('data_usage', 'Data Usage'), ('model_development', 'Model Development'), ('deployment', 'Deployment'), ('monitoring', 'Monitoring'), ('incident_response', 'Incident Response')], max_length=50)),
                ('scope', models.CharField(choices=[('all_models', 'All Models'), ('high_risk', 'High Risk'), ('customer_facing', 'Customer Facing'), ('internal_only', 'Internal Only')], max_length=50)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('review', 'Under Review'), ('approved', 'Approved'), ('active', 'Active'), ('deprecated', 'Deprecated')], default='draft', max_length=50)),
                ('version', models.CharField(default='1.0.0', max_length=50)),
                ('requirements', django.contrib.postgres.fields.JSONField(default=list, help_text='Policy requirements')),
                ('enforcement', django.contrib.postgres.fields.JSONField(default=dict, help_text='Enforcement mechanisms')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('next_review', models.DateTimeField(blank=True, null=True)),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_policies', to=settings.AUTH_USER_MODEL)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='governance_policies', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'governance_policies',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='StreamingDataSource',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('source_type', models.CharField(choices=[('websocket', 'WebSocket'), ('kafka', 'Apache Kafka'), ('rabbitmq', 'RabbitMQ'), ('redis', 'Redis'), ('sse', 'Server-Sent Events'), ('polling', 'HTTP Polling')], max_length=50)),
                ('endpoint', models.URLField()),
                ('status', models.CharField(choices=[('connected', 'Connected'), ('disconnected', 'Disconnected'), ('error', 'Error'), ('reconnecting', 'Reconnecting')], default='disconnected', max_length=50)),
                ('config', django.contrib.postgres.fields.JSONField(default=dict, help_text='Source-specific configuration')),
                ('filters', django.contrib.postgres.fields.JSONField(default=list, help_text='Data filters')),
                ('data_rate', models.FloatField(default=0.0, help_text='Messages per second')),
                ('total_messages', models.BigIntegerField(default=0)),
                ('error_count', models.IntegerField(default=0)),
                ('last_message_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='streaming_sources', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'streaming_data_sources',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='TrainingJob',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('queued', 'Queued'), ('initializing', 'Initializing'), ('training', 'Training'), ('validating', 'Validating'), ('completed', 'Completed'), ('failed', 'Failed'), ('cancelled', 'Cancelled')], default='queued', max_length=50)),
                ('epochs', models.IntegerField(default=100)),
                ('batch_size', models.IntegerField(default=32)),
                ('learning_rate', models.FloatField(default=0.001)),
                ('optimizer', models.CharField(default='adam', max_length=50)),
                ('progress', models.FloatField(default=0.0, validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(100.0)])),
                ('current_epoch', models.IntegerField(default=0)),
                ('training_metrics', django.contrib.postgres.fields.JSONField(default=dict, help_text='Training metrics by epoch')),
                ('validation_metrics', django.contrib.postgres.fields.JSONField(default=dict, help_text='Validation metrics by epoch')),
                ('resource_usage', django.contrib.postgres.fields.JSONField(default=dict, help_text='Resource usage during training')),
                ('logs', django.contrib.postgres.fields.JSONField(default=list, help_text='Training logs')),
                ('error_message', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='training_jobs', to='ai_ml.aimodel')),
            ],
            options={
                'db_table': 'training_jobs',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='StreamingEvent',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('event_type', models.CharField(choices=[('user_action', 'User Action'), ('system_event', 'System Event'), ('business_metric', 'Business Metric'), ('alert', 'Alert'), ('error', 'Error')], max_length=50)),
                ('category', models.CharField(max_length=100)),
                ('severity', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], default='low', max_length=50)),
                ('data', django.contrib.postgres.fields.JSONField(help_text='Event data payload')),
                ('tags', django.contrib.postgres.fields.JSONField(default=list, help_text='Event tags')),
                ('processed', models.BooleanField(default=False)),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
                ('timestamp', models.DateTimeField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('source', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='ai_ml.streamingdatasource')),
            ],
            options={
                'db_table': 'streaming_events',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='PolicyViolation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('severity', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], max_length=50)),
                ('status', models.CharField(choices=[('open', 'Open'), ('in_progress', 'In Progress'), ('resolved', 'Resolved'), ('accepted_risk', 'Accepted Risk')], default='open', max_length=50)),
                ('description', models.TextField()),
                ('resolution', models.TextField(blank=True, null=True)),
                ('detected_at', models.DateTimeField(auto_now_add=True)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='policy_violations', to='ai_ml.aimodel')),
                ('policy', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='violations', to='ai_ml.governancepolicy')),
                ('resolved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='resolved_violations', to=settings.AUTH_USER_MODEL)),
                ('responsible', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assigned_violations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'policy_violations',
                'ordering': ['-detected_at'],
            },
        ),
        migrations.CreateModel(
            name='ModelPrediction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('input_data', django.contrib.postgres.fields.JSONField(help_text='Input data for prediction')),
                ('prediction', django.contrib.postgres.fields.JSONField(help_text='Model prediction output')),
                ('confidence', models.FloatField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(1.0)])),
                ('explanation', django.contrib.postgres.fields.JSONField(default=dict, help_text='Prediction explanation data')),
                ('feature_importance', django.contrib.postgres.fields.JSONField(default=dict, help_text='Feature importance for this prediction')),
                ('prediction_time', models.FloatField(help_text='Time taken for prediction in seconds')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='predictions', to='ai_ml.aimodel')),
            ],
            options={
                'db_table': 'model_predictions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='BiasDetectionResult',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('detection_method', models.CharField(choices=[('statistical', 'Statistical'), ('fairness_metrics', 'Fairness Metrics'), ('adversarial', 'Adversarial'), ('causal', 'Causal')], max_length=50)),
                ('overall_score', models.FloatField(validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(1.0)])),
                ('bias_types', django.contrib.postgres.fields.JSONField(default=list, help_text='Detected bias types with details')),
                ('affected_groups', django.contrib.postgres.fields.JSONField(default=list, help_text='Groups affected by bias')),
                ('metrics', django.contrib.postgres.fields.JSONField(default=dict, help_text='Bias detection metrics')),
                ('recommendation', models.TextField()),
                ('mitigation_actions', django.contrib.postgres.fields.JSONField(default=list, help_text='Suggested mitigation actions')),
                ('detected_at', models.DateTimeField(auto_now_add=True)),
                ('confidence', models.FloatField(validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(1.0)])),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bias_results', to='ai_ml.aimodel')),
            ],
            options={
                'db_table': 'bias_detection_results',
                'ordering': ['-detected_at'],
            },
        ),
        # Add indexes
        migrations.AddIndex(
            model_name='aimodel',
            index=models.Index(fields=['model_type', 'status'], name='ai_models_model_type_status_idx'),
        ),
        migrations.AddIndex(
            model_name='aimodel',
            index=models.Index(fields=['created_by', 'status'], name='ai_models_created_by_status_idx'),
        ),
        migrations.AddIndex(
            model_name='aimodel',
            index=models.Index(fields=['last_run'], name='ai_models_last_run_idx'),
        ),
        migrations.AddIndex(
            model_name='trainingjob',
            index=models.Index(fields=['model', 'status'], name='training_jobs_model_status_idx'),
        ),
        migrations.AddIndex(
            model_name='trainingjob',
            index=models.Index(fields=['status', 'created_at'], name='training_jobs_status_created_idx'),
        ),
        migrations.AddIndex(
            model_name='modelprediction',
            index=models.Index(fields=['model', 'created_at'], name='model_predictions_model_created_idx'),
        ),
        migrations.AddIndex(
            model_name='modelprediction',
            index=models.Index(fields=['confidence'], name='model_predictions_confidence_idx'),
        ),
        migrations.AddIndex(
            model_name='biasdetectionresult',
            index=models.Index(fields=['model', 'overall_score'], name='bias_results_model_score_idx'),
        ),
        migrations.AddIndex(
            model_name='biasdetectionresult',
            index=models.Index(fields=['detected_at'], name='bias_results_detected_at_idx'),
        ),
        migrations.AddIndex(
            model_name='governancepolicy',
            index=models.Index(fields=['policy_type', 'status'], name='governance_policies_type_status_idx'),
        ),
        migrations.AddIndex(
            model_name='governancepolicy',
            index=models.Index(fields=['scope', 'status'], name='governance_policies_scope_status_idx'),
        ),
        migrations.AddIndex(
            model_name='policyviolation',
            index=models.Index(fields=['policy', 'status'], name='policy_violations_policy_status_idx'),
        ),
        migrations.AddIndex(
            model_name='policyviolation',
            index=models.Index(fields=['model', 'severity'], name='policy_violations_model_severity_idx'),
        ),
        migrations.AddIndex(
            model_name='policyviolation',
            index=models.Index(fields=['responsible', 'status'], name='policy_violations_responsible_status_idx'),
        ),
        migrations.AddIndex(
            model_name='streamingdatasource',
            index=models.Index(fields=['source_type', 'status'], name='streaming_sources_type_status_idx'),
        ),
        migrations.AddIndex(
            model_name='streamingdatasource',
            index=models.Index(fields=['status', 'last_message_at'], name='streaming_sources_status_message_idx'),
        ),
        migrations.AddIndex(
            model_name='streamingevent',
            index=models.Index(fields=['source', 'event_type'], name='streaming_events_source_type_idx'),
        ),
        migrations.AddIndex(
            model_name='streamingevent',
            index=models.Index(fields=['timestamp', 'severity'], name='streaming_events_timestamp_severity_idx'),
        ),
        migrations.AddIndex(
            model_name='streamingevent',
            index=models.Index(fields=['processed', 'created_at'], name='streaming_events_processed_created_idx'),
        ),
    ]
