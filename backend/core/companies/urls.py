"""
Companies API URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')

app_name = 'companies'

urlpatterns = [
    path('', include(router.urls)),
]
