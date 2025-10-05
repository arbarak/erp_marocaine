"""
Views for analytics module.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from core.permissions import CompanyContextPermission
from .models import (
    AnalyticsDataSource, AnalyticsMetric, MetricValue,
    PredictiveModel, Prediction, BusinessIntelligenceDashboard
)
from .serializers import (
    AnalyticsDataSourceSerializer, AnalyticsDataSourceCreateSerializer,
    AnalyticsMetricSerializer, AnalyticsMetricCreateSerializer,
    MetricValueSerializer, PredictiveModelSerializer,
    PredictiveModelCreateSerializer, PredictionSerializer,
    BusinessIntelligenceDashboardSerializer, BusinessIntelligenceDashboardCreateSerializer,
    MetricCalculationParametersSerializer, ModelTrainingParametersSerializer,
    PredictionParametersSerializer, DashboardDataSerializer,
    AnalyticsInsightSerializer
)
from .services import (
    AnalyticsDataService, MetricsCalculationService,
    PredictiveAnalyticsService, BusinessIntelligenceService
)


class AnalyticsDataSourceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing analytics data sources."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['source_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'last_refresh']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter data sources by company."""
        return AnalyticsDataSource.objects.filter(
            company=self.request.user.current_company
        )
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return AnalyticsDataSourceCreateSerializer
        return AnalyticsDataSourceSerializer
    
    @action(detail=True, methods=['post'])
    def refresh(self, request, pk=None):
        """Refresh data from the data source."""
        data_source = self.get_object()
        result = AnalyticsDataService.refresh_data_source(data_source)
        
        if result['success']:
            return Response({
                'message': _('Data source refreshed successfully'),
                'result': result
            })
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)


