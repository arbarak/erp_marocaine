from django.apps import AppConfig


class AiMlConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ai_ml'
    verbose_name = 'AI/ML Management'
    
    def ready(self):
        """Initialize app when Django starts"""
        import apps.ai_ml.signals
