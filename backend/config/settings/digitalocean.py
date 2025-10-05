"""
DigitalOcean App Platform settings for ERP project.
"""

import os
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# DigitalOcean provides DATABASE_URL automatically
import dj_database_url
DATABASES = {
    'default': dj_database_url.parse(
        os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Redis configuration (if using Redis add-on)
REDIS_URL = os.environ.get('REDIS_URL')
if REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {
                    'max_connections': 50,
                    'retry_on_timeout': True,
                }
            }
        }
    }
    
    # Celery configuration
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL
else:
    # Fallback to database cache if no Redis
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
            'LOCATION': 'cache_table',
        }
    }

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'

# SSL settings (DigitalOcean provides HTTPS automatically)
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'  # Required for cross-origin requests

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Use WhiteNoise for static files
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CORS settings for DigitalOcean
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',') if origin.strip()
]

# Add DigitalOcean and Netlify domain patterns
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.ondigitalocean\.app$",  # DigitalOcean App Platform domains
    r"^https://.*\.netlify\.app$",         # Netlify domains
    r"^https://.*\.netlify\.com$",         # Netlify preview domains
]

CORS_ALLOW_CREDENTIALS = True

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    origin.strip() for origin in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',') if origin.strip()
]

# Add DigitalOcean domain patterns for CSRF
CSRF_TRUSTED_ORIGINS.extend([
    'https://*.ondigitalocean.app',
])

# Allowed hosts
ALLOWED_HOSTS = [
    '.ondigitalocean.app',
    'localhost',
    '127.0.0.1',
]

# Add custom domain if configured
CUSTOM_DOMAIN = os.environ.get('CUSTOM_DOMAIN')
if CUSTOM_DOMAIN:
    ALLOWED_HOSTS.append(CUSTOM_DOMAIN)

# Logging configuration optimized for DigitalOcean
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@erp.ma')

# Sentry configuration for error tracking
SENTRY_DSN = os.environ.get('SENTRY_DSN')
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
        ],
        traces_sample_rate=0.1,
        send_default_pii=True,
        environment='digitalocean',
    )

# Performance optimizations
CONN_MAX_AGE = 600
DATABASES['default']['CONN_MAX_AGE'] = CONN_MAX_AGE

# Session configuration
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = FILE_UPLOAD_MAX_MEMORY_SIZE

# API throttling
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '100/hour',
    'user': '1000/hour'
}

# Health check settings
HEALTH_CHECK = {
    'DISK_USAGE_MAX': 90,  # percent
    'MEMORY_MIN': 100,     # in MB
}
