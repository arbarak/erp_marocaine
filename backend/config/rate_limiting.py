# API Rate Limiting and Performance Configuration

import time
import hashlib
from typing import Dict, Any, Optional, Tuple
from django.core.cache import cache
from django.http import JsonResponse
from django.conf import settings
from rest_framework.throttling import BaseThrottle
from rest_framework.views import APIView
import logging
import redis
from functools import wraps

logger = logging.getLogger(__name__)

# Rate limiting configurations
RATE_LIMITS = {
    'default': {
        'requests': 100,
        'window': 3600,  # 1 hour
        'burst': 10,     # burst allowance
    },
    'authentication': {
        'requests': 5,
        'window': 300,   # 5 minutes
        'burst': 2,
    },
    'ai_ml_training': {
        'requests': 3,
        'window': 3600,  # 1 hour
        'burst': 1,
    },
    'ai_ml_prediction': {
        'requests': 1000,
        'window': 3600,  # 1 hour
        'burst': 50,
    },
    'ai_ml_bias_detection': {
        'requests': 10,
        'window': 3600,  # 1 hour
        'burst': 2,
    },
    'analytics': {
        'requests': 200,
        'window': 3600,  # 1 hour
        'burst': 20,
    },
    'reporting': {
        'requests': 50,
        'window': 3600,  # 1 hour
        'burst': 5,
    },
    'streaming': {
        'requests': 10000,
        'window': 3600,  # 1 hour
        'burst': 100,
    },
    'admin': {
        'requests': 500,
        'window': 3600,  # 1 hour
        'burst': 50,
    },
    'public': {
        'requests': 20,
        'window': 3600,  # 1 hour
        'burst': 5,
    }
}

# Performance monitoring thresholds
PERFORMANCE_THRESHOLDS = {
    'response_time_warning': 1.0,    # seconds
    'response_time_critical': 3.0,   # seconds
    'memory_usage_warning': 512,     # MB
    'memory_usage_critical': 1024,   # MB
    'cpu_usage_warning': 70,         # percentage
    'cpu_usage_critical': 90,        # percentage
    'db_query_count_warning': 20,
    'db_query_count_critical': 50,
}


class AdvancedRateLimiter:
    """Advanced rate limiter with burst support and sliding window"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client or cache._cache.get_client()
    
    def is_allowed(self, key: str, limit_config: Dict[str, int]) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if request is allowed based on sliding window + burst algorithm
        Returns (is_allowed, rate_limit_info)
        """
        requests_limit = limit_config['requests']
        window_size = limit_config['window']
        burst_limit = limit_config.get('burst', 0)
        
        current_time = int(time.time())
        window_start = current_time - window_size
        
        # Use Redis pipeline for atomic operations
        pipe = self.redis_client.pipeline()
        
        # Remove old entries
        pipe.zremrangebyscore(key, 0, window_start)
        
        # Count current requests
        pipe.zcard(key)
        
        # Add current request
        pipe.zadd(key, {str(current_time): current_time})
        
        # Set expiration
        pipe.expire(key, window_size + 60)
        
        results = pipe.execute()
        current_requests = results[1]
        
        # Check burst limit first
        burst_key = f"{key}:burst"
        burst_count = self.redis_client.get(burst_key) or 0
        burst_count = int(burst_count)
        
        # Calculate remaining limits
        remaining_requests = max(0, requests_limit - current_requests)
        remaining_burst = max(0, burst_limit - burst_count)
        
        # Determine if request is allowed
        if current_requests <= requests_limit:
            # Within normal limit
            is_allowed = True
        elif burst_count < burst_limit:
            # Use burst allowance
            is_allowed = True
            self.redis_client.incr(burst_key)
            self.redis_client.expire(burst_key, 60)  # Burst window is 1 minute
        else:
            # Rate limited
            is_allowed = False
        
        # Calculate reset time
        reset_time = current_time + window_size
        
        rate_limit_info = {
            'limit': requests_limit,
            'remaining': remaining_requests,
            'reset': reset_time,
            'burst_limit': burst_limit,
            'burst_remaining': remaining_burst,
            'current_requests': current_requests,
            'window_size': window_size,
        }
        
        return is_allowed, rate_limit_info
    
    def get_rate_limit_key(self, request, view_name: str = None) -> str:
        """Generate rate limit key based on user, IP, and endpoint"""
        if hasattr(request, 'user') and request.user.is_authenticated:
            identifier = f"user:{request.user.id}"
        else:
            # Use IP address for anonymous users
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0].strip()
            else:
                ip = request.META.get('REMOTE_ADDR', 'unknown')
            identifier = f"ip:{ip}"
        
        endpoint = view_name or request.resolver_match.url_name or 'unknown'
        return f"rate_limit:{identifier}:{endpoint}"


