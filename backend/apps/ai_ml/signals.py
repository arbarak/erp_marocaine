from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import logging

from .models import (
    AIModel, TrainingJob, ModelPrediction, BiasDetectionResult,
    PolicyViolation, StreamingEvent
)
from .tasks import process_streaming_events_task

logger = logging.getLogger(__name__)


@receiver(post_save, sender=AIModel)
def ai_model_post_save(sender, instance, created, **kwargs):
    """Handle AI model creation and updates"""
    if created:
        logger.info(f"New AI model created: {instance.name} ({instance.model_type})")
        
        # Send notification to team
        if hasattr(settings, 'EMAIL_NOTIFICATIONS_ENABLED') and settings.EMAIL_NOTIFICATIONS_ENABLED:
            send_model_creation_notification(instance)
    
    else:
        # Check for status changes
        if hasattr(instance, '_original_status'):
            if instance._original_status != instance.status:
                logger.info(f"Model {instance.name} status changed: {instance._original_status} -> {instance.status}")
                
                # Handle deployment
                if instance.status == 'deployed':
                    handle_model_deployment(instance)
                
                # Handle failures
                elif instance.status == 'failed':
                    handle_model_failure(instance)


@receiver(pre_save, sender=AIModel)
def ai_model_pre_save(sender, instance, **kwargs):
    """Store original status before save"""
    if instance.pk:
        try:
            original = AIModel.objects.get(pk=instance.pk)
            instance._original_status = original.status
        except AIModel.DoesNotExist:
            instance._original_status = None


@receiver(post_save, sender=TrainingJob)
def training_job_post_save(sender, instance, created, **kwargs):
    """Handle training job creation and updates"""
    if created:
        logger.info(f"New training job created for model: {instance.model.name}")
        
        # Update model status
        instance.model.status = 'training'
        instance.model.save()
    
    else:
        # Check for status changes
        if hasattr(instance, '_original_status'):
            if instance._original_status != instance.status:
                logger.info(f"Training job {instance.id} status changed: {instance._original_status} -> {instance.status}")
                
                # Handle completion
                if instance.status == 'completed':
                    handle_training_completion(instance)
                
                # Handle failures
                elif instance.status == 'failed':
                    handle_training_failure(instance)


@receiver(pre_save, sender=TrainingJob)
def training_job_pre_save(sender, instance, **kwargs):
    """Store original status before save"""
    if instance.pk:
        try:
            original = TrainingJob.objects.get(pk=instance.pk)
            instance._original_status = original.status
        except TrainingJob.DoesNotExist:
            instance._original_status = None


@receiver(post_save, sender=ModelPrediction)
def model_prediction_post_save(sender, instance, created, **kwargs):
    """Handle model prediction creation"""
    if created:
        logger.info(f"New prediction made with model: {instance.model.name}")
        
        # Update model last run time
        instance.model.last_run = timezone.now()
        instance.model.save(update_fields=['last_run'])
        
        # Check for low confidence predictions
        if instance.confidence and instance.confidence < 0.5:
            logger.warning(f"Low confidence prediction ({instance.confidence:.3f}) from model {instance.model.name}")
            create_low_confidence_alert(instance)


@receiver(post_save, sender=BiasDetectionResult)
def bias_detection_post_save(sender, instance, created, **kwargs):
    """Handle bias detection result creation"""
    if created:
        logger.info(f"Bias detection completed for model: {instance.model.name} (Score: {instance.overall_score:.3f})")
        
        # Create policy violation if bias is significant
        if instance.overall_score < 0.7:
            create_bias_policy_violation(instance)
        
        # Send alert for critical bias
        if instance.overall_score < 0.5:
            send_critical_bias_alert(instance)


@receiver(post_save, sender=PolicyViolation)
def policy_violation_post_save(sender, instance, created, **kwargs):
    """Handle policy violation creation and updates"""
    if created:
        logger.warning(f"Policy violation created: {instance.policy.name} for model {instance.model.name}")
        
        # Send notification to responsible person
        send_violation_notification(instance)
        
        # Create streaming event for critical violations
        if instance.severity == 'critical':
            create_violation_streaming_event(instance)
    
    else:
        # Check for resolution
        if hasattr(instance, '_original_status'):
            if instance._original_status != instance.status and instance.status == 'resolved':
                logger.info(f"Policy violation resolved: {instance.id}")
                send_violation_resolution_notification(instance)


