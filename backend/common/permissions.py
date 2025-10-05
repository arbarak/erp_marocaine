"""
Common permissions for the ERP system.
"""

from rest_framework.permissions import BasePermission, IsAuthenticated


class CompanyContextPermission(BasePermission):
    """
    Permission that ensures user has access to the company context.
    For demo purposes, this is simplified.
    """
    
    def has_permission(self, request, view):
        # For demo, just check if user is authenticated
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # For demo, allow access to all objects
        return True


class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.created_by == request.user


class IsCompanyMember(BasePermission):
    """
    Permission that checks if user belongs to the company.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # For demo, allow access
        return True
