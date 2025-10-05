"""
Request ID middleware for tracking requests across the system.
"""
import uuid
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class RequestIDMiddleware(MiddlewareMixin):
    """
    Middleware to add a unique request ID to each request.
    """
    
    def process_request(self, request):
        """
        Add a unique request ID to the request.
        """
        request_id = str(uuid.uuid4())
        request.request_id = request_id
        
        # Add to logging context
        logger.info(f"Request started: {request_id}")
        
        return None
    
    def process_response(self, request, response):
        """
        Add request ID to response headers.
        """
        if hasattr(request, 'request_id'):
            response['X-Request-ID'] = request.request_id
            logger.info(f"Request completed: {request.request_id}")
        
        return response
