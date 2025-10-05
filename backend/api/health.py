"""
Health check views for the ERP API.
"""

from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import time


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Basic health check endpoint.
    """
    return JsonResponse({
        'status': 'healthy',
        'timestamp': time.time(),
        'version': '1.0.0'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def readiness_check(request):
    """
    Readiness check that verifies database and cache connectivity.
    """
    checks = {
        'database': False,
        'cache': False,
    }
    
    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks['database'] = True
    except Exception:
        pass
    
    # Check cache
    try:
        cache.set('health_check', 'ok', 10)
        if cache.get('health_check') == 'ok':
            checks['cache'] = True
    except Exception:
        pass
    
    all_healthy = all(checks.values())
    status_code = 200 if all_healthy else 503
    
    return JsonResponse({
        'status': 'ready' if all_healthy else 'not_ready',
        'checks': checks,
        'timestamp': time.time()
    }, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def liveness_check(request):
    """
    Liveness check for Kubernetes.
    """
    return JsonResponse({
        'status': 'alive',
        'timestamp': time.time()
    })
