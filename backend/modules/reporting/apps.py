"""
App configuration for reporting module.
"""
from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ReportingConfig(AppConfig):
    """Configuration for reporting app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'modules.reporting'
    verbose_name = _('Reporting & Analytics')
    
    def ready(self):
        """Initialize app when Django starts."""
        # Import signals to register them
        try:
            from . import signals
        except ImportError:
            pass