class SmartThrottle(BaseThrottle):
    """Smart throttling with different limits for different endpoints"""
    
    def __init__(self):
        self.rate_limiter = AdvancedRateLimiter()
    
    def allow_request(self, request, view):
        """Check if request should be allowed"""
        # Determine rate limit category
        category = self.get_rate_limit_category(request, view)
        limit_config = RATE_LIMITS.get(category, RATE_LIMITS['default'])
        
        # Generate rate limit key
        key = self.rate_limiter.get_rate_limit_key(request, category)
        
        # Check rate limit
        is_allowed, rate_limit_info = self.rate_limiter.is_allowed(key, limit_config)
        
        # Store rate limit info for response headers
        request.rate_limit_info = rate_limit_info
        
        if not is_allowed:
            logger.warning(f"Rate limit exceeded for {key}: {rate_limit_info}")
        
        return is_allowed
    
    def wait(self):
        """Return wait time for rate limited requests"""
        return 60  # Default wait time
    
    def get_rate_limit_category(self, request, view) -> str:
        """Determine rate limit category based on request and view"""
        # Check if it's an admin request
        if request.path.startswith('/admin/'):
            return 'admin'
        
        # Check if it's an authentication request
        if any(path in request.path for path in ['/auth/', '/login/', '/token/']):
            return 'authentication'
        
        # Check AI/ML endpoints
        if '/ai-ml/' in request.path:
            if 'training' in request.path:
                return 'ai_ml_training'
            elif 'predict' in request.path:
                return 'ai_ml_prediction'
            elif 'bias' in request.path:
                return 'ai_ml_bias_detection'
            else:
                return 'ai_ml_training'  # Default for AI/ML
        
        # Check analytics endpoints
        if any(path in request.path for path in ['/analytics/', '/dashboard/', '/metrics/']):
            return 'analytics'
        
        # Check reporting endpoints
        if '/reports/' in request.path:
            return 'reporting'
        
        # Check streaming endpoints
        if any(path in request.path for path in ['/streaming/', '/events/', '/ws/']):
            return 'streaming'
        
        # Check if user is authenticated
        if hasattr(request, 'user') and request.user.is_authenticated:
            return 'default'
        else:
            return 'public'


def rate_limit_decorator(category: str = 'default'):
    """Decorator for function-based views to apply rate limiting"""
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            rate_limiter = AdvancedRateLimiter()
            limit_config = RATE_LIMITS.get(category, RATE_LIMITS['default'])
            
            key = rate_limiter.get_rate_limit_key(request, category)
            is_allowed, rate_limit_info = rate_limiter.is_allowed(key, limit_config)
            
            if not is_allowed:
                return JsonResponse({
                    'error': 'Rate limit exceeded',
                    'rate_limit': rate_limit_info
                }, status=429)
            
            # Add rate limit headers to response
            response = func(request, *args, **kwargs)
            if hasattr(response, '__setitem__'):
                response['X-RateLimit-Limit'] = str(rate_limit_info['limit'])
                response['X-RateLimit-Remaining'] = str(rate_limit_info['remaining'])
                response['X-RateLimit-Reset'] = str(rate_limit_info['reset'])
            
            return response
        return wrapper
    return decorator


