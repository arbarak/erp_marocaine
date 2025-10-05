"""
URL configuration for tax engine.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    TaxViewSet, TaxRateVersionViewSet, TaxProfileViewSet,
    TaxConfigurationViewSet, TaxCalculationViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'taxes', TaxViewSet, basename='tax')
router.register(r'tax-rates', TaxRateVersionViewSet, basename='taxrateversion')
router.register(r'tax-profiles', TaxProfileViewSet, basename='taxprofile')
router.register(r'configurations', TaxConfigurationViewSet, basename='taxconfiguration')
router.register(r'calculations', TaxCalculationViewSet, basename='taxcalculation')

urlpatterns = [
    path('', include(router.urls)),
]
