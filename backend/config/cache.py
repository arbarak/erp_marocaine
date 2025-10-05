# Redis Cache Configuration for Performance Optimization

import os
from django.core.cache import cache
from django.core.cache.utils import make_template_fragment_key
from django.conf import settings
import redis
import json
import hashlib
from typing import Any, Optional, Union, Dict
import logging

logger = logging.getLogger(__name__)

# Cache timeout constants (in seconds)
CACHE_TIMEOUTS = {
    'short': 300,      # 5 minutes
    'medium': 1800,    # 30 minutes
    'long': 3600,      # 1 hour
    'very_long': 86400, # 24 hours
    'permanent': 604800, # 7 days
}

# Cache key prefixes
CACHE_PREFIXES = {
    'api': 'api',
    'model': 'model',
    'query': 'query',
    'template': 'template',
    'session': 'session',
    'ai_ml': 'ai_ml',
    'analytics': 'analytics',
    'user': 'user',
    'catalog': 'catalog',
    'inventory': 'inventory',
    'sales': 'sales',
    'purchasing': 'purchasing',
    'accounting': 'accounting',
}


class CacheManager:
    """Enhanced cache manager with AI/ML specific optimizations"""
    
    def __init__(self):
        self.redis_client = redis.Redis.from_url(
            os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
            decode_responses=True
        )
    
    def make_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a cache key with consistent formatting"""
        key_parts = [CACHE_PREFIXES.get(prefix, prefix)]
        
        # Add positional arguments
        for arg in args:
            if isinstance(arg, (dict, list)):
                # Hash complex objects for consistent keys
                key_parts.append(hashlib.md5(
                    json.dumps(arg, sort_keys=True).encode()
                ).hexdigest()[:8])
            else:
                key_parts.append(str(arg))
        
        # Add keyword arguments
        if kwargs:
            sorted_kwargs = sorted(kwargs.items())
            kwargs_str = '_'.join(f"{k}={v}" for k, v in sorted_kwargs)
            key_parts.append(hashlib.md5(kwargs_str.encode()).hexdigest()[:8])
        
        return ':'.join(key_parts)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache with error handling"""
        try:
            return cache.get(key, default)
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {str(e)}")
            return default
    
    def set(self, key: str, value: Any, timeout: Union[int, str] = 'medium') -> bool:
        """Set value in cache with timeout"""
        try:
            if isinstance(timeout, str):
                timeout = CACHE_TIMEOUTS.get(timeout, CACHE_TIMEOUTS['medium'])
            
            cache.set(key, value, timeout)
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            cache.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {str(e)}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {str(e)}")
            return 0
    
    def get_or_set(self, key: str, callable_func, timeout: Union[int, str] = 'medium') -> Any:
        """Get from cache or set if not exists"""
        value = self.get(key)
        if value is None:
            value = callable_func()
            self.set(key, value, timeout)
        return value
    
    def increment(self, key: str, delta: int = 1) -> int:
        """Increment a counter in cache"""
        try:
            return cache.get_or_set(key, 0) + delta
        except Exception as e:
            logger.error(f"Cache increment error for key {key}: {str(e)}")
            return delta
    
    def get_many(self, keys: list) -> Dict[str, Any]:
        """Get multiple keys from cache"""
        try:
            return cache.get_many(keys)
        except Exception as e:
            logger.error(f"Cache get_many error: {str(e)}")
            return {}
    
    def set_many(self, data: Dict[str, Any], timeout: Union[int, str] = 'medium') -> bool:
        """Set multiple keys in cache"""
        try:
            if isinstance(timeout, str):
                timeout = CACHE_TIMEOUTS.get(timeout, CACHE_TIMEOUTS['medium'])
            
            cache.set_many(data, timeout)
            return True
        except Exception as e:
            logger.error(f"Cache set_many error: {str(e)}")
            return False


# Global cache manager instance
cache_manager = CacheManager()


