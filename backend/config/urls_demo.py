"""
Demo URL Configuration for ERP project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.generic import TemplateView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

def api_info(request):
    """Simple API info endpoint for demo."""
    return JsonResponse({
        'message': 'Welcome to ERP System Demo!',
        'version': '1.0.0',
        'status': 'Demo Mode',
        'features': [
            'Django 5.0.1 Backend',
            'Django REST Framework',
            'SQLite Database',
            'Admin Interface',
            'API Documentation'
        ],
        'endpoints': {
            'admin': '/admin/',
            'api_info': '/api/info/',
            'api_docs': '/api/schema/',
        }
    })

class DemoHomeView(TemplateView):
    """Simple home page for demo."""
    template_name = 'demo_home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'ERP System Demo'
        return context

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API
    path('api/v1/', include('api.urls')),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Demo endpoints
    path('api/info/', api_info, name='api_info'),
    path('', api_info, name='home'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns

# Custom admin site configuration
admin.site.site_header = "ERP Administration"
admin.site.site_title = "ERP Admin"
admin.site.index_title = "Welcome to ERP Administration"
