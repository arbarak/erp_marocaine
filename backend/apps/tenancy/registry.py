# Tenant Registry and Management

import logging
from typing import Dict, List, Optional
from django.core.cache import cache
from django.apps import apps
from django.db import models

from .models import Tenant
from .utils import get_current_tenant

logger = logging.getLogger(__name__)


class TenantRegistry:
    """
    Registry for managing tenant-aware models and operations
    """
    
    def __init__(self):
        self._tenant_models: Dict[str, models.Model] = {}
        self._shared_models: Dict[str, models.Model] = {}
        self._initialized = False
    
    def initialize(self):
        """Initialize the tenant registry"""
        if self._initialized:
            return
        
        self._discover_models()
        self._initialized = True
        logger.info("Tenant registry initialized")
    
    def _discover_models(self):
        """Discover and categorize models as tenant-aware or shared"""
        for app_config in apps.get_app_configs():
            if not app_config.name.startswith('apps.'):
                continue
            
            for model in app_config.get_models():
                model_label = f"{app_config.label}.{model.__name__}"
                
                if self._is_tenant_model(model):
                    self._tenant_models[model_label] = model
                else:
                    self._shared_models[model_label] = model
        
        logger.info(f"Discovered {len(self._tenant_models)} tenant models and {len(self._shared_models)} shared models")
    
    def _is_tenant_model(self, model) -> bool:
        """Determine if a model is tenant-aware"""
        # Models in tenancy app are shared (not tenant-specific)
        if model._meta.app_label == 'tenancy':
            return False
        
        # Models with explicit tenant_aware attribute
        if hasattr(model._meta, 'tenant_aware'):
            return model._meta.tenant_aware
        
        # By default, all business models are tenant-aware
        tenant_apps = [
            'core', 'catalog', 'inventory', 'sales', 'purchasing',
            'invoicing', 'accounting', 'reporting', 'ai_ml'
        ]
        
        return model._meta.app_label in tenant_apps
    
    def get_tenant_models(self) -> Dict[str, models.Model]:
        """Get all tenant-aware models"""
        return self._tenant_models.copy()
    
    def get_shared_models(self) -> Dict[str, models.Model]:
        """Get all shared models"""
        return self._shared_models.copy()
    
    def is_tenant_model(self, model) -> bool:
        """Check if a model is tenant-aware"""
        model_label = f"{model._meta.app_label}.{model.__name__}"
        return model_label in self._tenant_models
    
    def get_model_by_label(self, label: str) -> Optional[models.Model]:
        """Get model by label"""
        return self._tenant_models.get(label) or self._shared_models.get(label)


