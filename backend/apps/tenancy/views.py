# Tenant API Views

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.cache import cache
import logging

from .models import Tenant, TenantUser, TenantConfiguration, TenantInvitation
from .serializers import (
    TenantSerializer, TenantCreateSerializer, TenantUserSerializer,
    TenantConfigurationSerializer, TenantInvitationSerializer,
    TenantInvitationAcceptSerializer, TenantStatisticsSerializer,
    TenantSettingsSerializer, TenantFeatureSerializer,
    SubdomainAvailabilitySerializer
)
from .utils import (
    get_current_tenant, get_tenant_statistics, validate_tenant_limits,
    tenant_has_feature, get_tenant_setting, set_tenant_setting
)
from .permissions import IsTenantOwnerOrAdmin, IsTenantMember

logger = logging.getLogger(__name__)


class TenantViewSet(viewsets.ModelViewSet):
    """ViewSet for managing tenants"""
    
    queryset = Tenant.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        return TenantSerializer
    
    def get_queryset(self):
        """Filter tenants based on user permissions"""
        user = self.request.user
        
        if user.is_superuser:
            return Tenant.objects.all()
        
        # Return tenants where user is a member
        return Tenant.objects.filter(
            tenant_users__user=user,
            tenant_users__is_active=True
        ).distinct()
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get tenant statistics"""
        tenant = self.get_object()
        
        # Check permissions
        if not self._user_can_view_tenant(request.user, tenant):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        stats = get_tenant_statistics(tenant)
        serializer = TenantStatisticsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'post'])
    def settings(self, request, pk=None):
        """Get or update tenant settings"""
        tenant = self.get_object()
        
        # Check permissions
        if not self._user_can_manage_tenant(request.user, tenant):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            serializer = TenantSettingsSerializer(tenant.settings)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = TenantSettingsSerializer(data=request.data)
            if serializer.is_valid():
                # Update tenant settings
                for key, value in serializer.validated_data.items():
                    set_tenant_setting(key, value, tenant)
                
                return Response({'message': 'Settings updated successfully'})
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'post'])
    def features(self, request, pk=None):
        """Get or update tenant features"""
        tenant = self.get_object()
        
        # Check permissions
        if not self._user_can_manage_tenant(request.user, tenant):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            features = [{'feature': f, 'enabled': True} for f in tenant.features]
            serializer = TenantFeatureSerializer(features, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = TenantFeatureSerializer(data=request.data)
            if serializer.is_valid():
                feature = serializer.validated_data['feature']
                enabled = serializer.validated_data['enabled']
                
                if enabled:
                    tenant.enable_feature(feature)
                else:
                    tenant.disable_feature(feature)
                
                return Response({'message': f'Feature {feature} {"enabled" if enabled else "disabled"}'})
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def validate_limits(self, request, pk=None):
        """Validate tenant against plan limits"""
        tenant = self.get_object()
        
        # Check permissions
        if not self._user_can_view_tenant(request.user, tenant):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        validation_result = validate_tenant_limits(tenant)
        return Response(validation_result)
    
    @action(detail=True, methods=['post'])
    def backup(self, request, pk=None):
        """Create backup of tenant data"""
        tenant = self.get_object()
        
        # Check permissions
        if not self._user_can_manage_tenant(request.user, tenant):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        from .registry import tenant_model_manager
        
        try:
            backup_data = tenant_model_manager.backup_tenant_data(tenant)
            
            # In production, save backup to storage
            # backup_url = save_backup_to_storage(backup_data)
            
            return Response({
                'message': 'Backup created successfully',
                'backup_info': {
                    'timestamp': backup_data['backup_timestamp'],
                    'models_count': len(backup_data['models']),
                    'total_records': sum(
                        model_data.get('count', 0) 
                        for model_data in backup_data['models'].values()
                    )
                }
            })
        
        except Exception as e:
            logger.error(f"Backup failed for tenant {tenant.name}: {str(e)}")
            return Response(
                {'error': 'Backup failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _user_can_view_tenant(self, user, tenant):
        """Check if user can view tenant"""
        if user.is_superuser:
            return True
        
        return tenant.tenant_users.filter(user=user, is_active=True).exists()
    
    def _user_can_manage_tenant(self, user, tenant):
        """Check if user can manage tenant"""
        if user.is_superuser:
            return True
        
        tenant_user = tenant.tenant_users.filter(user=user, is_active=True).first()
        return tenant_user and tenant_user.role in ['owner', 'admin']


class TenantUserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing tenant users"""
    
    serializer_class = TenantUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]
    
    def get_queryset(self):
        """Filter tenant users based on current tenant"""
        tenant = get_current_tenant()
        if not tenant:
            return TenantUser.objects.none()
        
        return TenantUser.objects.filter(tenant=tenant)
    
    def perform_create(self, serializer):
        """Create tenant user with current tenant"""
        tenant = get_current_tenant()
        if not tenant:
            raise ValueError("No current tenant")
        
        serializer.save(tenant=tenant)


class TenantConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing tenant configurations"""
    
    serializer_class = TenantConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantOwnerOrAdmin]
    
    def get_queryset(self):
        """Filter configurations based on current tenant"""
        tenant = get_current_tenant()
        if not tenant:
            return TenantConfiguration.objects.none()
        
        return TenantConfiguration.objects.filter(tenant=tenant)
    
    def perform_create(self, serializer):
        """Create configuration with current tenant"""
        tenant = get_current_tenant()
        if not tenant:
            raise ValueError("No current tenant")
        
        serializer.save(tenant=tenant, updated_by=self.request.user)


class TenantInvitationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing tenant invitations"""
    
    serializer_class = TenantInvitationSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantOwnerOrAdmin]
    
    def get_queryset(self):
        """Filter invitations based on current tenant"""
        tenant = get_current_tenant()
        if not tenant:
            return TenantInvitation.objects.none()
        
        return TenantInvitation.objects.filter(tenant=tenant)
    
    def perform_create(self, serializer):
        """Create invitation with current tenant"""
        tenant = get_current_tenant()
        if not tenant:
            raise ValueError("No current tenant")
        
        serializer.save(tenant=tenant, invited_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def resend(self, request, pk=None):
        """Resend invitation"""
        invitation = self.get_object()
        
        if invitation.status != 'pending':
            return Response(
                {'error': 'Can only resend pending invitations'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update expiry
        from datetime import timedelta
        from django.utils import timezone
        invitation.expires_at = timezone.now() + timedelta(days=7)
        invitation.save()
        
        # Send email (implement as needed)
        # send_tenant_invitation_email(invitation)
        
        return Response({'message': 'Invitation resent successfully'})


class AcceptInvitationView(APIView):
    """View for accepting tenant invitations"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Accept tenant invitation"""
        serializer = TenantInvitationAcceptSerializer(
            data=request.data,
            context={'user': request.user}
        )
        
        if serializer.is_valid():
            result = serializer.save()
            
            return Response({
                'message': 'Invitation accepted successfully',
                'tenant': TenantSerializer(result['tenant_user'].tenant).data,
                'role': result['tenant_user'].role,
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubdomainAvailabilityView(APIView):
    """View for checking subdomain availability"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Check subdomain availability"""
        serializer = SubdomainAvailabilitySerializer(data=request.data)
        
        if serializer.is_valid():
            return Response(serializer.to_representation(None))
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentTenantView(APIView):
    """View for getting current tenant information"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current tenant"""
        tenant = get_current_tenant()
        
        if not tenant:
            return Response({'error': 'No current tenant'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user has access to tenant
        if not tenant.tenant_users.filter(user=request.user, is_active=True).exists():
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TenantSerializer(tenant)
        return Response(serializer.data)


class SwitchTenantView(APIView):
    """View for switching between tenants"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Switch to different tenant"""
        tenant_id = request.data.get('tenant_id')
        
        if not tenant_id:
            return Response(
                {'error': 'tenant_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            tenant = Tenant.objects.get(id=tenant_id, is_active=True)
        except Tenant.DoesNotExist:
            return Response(
                {'error': 'Tenant not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user has access to tenant
        if not tenant.tenant_users.filter(user=request.user, is_active=True).exists():
            return Response(
                {'error': 'Access denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # In a real implementation, you might set a session variable
        # or return a new JWT token with tenant information
        
        return Response({
            'message': 'Tenant switched successfully',
            'tenant': TenantSerializer(tenant).data,
            'redirect_url': f"https://{tenant.full_domain}/"
        })


class TenantHealthView(APIView):
    """View for checking tenant health"""
    
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]
    
    def get(self, request):
        """Get tenant health status"""
        tenant = get_current_tenant()
        
        if not tenant:
            return Response({'error': 'No current tenant'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check various health metrics
        health_status = {
            'tenant_active': tenant.is_active,
            'trial_status': 'active' if not tenant.is_trial else (
                'expired' if tenant.is_trial_expired else 'active'
            ),
            'limits_validation': validate_tenant_limits(tenant),
            'database_connection': self._check_database_connection(tenant),
            'cache_status': self._check_cache_status(tenant),
        }
        
        overall_healthy = (
            health_status['tenant_active'] and
            health_status['trial_status'] == 'active' and
            health_status['limits_validation']['valid'] and
            health_status['database_connection'] and
            health_status['cache_status']
        )
        
        return Response({
            'healthy': overall_healthy,
            'details': health_status,
            'timestamp': timezone.now().isoformat(),
        })
    
    def _check_database_connection(self, tenant):
        """Check database connection for tenant"""
        try:
            from .utils import with_tenant_schema
            with with_tenant_schema(tenant):
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute('SELECT 1')
                    return True
        except:
            return False
    
    def _check_cache_status(self, tenant):
        """Check cache status for tenant"""
        try:
            from .registry import tenant_cache
            test_key = 'health_check'
            test_value = 'ok'
            
            tenant_cache.set(test_key, test_value, tenant=tenant)
            cached_value = tenant_cache.get(test_key, tenant=tenant)
            
            return cached_value == test_value
        except:
            return False
