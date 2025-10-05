# Tenant Utilities and Helper Functions

import threading
from typing import Optional
from django.core.cache import cache
from django.conf import settings
from django.db import connection
from .models import Tenant

# Thread-local storage for current tenant
_thread_local = threading.local()


def get_tenant_from_request(request) -> Optional[Tenant]:
    """
    Extract tenant from request based on subdomain or custom domain
    """
    host = request.get_host()
    
    # Remove port if present
    if ':' in host:
        host = host.split(':')[0]
    
    # Check cache first
    cache_key = f"tenant_by_host_{host}"
    tenant = cache.get(cache_key)
    
    if tenant is not None:
        return tenant
    
    # Query database
    tenant = Tenant.objects.by_domain(host)
    
    # Cache result (even if None)
    cache.set(cache_key, tenant, timeout=300)  # 5 minutes
    
    return tenant


def get_current_tenant() -> Optional[Tenant]:
    """Get the current tenant from thread-local storage"""
    return getattr(_thread_local, 'tenant', None)


def set_current_tenant(tenant: Optional[Tenant]):
    """Set the current tenant in thread-local storage"""
    _thread_local.tenant = tenant


def get_tenant_schema_name(tenant: Optional[Tenant] = None) -> str:
    """Get schema name for tenant"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if tenant is None:
        return 'public'
    
    return tenant.schema_name


def with_tenant_schema(tenant: Tenant):
    """
    Context manager to execute code within tenant schema
    
    Usage:
        with with_tenant_schema(tenant):
            # Code here runs in tenant schema
            Model.objects.all()
    """
    class TenantSchemaContext:
        def __init__(self, tenant):
            self.tenant = tenant
            self.original_tenant = None
        
        def __enter__(self):
            self.original_tenant = get_current_tenant()
            set_current_tenant(self.tenant)
            
            # Set database schema
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{self.tenant.schema_name}", public')
            
            return self.tenant
        
        def __exit__(self, exc_type, exc_val, exc_tb):
            # Restore original tenant
            set_current_tenant(self.original_tenant)
            
            # Reset schema
            schema_name = 'public'
            if self.original_tenant:
                schema_name = self.original_tenant.schema_name
            
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{schema_name}", public')
    
    return TenantSchemaContext(tenant)


def tenant_aware_cache_key(key: str, tenant: Optional[Tenant] = None) -> str:
    """Generate tenant-aware cache key"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if tenant is None:
        return key
    
    return f"tenant_{tenant.id}_{key}"


def get_tenant_setting(key: str, default=None, tenant: Optional[Tenant] = None):
    """Get tenant-specific setting"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if tenant is None:
        return default
    
    return tenant.get_setting(key, default)


def set_tenant_setting(key: str, value, tenant: Optional[Tenant] = None):
    """Set tenant-specific setting"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if tenant is None:
        raise ValueError("No current tenant")
    
    tenant.set_setting(key, value)


def tenant_has_feature(feature: str, tenant: Optional[Tenant] = None) -> bool:
    """Check if tenant has specific feature enabled"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if tenant is None:
        return False
    
    return tenant.has_feature(feature)


def require_tenant_feature(feature: str):
    """
    Decorator to require specific tenant feature
    
    Usage:
        @require_tenant_feature('advanced_analytics')
        def advanced_analytics_view(request):
            # View code here
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            if not tenant_has_feature(feature):
                from django.http import JsonResponse
                return JsonResponse(
                    {'error': f'Feature "{feature}" not available for this tenant'},
                    status=403
                )
            return func(*args, **kwargs)
        return wrapper
    return decorator


def get_tenant_url(tenant: Tenant, path: str = '') -> str:
    """Generate URL for tenant"""
    protocol = 'https' if getattr(settings, 'USE_TLS', True) else 'http'
    domain = tenant.full_domain
    
    if path and not path.startswith('/'):
        path = '/' + path
    
    return f"{protocol}://{domain}{path}"


