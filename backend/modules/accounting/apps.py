"""
Django app configuration for accounting module.
"""
from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class AccountingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'modules.accounting'
    verbose_name = _('Accounting')
    
    def ready(self):
        """Import signals and initialize accounting integration when app is ready."""
        try:
            # Import signals to register them
            import modules.accounting.signals  # noqa F401
            
            # Initialize state tracking for accounting integration
            from modules.accounting.middleware import track_model_state_changes
            track_model_state_changes()
            
        except ImportError:
            pass
