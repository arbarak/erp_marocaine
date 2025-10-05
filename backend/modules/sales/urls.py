"""
URL configuration for sales app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerViewSet, CustomerContactViewSet, CustomerPriceListViewSet,
    SalesQuotationViewSet, SalesOrderViewSet,
    DeliveryNoteViewSet, ReturnNoteViewSet,
    SalesAnalyticsViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'customer-contacts', CustomerContactViewSet, basename='customer-contact')
router.register(r'customer-price-lists', CustomerPriceListViewSet, basename='customer-price-list')
router.register(r'quotations', SalesQuotationViewSet, basename='sales-quotation')
router.register(r'orders', SalesOrderViewSet, basename='sales-order')
router.register(r'deliveries', DeliveryNoteViewSet, basename='delivery-note')
router.register(r'returns', ReturnNoteViewSet, basename='return-note')
router.register(r'analytics', SalesAnalyticsViewSet, basename='sales-analytics')

urlpatterns = [
    path('', include(router.urls)),
]