@receiver(pre_save, sender=PolicyViolation)
def policy_violation_pre_save(sender, instance, **kwargs):
    """Store original status before save"""
    if instance.pk:
        try:
            original = PolicyViolation.objects.get(pk=instance.pk)
            instance._original_status = original.status
        except PolicyViolation.DoesNotExist:
            instance._original_status = None


@receiver(post_save, sender=StreamingEvent)
def streaming_event_post_save(sender, instance, created, **kwargs):
    """Handle streaming event creation"""
    if created:
        # Update source metrics
        source = instance.source
        source.total_messages += 1
        source.last_message_at = timezone.now()
        
        # Calculate data rate (messages per second over last minute)
        one_minute_ago = timezone.now() - timezone.timedelta(minutes=1)
        recent_events = StreamingEvent.objects.filter(
            source=source,
            timestamp__gte=one_minute_ago
        ).count()
        source.data_rate = recent_events / 60.0
        
        source.save(update_fields=['total_messages', 'last_message_at', 'data_rate'])
        
        # Process critical events immediately
        if instance.severity == 'critical':
            logger.critical(f"Critical streaming event received: {instance.category}")
            process_streaming_events_task.delay()
        
        # Process alerts
        elif instance.event_type == 'alert':
            handle_streaming_alert(instance)


@receiver(post_delete, sender=AIModel)
def ai_model_post_delete(sender, instance, **kwargs):
    """Handle AI model deletion"""
    logger.info(f"AI model deleted: {instance.name}")
    
    # Clean up related data if needed
    # (Django will handle cascade deletes automatically)


# Helper functions

def send_model_creation_notification(model):
    """Send email notification when a new model is created"""
    try:
        subject = f"New AI Model Created: {model.name}"
        message = f"""
        A new AI model has been created in the system.
        
        Model: {model.name}
        Type: {model.model_type}
        Algorithm: {model.algorithm}
        Created by: {model.created_by.get_full_name() or model.created_by.username}
        Created at: {model.created_at}
        
        Please review the model configuration and approve for training if appropriate.
        """
        
        # Send to AI team (you would configure this list in settings)
        recipient_list = getattr(settings, 'AI_TEAM_EMAILS', [])
        if recipient_list:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list,
                fail_silently=True
            )
    except Exception as e:
        logger.error(f"Failed to send model creation notification: {str(e)}")


def handle_model_deployment(model):
    """Handle model deployment"""
    logger.info(f"Model {model.name} has been deployed")
    
    # Update next run schedule if applicable
    if model.model_type in ['time_series', 'forecasting']:
        # Schedule next run for time series models
        next_run = timezone.now() + timezone.timedelta(hours=24)
        model.next_run = next_run
        model.save(update_fields=['next_run'])


