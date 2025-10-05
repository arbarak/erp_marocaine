# Tenant API URLs

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    TenantViewSet, TenantUserViewSet, TenantConfigurationViewSet,
    TenantInvitationViewSet, AcceptInvitationView, SubdomainAvailabilityView,
    CurrentTenantView, SwitchTenantView, TenantHealthView
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'tenant-users', TenantUserViewSet, basename='tenantuser')
router.register(r'tenant-configurations', TenantConfigurationViewSet, basename='tenantconfiguration')
router.register(r'tenant-invitations', TenantInvitationViewSet, basename='tenantinvitation')

# URL patterns
urlpatterns = [
    # Router URLs
    path('api/v1/', include(router.urls)),
    
    # Additional API endpoints
    path('api/v1/accept-invitation/', AcceptInvitationView.as_view(), name='accept-invitation'),
    path('api/v1/subdomain-availability/', SubdomainAvailabilityView.as_view(), name='subdomain-availability'),
    path('api/v1/current-tenant/', CurrentTenantView.as_view(), name='current-tenant'),
    path('api/v1/switch-tenant/', SwitchTenantView.as_view(), name='switch-tenant'),
    path('api/v1/tenant-health/', TenantHealthView.as_view(), name='tenant-health'),
]
