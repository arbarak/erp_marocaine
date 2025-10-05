from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.documentation import include_docs_urls
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'models', views.AIModelViewSet, basename='aimodel')
router.register(r'training-jobs', views.TrainingJobViewSet, basename='trainingjob')
router.register(r'predictions', views.ModelPredictionViewSet, basename='modelprediction')
router.register(r'bias-detection', views.BiasDetectionResultViewSet, basename='biasdetectionresult')
router.register(r'governance-policies', views.GovernancePolicyViewSet, basename='governancepolicy')
router.register(r'policy-violations', views.PolicyViolationViewSet, basename='policyviolation')
router.register(r'streaming-sources', views.StreamingDataSourceViewSet, basename='streamingdatasource')
router.register(r'streaming-events', views.StreamingEventViewSet, basename='streamingevent')

app_name = 'ai_ml'

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    
    # Additional custom endpoints
    path('api/analytics/', views.AnalyticsAPIView.as_view(), name='analytics'),
    path('api/dashboard/', views.DashboardAPIView.as_view(), name='dashboard'),
    path('api/health/', views.HealthCheckAPIView.as_view(), name='health'),
    
    # Batch operations
    path('api/batch/train/', views.BatchTrainingAPIView.as_view(), name='batch-train'),
    path('api/batch/predict/', views.BatchPredictionAPIView.as_view(), name='batch-predict'),
    path('api/batch/bias-scan/', views.BatchBiasScanAPIView.as_view(), name='batch-bias-scan'),
    
    # Real-time endpoints
    path('api/realtime/events/', views.RealtimeEventsAPIView.as_view(), name='realtime-events'),
    path('api/realtime/metrics/', views.RealtimeMetricsAPIView.as_view(), name='realtime-metrics'),
    
    # Export endpoints
    path('api/export/models/', views.ExportModelsAPIView.as_view(), name='export-models'),
    path('api/export/predictions/', views.ExportPredictionsAPIView.as_view(), name='export-predictions'),
    path('api/export/governance-report/', views.ExportGovernanceReportAPIView.as_view(), name='export-governance'),
    
    # API documentation
    path('docs/', include_docs_urls(title='AI/ML API Documentation')),
]
