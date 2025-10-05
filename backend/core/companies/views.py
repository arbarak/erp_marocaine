"""
Views for companies app.
"""
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.utils.translation import gettext_lazy as _
from django.db.models import Count, Q
from datetime import date, datetime
from .models import Company, CompanySettings
from .serializers import (
    CompanySerializer, CompanyCreateSerializer, CompanySettingsSerializer,
    CompanyListSerializer, CompanyStatsSerializer, CompanyFiscalYearSerializer,
    CompanyValidationSerializer
)


class CompanyViewSet(ModelViewSet):
    """ViewSet for company management."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return companies the user has access to."""
        user = self.request.user
        
        if user.is_superuser:
            return Company.objects.all()
        
        # Return companies where user has membership
        from core.accounts.models import UserCompanyMembership
        company_ids = UserCompanyMembership.objects.filter(
            user=user,
            is_active=True
        ).values_list('company_id', flat=True)
        
        return Company.objects.filter(id__in=company_ids)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return CompanyCreateSerializer
        elif self.action == 'list':
            return CompanyListSerializer
        return CompanySerializer
    
    def perform_create(self, serializer):
        """Create company and add creator as admin."""
        company = serializer.save()
        
        # Add creator as admin member
        from core.accounts.models import UserCompanyMembership
        UserCompanyMembership.objects.create(
            user=self.request.user,
            company=company,
            is_admin=True,
            is_active=True
        )
        
        # Set as current company if user doesn't have one
        if not self.request.user.current_company:
            self.request.user.current_company = company
            self.request.user.save(update_fields=['current_company'])
    
    @action(detail=True, methods=['get'])
    def settings(self, request, pk=None):
        """Get company settings."""
        company = self.get_object()
        
        try:
            settings = company.settings
            serializer = CompanySettingsSerializer(settings)
            return Response(serializer.data)
        except CompanySettings.DoesNotExist:
            return Response({
                'message': _('No settings found for this company')
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post', 'put'])
    def settings(self, request, pk=None):
        """Update company settings."""
        company = self.get_object()
        
        try:
            settings = company.settings
            serializer = CompanySettingsSerializer(
                settings,
                data=request.data,
                partial=True
            )
        except CompanySettings.DoesNotExist:
            serializer = CompanySettingsSerializer(data=request.data)
        
        if serializer.is_valid():
            if hasattr(company, 'settings'):
                serializer.save()
            else:
                serializer.save(company=company)
            
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get company statistics."""
        company = self.get_object()
        
        # Get user statistics
        from core.accounts.models import UserCompanyMembership
        memberships = UserCompanyMembership.objects.filter(company=company)
        total_users = memberships.count()
        active_users = memberships.filter(is_active=True).count()
        
        # Get document statistics (placeholder for now)
        total_documents = 0  # Will be implemented when document modules are ready
        
        # Get fiscal year info
        current_fiscal_year = company.get_current_fiscal_year()
        
        stats_data = {
            'total_users': total_users,
            'active_users': active_users,
            'total_documents': total_documents,
            'current_fiscal_year': current_fiscal_year,
            'total_revenue': 0,  # Placeholder
            'total_expenses': 0,  # Placeholder
            'outstanding_invoices': 0,  # Placeholder
        }
        
        serializer = CompanyStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def fiscal_years(self, request, pk=None):
        """Get fiscal year information."""
        company = self.get_object()
        current_year = date.today().year
        
        fiscal_years = []
        for year in range(current_year - 2, current_year + 3):
            start_date, end_date = company.get_fiscal_year_dates(year)
            is_current = company.get_current_fiscal_year() == year
            
            fiscal_years.append({
                'fiscal_year': year,
                'start_date': start_date,
                'end_date': end_date,
                'is_current': is_current,
                'is_closed': False,  # Placeholder for future implementation
            })
        
        serializer = CompanyFiscalYearSerializer(fiscal_years, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def validate_identifiers(self, request):
        """Validate company identifiers (ICE, IF, RC)."""
        serializer = CompanyValidationSerializer(data=request.data)
        
        if serializer.is_valid():
            return Response({
                'valid': True,
                'message': _('All identifiers are valid and available')
            })
        
        return Response({
            'valid': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a company."""
        company = self.get_object()
        company.is_active = True
        company.save()
        
        return Response({
            'message': _('Company activated successfully')
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a company."""
        company = self.get_object()
        company.is_active = False
        company.save()
        
        return Response({
            'message': _('Company deactivated successfully')
        })
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get company members."""
        company = self.get_object()
        
        from core.accounts.models import UserCompanyMembership
        from core.accounts.serializers import UserCompanyMembershipSerializer
        
        memberships = UserCompanyMembership.objects.filter(
            company=company
        ).select_related('user').prefetch_related('roles')
        
        serializer = UserCompanyMembershipSerializer(
            memberships,
            many=True,
            context={'request': request}
        )
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the company."""
        company = self.get_object()
        
        from core.accounts.models import User, UserCompanyMembership
        
        email = request.data.get('email')
        is_admin = request.data.get('is_admin', False)
        
        if not email:
            return Response({
                'error': _('Email is required')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': _('User with this email does not exist')
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if membership already exists
        membership, created = UserCompanyMembership.objects.get_or_create(
            user=user,
            company=company,
            defaults={
                'is_admin': is_admin,
                'is_active': True
            }
        )
        
        if not created:
            return Response({
                'error': _('User is already a member of this company')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from core.accounts.serializers import UserCompanyMembershipSerializer
        serializer = UserCompanyMembershipSerializer(
            membership,
            context={'request': request}
        )
        
        return Response({
            'message': _('Member added successfully'),
            'membership': serializer.data
        }, status=status.HTTP_201_CREATED)
