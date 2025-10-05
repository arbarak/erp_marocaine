"""
Custom permissions for the ERP system.
"""
from rest_framework import permissions
from django.utils.translation import gettext_lazy as _


class CompanyContextPermission(permissions.BasePermission):
    """
    Permission that ensures user has access to the company context.
    """
    
    message = _('You do not have permission to access this company\'s data.')
    
    def has_permission(self, request, view):
        """
        Check if user has permission to access the company context.
        """
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if company context is set
        if not hasattr(request, 'company') or not request.company:
            return False
        
        # Check if user has access to this company
        # For now, we'll allow access if user is active
        # This can be extended with more sophisticated company membership checks
        return request.user.is_active
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user has permission to access the specific object.
        """
        # Check if object belongs to the user's company context
        if hasattr(obj, 'company'):
            return obj.company == request.company
        
        return True


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Read permissions are allowed to any request,
        so we'll always allow GET, HEAD or OPTIONS requests.
        """
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object.
        return obj.created_by == request.user


class IsCompanyMember(permissions.BasePermission):
    """
    Permission that checks if user is a member of the company.
    """
    
    message = _('You are not a member of this company.')
    
    def has_permission(self, request, view):
        """
        Check if user is a member of the company.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request, 'company') or not request.company:
            return False
        
        # For now, we'll allow access if user is active
        # This can be extended with proper company membership model
        return request.user.is_active


class IsCompanyAdmin(permissions.BasePermission):
    """
    Permission that checks if user is an admin of the company.
    """
    
    message = _('You are not an admin of this company.')
    
    def has_permission(self, request, view):
        """
        Check if user is an admin of the company.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request, 'company') or not request.company:
            return False
        
        # For now, we'll allow access if user is staff
        # This can be extended with proper company admin model
        return request.user.is_staff


class CanModifyFinancialData(permissions.BasePermission):
    """
    Permission for modifying financial data (invoices, payments, etc.).
    """
    
    message = _('You do not have permission to modify financial data.')
    
    def has_permission(self, request, view):
        """
        Check if user can modify financial data.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # For now, allow all authenticated users
        # This can be extended with role-based permissions
        return request.user.is_active
    
    def has_object_permission(self, request, view, obj):
        """
        Check object-level permissions for financial data.
        """
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions based on object state
        if hasattr(obj, 'state'):
            # Don't allow modification of posted/confirmed items
            if obj.state in ['POSTED', 'CONFIRMED', 'CLOSED']:
                return False
        
        return True


class CanPostJournalEntries(permissions.BasePermission):
    """
    Permission for posting journal entries.
    """
    
    message = _('You do not have permission to post journal entries.')
    
    def has_permission(self, request, view):
        """
        Check if user can post journal entries.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # For now, allow all authenticated users
        # This can be extended with specific accounting permissions
        return request.user.is_active
