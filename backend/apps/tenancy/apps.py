# Tenancy App Configuration

from django.apps import AppConfig


class TenancyConfig(AppConfig):
    """Configuration for the tenancy app"""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.tenancy'
    verbose_name = 'Multi-Tenancy'
    
    def ready(self):
        """Initialize tenancy system when app is ready"""
        # Import signals to register them
        from . import signals
        
        # Initialize tenant registry
        from .registry import tenant_registry
        tenant_registry.initialize()
        
        # Setup tenant-aware middleware
        from .middleware import setup_tenant_middleware
        setup_tenant_middleware()