def handle_model_failure(model):
    """Handle model failure"""
    logger.error(f"Model {model.name} has failed")
    
    # Send alert to responsible team
    if hasattr(settings, 'EMAIL_NOTIFICATIONS_ENABLED') and settings.EMAIL_NOTIFICATIONS_ENABLED:
        subject = f"Model Failure Alert: {model.name}"
        message = f"""
        Model {model.name} has failed and requires attention.
        
        Model Type: {model.model_type}
        Algorithm: {model.algorithm}
        Last Run: {model.last_run}
        
        Please investigate and take appropriate action.
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [model.created_by.email],
            fail_silently=True
        )


def handle_training_completion(training_job):
    """Handle training job completion"""
    logger.info(f"Training completed for model: {training_job.model.name}")
    
    # Update model status based on training results
    if training_job.training_metrics:
        final_metrics = training_job.training_metrics[-1] if training_job.training_metrics else {}
        final_accuracy = final_metrics.get('val_accuracy', 0)
        
        # Set model status based on performance
        if final_accuracy > 0.8:
            training_job.model.status = 'deployed'
        elif final_accuracy > 0.6:
            training_job.model.status = 'validating'
        else:
            training_job.model.status = 'failed'
        
        training_job.model.save()


def handle_training_failure(training_job):
    """Handle training job failure"""
    logger.error(f"Training failed for model: {training_job.model.name}")
    
    # Update model status
    training_job.model.status = 'failed'
    training_job.model.save()


def create_low_confidence_alert(prediction):
    """Create alert for low confidence predictions"""
    try:
        # Create streaming event for low confidence
        StreamingEvent.objects.create(
            source_id=1,  # You would have a default system source
            event_type='alert',
            category='low_confidence_prediction',
            severity='medium',
            data={
                'model_id': str(prediction.model.id),
                'model_name': prediction.model.name,
                'confidence': prediction.confidence,
                'prediction_id': str(prediction.id)
            },
            timestamp=timezone.now()
        )
    except Exception as e:
        logger.error(f"Failed to create low confidence alert: {str(e)}")


def create_bias_policy_violation(bias_result):
    """Create policy violation for bias detection"""
    try:
        from .models import GovernancePolicy
        
        # Find bias-related policy
        bias_policy = GovernancePolicy.objects.filter(
            policy_type='model_development',
            status='active'
        ).first()
        
        if bias_policy:
            PolicyViolation.objects.create(
                policy=bias_policy,
                model=bias_result.model,
                severity='high' if bias_result.overall_score < 0.6 else 'medium',
                description=f'Bias detected with score {bias_result.overall_score:.3f}. Threshold: 0.8',
                responsible=bias_result.model.created_by
            )
    except Exception as e:
        logger.error(f"Failed to create bias policy violation: {str(e)}")


def send_critical_bias_alert(bias_result):
    """Send alert for critical bias detection"""
    try:
        subject = f"Critical Bias Alert: {bias_result.model.name}"
        message = f"""
        Critical bias has been detected in model {bias_result.model.name}.
        
        Overall Bias Score: {bias_result.overall_score:.3f}
        Detection Method: {bias_result.detection_method}
        Detected At: {bias_result.detected_at}
        
        Immediate action is required to address this bias.
        
        Recommendation: {bias_result.recommendation}
        """
        
        # Send to model owner and AI ethics team
        recipients = [bias_result.model.created_by.email]
        ai_ethics_emails = getattr(settings, 'AI_ETHICS_TEAM_EMAILS', [])
        recipients.extend(ai_ethics_emails)
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            fail_silently=True
        )
    except Exception as e:
        logger.error(f"Failed to send critical bias alert: {str(e)}")


def send_violation_notification(violation):
    """Send notification for policy violation"""
    try:
        subject = f"Policy Violation: {violation.policy.name}"
        message = f"""
        A policy violation has been detected and assigned to you.
        
        Policy: {violation.policy.name}
        Model: {violation.model.name}
        Severity: {violation.severity}
        Description: {violation.description}
        Detected At: {violation.detected_at}
        
        Please review and take appropriate action.
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [violation.responsible.email],
            fail_silently=True
        )
    except Exception as e:
        logger.error(f"Failed to send violation notification: {str(e)}")


def send_violation_resolution_notification(violation):
    """Send notification when violation is resolved"""
    try:
        subject = f"Policy Violation Resolved: {violation.policy.name}"
        message = f"""
        The policy violation has been resolved.
        
        Policy: {violation.policy.name}
        Model: {violation.model.name}
        Resolution: {violation.resolution}
        Resolved By: {violation.resolved_by.get_full_name() if violation.resolved_by else 'Unknown'}
        Resolved At: {violation.resolved_at}
        """
        
        # Notify stakeholders
        recipients = [violation.responsible.email]
        if violation.resolved_by and violation.resolved_by.email != violation.responsible.email:
            recipients.append(violation.resolved_by.email)
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            fail_silently=True
        )
    except Exception as e:
        logger.error(f"Failed to send violation resolution notification: {str(e)}")


def create_violation_streaming_event(violation):
    """Create streaming event for critical violations"""
    try:
        StreamingEvent.objects.create(
            source_id=1,  # System source
            event_type='alert',
            category='critical_policy_violation',
            severity='critical',
            data={
                'violation_id': str(violation.id),
                'policy_name': violation.policy.name,
                'model_name': violation.model.name,
                'severity': violation.severity,
                'description': violation.description
            },
            timestamp=timezone.now()
        )
    except Exception as e:
        logger.error(f"Failed to create violation streaming event: {str(e)}")


def handle_streaming_alert(event):
    """Handle streaming alert events"""
    logger.warning(f"Streaming alert received: {event.category} - {event.data}")
    
    # Process based on alert category
    if event.category == 'model_performance_degradation':
        handle_performance_degradation_alert(event)
    elif event.category == 'data_drift_detected':
        handle_data_drift_alert(event)
    elif event.category == 'system_resource_high':
        handle_resource_alert(event)


def handle_performance_degradation_alert(event):
    """Handle model performance degradation alerts"""
    # Implementation for performance degradation handling
    pass


def handle_data_drift_alert(event):
    """Handle data drift detection alerts"""
    # Implementation for data drift handling
    pass


def handle_resource_alert(event):
    """Handle system resource alerts"""
    # Implementation for resource alert handling
    pass
