"""
Development settings for ERP project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Development-specific apps (temporarily disabled)
# INSTALLED_APPS += [
#     'django_extensions',
#     'debug_toolbar',
# ]

# Development middleware (temporarily disabled)
# MIDDLEWARE += [
#     'debug_toolbar.middleware.DebugToolbarMiddleware',
# ]

# Debug toolbar configuration
INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

# Email backend for development (console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Disable caching in development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Development logging (temporarily disabled)
# LOGGING['loggers']['django']['level'] = 'DEBUG'
# LOGGING['loggers']['erp']['level'] = 'DEBUG'

# Allow all hosts in development
ALLOWED_HOSTS = ['*']

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True

# Disable HTTPS redirects in development
SECURE_SSL_REDIRECT = False

# Development database settings
if DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
    DATABASES['default']['OPTIONS'] = {
        'options': '-c default_transaction_isolation=read_committed'
    }

# Static files in development
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Media files in development
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

# Celery settings for development
CELERY_TASK_ALWAYS_EAGER = False
CELERY_TASK_EAGER_PROPAGATES = True

# Development-specific settings
SHELL_PLUS_PRINT_SQL = True
SHELL_PLUS_PRINT_SQL_TRUNCATE = 1000
