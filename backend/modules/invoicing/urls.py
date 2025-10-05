"""
URL configuration for invoicing module.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    InvoiceViewSet, PaymentViewSet, InvoicePaymentViewSet, ReportViewSet,
    InvoiceTemplateViewSet, InvoiceAnalyticsViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'allocations', InvoicePaymentViewSet, basename='invoicepayment')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'templates', InvoiceTemplateViewSet, basename='template')
router.register(r'analytics', InvoiceAnalyticsViewSet, basename='analytics')

app_name = 'invoicing'

urlpatterns = [
    path('', include(router.urls)),
]