# Decorators for caching
def cache_result(prefix: str, timeout: Union[int, str] = 'medium', key_func=None):
    """Decorator to cache function results"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = cache_manager.make_key(prefix, func.__name__, *args, **kwargs)
            
            # Try to get from cache
            result = cache_manager.get(cache_key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, timeout)
            return result
        
        return wrapper
    return decorator


def invalidate_cache(prefix: str, *args, **kwargs):
    """Invalidate cache entries matching pattern"""
    pattern = cache_manager.make_key(prefix, *args, **kwargs)
    return cache_manager.delete_pattern(f"{pattern}*")


# AI/ML specific cache functions
class AIMLCache:
    """Cache manager specifically for AI/ML operations"""
    
    @staticmethod
    def cache_model_prediction(model_id: str, input_hash: str, prediction: dict, confidence: float):
        """Cache model prediction results"""
        key = cache_manager.make_key('ai_ml', 'prediction', model_id, input_hash)
        data = {
            'prediction': prediction,
            'confidence': confidence,
            'cached_at': cache.get('current_timestamp', 0)
        }
        
        # Cache longer for high-confidence predictions
        timeout = 'very_long' if confidence > 0.9 else 'long'
        cache_manager.set(key, data, timeout)
    
    @staticmethod
    def get_cached_prediction(model_id: str, input_hash: str) -> Optional[dict]:
        """Get cached prediction if available"""
        key = cache_manager.make_key('ai_ml', 'prediction', model_id, input_hash)
        return cache_manager.get(key)
    
    @staticmethod
    def cache_model_metrics(model_id: str, metrics: dict):
        """Cache model performance metrics"""
        key = cache_manager.make_key('ai_ml', 'metrics', model_id)
        cache_manager.set(key, metrics, 'long')
    
    @staticmethod
    def cache_training_progress(job_id: str, progress: dict):
        """Cache training job progress"""
        key = cache_manager.make_key('ai_ml', 'training', job_id)
        cache_manager.set(key, progress, 'short')
    
    @staticmethod
    def cache_bias_detection(model_id: str, results: dict):
        """Cache bias detection results"""
        key = cache_manager.make_key('ai_ml', 'bias', model_id)
        cache_manager.set(key, results, 'very_long')
    
    @staticmethod
    def invalidate_model_cache(model_id: str):
        """Invalidate all cache entries for a model"""
        patterns = [
            f"ai_ml:prediction:{model_id}:*",
            f"ai_ml:metrics:{model_id}",
            f"ai_ml:bias:{model_id}",
        ]
        
        for pattern in patterns:
            cache_manager.delete_pattern(pattern)


# Analytics cache functions
class AnalyticsCache:
    """Cache manager for analytics and reporting"""
    
    @staticmethod
    def cache_dashboard_data(dashboard_id: str, user_id: str, data: dict):
        """Cache dashboard data"""
        key = cache_manager.make_key('analytics', 'dashboard', dashboard_id, user_id)
        cache_manager.set(key, data, 'medium')
    
    @staticmethod
    def cache_report_data(report_id: str, filters: dict, data: dict):
        """Cache report data"""
        key = cache_manager.make_key('analytics', 'report', report_id, filters)
        cache_manager.set(key, data, 'long')
    
    @staticmethod
    def cache_kpi_data(kpi_type: str, period: str, data: dict):
        """Cache KPI calculations"""
        key = cache_manager.make_key('analytics', 'kpi', kpi_type, period)
        cache_manager.set(key, data, 'very_long')


# Business data cache functions
class BusinessCache:
    """Cache manager for business data"""
    
    @staticmethod
    def cache_catalog_data(category_id: str = None):
        """Cache catalog data"""
        key = cache_manager.make_key('catalog', 'data', category_id or 'all')
        
        def get_catalog_data():
            from apps.catalog.models import Product, Category
            # Implementation would fetch and serialize catalog data
            return {'products': [], 'categories': []}
        
        return cache_manager.get_or_set(key, get_catalog_data, 'long')
    
    @staticmethod
    def cache_inventory_levels():
        """Cache current inventory levels"""
        key = cache_manager.make_key('inventory', 'levels')
        
        def get_inventory_levels():
            from apps.inventory.models import Stock
            # Implementation would fetch current stock levels
            return {}
        
        return cache_manager.get_or_set(key, get_inventory_levels, 'medium')
    
    @staticmethod
    def invalidate_business_cache(module: str, entity_id: str = None):
        """Invalidate business data cache"""
        if entity_id:
            pattern = f"{module}:*:{entity_id}:*"
        else:
            pattern = f"{module}:*"
        
        cache_manager.delete_pattern(pattern)


# Template fragment caching
def cache_template_fragment(fragment_name: str, *args, timeout: Union[int, str] = 'medium'):
    """Cache template fragments"""
    key = make_template_fragment_key(fragment_name, args)
    
    if isinstance(timeout, str):
        timeout = CACHE_TIMEOUTS.get(timeout, CACHE_TIMEOUTS['medium'])
    
    return key, timeout


# Cache warming functions
def warm_cache():
    """Warm up frequently accessed cache entries"""
    logger.info("Starting cache warming...")
    
    try:
        # Warm up catalog cache
        BusinessCache.cache_catalog_data()
        
        # Warm up inventory cache
        BusinessCache.cache_inventory_levels()
        
        # Warm up common analytics
        from datetime import datetime, timedelta
        today = datetime.now().date()
        AnalyticsCache.cache_kpi_data('sales', 'daily', {})
        AnalyticsCache.cache_kpi_data('inventory', 'current', {})
        
        logger.info("Cache warming completed successfully")
        
    except Exception as e:
        logger.error(f"Cache warming failed: {str(e)}")


# Cache monitoring
def get_cache_stats() -> dict:
    """Get cache statistics"""
    try:
        info = cache_manager.redis_client.info()
        return {
            'connected_clients': info.get('connected_clients', 0),
            'used_memory': info.get('used_memory_human', '0B'),
            'used_memory_peak': info.get('used_memory_peak_human', '0B'),
            'keyspace_hits': info.get('keyspace_hits', 0),
            'keyspace_misses': info.get('keyspace_misses', 0),
            'hit_rate': (
                info.get('keyspace_hits', 0) / 
                max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1)
            ) * 100,
            'total_commands_processed': info.get('total_commands_processed', 0),
        }
    except Exception as e:
        logger.error(f"Failed to get cache stats: {str(e)}")
        return {}


# Export commonly used functions
__all__ = [
    'cache_manager',
    'cache_result',
    'invalidate_cache',
    'AIMLCache',
    'AnalyticsCache',
    'BusinessCache',
    'cache_template_fragment',
    'warm_cache',
    'get_cache_stats',
    'CACHE_TIMEOUTS',
    'CACHE_PREFIXES',
]
