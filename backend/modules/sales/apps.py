"""
Sales app configuration.
"""
from django.apps import AppConfig


class SalesConfig(AppConfig):
    """Sales app configuration."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'modules.sales'
    verbose_name = 'Sales Management'
