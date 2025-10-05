"""
Accounts API URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView, UserLoginView, UserLogoutView,
    UserProfileViewSet, RoleViewSet,  # UserCompanyMembershipViewSet
)

# Create router for viewsets
router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='user-profile')
router.register(r'roles', RoleViewSet, basename='role')
# router.register(r'memberships', UserCompanyMembershipViewSet, basename='membership')

app_name = 'accounts'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/logout/', UserLogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # User management endpoints
    path('', include(router.urls)),
]
