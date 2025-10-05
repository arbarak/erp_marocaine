"""
Company context middleware for multi-tenant support.
"""
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from rest_framework import status

logger = logging.getLogger(__name__)


class CompanyContextMiddleware(MiddlewareMixin):
    """
    Middleware to resolve and set the current company context from JWT token or header.
    """
    
    def process_request(self, request):
        """
        Extract company context from request.
        """
        company_id = None
        
        # Try to get company ID from header
        company_id = request.META.get('HTTP_X_COMPANY_ID')
        
        # If not in header, try to get from JWT token
        if not company_id and hasattr(request, 'user') and request.user.is_authenticated:
            # This will be implemented when we have the User model
            # company_id = getattr(request.user, 'current_company_id', None)
            pass
        
        # Set company context
        request.company_id = company_id
        
        # Log company context
        if company_id:
            logger.debug(f"Company context set: {company_id}")
        
        return None
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Check if company context is required for this view.
        """
        # Skip for admin, auth, and health check endpoints
        if request.path.startswith(('/admin/', '/api/v1/auth/', '/health/')):
            return None
        
        # Skip for API documentation
        if request.path.startswith(('/api/schema/', '/api/docs/', '/api/redoc/')):
            return None
        
        # For API endpoints, company context might be required
        if request.path.startswith('/api/v1/') and not request.company_id:
            # For now, we'll be lenient during development
            logger.warning(f"No company context for API request: {request.path}")
        
        return None
