# Tenant-Aware Middleware

import logging
from django.http import Http404, HttpResponseRedirect
from django.urls import reverse
from django.conf import settings
from django.core.cache import cache
from django.db import connection
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser

from .models import Tenant
from .utils import get_tenant_from_request, set_current_tenant, get_current_tenant
from .exceptions import TenantNotFoundError, TenantInactiveError

logger = logging.getLogger(__name__)


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to detect and set the current tenant based on request
    Handles subdomain and custom domain routing
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.excluded_paths = getattr(settings, 'TENANT_EXCLUDED_PATHS', [
            '/admin/',
            '/api/auth/',
            '/api/tenants/',
            '/health/',
            '/static/',
            '/media/',
        ])
    
    def process_request(self, request):
        """Process incoming request to determine tenant"""
        # Skip tenant detection for excluded paths
        if any(request.path.startswith(path) for path in self.excluded_paths):
            return None
        
        try:
            # Get tenant from request (subdomain/domain)
            tenant = get_tenant_from_request(request)
            
            if not tenant:
                # No tenant found - redirect to tenant selection or 404
                return self._handle_no_tenant(request)
            
            if not tenant.is_active:
                # Tenant is inactive
                return self._handle_inactive_tenant(request, tenant)
            
            if tenant.is_trial_expired:
                # Trial has expired
                return self._handle_expired_trial(request, tenant)
            
            # Set current tenant for request
            set_current_tenant(tenant)
            request.tenant = tenant
            
            # Set database schema for tenant
            self._set_tenant_schema(tenant)
            
            # Log tenant access
            self._log_tenant_access(request, tenant)
            
        except Exception as e:
            logger.error(f"Error in tenant middleware: {str(e)}")
            return self._handle_tenant_error(request, e)
        
        return None
    
    def process_response(self, request, response):
        """Clean up after request processing"""
        # Reset to public schema
        self._reset_schema()
        
        # Clear current tenant
        set_current_tenant(None)
        
        return response
    
    def _handle_no_tenant(self, request):
        """Handle case where no tenant is found"""
        if request.path.startswith('/api/'):
            # API request without tenant - return 404
            raise Http404("Tenant not found")
        
        # Web request - redirect to tenant selection
        return HttpResponseRedirect(reverse('tenant_selection'))
    
    def _handle_inactive_tenant(self, request, tenant):
        """Handle inactive tenant"""
        logger.warning(f"Access attempt to inactive tenant: {tenant.name}")
        
        if request.path.startswith('/api/'):
            raise TenantInactiveError(f"Tenant {tenant.name} is inactive")
        
        # Redirect to tenant inactive page
        return HttpResponseRedirect(reverse('tenant_inactive'))
    
    def _handle_expired_trial(self, request, tenant):
        """Handle expired trial tenant"""
        logger.warning(f"Access attempt to expired trial tenant: {tenant.name}")
        
        if request.path.startswith('/api/'):
            raise TenantInactiveError(f"Trial for tenant {tenant.name} has expired")
        
        # Redirect to trial expired page
        return HttpResponseRedirect(reverse('trial_expired'))
    
    def _handle_tenant_error(self, request, error):
        """Handle tenant-related errors"""
        logger.error(f"Tenant error for {request.get_host()}: {str(error)}")
        
        if request.path.startswith('/api/'):
            raise Http404("Tenant error")
        
        # Redirect to error page
        return HttpResponseRedirect(reverse('tenant_error'))
    
    def _set_tenant_schema(self, tenant):
        """Set database schema for tenant"""
        try:
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{tenant.schema_name}", public')
            
            logger.debug(f"Set database schema to {tenant.schema_name}")
            
        except Exception as e:
            logger.error(f"Failed to set schema for tenant {tenant.name}: {str(e)}")
            raise
    
    def _reset_schema(self):
        """Reset database schema to public"""
        try:
            with connection.cursor() as cursor:
                cursor.execute('SET search_path TO public')
            
            logger.debug("Reset database schema to public")
            
        except Exception as e:
            logger.error(f"Failed to reset schema: {str(e)}")
    
    def _log_tenant_access(self, request, tenant):
        """Log tenant access for analytics"""
        if hasattr(request, 'user') and not isinstance(request.user, AnonymousUser):
            # Update user's last access to tenant
            try:
                tenant_user = tenant.tenant_users.get(user=request.user)
                tenant_user.update_last_access()
            except:
                pass  # User might not be a member of this tenant


class TenantUserMiddleware(MiddlewareMixin):
    """
    Middleware to validate user access to tenant
    Ensures users can only access tenants they belong to
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.excluded_paths = getattr(settings, 'TENANT_USER_EXCLUDED_PATHS', [
            '/admin/',
            '/api/auth/',
            '/api/tenants/',
            '/health/',
            '/static/',
            '/media/',
        ])
    
    def process_request(self, request):
        """Validate user access to current tenant"""
        # Skip for excluded paths
        if any(request.path.startswith(path) for path in self.excluded_paths):
            return None
        
        # Skip if no tenant or user
        if not hasattr(request, 'tenant') or not hasattr(request, 'user'):
            return None
        
        # Skip for anonymous users
        if isinstance(request.user, AnonymousUser):
            return None
        
        tenant = request.tenant
        user = request.user
        
        try:
            # Check if user has access to tenant
            tenant_user = tenant.tenant_users.get(user=user, is_active=True)
            request.tenant_user = tenant_user
            
            # Check if user has required permissions for the request
            if not self._check_user_permissions(request, tenant_user):
                logger.warning(f"User {user.username} denied access to {request.path} in tenant {tenant.name}")
                
                if request.path.startswith('/api/'):
                    from django.http import JsonResponse
                    return JsonResponse({'error': 'Permission denied'}, status=403)
                
                return HttpResponseRedirect(reverse('permission_denied'))
        
        except tenant.tenant_users.model.DoesNotExist:
            logger.warning(f"User {user.username} attempted access to tenant {tenant.name} without membership")
            
            if request.path.startswith('/api/'):
                from django.http import JsonResponse
                return JsonResponse({'error': 'Access denied'}, status=403)
            
            return HttpResponseRedirect(reverse('access_denied'))
        
        return None
    
    def _check_user_permissions(self, request, tenant_user):
        """Check if user has required permissions for request"""
        # Basic role-based access control
        role_permissions = {
            'viewer': ['GET'],
            'user': ['GET', 'POST'],
            'manager': ['GET', 'POST', 'PUT', 'PATCH'],
            'admin': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            'owner': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        }
        
        allowed_methods = role_permissions.get(tenant_user.role, [])
        
        if request.method not in allowed_methods:
            return False
        
        # Additional permission checks can be added here
        # e.g., resource-specific permissions, feature-based access
        
        return True


class TenantCacheMiddleware(MiddlewareMixin):
    """
    Middleware to handle tenant-specific caching
    Ensures cache keys are tenant-aware
    """
    
    def process_request(self, request):
        """Set tenant-specific cache prefix"""
        if hasattr(request, 'tenant'):
            # Set cache key prefix for tenant
            cache_prefix = f"tenant_{request.tenant.id}_"
            cache.key_prefix = cache_prefix
        
        return None
    
    def process_response(self, request, response):
        """Reset cache prefix"""
        cache.key_prefix = ""
        return response


def setup_tenant_middleware():
    """Setup tenant middleware configuration"""
    # This function is called during app initialization
    # Can be used to configure middleware settings
    pass
