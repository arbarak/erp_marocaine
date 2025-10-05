"""
URL configuration for reporting module.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ReportTemplateViewSet, ReportExecutionViewSet, DashboardViewSet,
    AuditLogViewSet, FinancialReportsViewSet, TaxComplianceViewSet,
    ManagementDashboardViewSet, AuditReportsViewSet, Phase8ComplianceReportsViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'templates', ReportTemplateViewSet, basename='reporttemplate')
router.register(r'executions', ReportExecutionViewSet, basename='reportexecution')
router.register(r'dashboards', DashboardViewSet, basename='dashboard')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')
router.register(r'financial', FinancialReportsViewSet, basename='financialreports')
router.register(r'tax-compliance', TaxComplianceViewSet, basename='taxcompliance')
router.register(r'management', ManagementDashboardViewSet, basename='managementdashboard')
router.register(r'audit', AuditReportsViewSet, basename='auditreports')
router.register(r'phase8', Phase8ComplianceReportsViewSet, basename='phase8reports')

urlpatterns = [
    path('', include(router.urls)),
]
