# Tenant-Aware Permissions

from rest_framework import permissions
from .utils import get_current_tenant


class IsTenantMember(permissions.BasePermission):
    """
    Permission to check if user is a member of the current tenant
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        tenant = get_current_tenant()
        if not tenant:
            return False
        
        # Check if user is a member of the tenant
        return tenant.tenant_users.filter(
            user=request.user,
            is_active=True
        ).exists()


class IsTenantOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to check if user is owner or admin of the current tenant
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        tenant = get_current_tenant()
        if not tenant:
            return False
        
        # Check if user is owner or admin
        tenant_user = tenant.tenant_users.filter(
            user=request.user,
            is_active=True
        ).first()
        
        return tenant_user and tenant_user.role in ['owner', 'admin']


class IsTenantOwner(permissions.BasePermission):
    """
    Permission to check if user is owner of the current tenant
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        tenant = get_current_tenant()
        if not tenant:
            return False
        
        # Check if user is owner
        return tenant.tenant_users.filter(
            user=request.user,
            role='owner',
            is_active=True
        ).exists()


class HasTenantFeature(permissions.BasePermission):
    """
    Permission to check if tenant has specific feature enabled
    """
    
    def __init__(self, feature_name):
        self.feature_name = feature_name
    
    def has_permission(self, request, view):
        tenant = get_current_tenant()
        if not tenant:
            return False
        
        return tenant.has_feature(self.feature_name)


class TenantResourcePermission(permissions.BasePermission):
    """
    Permission for tenant-specific resources
    Checks both tenant membership and resource-level permissions
    """
    
    def has_permission(self, request, view):
        # Basic tenant membership check
        if not request.user or not request.user.is_authenticated:
            return False
        
        tenant = get_current_tenant()
        if not tenant:
            return False
        
        tenant_user = tenant.tenant_users.filter(
            user=request.user,
            is_active=True
        ).first()
        
        if not tenant_user:
            return False
        
        # Role-based permissions
        role_permissions = {
            'viewer': ['GET'],
            'user': ['GET', 'POST'],
            'manager': ['GET', 'POST', 'PUT', 'PATCH'],
            'admin': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            'owner': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        }
        
        allowed_methods = role_permissions.get(tenant_user.role, [])
        return request.method in allowed_methods
    
    def has_object_permission(self, request, view, obj):
        # Additional object-level permissions can be implemented here
        return True


def require_tenant_feature(feature_name):
    """
    Decorator to require specific tenant feature
    
    Usage:
        @require_tenant_feature('advanced_analytics')
        class AnalyticsViewSet(viewsets.ModelViewSet):
            # ViewSet code here
    """
    def decorator(cls):
        # Add feature permission to existing permission classes
        if hasattr(cls, 'permission_classes'):
            cls.permission_classes = list(cls.permission_classes) + [HasTenantFeature(feature_name)]
        else:
            cls.permission_classes = [HasTenantFeature(feature_name)]
        
        return cls
    
    return decorator


def require_tenant_role(required_role):
    """
    Decorator to require specific tenant role
    
    Usage:
        @require_tenant_role('admin')
        class AdminOnlyViewSet(viewsets.ModelViewSet):
            # ViewSet code here
    """
    class RequireTenantRole(permissions.BasePermission):
        def has_permission(self, request, view):
            if not request.user or not request.user.is_authenticated:
                return False
            
            tenant = get_current_tenant()
            if not tenant:
                return False
            
            tenant_user = tenant.tenant_users.filter(
                user=request.user,
                is_active=True
            ).first()
            
            if not tenant_user:
                return False
            
            # Define role hierarchy
            role_hierarchy = {
                'viewer': 1,
                'user': 2,
                'manager': 3,
                'admin': 4,
                'owner': 5,
            }
            
            user_level = role_hierarchy.get(tenant_user.role, 0)
            required_level = role_hierarchy.get(required_role, 5)
            
            return user_level >= required_level
    
    def decorator(cls):
        if hasattr(cls, 'permission_classes'):
            cls.permission_classes = list(cls.permission_classes) + [RequireTenantRole]
        else:
            cls.permission_classes = [RequireTenantRole]
        
        return cls
    
    return decorator
