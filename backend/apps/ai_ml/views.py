from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    AIModel, TrainingJob, ModelPrediction, BiasDetectionResult,
    GovernancePolicy, PolicyViolation, StreamingDataSource, StreamingEvent
)
from .serializers import (
    AIModelSerializer, TrainingJobSerializer, ModelPredictionSerializer,
    BiasDetectionResultSerializer, GovernancePolicySerializer, PolicyViolationSerializer,
    StreamingDataSourceSerializer, StreamingEventSerializer,
    ModelPerformanceStatsSerializer, BiasAnalyticsSerializer,
    GovernanceMetricsSerializer, StreamingAnalyticsSerializer,
    PredictionRequestSerializer, PredictionResponseSerializer,
    TrainingRequestSerializer, BiasDetectionRequestSerializer,
    BulkModelUpdateSerializer, BulkPolicyApplicationSerializer
)
from .tasks import (
    train_model_task, predict_model_task, detect_bias_task,
    process_streaming_events_task
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AIModelViewSet(viewsets.ModelViewSet):
    """ViewSet for AI Models"""
    
    queryset = AIModel.objects.all()
    serializer_class = AIModelSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['model_type', 'status', 'created_by']
    search_fields = ['name', 'description', 'algorithm']
    ordering_fields = ['created_at', 'updated_at', 'accuracy', 'compute_time']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by accuracy range
        min_accuracy = self.request.query_params.get('min_accuracy')
        max_accuracy = self.request.query_params.get('max_accuracy')
        if min_accuracy:
            queryset = queryset.filter(accuracy__gte=float(min_accuracy))
        if max_accuracy:
            queryset = queryset.filter(accuracy__lte=float(max_accuracy))
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def train(self, request, pk=None):
        """Start training for a specific model"""
        model = self.get_object()
        serializer = TrainingRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            # Create training job
            training_job = TrainingJob.objects.create(
                model=model,
                epochs=serializer.validated_data['epochs'],
                batch_size=serializer.validated_data['batch_size'],
                learning_rate=serializer.validated_data['learning_rate'],
                optimizer=serializer.validated_data['optimizer']
            )
            
            # Start training task
            train_model_task.delay(training_job.id)
            
            return Response({
                'message': 'Training started successfully',
                'training_job_id': training_job.id,
                'status': 'queued'
            }, status=status.HTTP_202_ACCEPTED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def predict(self, request, pk=None):
        """Make prediction with a specific model"""
        model = self.get_object()
        serializer = PredictionRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            # Start prediction task
            task = predict_model_task.delay(
                model.id,
                serializer.validated_data['input_data'],
                serializer.validated_data.get('include_explanation', False),
                serializer.validated_data.get('include_confidence', True)
            )
            
            return Response({
                'message': 'Prediction started',
                'task_id': task.id,
                'status': 'processing'
            }, status=status.HTTP_202_ACCEPTED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def detect_bias(self, request, pk=None):
        """Detect bias in a specific model"""
        model = self.get_object()
        serializer = BiasDetectionRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            # Start bias detection task
            task = detect_bias_task.delay(
                model.id,
                serializer.validated_data['detection_method'],
                serializer.validated_data.get('protected_attributes', []),
                serializer.validated_data.get('fairness_metrics', []),
                serializer.validated_data.get('threshold', 0.8)
            )
            
            return Response({
                'message': 'Bias detection started',
                'task_id': task.id,
                'status': 'processing'
            }, status=status.HTTP_202_ACCEPTED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get model performance statistics"""
        total_models = AIModel.objects.count()
        active_models = AIModel.objects.filter(status='deployed').count()
        training_models = AIModel.objects.filter(status='training').count()
        failed_models = AIModel.objects.filter(status='failed').count()
        
        # Calculate averages
        avg_accuracy = AIModel.objects.filter(
            accuracy__isnull=False
        ).aggregate(avg=Avg('accuracy'))['avg'] or 0
        
        avg_compute_time = AIModel.objects.filter(
            compute_time__isnull=False
        ).aggregate(avg=Avg('compute_time'))['avg'] or 0
        
        # Prediction counts
        total_predictions = ModelPrediction.objects.count()
        today = timezone.now().date()
        predictions_today = ModelPrediction.objects.filter(
            created_at__date=today
        ).count()
        
        stats = {
            'total_models': total_models,
            'active_models': active_models,
            'training_models': training_models,
            'deployed_models': active_models,
            'failed_models': failed_models,
            'average_accuracy': round(avg_accuracy, 3),
            'average_compute_time': round(avg_compute_time, 2),
            'total_predictions': total_predictions,
            'predictions_today': predictions_today
        }
        
        serializer = ModelPerformanceStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update multiple models"""
        serializer = BulkModelUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            model_ids = serializer.validated_data['model_ids']
            models = AIModel.objects.filter(id__in=model_ids)
            
            update_data = {}
            if 'status' in serializer.validated_data:
                update_data['status'] = serializer.validated_data['status']
            if 'parameters' in serializer.validated_data:
                update_data['parameters'] = serializer.validated_data['parameters']
            
            updated_count = models.update(**update_data)
            
            return Response({
                'message': f'Updated {updated_count} models successfully',
                'updated_count': updated_count
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrainingJobViewSet(viewsets.ModelViewSet):
    """ViewSet for Training Jobs"""
    
    queryset = TrainingJob.objects.all()
    serializer_class = TrainingJobSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'model']
    search_fields = ['model__name']
    ordering_fields = ['created_at', 'started_at', 'completed_at', 'progress']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a training job"""
        job = self.get_object()
        
        if job.status in ['queued', 'initializing', 'training']:
            job.status = 'cancelled'
            job.save()
            
            return Response({
                'message': 'Training job cancelled successfully',
                'status': 'cancelled'
            })
        
        return Response({
            'error': 'Cannot cancel job in current status',
            'current_status': job.status
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active training jobs"""
        active_jobs = self.get_queryset().filter(
            status__in=['queued', 'initializing', 'training', 'validating']
        )
        
        page = self.paginate_queryset(active_jobs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(active_jobs, many=True)
        return Response(serializer.data)


class ModelPredictionViewSet(viewsets.ModelViewSet):
    """ViewSet for Model Predictions"""
    
    queryset = ModelPrediction.objects.all()
    serializer_class = ModelPredictionSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['model', 'created_by']
    ordering_fields = ['created_at', 'confidence', 'prediction_time']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by confidence range
        min_confidence = self.request.query_params.get('min_confidence')
        max_confidence = self.request.query_params.get('max_confidence')
        if min_confidence:
            queryset = queryset.filter(confidence__gte=float(min_confidence))
        if max_confidence:
            queryset = queryset.filter(confidence__lte=float(max_confidence))
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent predictions"""
        hours = int(request.query_params.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        
        recent_predictions = self.get_queryset().filter(created_at__gte=since)
        
        page = self.paginate_queryset(recent_predictions)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(recent_predictions, many=True)
        return Response(serializer.data)


class BiasDetectionResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Bias Detection Results"""
    
    queryset = BiasDetectionResult.objects.all()
    serializer_class = BiasDetectionResultSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['model', 'detection_method']
    ordering_fields = ['detected_at', 'overall_score', 'confidence']
    ordering = ['-detected_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by bias score range
        min_score = self.request.query_params.get('min_score')
        max_score = self.request.query_params.get('max_score')
        if min_score:
            queryset = queryset.filter(overall_score__gte=float(min_score))
        if max_score:
            queryset = queryset.filter(overall_score__lte=float(max_score))
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get bias analytics"""
        total_scans = BiasDetectionResult.objects.count()
        
        # Models with bias issues (score < 0.8)
        models_with_bias = BiasDetectionResult.objects.filter(
            overall_score__lt=0.8
        ).values('model').distinct().count()
        
        # Critical bias issues
        critical_bias_issues = BiasDetectionResult.objects.filter(
            overall_score__lt=0.6
        ).count()
        
        # Average bias score
        avg_bias_score = BiasDetectionResult.objects.aggregate(
            avg=Avg('overall_score')
        )['avg'] or 0
        
        # Bias by type (mock data for now)
        bias_by_type = {
            'demographic': 15,
            'historical': 8,
            'representation': 12,
            'measurement': 5,
            'evaluation': 3
        }
        
        # Bias trends (mock data for now)
        bias_trends = [
            {'month': 'Jan', 'score': 0.85},
            {'month': 'Feb', 'score': 0.87},
            {'month': 'Mar', 'score': 0.84},
            {'month': 'Apr', 'score': 0.89},
            {'month': 'May', 'score': 0.91},
            {'month': 'Jun', 'score': 0.88},
        ]
        
        analytics = {
            'total_scans': total_scans,
            'models_with_bias': models_with_bias,
            'critical_bias_issues': critical_bias_issues,
            'average_bias_score': round(avg_bias_score, 3),
            'bias_by_type': bias_by_type,
            'bias_trends': bias_trends
        }
        
        serializer = BiasAnalyticsSerializer(analytics)
        return Response(serializer.data)


class StreamingDataSourceViewSet(viewsets.ModelViewSet):
    """ViewSet for Streaming Data Sources"""

    queryset = StreamingDataSource.objects.all()
    serializer_class = StreamingDataSourceSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['source_type', 'status', 'created_by']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'last_message_at', 'data_rate']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def connect(self, request, pk=None):
        """Connect to a streaming data source"""
        source = self.get_object()

        # Simulate connection logic
        source.status = 'connected'
        source.save()

        return Response({
            'message': 'Connected to data source successfully',
            'status': 'connected'
        })

    @action(detail=True, methods=['post'])
    def disconnect(self, request, pk=None):
        """Disconnect from a streaming data source"""
        source = self.get_object()

        source.status = 'disconnected'
        source.save()

        return Response({
            'message': 'Disconnected from data source',
            'status': 'disconnected'
        })

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get streaming analytics"""
        total_sources = StreamingDataSource.objects.count()
        active_sources = StreamingDataSource.objects.filter(status='connected').count()
        total_events = StreamingEvent.objects.count()

        # Calculate events per second (last hour)
        last_hour = timezone.now() - timedelta(hours=1)
        events_last_hour = StreamingEvent.objects.filter(
            timestamp__gte=last_hour
        ).count()
        events_per_second = events_last_hour / 3600 if events_last_hour > 0 else 0

        # Calculate error rate
        total_messages = StreamingDataSource.objects.aggregate(
            total=Sum('total_messages')
        )['total'] or 0
        total_errors = StreamingDataSource.objects.aggregate(
            total=Sum('error_count')
        )['total'] or 0
        error_rate = (total_errors / total_messages * 100) if total_messages > 0 else 0

        # Events by type and severity
        events_by_type = {}
        events_by_severity = {}

        for event_type in ['user_action', 'system_event', 'business_metric', 'alert', 'error']:
            events_by_type[event_type] = StreamingEvent.objects.filter(
                event_type=event_type
            ).count()

        for severity in ['low', 'medium', 'high', 'critical']:
            events_by_severity[severity] = StreamingEvent.objects.filter(
                severity=severity
            ).count()

        analytics = {
            'total_sources': total_sources,
            'active_sources': active_sources,
            'total_events': total_events,
            'events_per_second': round(events_per_second, 2),
            'error_rate': round(error_rate, 2),
            'average_latency': 45.2,  # Mock data
            'events_by_type': events_by_type,
            'events_by_severity': events_by_severity
        }

        serializer = StreamingAnalyticsSerializer(analytics)
        return Response(serializer.data)


class StreamingEventViewSet(viewsets.ModelViewSet):
    """ViewSet for Streaming Events"""

    queryset = StreamingEvent.objects.all()
    serializer_class = StreamingEventSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['source', 'event_type', 'severity', 'processed']
    search_fields = ['category']
    ordering_fields = ['timestamp', 'created_at', 'severity']
    ordering = ['-timestamp']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by time range
        hours = self.request.query_params.get('hours')
        if hours:
            since = timezone.now() - timedelta(hours=int(hours))
            queryset = queryset.filter(timestamp__gte=since)

        return queryset

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent events"""
        hours = int(request.query_params.get('hours', 1))
        since = timezone.now() - timedelta(hours=hours)

        recent_events = self.get_queryset().filter(timestamp__gte=since)

        page = self.paginate_queryset(recent_events)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(recent_events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get alert events"""
        alert_events = self.get_queryset().filter(
            event_type='alert',
            severity__in=['high', 'critical']
        )

        page = self.paginate_queryset(alert_events)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(alert_events, many=True)
        return Response(serializer.data)


# Additional API Views

from rest_framework.views import APIView
from django.http import HttpResponse
import csv
import json


class AnalyticsAPIView(APIView):
    """Comprehensive analytics API"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get comprehensive analytics data"""

        # Model analytics
        model_stats = {
            'total_models': AIModel.objects.count(),
            'active_models': AIModel.objects.filter(status='deployed').count(),
            'training_models': AIModel.objects.filter(status='training').count(),
            'failed_models': AIModel.objects.filter(status='failed').count(),
            'average_accuracy': AIModel.objects.filter(
                accuracy__isnull=False
            ).aggregate(avg=Avg('accuracy'))['avg'] or 0,
            'models_by_type': {}
        }

        # Models by type
        for model_type, _ in AIModel.MODEL_TYPES:
            model_stats['models_by_type'][model_type] = AIModel.objects.filter(
                model_type=model_type
            ).count()

        # Prediction analytics
        prediction_stats = {
            'total_predictions': ModelPrediction.objects.count(),
            'predictions_today': ModelPrediction.objects.filter(
                created_at__date=timezone.now().date()
            ).count(),
            'average_confidence': ModelPrediction.objects.filter(
                confidence__isnull=False
            ).aggregate(avg=Avg('confidence'))['avg'] or 0,
            'average_prediction_time': ModelPrediction.objects.aggregate(
                avg=Avg('prediction_time')
            )['avg'] or 0
        }

        # Bias analytics
        bias_stats = {
            'total_scans': BiasDetectionResult.objects.count(),
            'models_with_bias': BiasDetectionResult.objects.filter(
                overall_score__lt=0.8
            ).values('model').distinct().count(),
            'critical_bias_issues': BiasDetectionResult.objects.filter(
                overall_score__lt=0.6
            ).count(),
            'average_bias_score': BiasDetectionResult.objects.aggregate(
                avg=Avg('overall_score')
            )['avg'] or 0
        }

        # Governance analytics
        governance_stats = {
            'total_policies': GovernancePolicy.objects.count(),
            'active_policies': GovernancePolicy.objects.filter(status='active').count(),
            'total_violations': PolicyViolation.objects.count(),
            'open_violations': PolicyViolation.objects.filter(
                status__in=['open', 'in_progress']
            ).count(),
            'critical_violations': PolicyViolation.objects.filter(
                severity='critical', status__in=['open', 'in_progress']
            ).count()
        }

        # Streaming analytics
        streaming_stats = {
            'total_sources': StreamingDataSource.objects.count(),
            'active_sources': StreamingDataSource.objects.filter(status='connected').count(),
            'total_events': StreamingEvent.objects.count(),
            'events_today': StreamingEvent.objects.filter(
                timestamp__date=timezone.now().date()
            ).count()
        }

        return Response({
            'models': model_stats,
            'predictions': prediction_stats,
            'bias': bias_stats,
            'governance': governance_stats,
            'streaming': streaming_stats,
            'generated_at': timezone.now().isoformat()
        })


class DashboardAPIView(APIView):
    """Dashboard data API"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get dashboard data"""

        # Key metrics
        key_metrics = {
            'total_models': AIModel.objects.count(),
            'active_models': AIModel.objects.filter(status='deployed').count(),
            'total_predictions_today': ModelPrediction.objects.filter(
                created_at__date=timezone.now().date()
            ).count(),
            'compliance_score': 92.5,  # Mock data
            'bias_score': 87.3,  # Mock data
            'system_health': 'healthy'
        }

        # Recent activity
        recent_activity = []

        # Recent training jobs
        recent_training = TrainingJob.objects.filter(
            created_at__gte=timezone.now() - timedelta(hours=24)
        ).order_by('-created_at')[:5]

        for job in recent_training:
            recent_activity.append({
                'type': 'training',
                'message': f'Training started for {job.model.name}',
                'timestamp': job.created_at.isoformat(),
                'status': job.status
            })

        # Recent predictions
        recent_predictions = ModelPrediction.objects.filter(
            created_at__gte=timezone.now() - timedelta(hours=24)
        ).order_by('-created_at')[:5]

        for pred in recent_predictions:
            recent_activity.append({
                'type': 'prediction',
                'message': f'Prediction made with {pred.model.name}',
                'timestamp': pred.created_at.isoformat(),
                'confidence': pred.confidence
            })

        # Recent violations
        recent_violations = PolicyViolation.objects.filter(
            detected_at__gte=timezone.now() - timedelta(hours=24)
        ).order_by('-detected_at')[:3]

        for violation in recent_violations:
            recent_activity.append({
                'type': 'violation',
                'message': f'Policy violation detected: {violation.policy.name}',
                'timestamp': violation.detected_at.isoformat(),
                'severity': violation.severity
            })

        # Sort recent activity by timestamp
        recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)

        # Performance trends (mock data)
        performance_trends = [
            {'date': '2024-01-15', 'accuracy': 85.2, 'predictions': 1250, 'bias_score': 87.1},
            {'date': '2024-01-16', 'accuracy': 86.1, 'predictions': 1340, 'bias_score': 87.8},
            {'date': '2024-01-17', 'accuracy': 85.8, 'predictions': 1180, 'bias_score': 86.9},
            {'date': '2024-01-18', 'accuracy': 87.2, 'predictions': 1420, 'bias_score': 88.2},
            {'date': '2024-01-19', 'accuracy': 86.9, 'predictions': 1380, 'bias_score': 87.5},
            {'date': '2024-01-20', 'accuracy': 87.5, 'predictions': 1450, 'bias_score': 88.1},
        ]

        return Response({
            'key_metrics': key_metrics,
            'recent_activity': recent_activity[:10],
            'performance_trends': performance_trends,
            'generated_at': timezone.now().isoformat()
        })


class HealthCheckAPIView(APIView):
    """Health check API"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get system health status"""

        health_status = {
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'services': {
                'database': 'healthy',
                'celery': 'healthy',
                'redis': 'healthy',
                'ai_models': 'healthy',
                'streaming': 'healthy'
            },
            'metrics': {
                'active_models': AIModel.objects.filter(status='deployed').count(),
                'running_jobs': TrainingJob.objects.filter(
                    status__in=['training', 'validating']
                ).count(),
                'connected_sources': StreamingDataSource.objects.filter(
                    status='connected'
                ).count(),
                'open_violations': PolicyViolation.objects.filter(
                    status__in=['open', 'in_progress']
                ).count()
            }
        }

        # Check for any critical issues
        critical_violations = PolicyViolation.objects.filter(
            severity='critical',
            status__in=['open', 'in_progress']
        ).count()

        if critical_violations > 0:
            health_status['status'] = 'warning'
            health_status['services']['governance'] = 'warning'

        failed_models = AIModel.objects.filter(status='failed').count()
        if failed_models > 5:  # Threshold for concern
            health_status['status'] = 'warning'
            health_status['services']['ai_models'] = 'warning'

        return Response(health_status)


class BatchTrainingAPIView(APIView):
    """Batch training operations"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Start batch training for multiple models"""
        model_ids = request.data.get('model_ids', [])
        training_config = request.data.get('config', {})

        if not model_ids:
            return Response({
                'error': 'No model IDs provided'
            }, status=status.HTTP_400_BAD_REQUEST)

        models = AIModel.objects.filter(id__in=model_ids)
        training_jobs = []

        for model in models:
            # Create training job
            training_job = TrainingJob.objects.create(
                model=model,
                epochs=training_config.get('epochs', 100),
                batch_size=training_config.get('batch_size', 32),
                learning_rate=training_config.get('learning_rate', 0.001),
                optimizer=training_config.get('optimizer', 'adam')
            )

            # Start training task
            train_model_task.delay(training_job.id)
            training_jobs.append(training_job.id)

        return Response({
            'message': f'Batch training started for {len(training_jobs)} models',
            'training_job_ids': training_jobs,
            'status': 'queued'
        }, status=status.HTTP_202_ACCEPTED)


class BatchPredictionAPIView(APIView):
    """Batch prediction operations"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Make batch predictions"""
        predictions_data = request.data.get('predictions', [])

        if not predictions_data:
            return Response({
                'error': 'No prediction data provided'
            }, status=status.HTTP_400_BAD_REQUEST)

        task_ids = []

        for pred_data in predictions_data:
            model_id = pred_data.get('model_id')
            input_data = pred_data.get('input_data')

            if model_id and input_data:
                task = predict_model_task.delay(
                    model_id,
                    input_data,
                    pred_data.get('include_explanation', False),
                    pred_data.get('include_confidence', True)
                )
                task_ids.append(task.id)

        return Response({
            'message': f'Batch prediction started for {len(task_ids)} requests',
            'task_ids': task_ids,
            'status': 'processing'
        }, status=status.HTTP_202_ACCEPTED)


class BatchBiasScanAPIView(APIView):
    """Batch bias scanning operations"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Start batch bias scanning"""
        model_ids = request.data.get('model_ids', [])
        scan_config = request.data.get('config', {})

        if not model_ids:
            return Response({
                'error': 'No model IDs provided'
            }, status=status.HTTP_400_BAD_REQUEST)

        task_ids = []

        for model_id in model_ids:
            task = detect_bias_task.delay(
                model_id,
                scan_config.get('detection_method', 'fairness_metrics'),
                scan_config.get('protected_attributes', []),
                scan_config.get('fairness_metrics', []),
                scan_config.get('threshold', 0.8)
            )
            task_ids.append(task.id)

        return Response({
            'message': f'Batch bias scanning started for {len(task_ids)} models',
            'task_ids': task_ids,
            'status': 'processing'
        }, status=status.HTTP_202_ACCEPTED)


class RealtimeEventsAPIView(APIView):
    """Real-time events API"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get real-time events stream"""
        # Get recent events (last 5 minutes)
        since = timezone.now() - timedelta(minutes=5)
        recent_events = StreamingEvent.objects.filter(
            timestamp__gte=since
        ).order_by('-timestamp')[:50]

        serializer = StreamingEventSerializer(recent_events, many=True)

        return Response({
            'events': serializer.data,
            'count': recent_events.count(),
            'timestamp': timezone.now().isoformat()
        })

    def post(self, request):
        """Create new streaming event"""
        serializer = StreamingEventSerializer(data=request.data)

        if serializer.is_valid():
            event = serializer.save()

            # Process event immediately if critical
            if event.severity == 'critical':
                process_streaming_events_task.delay()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RealtimeMetricsAPIView(APIView):
    """Real-time metrics API"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get real-time system metrics"""

        # Current active operations
        active_training = TrainingJob.objects.filter(
            status__in=['training', 'validating']
        ).count()

        active_predictions = ModelPrediction.objects.filter(
            created_at__gte=timezone.now() - timedelta(minutes=5)
        ).count()

        connected_sources = StreamingDataSource.objects.filter(
            status='connected'
        ).count()

        # Recent events count
        recent_events = StreamingEvent.objects.filter(
            timestamp__gte=timezone.now() - timedelta(minutes=1)
        ).count()

        # System resource usage (mock data)
        system_metrics = {
            'cpu_usage': random.uniform(30, 80),
            'memory_usage': random.uniform(40, 85),
            'gpu_usage': random.uniform(20, 95),
            'disk_usage': random.uniform(45, 75),
            'network_io': random.uniform(10, 50)
        }

        return Response({
            'active_operations': {
                'training_jobs': active_training,
                'recent_predictions': active_predictions,
                'connected_sources': connected_sources,
                'recent_events': recent_events
            },
            'system_metrics': system_metrics,
            'timestamp': timezone.now().isoformat()
        })


class ExportModelsAPIView(APIView):
    """Export models data"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Export models to CSV"""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="ai_models.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Name', 'Type', 'Algorithm', 'Status', 'Accuracy',
            'Precision', 'Recall', 'F1 Score', 'Created At', 'Last Run'
        ])

        models = AIModel.objects.all()
        for model in models:
            writer.writerow([
                str(model.id),
                model.name,
                model.model_type,
                model.algorithm,
                model.status,
                model.accuracy or '',
                model.precision or '',
                model.recall or '',
                model.f1_score or '',
                model.created_at.isoformat(),
                model.last_run.isoformat() if model.last_run else ''
            ])

        return response


class ExportPredictionsAPIView(APIView):
    """Export predictions data"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Export predictions to CSV"""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="predictions.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Model Name', 'Confidence', 'Prediction Time',
            'Created At', 'Created By'
        ])

        predictions = ModelPrediction.objects.select_related('model', 'created_by').all()
        for pred in predictions:
            writer.writerow([
                str(pred.id),
                pred.model.name,
                pred.confidence or '',
                pred.prediction_time,
                pred.created_at.isoformat(),
                pred.created_by.username if pred.created_by else ''
            ])

        return response


class ExportGovernanceReportAPIView(APIView):
    """Export governance report"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Export governance report as JSON"""

        # Compile governance report
        report = {
            'generated_at': timezone.now().isoformat(),
            'summary': {
                'total_policies': GovernancePolicy.objects.count(),
                'active_policies': GovernancePolicy.objects.filter(status='active').count(),
                'total_violations': PolicyViolation.objects.count(),
                'open_violations': PolicyViolation.objects.filter(
                    status__in=['open', 'in_progress']
                ).count(),
                'compliance_score': 92.5  # Mock calculation
            },
            'policies': [],
            'violations': [],
            'bias_results': []
        }

        # Add policy details
        policies = GovernancePolicy.objects.all()
        for policy in policies:
            report['policies'].append({
                'id': str(policy.id),
                'name': policy.name,
                'type': policy.policy_type,
                'status': policy.status,
                'created_at': policy.created_at.isoformat(),
                'violations_count': policy.violations.count()
            })

        # Add violation details
        violations = PolicyViolation.objects.select_related('policy', 'model').all()
        for violation in violations:
            report['violations'].append({
                'id': str(violation.id),
                'policy_name': violation.policy.name,
                'model_name': violation.model.name,
                'severity': violation.severity,
                'status': violation.status,
                'detected_at': violation.detected_at.isoformat()
            })

        # Add bias detection results
        bias_results = BiasDetectionResult.objects.select_related('model').all()
        for result in bias_results:
            report['bias_results'].append({
                'id': str(result.id),
                'model_name': result.model.name,
                'overall_score': result.overall_score,
                'detection_method': result.detection_method,
                'detected_at': result.detected_at.isoformat()
            })

        response = HttpResponse(
            json.dumps(report, indent=2),
            content_type='application/json'
        )
        response['Content-Disposition'] = 'attachment; filename="governance_report.json"'

        return response


class GovernancePolicyViewSet(viewsets.ModelViewSet):
    """ViewSet for Governance Policies"""
    
    queryset = GovernancePolicy.objects.all()
    serializer_class = GovernancePolicySerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['policy_type', 'scope', 'status', 'created_by']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'approved_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a governance policy"""
        policy = self.get_object()
        
        if policy.status == 'review':
            policy.status = 'approved'
            policy.approved_by = request.user
            policy.approved_at = timezone.now()
            policy.save()
            
            return Response({
                'message': 'Policy approved successfully',
                'status': 'approved'
            })
        
        return Response({
            'error': 'Policy is not in review status',
            'current_status': policy.status
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a governance policy"""
        policy = self.get_object()
        
        if policy.status == 'approved':
            policy.status = 'active'
            policy.save()
            
            return Response({
                'message': 'Policy activated successfully',
                'status': 'active'
            })
        
        return Response({
            'error': 'Policy must be approved before activation',
            'current_status': policy.status
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def bulk_apply(self, request):
        """Apply policy to multiple models"""
        serializer = BulkPolicyApplicationSerializer(data=request.data)
        
        if serializer.is_valid():
            policy_id = serializer.validated_data['policy_id']
            model_ids = serializer.validated_data['model_ids']
            
            try:
                policy = GovernancePolicy.objects.get(id=policy_id)
                models = AIModel.objects.filter(id__in=model_ids)
                
                # Apply policy logic here
                applied_count = models.count()
                
                return Response({
                    'message': f'Policy applied to {applied_count} models',
                    'applied_count': applied_count
                })
            
            except GovernancePolicy.DoesNotExist:
                return Response({
                    'error': 'Policy not found'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def metrics(self, request):
        """Get governance metrics"""
        total_policies = GovernancePolicy.objects.count()
        active_policies = GovernancePolicy.objects.filter(status='active').count()
        total_violations = PolicyViolation.objects.count()
        open_violations = PolicyViolation.objects.filter(
            status__in=['open', 'in_progress']
        ).count()
        critical_violations = PolicyViolation.objects.filter(
            severity='critical', status__in=['open', 'in_progress']
        ).count()
        
        # Calculate compliance score (mock calculation)
        compliance_score = 85.5 if total_policies > 0 else 0
        policy_coverage = (active_policies / total_policies * 100) if total_policies > 0 else 0
        
        metrics = {
            'total_policies': total_policies,
            'active_policies': active_policies,
            'total_violations': total_violations,
            'open_violations': open_violations,
            'critical_violations': critical_violations,
            'compliance_score': compliance_score,
            'policy_coverage': round(policy_coverage, 1)
        }
        
        serializer = GovernanceMetricsSerializer(metrics)
        return Response(serializer.data)


class PolicyViolationViewSet(viewsets.ModelViewSet):
    """ViewSet for Policy Violations"""
    
    queryset = PolicyViolation.objects.all()
    serializer_class = PolicyViolationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['policy', 'model', 'severity', 'status', 'responsible']
    search_fields = ['description']
    ordering_fields = ['detected_at', 'resolved_at', 'severity']
    ordering = ['-detected_at']
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a policy violation"""
        violation = self.get_object()
        resolution = request.data.get('resolution', '')
        
        if violation.status in ['open', 'in_progress']:
            violation.status = 'resolved'
            violation.resolution = resolution
            violation.resolved_by = request.user
            violation.resolved_at = timezone.now()
            violation.save()
            
            return Response({
                'message': 'Violation resolved successfully',
                'status': 'resolved'
            })
        
        return Response({
            'error': 'Violation is already resolved',
            'current_status': violation.status
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def critical(self, request):
        """Get critical violations"""
        critical_violations = self.get_queryset().filter(
            severity='critical',
            status__in=['open', 'in_progress']
        )
        
        page = self.paginate_queryset(critical_violations)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(critical_violations, many=True)
        return Response(serializer.data)