class PerformanceMonitor:
    """Monitor API performance and detect issues"""
    
    def __init__(self):
        self.redis_client = cache._cache.get_client()
    
    def record_request_metrics(self, request, response, duration: float):
        """Record request performance metrics"""
        endpoint = request.resolver_match.url_name if request.resolver_match else 'unknown'
        method = request.method
        status_code = response.status_code
        
        # Create metric key
        timestamp = int(time.time())
        minute_bucket = timestamp // 60 * 60  # Round to minute
        
        metrics_key = f"metrics:{endpoint}:{method}:{minute_bucket}"
        
        # Store metrics
        metrics = {
            'count': 1,
            'total_duration': duration,
            'min_duration': duration,
            'max_duration': duration,
            'status_codes': {str(status_code): 1},
            'timestamp': timestamp
        }
        
        # Update existing metrics or create new
        existing = self.redis_client.get(metrics_key)
        if existing:
            try:
                existing_metrics = eval(existing)  # In production, use proper JSON
                existing_metrics['count'] += 1
                existing_metrics['total_duration'] += duration
                existing_metrics['min_duration'] = min(existing_metrics['min_duration'], duration)
                existing_metrics['max_duration'] = max(existing_metrics['max_duration'], duration)
                
                if str(status_code) in existing_metrics['status_codes']:
                    existing_metrics['status_codes'][str(status_code)] += 1
                else:
                    existing_metrics['status_codes'][str(status_code)] = 1
                
                metrics = existing_metrics
            except:
                pass  # Use new metrics if parsing fails
        
        self.redis_client.setex(metrics_key, 3600, str(metrics))  # Store for 1 hour
        
        # Check for performance issues
        self.check_performance_thresholds(endpoint, duration, status_code)
    
    def check_performance_thresholds(self, endpoint: str, duration: float, status_code: int):
        """Check if performance thresholds are exceeded"""
        if duration > PERFORMANCE_THRESHOLDS['response_time_critical']:
            logger.critical(f"Critical response time: {endpoint} took {duration:.2f}s")
        elif duration > PERFORMANCE_THRESHOLDS['response_time_warning']:
            logger.warning(f"Slow response time: {endpoint} took {duration:.2f}s")
        
        if status_code >= 500:
            logger.error(f"Server error on {endpoint}: HTTP {status_code}")
        elif status_code >= 400:
            logger.warning(f"Client error on {endpoint}: HTTP {status_code}")
    
    def get_performance_summary(self, hours: int = 1) -> Dict[str, Any]:
        """Get performance summary for the last N hours"""
        current_time = int(time.time())
        start_time = current_time - (hours * 3600)
        
        # Get all metric keys for the time period
        pattern = f"metrics:*"
        keys = self.redis_client.keys(pattern)
        
        summary = {
            'total_requests': 0,
            'avg_response_time': 0,
            'error_rate': 0,
            'endpoints': {},
            'status_codes': {},
            'time_period': f"{hours} hours"
        }
        
        total_duration = 0
        total_errors = 0
        
        for key in keys:
            try:
                metrics_data = eval(self.redis_client.get(key))
                timestamp = metrics_data.get('timestamp', 0)
                
                if timestamp >= start_time:
                    count = metrics_data['count']
                    duration = metrics_data['total_duration']
                    status_codes = metrics_data['status_codes']
                    
                    summary['total_requests'] += count
                    total_duration += duration
                    
                    # Count errors (4xx and 5xx)
                    for code, code_count in status_codes.items():
                        if int(code) >= 400:
                            total_errors += code_count
                        
                        if code in summary['status_codes']:
                            summary['status_codes'][code] += code_count
                        else:
                            summary['status_codes'][code] = code_count
                    
                    # Extract endpoint from key
                    key_parts = key.split(':')
                    if len(key_parts) >= 3:
                        endpoint = key_parts[1]
                        if endpoint not in summary['endpoints']:
                            summary['endpoints'][endpoint] = {
                                'requests': 0,
                                'total_duration': 0,
                                'avg_duration': 0
                            }
                        
                        summary['endpoints'][endpoint]['requests'] += count
                        summary['endpoints'][endpoint]['total_duration'] += duration
            except:
                continue  # Skip invalid metrics
        
        # Calculate averages
        if summary['total_requests'] > 0:
            summary['avg_response_time'] = total_duration / summary['total_requests']
            summary['error_rate'] = (total_errors / summary['total_requests']) * 100
            
            # Calculate endpoint averages
            for endpoint_data in summary['endpoints'].values():
                if endpoint_data['requests'] > 0:
                    endpoint_data['avg_duration'] = endpoint_data['total_duration'] / endpoint_data['requests']
        
        return summary


class PerformanceMiddleware:
    """Middleware to monitor API performance"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.performance_monitor = PerformanceMonitor()
    
    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Record metrics
        self.performance_monitor.record_request_metrics(request, response, duration)
        
        # Add performance headers
        response['X-Response-Time'] = f"{duration:.3f}s"
        
        # Add rate limit headers if available
        if hasattr(request, 'rate_limit_info'):
            info = request.rate_limit_info
            response['X-RateLimit-Limit'] = str(info['limit'])
            response['X-RateLimit-Remaining'] = str(info['remaining'])
            response['X-RateLimit-Reset'] = str(info['reset'])
        
        return response


# Export commonly used functions
__all__ = [
    'AdvancedRateLimiter',
    'SmartThrottle',
    'rate_limit_decorator',
    'PerformanceMonitor',
    'PerformanceMiddleware',
    'RATE_LIMITS',
    'PERFORMANCE_THRESHOLDS',
]