class TenantModelManager:
    """
    Manager for tenant-aware model operations
    """
    
    def __init__(self, registry: TenantRegistry):
        self.registry = registry
    
    def get_tenant_data_summary(self, tenant: Tenant) -> Dict:
        """Get summary of data for a tenant"""
        from .utils import with_tenant_schema
        
        summary = {}
        
        with with_tenant_schema(tenant):
            for label, model in self.registry.get_tenant_models().items():
                try:
                    count = model.objects.count()
                    summary[label] = {
                        'count': count,
                        'model_name': model.__name__,
                        'app_label': model._meta.app_label,
                    }
                except Exception as e:
                    logger.error(f"Error counting {label} for tenant {tenant.name}: {str(e)}")
                    summary[label] = {
                        'count': 0,
                        'error': str(e),
                    }
        
        return summary
    
    def migrate_tenant_data(self, source_tenant: Tenant, target_tenant: Tenant, 
                          models: Optional[List[str]] = None) -> Dict:
        """Migrate data between tenants"""
        from .utils import with_tenant_schema
        
        if models is None:
            models = list(self.registry.get_tenant_models().keys())
        
        results = {}
        
        for model_label in models:
            model = self.registry.get_model_by_label(model_label)
            if not model or not self.registry.is_tenant_model(model):
                continue
            
            try:
                # Export from source
                with with_tenant_schema(source_tenant):
                    data = list(model.objects.values())
                
                # Import to target
                with with_tenant_schema(target_tenant):
                    # Clear existing data
                    model.objects.all().delete()
                    
                    # Create new records
                    for record in data:
                        model.objects.create(**record)
                
                results[model_label] = {
                    'success': True,
                    'records_migrated': len(data),
                }
                
                logger.info(f"Migrated {len(data)} records of {model_label} from {source_tenant.name} to {target_tenant.name}")
                
            except Exception as e:
                logger.error(f"Error migrating {model_label}: {str(e)}")
                results[model_label] = {
                    'success': False,
                    'error': str(e),
                }
        
        return results
    
    def backup_tenant_data(self, tenant: Tenant, models: Optional[List[str]] = None) -> Dict:
        """Create backup of tenant data"""
        from .utils import with_tenant_schema
        import json
        from datetime import datetime
        
        if models is None:
            models = list(self.registry.get_tenant_models().keys())
        
        backup_data = {
            'tenant_info': {
                'id': str(tenant.id),
                'name': tenant.name,
                'subdomain': tenant.subdomain,
                'schema_name': tenant.schema_name,
            },
            'backup_timestamp': datetime.now().isoformat(),
            'models': {},
        }
        
        with with_tenant_schema(tenant):
            for model_label in models:
                model = self.registry.get_model_by_label(model_label)
                if not model or not self.registry.is_tenant_model(model):
                    continue
                
                try:
                    data = list(model.objects.values())
                    backup_data['models'][model_label] = {
                        'count': len(data),
                        'data': data,
                    }
                    
                    logger.info(f"Backed up {len(data)} records of {model_label} for tenant {tenant.name}")
                    
                except Exception as e:
                    logger.error(f"Error backing up {model_label}: {str(e)}")
                    backup_data['models'][model_label] = {
                        'error': str(e),
                    }
        
        return backup_data
    
    def restore_tenant_data(self, tenant: Tenant, backup_data: Dict) -> Dict:
        """Restore tenant data from backup"""
        from .utils import with_tenant_schema
        
        results = {}
        
        with with_tenant_schema(tenant):
            for model_label, model_backup in backup_data.get('models', {}).items():
                if 'error' in model_backup:
                    continue
                
                model = self.registry.get_model_by_label(model_label)
                if not model or not self.registry.is_tenant_model(model):
                    continue
                
                try:
                    # Clear existing data
                    model.objects.all().delete()
                    
                    # Restore data
                    data = model_backup.get('data', [])
                    for record in data:
                        model.objects.create(**record)
                    
                    results[model_label] = {
                        'success': True,
                        'records_restored': len(data),
                    }
                    
                    logger.info(f"Restored {len(data)} records of {model_label} for tenant {tenant.name}")
                    
                except Exception as e:
                    logger.error(f"Error restoring {model_label}: {str(e)}")
                    results[model_label] = {
                        'success': False,
                        'error': str(e),
                    }
        
        return results


class TenantCache:
    """
    Tenant-aware caching system
    """
    
    def __init__(self):
        self.cache_timeout = 300  # 5 minutes default
    
    def get(self, key: str, default=None, tenant: Optional[Tenant] = None):
        """Get value from tenant-aware cache"""
        cache_key = self._make_tenant_key(key, tenant)
        return cache.get(cache_key, default)
    
    def set(self, key: str, value, timeout: Optional[int] = None, tenant: Optional[Tenant] = None):
        """Set value in tenant-aware cache"""
        cache_key = self._make_tenant_key(key, tenant)
        timeout = timeout or self.cache_timeout
        cache.set(cache_key, value, timeout)
    
    def delete(self, key: str, tenant: Optional[Tenant] = None):
        """Delete value from tenant-aware cache"""
        cache_key = self._make_tenant_key(key, tenant)
        cache.delete(cache_key)
    
    def clear_tenant_cache(self, tenant: Optional[Tenant] = None):
        """Clear all cache for tenant"""
        if tenant is None:
            tenant = get_current_tenant()
        
        if tenant is None:
            return
        
        # This is a simplified implementation
        # In production, you might want to use cache versioning
        # or maintain a list of tenant cache keys
        cache_prefix = f"tenant_{tenant.id}_"
        
        # Clear known cache patterns
        patterns = [
            f"{cache_prefix}*",
        ]
        
        for pattern in patterns:
            cache.delete_pattern(pattern)
    
    def _make_tenant_key(self, key: str, tenant: Optional[Tenant] = None) -> str:
        """Create tenant-aware cache key"""
        if tenant is None:
            tenant = get_current_tenant()
        
        if tenant is None:
            return key
        
        return f"tenant_{tenant.id}_{key}"


# Global instances
tenant_registry = TenantRegistry()
tenant_model_manager = TenantModelManager(tenant_registry)
tenant_cache = TenantCache()

# Export commonly used functions
__all__ = [
    'TenantRegistry',
    'TenantModelManager',
    'TenantCache',
    'tenant_registry',
    'tenant_model_manager',
    'tenant_cache',
]
