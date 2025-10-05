"""
API URL configuration.
"""
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .health import health_check, readiness_check, liveness_check

urlpatterns = [
    # Health checks
    path('health/', health_check, name='health_check'),
    path('readiness/', readiness_check, name='readiness_check'),
    path('liveness/', liveness_check, name='liveness_check'),

    # Authentication
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Core modules
    path('accounts/', include('core.accounts.urls')),
    path('companies/', include('core.companies.urls')),
    
    # Business modules
    path('catalog/', include('modules.catalog.urls')),
    path('inventory/', include('modules.inventory.urls')),
    path('purchasing/', include('modules.purchasing.urls')),
    path('sales/', include('modules.sales.urls')),
    path('invoicing/', include('modules.invoicing.urls')),
    path('accounting/', include('modules.accounting.urls')),
    path('reporting/', include('modules.reporting.urls')),
    # path('currencies/', include('libs.fx_rates.urls')),  # URLs not implemented yet
    # path('tax-engine/', include('libs.tax_engine.urls')),  # Views not implemented yet
]
