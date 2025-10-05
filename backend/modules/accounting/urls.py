"""
URL configuration for accounting module.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AccountTypeViewSet, AccountViewSet, JournalViewSet,
    JournalEntryViewSet, FinancialReportsViewSet, ChartOfAccountsViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'account-types', AccountTypeViewSet, basename='accounttype')
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'journals', JournalViewSet, basename='journal')
router.register(r'journal-entries', JournalEntryViewSet, basename='journalentry')
router.register(r'reports', FinancialReportsViewSet, basename='financialreports')
router.register(r'chart-of-accounts', ChartOfAccountsViewSet, basename='chartofaccounts')

urlpatterns = [
    path('', include(router.urls)),
]
