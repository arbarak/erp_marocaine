"""
URL configuration for analytics module.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AnalyticsDataSourceViewSet, AnalyticsMetricViewSet, MetricValueViewSet,
    PredictiveModelViewSet, PredictionViewSet, BusinessIntelligenceDashboardViewSet,
    AnalyticsAPIViewSet
)

router = DefaultRouter()
router.register(r'data-sources', AnalyticsDataSourceViewSet, basename='analytics-data-source')
router.register(r'metrics', AnalyticsMetricViewSet, basename='analytics-metric')
router.register(r'metric-values', MetricValueViewSet, basename='metric-value')
router.register(r'predictive-models', PredictiveModelViewSet, basename='predictive-model')
router.register(r'predictions', PredictionViewSet, basename='prediction')
router.register(r'dashboards', BusinessIntelligenceDashboardViewSet, basename='bi-dashboard')
router.register(r'api', AnalyticsAPIViewSet, basename='analytics-api')

urlpatterns = [
    path('', include(router.urls)),
]
