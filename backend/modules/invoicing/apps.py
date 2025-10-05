"""
Django app configuration for invoicing module.
"""
from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class InvoicingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'modules.invoicing'
    verbose_name = _('Invoicing')
    
    def ready(self):
        """Import signals when app is ready."""
        try:
            import modules.invoicing.signals  # noqa F401
        except ImportError:
            pass
