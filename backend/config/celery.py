"""
Celery configuration for ERP project.
"""
import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

app = Celery('erp')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery beat schedule
app.conf.beat_schedule = {
    'fetch-fx-rates-daily': {
        'task': 'libs.fx_rates.tasks.fetch_bam_rates',
        'schedule': 3600.0,  # Every hour
    },
    'update-stock-valuation': {
        'task': 'modules.inventory.tasks.update_stock_valuation',
        'schedule': 86400.0,  # Daily
    },
}

app.conf.timezone = settings.TIME_ZONE

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
