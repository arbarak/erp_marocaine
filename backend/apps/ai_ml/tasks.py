from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import logging
import time
import random
import json
from datetime import timedelta

from .models import (
    AIModel, TrainingJob, ModelPrediction, BiasDetectionResult,
    PolicyViolation, StreamingEvent, StreamingDataSource
)

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def train_model_task(self, training_job_id):
    """
    Celery task for training AI/ML models
    This is a mock implementation - in production, this would integrate with actual ML frameworks
    """
    try:
        training_job = TrainingJob.objects.get(id=training_job_id)
        model = training_job.model
        
        logger.info(f"Starting training for model {model.name} (Job: {training_job_id})")
        
        # Update job status
        training_job.status = 'initializing'
        training_job.started_at = timezone.now()
        training_job.save()
        
        # Simulate initialization
        time.sleep(2)
        
        # Update status to training
        training_job.status = 'training'
        training_job.save()
        
        # Simulate training epochs
        total_epochs = training_job.epochs
        training_metrics = []
        validation_metrics = []
        
        for epoch in range(1, total_epochs + 1):
            # Simulate training time per epoch
            time.sleep(0.5)  # Reduced for demo purposes
            
            # Update progress
            progress = (epoch / total_epochs) * 100
            training_job.progress = progress
            training_job.current_epoch = epoch
            
            # Simulate metrics (improving over time)
            base_accuracy = 0.6 + (epoch / total_epochs) * 0.3
            noise = random.uniform(-0.05, 0.05)
            
            epoch_metrics = {
                'epoch': epoch,
                'loss': max(0.1, 2.0 - (epoch / total_epochs) * 1.5 + noise),
                'accuracy': min(0.95, base_accuracy + noise),
                'val_loss': max(0.1, 2.2 - (epoch / total_epochs) * 1.6 + noise),
                'val_accuracy': min(0.93, base_accuracy - 0.02 + noise),
                'learning_rate': training_job.learning_rate * (0.95 ** (epoch // 10))
            }
            
            training_metrics.append(epoch_metrics)
            
            # Update resource usage
            resource_usage = {
                'cpu_usage': random.uniform(60, 90),
                'memory_usage': random.uniform(2000, 4000),
                'gpu_usage': random.uniform(80, 95) if model.model_type in ['cnn', 'transformer'] else 0,
                'disk_io': random.uniform(10, 50),
                'network_io': random.uniform(5, 20)
            }
            
            training_job.training_metrics = training_metrics
            training_job.resource_usage = resource_usage
            training_job.save()
            
            # Add training log
            log_entry = {
                'timestamp': timezone.now().isoformat(),
                'level': 'INFO',
                'message': f'Epoch {epoch}/{total_epochs} - Loss: {epoch_metrics["loss"]:.4f}, Accuracy: {epoch_metrics["accuracy"]:.4f}'
            }
            
            if not training_job.logs:
                training_job.logs = []
            training_job.logs.append(log_entry)
            training_job.save()
            
            # Update task progress
            self.update_state(
                state='PROGRESS',
                meta={
                    'current_epoch': epoch,
                    'total_epochs': total_epochs,
                    'progress': progress,
                    'metrics': epoch_metrics
                }
            )
        
        # Validation phase
        training_job.status = 'validating'
        training_job.save()
        
        time.sleep(1)  # Simulate validation time
        
        # Final metrics
        final_accuracy = training_metrics[-1]['val_accuracy']
        final_loss = training_metrics[-1]['val_loss']
        
        # Update model with final metrics
        model.accuracy = final_accuracy
        model.precision = min(0.95, final_accuracy + random.uniform(-0.05, 0.02))
        model.recall = min(0.95, final_accuracy + random.uniform(-0.03, 0.03))
        model.f1_score = 2 * (model.precision * model.recall) / (model.precision + model.recall)
        model.compute_time = (timezone.now() - training_job.started_at).total_seconds()
        model.memory_usage = int(resource_usage['memory_usage'])
        model.cpu_usage = resource_usage['cpu_usage']
        model.status = 'deployed'
        model.last_run = timezone.now()
        model.save()
        
        # Complete training job
        training_job.status = 'completed'
        training_job.completed_at = timezone.now()
        training_job.progress = 100.0
        training_job.save()
        
        logger.info(f"Training completed for model {model.name}. Final accuracy: {final_accuracy:.4f}")
        
        # Send notification email (if configured)
        if hasattr(settings, 'EMAIL_NOTIFICATIONS_ENABLED') and settings.EMAIL_NOTIFICATIONS_ENABLED:
            send_training_completion_email(model, training_job, final_accuracy)
        
        return {
            'status': 'completed',
            'final_accuracy': final_accuracy,
            'final_loss': final_loss,
            'training_time': model.compute_time
        }
        
    except TrainingJob.DoesNotExist:
        logger.error(f"Training job {training_job_id} not found")
        return {'status': 'error', 'message': 'Training job not found'}
    
    except Exception as e:
        logger.error(f"Training failed for job {training_job_id}: {str(e)}")
        
        # Update job status to failed
        try:
            training_job = TrainingJob.objects.get(id=training_job_id)
            training_job.status = 'failed'
            training_job.error_message = str(e)
            training_job.completed_at = timezone.now()
            training_job.save()
            
            # Update model status
            training_job.model.status = 'failed'
            training_job.model.save()
        except:
            pass
        
        return {'status': 'error', 'message': str(e)}


@shared_task(bind=True)
def predict_model_task(self, model_id, input_data, include_explanation=False, include_confidence=True):
    """
    Celery task for making model predictions
    This is a mock implementation - in production, this would load and run actual models
    """
    try:
        model = AIModel.objects.get(id=model_id)
        
        logger.info(f"Making prediction with model {model.name}")
        
        start_time = time.time()
        
        # Simulate prediction processing time
        processing_time = random.uniform(0.1, 2.0)
        time.sleep(processing_time)
        
        # Generate mock prediction based on model type
        if model.model_type == 'classification':
            prediction = {
                'class': random.choice(['A', 'B', 'C']),
                'probabilities': {
                    'A': random.uniform(0.1, 0.9),
                    'B': random.uniform(0.1, 0.9),
                    'C': random.uniform(0.1, 0.9)
                }
            }
            confidence = max(prediction['probabilities'].values())
        
        elif model.model_type == 'regression':
            prediction = {
                'value': random.uniform(0, 100),
                'range': [random.uniform(0, 50), random.uniform(50, 100)]
            }
            confidence = random.uniform(0.7, 0.95)
        
        else:
            # Generic prediction
            prediction = {
                'result': random.uniform(0, 1),
                'category': random.choice(['low', 'medium', 'high'])
            }
            confidence = random.uniform(0.6, 0.9)
        
        # Generate explanation if requested
        explanation = {}
        feature_importance = {}
        
        if include_explanation:
            explanation = {
                'method': 'SHAP',
                'global_explanation': 'Model prediction based on input features',
                'local_explanation': 'This specific prediction was influenced by...',
                'decision_path': ['feature_1 > 0.5', 'feature_2 < 0.3', 'feature_3 = high']
            }
            
            feature_importance = {
                'feature_1': random.uniform(0.1, 0.4),
                'feature_2': random.uniform(0.1, 0.3),
                'feature_3': random.uniform(0.2, 0.5),
                'feature_4': random.uniform(0.05, 0.2)
            }
        
        prediction_time = time.time() - start_time
        
        # Store prediction in database
        model_prediction = ModelPrediction.objects.create(
            model=model,
            input_data=input_data,
            prediction=prediction,
            confidence=confidence if include_confidence else None,
            explanation=explanation,
            feature_importance=feature_importance,
            prediction_time=prediction_time
        )
        
        logger.info(f"Prediction completed for model {model.name}. Confidence: {confidence:.3f}")
        
        return {
            'prediction_id': str(model_prediction.id),
            'prediction': prediction,
            'confidence': confidence if include_confidence else None,
            'explanation': explanation if include_explanation else None,
            'feature_importance': feature_importance if include_explanation else None,
            'prediction_time': prediction_time,
            'model_info': {
                'name': model.name,
                'type': model.model_type,
                'version': model.version
            }
        }
        
    except AIModel.DoesNotExist:
        logger.error(f"Model {model_id} not found")
        return {'status': 'error', 'message': 'Model not found'}
    
    except Exception as e:
        logger.error(f"Prediction failed for model {model_id}: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@shared_task(bind=True)
def detect_bias_task(self, model_id, detection_method='fairness_metrics', protected_attributes=None, fairness_metrics=None, threshold=0.8):
    """
    Celery task for detecting bias in AI/ML models
    This is a mock implementation - in production, this would use actual bias detection libraries
    """
    try:
        model = AIModel.objects.get(id=model_id)
        
        logger.info(f"Starting bias detection for model {model.name}")
        
        # Simulate bias detection processing time
        time.sleep(random.uniform(2, 5))
        
        # Generate mock bias detection results
        bias_types = []
        overall_score = random.uniform(0.6, 0.95)
        
        # Simulate different types of bias
        if random.random() < 0.3:  # 30% chance of demographic bias
            bias_types.append({
                'type': 'demographic',
                'severity': random.choice(['low', 'medium', 'high']),
                'affected_groups': ['age_group_seniors', 'gender_female'],
                'metrics': [
                    {
                        'name': 'Demographic Parity',
                        'value': random.uniform(0.6, 0.85),
                        'threshold': threshold,
                        'passed': random.choice([True, False]),
                        'description': 'Difference in positive prediction rates between groups'
                    }
                ],
                'explanation': 'Model shows different prediction rates for different demographic groups',
                'confidence': random.uniform(0.7, 0.95)
            })
        
        if random.random() < 0.2:  # 20% chance of historical bias
            bias_types.append({
                'type': 'historical',
                'severity': random.choice(['low', 'medium']),
                'affected_groups': ['historical_data'],
                'metrics': [
                    {
                        'name': 'Historical Bias Score',
                        'value': random.uniform(0.7, 0.9),
                        'threshold': threshold,
                        'passed': True,
                        'description': 'Bias inherited from historical training data'
                    }
                ],
                'explanation': 'Model may have learned biases present in historical training data',
                'confidence': random.uniform(0.6, 0.8)
            })
        
        # Generate mitigation actions
        mitigation_actions = []
        
        if bias_types:
            mitigation_actions = [
                {
                    'type': 'data_preprocessing',
                    'description': 'Rebalance training data to ensure equal representation',
                    'effort': random.choice(['low', 'medium', 'high']),
                    'impact': random.choice(['medium', 'high']),
                    'timeline': '2-3 weeks',
                    'responsible': 'Data Engineering Team',
                    'status': 'planned'
                },
                {
                    'type': 'post_processing',
                    'description': 'Apply fairness constraints to model outputs',
                    'effort': 'medium',
                    'impact': 'medium',
                    'timeline': '1 week',
                    'responsible': 'ML Engineering Team',
                    'status': 'planned'
                }
            ]
        
        # Generate recommendation
        if overall_score >= 0.9:
            recommendation = 'Model shows excellent fairness metrics. Continue monitoring.'
        elif overall_score >= 0.8:
            recommendation = 'Model shows good fairness. Consider minor adjustments.'
        elif overall_score >= 0.7:
            recommendation = 'Model shows moderate bias. Implement mitigation strategies.'
        else:
            recommendation = 'Model shows significant bias. Immediate action required.'
        
        # Store bias detection result
        bias_result = BiasDetectionResult.objects.create(
            model=model,
            detection_method=detection_method,
            overall_score=overall_score,
            bias_types=bias_types,
            affected_groups=[group for bias in bias_types for group in bias.get('affected_groups', [])],
            metrics={
                'fairness_metrics': fairness_metrics or ['demographic_parity', 'equalized_odds'],
                'protected_attributes': protected_attributes or ['age', 'gender'],
                'threshold': threshold
            },
            recommendation=recommendation,
            mitigation_actions=mitigation_actions,
            confidence=random.uniform(0.8, 0.95)
        )
        
        logger.info(f"Bias detection completed for model {model.name}. Overall score: {overall_score:.3f}")
        
        # Create policy violation if bias is significant
        if overall_score < 0.7:
            create_bias_policy_violation(model, bias_result)
        
        return {
            'bias_result_id': str(bias_result.id),
            'overall_score': overall_score,
            'bias_types': bias_types,
            'recommendation': recommendation,
            'mitigation_actions': mitigation_actions
        }
        
    except AIModel.DoesNotExist:
        logger.error(f"Model {model_id} not found")
        return {'status': 'error', 'message': 'Model not found'}
    
    except Exception as e:
        logger.error(f"Bias detection failed for model {model_id}: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@shared_task
def process_streaming_events_task():
    """
    Celery task for processing streaming events
    This task runs periodically to process unprocessed events
    """
    try:
        # Get unprocessed events
        unprocessed_events = StreamingEvent.objects.filter(processed=False)[:100]
        
        processed_count = 0
        
        for event in unprocessed_events:
            try:
                # Process event based on type
                if event.event_type == 'alert' and event.severity in ['high', 'critical']:
                    # Handle high-priority alerts
                    handle_critical_alert(event)
                
                elif event.event_type == 'business_metric':
                    # Process business metrics
                    process_business_metric(event)
                
                elif event.event_type == 'error':
                    # Log and analyze errors
                    analyze_error_event(event)
                
                # Mark as processed
                event.processed = True
                event.processed_at = timezone.now()
                event.save()
                
                processed_count += 1
                
            except Exception as e:
                logger.error(f"Failed to process event {event.id}: {str(e)}")
        
        logger.info(f"Processed {processed_count} streaming events")
        
        return {
            'processed_count': processed_count,
            'status': 'completed'
        }
        
    except Exception as e:
        logger.error(f"Streaming event processing failed: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@shared_task
def cleanup_old_data_task():
    """
    Celery task for cleaning up old data
    Runs daily to remove old predictions, events, and logs
    """
    try:
        # Clean up old predictions (older than 30 days)
        cutoff_date = timezone.now() - timedelta(days=30)
        
        old_predictions = ModelPrediction.objects.filter(created_at__lt=cutoff_date)
        predictions_deleted = old_predictions.count()
        old_predictions.delete()
        
        # Clean up old streaming events (older than 7 days)
        event_cutoff = timezone.now() - timedelta(days=7)
        old_events = StreamingEvent.objects.filter(created_at__lt=event_cutoff)
        events_deleted = old_events.count()
        old_events.delete()
        
        # Clean up old training job logs (keep only last 100 entries per job)
        for job in TrainingJob.objects.all():
            if job.logs and len(job.logs) > 100:
                job.logs = job.logs[-100:]  # Keep last 100 entries
                job.save()
        
        logger.info(f"Cleanup completed: {predictions_deleted} predictions, {events_deleted} events deleted")
        
        return {
            'predictions_deleted': predictions_deleted,
            'events_deleted': events_deleted,
            'status': 'completed'
        }
        
    except Exception as e:
        logger.error(f"Data cleanup failed: {str(e)}")
        return {'status': 'error', 'message': str(e)}


# Helper functions

def send_training_completion_email(model, training_job, accuracy):
    """Send email notification when training completes"""
    try:
        subject = f"Model Training Completed: {model.name}"
        message = f"""
        Model training has completed successfully.
        
        Model: {model.name}
        Type: {model.model_type}
        Final Accuracy: {accuracy:.4f}
        Training Time: {training_job.completed_at - training_job.started_at}
        
        The model is now ready for deployment.
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [model.created_by.email],
            fail_silently=True
        )
    except Exception as e:
        logger.error(f"Failed to send training completion email: {str(e)}")


def create_bias_policy_violation(model, bias_result):
    """Create a policy violation for significant bias"""
    try:
        from .models import GovernancePolicy
        
        # Find relevant bias policy
        bias_policy = GovernancePolicy.objects.filter(
            policy_type='model_development',
            status='active'
        ).first()
        
        if bias_policy:
            PolicyViolation.objects.create(
                policy=bias_policy,
                model=model,
                severity='high' if bias_result.overall_score < 0.6 else 'medium',
                description=f'Model bias detected with score {bias_result.overall_score:.3f}',
                responsible=model.created_by
            )
    except Exception as e:
        logger.error(f"Failed to create bias policy violation: {str(e)}")


def handle_critical_alert(event):
    """Handle critical alerts from streaming events"""
    logger.warning(f"Critical alert received: {event.data}")
    # Implement alert handling logic


def process_business_metric(event):
    """Process business metric events"""
    logger.info(f"Processing business metric: {event.category}")
    # Implement business metric processing logic


def analyze_error_event(event):
    """Analyze error events for patterns"""
    logger.error(f"Error event: {event.data}")
    # Implement error analysis logic