def create_tenant_schema_tables(tenant: Tenant):
    """Create all tables in tenant schema"""
    from django.core.management import call_command
    from django.db import connection
    
    # Set schema
    with connection.cursor() as cursor:
        cursor.execute(f'SET search_path TO "{tenant.schema_name}", public')
    
    # Run migrations
    call_command('migrate', verbosity=0, interactive=False)
    
    # Reset schema
    with connection.cursor() as cursor:
        cursor.execute('SET search_path TO public')


def clone_tenant_data(source_tenant: Tenant, target_tenant: Tenant, exclude_models=None):
    """
    Clone data from source tenant to target tenant
    Useful for creating tenant templates or backups
    """
    from django.apps import apps
    
    exclude_models = exclude_models or []
    
    with with_tenant_schema(source_tenant):
        # Get all models
        models = []
        for app_config in apps.get_app_configs():
            if app_config.name.startswith('apps.'):  # Only our apps
                models.extend(app_config.get_models())
        
        # Export data
        data = {}
        for model in models:
            if model._meta.label not in exclude_models:
                data[model._meta.label] = list(model.objects.values())
    
    with with_tenant_schema(target_tenant):
        # Import data
        for model_label, records in data.items():
            app_label, model_name = model_label.split('.')
            model = apps.get_model(app_label, model_name)
            
            # Clear existing data
            model.objects.all().delete()
            
            # Create new records
            for record in records:
                model.objects.create(**record)


def get_tenant_statistics(tenant: Optional[Tenant] = None) -> dict:
    """Get statistics for tenant"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if tenant is None:
        return {}
    
    with with_tenant_schema(tenant):
        from django.apps import apps
        
        stats = {
            'tenant_info': {
                'name': tenant.name,
                'subdomain': tenant.subdomain,
                'plan': tenant.plan,
                'is_trial': tenant.is_trial,
                'created_at': tenant.created_at,
            },
            'users': tenant.tenant_users.filter(is_active=True).count(),
            'data_counts': {},
        }
        
        # Count records in key models
        key_models = [
            'core.Company',
            'catalog.Product',
            'inventory.StockMove',
            'sales.SalesOrder',
            'purchasing.PurchaseOrder',
            'invoicing.Invoice',
        ]
        
        for model_label in key_models:
            try:
                app_label, model_name = model_label.split('.')
                model = apps.get_model(app_label, model_name)
                stats['data_counts'][model_label] = model.objects.count()
            except:
                stats['data_counts'][model_label] = 0
        
        return stats


def validate_tenant_limits(tenant: Optional[Tenant] = None) -> dict:
    """Validate tenant against plan limits"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if tenant is None:
        return {'valid': False, 'errors': ['No tenant']}
    
    errors = []
    warnings = []
    
    # Check user limit
    user_count = tenant.tenant_users.filter(is_active=True).count()
    if user_count > tenant.max_users:
        errors.append(f"User count ({user_count}) exceeds limit ({tenant.max_users})")
    elif user_count > tenant.max_users * 0.8:
        warnings.append(f"User count ({user_count}) approaching limit ({tenant.max_users})")
    
    # Check company limit
    with with_tenant_schema(tenant):
        try:
            from apps.core.models import Company
            company_count = Company.objects.count()
            if company_count > tenant.max_companies:
                errors.append(f"Company count ({company_count}) exceeds limit ({tenant.max_companies})")
        except:
            pass
    
    # Check trial expiry
    if tenant.is_trial and tenant.is_trial_expired:
        errors.append("Trial period has expired")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
    }


def get_available_subdomains() -> list:
    """Get list of available subdomains"""
    reserved_subdomains = [
        'www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog',
        'support', 'help', 'docs', 'status', 'cdn', 'assets',
        'static', 'media', 'files', 'download', 'upload',
    ]
    
    used_subdomains = list(Tenant.objects.values_list('subdomain', flat=True))
    
    return {
        'reserved': reserved_subdomains,
        'used': used_subdomains,
        'available_check': lambda subdomain: (
            subdomain not in reserved_subdomains and 
            subdomain not in used_subdomains
        )
    }
