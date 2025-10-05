"""
URL configuration for inventory app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WarehouseViewSet, LocationTypeViewSet, LocationViewSet,
    StockQuantViewSet, StockMoveViewSet
)
from .valuation_views import StockValuationViewSet, StockValuationLayerViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'location-types', LocationTypeViewSet, basename='locationtype')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'stock-quants', StockQuantViewSet, basename='stockquant')
router.register(r'stock-moves', StockMoveViewSet, basename='stockmove')
router.register(r'valuations', StockValuationViewSet, basename='stockvaluation')
router.register(r'valuation-layers', StockValuationLayerViewSet, basename='stockvaluationlayer')

urlpatterns = [
    path('', include(router.urls)),
]
