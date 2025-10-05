"""
URL configuration for purchasing app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet,
    SupplierContactViewSet,
    SupplierPriceListViewSet,
    RequestForQuotationViewSet,
    SupplierQuotationViewSet,
    PurchaseOrderViewSet,
    GoodsReceiptViewSet,
    PurchaseAnalyticsViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'supplier-contacts', SupplierContactViewSet, basename='supplier-contact')
router.register(r'supplier-price-lists', SupplierPriceListViewSet, basename='supplier-price-list')
router.register(r'rfqs', RequestForQuotationViewSet, basename='rfq')
router.register(r'quotations', SupplierQuotationViewSet, basename='quotation')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'goods-receipts', GoodsReceiptViewSet, basename='goods-receipt')
router.register(r'analytics', PurchaseAnalyticsViewSet, basename='purchase-analytics')

urlpatterns = [
    path('', include(router.urls)),
]
