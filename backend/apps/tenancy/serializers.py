# Tenant API Serializers

from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import secrets

from .models import Tenant, TenantUser, TenantConfiguration, TenantInvitation
from .utils import get_available_subdomains


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for Tenant model"""
    
    full_domain = serializers.ReadOnlyField()
    is_trial_expired = serializers.ReadOnlyField()
    user_count = serializers.SerializerMethodField()
    data_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'slug', 'subdomain', 'domain', 'schema_name',
            'is_active', 'is_trial', 'trial_ends_at', 'plan', 'max_users',
            'max_companies', 'settings', 'features', 'created_at',
            'updated_at', 'full_domain', 'is_trial_expired', 'user_count',
            'data_summary'
        ]
        read_only_fields = ['id', 'schema_name', 'created_at', 'updated_at']
    
    def get_user_count(self, obj):
        """Get active user count for tenant"""
        return obj.tenant_users.filter(is_active=True).count()
    
    def get_data_summary(self, obj):
        """Get data summary for tenant"""
        from .registry import tenant_model_manager
        try:
            return tenant_model_manager.get_tenant_data_summary(obj)
        except:
            return {}
    
    def validate_subdomain(self, value):
        """Validate subdomain availability"""
        subdomain_info = get_available_subdomains()
        
        if not subdomain_info['available_check'](value):
            raise serializers.ValidationError("Subdomain is not available")
        
        return value
    
    def validate(self, attrs):
        """Validate tenant data"""
        # Check trial settings
        if attrs.get('is_trial') and not attrs.get('trial_ends_at'):
            # Set default trial period (30 days)
            attrs['trial_ends_at'] = timezone.now() + timedelta(days=30)
        
        return attrs


class TenantCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new tenants"""
    
    admin_email = serializers.EmailField(write_only=True)
    admin_first_name = serializers.CharField(max_length=30, write_only=True, required=False)
    admin_last_name = serializers.CharField(max_length=30, write_only=True, required=False)
    
    class Meta:
        model = Tenant
        fields = [
            'name', 'subdomain', 'domain', 'plan', 'max_users', 'max_companies',
            'settings', 'features', 'admin_email', 'admin_first_name', 'admin_last_name'
        ]
    
    def validate_subdomain(self, value):
        """Validate subdomain availability"""
        subdomain_info = get_available_subdomains()
        
        if not subdomain_info['available_check'](value):
            raise serializers.ValidationError("Subdomain is not available")
        
        return value
    
    def create(self, validated_data):
        """Create tenant with admin user"""
        admin_email = validated_data.pop('admin_email')
        admin_first_name = validated_data.pop('admin_first_name', '')
        admin_last_name = validated_data.pop('admin_last_name', '')
        
        # Create or get admin user
        admin_user, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'username': admin_email,
                'first_name': admin_first_name,
                'last_name': admin_last_name,
                'is_active': True,
            }
        )
        
        # Create tenant
        tenant = Tenant.objects.create_tenant(
            created_by=admin_user,
            **validated_data
        )
        
        # Create admin tenant user
        TenantUser.objects.create(
            tenant=tenant,
            user=admin_user,
            role='owner',
            is_active=True,
            joined_at=timezone.now()
        )
        
        return tenant


class TenantUserSerializer(serializers.ModelSerializer):
    """Serializer for TenantUser model"""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = TenantUser
        fields = [
            'id', 'tenant', 'user', 'role', 'is_active', 'invited_at',
            'joined_at', 'last_accessed', 'permissions', 'user_email',
            'user_name', 'user_username', 'tenant_name'
        ]
        read_only_fields = ['id', 'invited_at', 'joined_at', 'last_accessed']


class TenantConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for TenantConfiguration model"""
    
    class Meta:
        model = TenantConfiguration
        fields = [
            'id', 'tenant', 'category', 'key', 'value', 'description',
            'is_system', 'created_at', 'updated_at', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantInvitationSerializer(serializers.ModelSerializer):
    """Serializer for TenantInvitation model"""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = TenantInvitation
        fields = [
            'id', 'tenant', 'email', 'role', 'status', 'token', 'expires_at',
            'message', 'created_at', 'invited_by', 'accepted_at', 'accepted_by',
            'tenant_name', 'invited_by_name', 'is_expired'
        ]
        read_only_fields = [
            'id', 'token', 'created_at', 'accepted_at', 'accepted_by', 'is_expired'
        ]
    
    def create(self, validated_data):
        """Create invitation with token"""
        # Generate secure token
        validated_data['token'] = secrets.token_urlsafe(32)
        
        # Set expiry if not provided (7 days default)
        if not validated_data.get('expires_at'):
            validated_data['expires_at'] = timezone.now() + timedelta(days=7)
        
        return super().create(validated_data)


class TenantInvitationAcceptSerializer(serializers.Serializer):
    """Serializer for accepting tenant invitations"""
    
    token = serializers.CharField(max_length=255)
    user_id = serializers.IntegerField(required=False)
    
    def validate_token(self, value):
        """Validate invitation token"""
        try:
            invitation = TenantInvitation.objects.get(token=value, status='pending')
            
            if invitation.is_expired:
                raise serializers.ValidationError("Invitation has expired")
            
            return value
        except TenantInvitation.DoesNotExist:
            raise serializers.ValidationError("Invalid invitation token")
    
    def save(self):
        """Accept the invitation"""
        token = self.validated_data['token']
        user_id = self.validated_data.get('user_id')
        
        invitation = TenantInvitation.objects.get(token=token)
        
        # Get user (from context or user_id)
        user = self.context.get('user')
        if not user and user_id:
            user = User.objects.get(id=user_id)
        
        if not user:
            raise serializers.ValidationError("User required to accept invitation")
        
        # Accept invitation
        tenant_user = invitation.accept(user)
        
        return {
            'tenant_user': tenant_user,
            'invitation': invitation,
        }


class TenantStatisticsSerializer(serializers.Serializer):
    """Serializer for tenant statistics"""
    
    tenant_info = serializers.DictField()
    users = serializers.IntegerField()
    data_counts = serializers.DictField()
    storage_usage = serializers.DictField(required=False)
    activity_summary = serializers.DictField(required=False)


class TenantSettingsSerializer(serializers.Serializer):
    """Serializer for tenant settings"""
    
    timezone = serializers.CharField(max_length=50, required=False)
    language = serializers.CharField(max_length=10, required=False)
    currency = serializers.CharField(max_length=3, required=False)
    date_format = serializers.CharField(max_length=20, required=False)
    number_format = serializers.CharField(max_length=20, required=False)
    fiscal_year_start = serializers.CharField(max_length=10, required=False)
    
    # Business settings
    company_name = serializers.CharField(max_length=255, required=False)
    company_address = serializers.CharField(required=False)
    company_phone = serializers.CharField(max_length=20, required=False)
    company_email = serializers.EmailField(required=False)
    company_website = serializers.URLField(required=False)
    
    # Feature flags
    enable_multi_currency = serializers.BooleanField(required=False)
    enable_advanced_analytics = serializers.BooleanField(required=False)
    enable_ai_features = serializers.BooleanField(required=False)
    enable_api_access = serializers.BooleanField(required=False)
    
    # Notification settings
    email_notifications = serializers.BooleanField(required=False)
    sms_notifications = serializers.BooleanField(required=False)
    push_notifications = serializers.BooleanField(required=False)
    
    def validate(self, attrs):
        """Validate settings"""
        # Validate timezone
        if 'timezone' in attrs:
            import pytz
            try:
                pytz.timezone(attrs['timezone'])
            except pytz.exceptions.UnknownTimeZoneError:
                raise serializers.ValidationError({'timezone': 'Invalid timezone'})
        
        # Validate currency
        if 'currency' in attrs:
            valid_currencies = ['MAD', 'EUR', 'USD', 'GBP']  # Add more as needed
            if attrs['currency'] not in valid_currencies:
                raise serializers.ValidationError({'currency': 'Invalid currency'})
        
        return attrs


class TenantFeatureSerializer(serializers.Serializer):
    """Serializer for tenant features"""
    
    feature = serializers.CharField(max_length=100)
    enabled = serializers.BooleanField()
    
    def validate_feature(self, value):
        """Validate feature name"""
        available_features = [
            'catalog_management',
            'inventory_tracking',
            'sales_management',
            'purchase_management',
            'invoicing',
            'basic_accounting',
            'advanced_accounting',
            'reporting',
            'analytics',
            'ai_features',
            'api_access',
            'multi_currency',
            'multi_company',
            'workflow_automation',
            'document_management',
            'integration_hub',
        ]
        
        if value not in available_features:
            raise serializers.ValidationError(f"Invalid feature: {value}")
        
        return value


class SubdomainAvailabilitySerializer(serializers.Serializer):
    """Serializer for checking subdomain availability"""
    
    subdomain = serializers.CharField(max_length=63)
    
    def validate_subdomain(self, value):
        """Validate subdomain format"""
        import re
        
        if not re.match(r'^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?$', value):
            raise serializers.ValidationError("Invalid subdomain format")
        
        return value
    
    def to_representation(self, instance):
        """Return availability information"""
        subdomain = self.validated_data['subdomain']
        subdomain_info = get_available_subdomains()
        
        return {
            'subdomain': subdomain,
            'available': subdomain_info['available_check'](subdomain),
            'reserved': subdomain in subdomain_info['reserved'],
            'used': subdomain in subdomain_info['used'],
        }