class AnalyticsMetricViewSet(viewsets.ModelViewSet):
    """ViewSet for managing analytics metrics."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['metric_type', 'aggregation_period', 'is_active', 'data_source']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter metrics by company."""
        return AnalyticsMetric.objects.filter(
            company=self.request.user.current_company
        )
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return AnalyticsMetricCreateSerializer
        return AnalyticsMetricSerializer
    
    @action(detail=True, methods=['get'])
    def values(self, request, pk=None):
        """Get historical values for a metric."""
        metric = self.get_object()
        values = MetricValue.objects.filter(metric=metric).order_by('-period_start')
        
        # Apply date filtering if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            values = values.filter(period_start__gte=start_date)
        if end_date:
            values = values.filter(period_end__lte=end_date)
        
        serializer = MetricValueSerializer(values, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def calculate(self, request, pk=None):
        """Calculate metric value for a specific period."""
        metric = self.get_object()
        
        # Get period from request
        period_start = request.data.get('period_start')
        period_end = request.data.get('period_end')
        
        if not period_start or not period_end:
            return Response({
                'error': _('period_start and period_end are required')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate metric
        value = MetricsCalculationService.calculate_metric(
            metric, period_start, period_end
        )
        
        # Store the value
        metric_value = MetricValue.objects.update_or_create(
            metric=metric,
            period_start=period_start,
            period_end=period_end,
            defaults={'value': value}
        )[0]
        
        serializer = MetricValueSerializer(metric_value)
        return Response(serializer.data)


class MetricValueViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing metric values."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    serializer_class = MetricValueSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['metric']
    ordering_fields = ['period_start', 'calculated_at']
    ordering = ['-period_start']
    
    def get_queryset(self):
        """Filter metric values by company."""
        return MetricValue.objects.filter(
            metric__company=self.request.user.current_company
        )


class PredictiveModelViewSet(viewsets.ModelViewSet):
    """ViewSet for managing predictive models."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['model_type', 'status', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'trained_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter models by company."""
        return PredictiveModel.objects.filter(
            company=self.request.user.current_company
        )
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return PredictiveModelCreateSerializer
        return PredictiveModelSerializer
    
    @action(detail=True, methods=['post'])
    def train(self, request, pk=None):
        """Train the predictive model."""
        model = self.get_object()
        
        # Check if model is already trained and retrain flag
        retrain = request.data.get('retrain', False)
        if model.status == 'TRAINED' and not retrain:
            return Response({
                'error': _('Model is already trained. Use retrain=true to retrain.')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Train the model
        result = PredictiveAnalyticsService.train_model(model)
        
        if result['success']:
            return Response({
                'message': _('Model trained successfully'),
                'result': result
            })
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def predict(self, request, pk=None):
        """Generate a prediction using the model."""
        model = self.get_object()
        
        target_date = request.data.get('target_date')
        if not target_date:
            return Response({
                'error': _('target_date is required')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate prediction
        result = PredictiveAnalyticsService.generate_prediction(model, target_date)
        
        if result['success']:
            return Response({
                'message': _('Prediction generated successfully'),
                'result': result
            })
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def deploy(self, request, pk=None):
        """Deploy the model for production use."""
        model = self.get_object()
        
        if model.status != 'TRAINED':
            return Response({
                'error': _('Model must be trained before deployment')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        model.status = 'DEPLOYED'
        model.deployed_at = timezone.now()
        model.save()
        
        return Response({
            'message': _('Model deployed successfully')
        })


class PredictionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing predictions."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    serializer_class = PredictionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['model']
    ordering_fields = ['prediction_date', 'target_period_start']
    ordering = ['-prediction_date']
    
    def get_queryset(self):
        """Filter predictions by company."""
        return Prediction.objects.filter(
            model__company=self.request.user.current_company
        )


class BusinessIntelligenceDashboardViewSet(viewsets.ModelViewSet):
    """ViewSet for managing BI dashboards."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['dashboard_type', 'is_public', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter dashboards by company and access permissions."""
        user = self.request.user
        company = user.current_company
        
        queryset = BusinessIntelligenceDashboard.objects.filter(company=company)
        
        # Filter by access permissions
        if not user.is_superuser:
            queryset = queryset.filter(
                models.Q(is_public=True) |
                models.Q(created_by=user) |
                models.Q(allowed_users=user)
            ).distinct()
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return BusinessIntelligenceDashboardCreateSerializer
        return BusinessIntelligenceDashboardSerializer
    
    @action(detail=True, methods=['get'])
    def data(self, request, pk=None):
        """Get dashboard data."""
        dashboard = self.get_object()
        
        # Generate dashboard data based on type
        if dashboard.dashboard_type == 'EXECUTIVE':
            data = BusinessIntelligenceService.generate_executive_dashboard(
                dashboard.company
            )
        else:
            # Default dashboard data
            data = {
                'dashboard_type': dashboard.dashboard_type,
                'period': {
                    'start': timezone.now() - timezone.timedelta(days=30),
                    'end': timezone.now()
                },
                'key_metrics': {},
                'trends': {},
                'alerts': []
            }
        
        data['generated_at'] = timezone.now()
        serializer = DashboardDataSerializer(data)
        return Response(serializer.data)


class AnalyticsAPIViewSet(viewsets.ViewSet):
    """ViewSet for analytics API endpoints."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    @action(detail=False, methods=['post'])
    def calculate_metrics(self, request):
        """Calculate metrics for a specific period."""
        serializer = MetricCalculationParametersSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        company = request.user.current_company
        
        result = MetricsCalculationService.calculate_all_metrics(
            company, data['period_start'], data['period_end']
        )
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def insights(self, request):
        """Get analytics insights and recommendations."""
        company = request.user.current_company
        
        # Generate insights (simplified implementation)
        insights = [
            {
                'insight_type': 'TREND',
                'title': _('Revenue Growth'),
                'description': _('Revenue has increased by 15% compared to last month'),
                'severity': 'INFO',
                'metrics': ['total_revenue'],
                'recommendations': [_('Continue current sales strategy')],
                'generated_at': timezone.now()
            }
        ]
        
        serializer = AnalyticsInsightSerializer(insights, many=True)
        return Response(serializer.data)
