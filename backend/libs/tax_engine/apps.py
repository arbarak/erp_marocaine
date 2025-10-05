from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class TaxEngineConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'libs.tax_engine'
    verbose_name = _('Tax Engine')

    def ready(self):
        """Import signals when app is ready."""
        try:
            import libs.tax_engine.signals  # noqa F401
        except ImportError:
            pass
    verbose_name = 'Tax Engine'
