# Multi-Tenant Models

import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.utils import timezone
from django.contrib.postgres.fields import JSONField
import logging

logger = logging.getLogger(__name__)


class TenantManager(models.Manager):
    """Manager for Tenant model with additional methods"""
    
    def active(self):
        """Get only active tenants"""
        return self.filter(is_active=True)
    
    def by_domain(self, domain):
        """Get tenant by domain"""
        return self.filter(
            models.Q(domain=domain) | 
            models.Q(subdomain=domain.split('.')[0])
        ).first()
    
    def create_tenant(self, name, subdomain, admin_user, **kwargs):
        """Create a new tenant with proper setup"""
        tenant = self.create(
            name=name,
            subdomain=subdomain,
            created_by=admin_user,
            **kwargs
        )
        
        # Create tenant schema
        tenant.create_schema()
        
        # Setup default configurations
        tenant.setup_defaults()
        
        return tenant


class Tenant(models.Model):
    """
    Tenant model representing a separate organization/company
    Each tenant has its own schema for complete data isolation
    """
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Tenant organization name")
    slug = models.SlugField(max_length=100, unique=True, help_text="URL-friendly identifier")
    
    # Domain Configuration
    subdomain = models.CharField(
        max_length=63,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?$',
                message="Subdomain must be lowercase alphanumeric with hyphens"
            )
        ],
        help_text="Subdomain for tenant access (e.g., 'acme' for acme.erp.com)"
    )
    domain = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Custom domain for tenant (optional)"
    )
    
    # Schema Information
    schema_name = models.CharField(
        max_length=63,
        unique=True,
        help_text="PostgreSQL schema name for tenant data"
    )
    
    # Status and Metadata
    is_active = models.BooleanField(default=True, help_text="Whether tenant is active")
    is_trial = models.BooleanField(default=False, help_text="Whether tenant is on trial")
    trial_ends_at = models.DateTimeField(blank=True, null=True)
    
    # Subscription Information
    plan = models.CharField(
        max_length=50,
        choices=[
            ('starter', 'Starter'),
            ('professional', 'Professional'),
            ('enterprise', 'Enterprise'),
            ('custom', 'Custom'),
        ],
        default='starter'
    )
    max_users = models.PositiveIntegerField(default=5, help_text="Maximum number of users")
    max_companies = models.PositiveIntegerField(default=1, help_text="Maximum number of companies")
    
    # Configuration
    settings = JSONField(default=dict, blank=True, help_text="Tenant-specific settings")
    features = JSONField(default=list, blank=True, help_text="Enabled features for tenant")
    
    # Audit Fields
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_tenants'
    )
    
    objects = TenantManager()
    
    class Meta:
        db_table = 'tenants'
        ordering = ['name']
        indexes = [
            models.Index(fields=['subdomain']),
            models.Index(fields=['domain']),
            models.Index(fields=['schema_name']),
            models.Index(fields=['is_active', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.subdomain})"
    
    def save(self, *args, **kwargs):
        """Override save to set schema_name if not provided"""
        if not self.schema_name:
            self.schema_name = f"tenant_{self.subdomain}"
        
        super().save(*args, **kwargs)
    
    @property
    def full_domain(self):
        """Get full domain for tenant"""
        if self.domain:
            return self.domain
        return f"{self.subdomain}.erp.local"  # Default domain pattern
    
    @property
    def is_trial_expired(self):
        """Check if trial has expired"""
        if not self.is_trial or not self.trial_ends_at:
            return False
        return timezone.now() > self.trial_ends_at
    
    def create_schema(self):
        """Create PostgreSQL schema for tenant"""
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute(f'CREATE SCHEMA IF NOT EXISTS "{self.schema_name}"')
            logger.info(f"Created schema {self.schema_name} for tenant {self.name}")
    
    def drop_schema(self):
        """Drop PostgreSQL schema for tenant (use with caution!)"""
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute(f'DROP SCHEMA IF EXISTS "{self.schema_name}" CASCADE')
            logger.warning(f"Dropped schema {self.schema_name} for tenant {self.name}")
    
    def setup_defaults(self):
        """Setup default configurations for new tenant"""
        default_settings = {
            'timezone': 'Africa/Casablanca',
            'language': 'fr',
            'currency': 'MAD',
            'date_format': 'DD/MM/YYYY',
            'number_format': 'european',
            'fiscal_year_start': '01-01',
        }
        
        default_features = [
            'catalog_management',
            'inventory_tracking',
            'sales_management',
            'purchase_management',
            'invoicing',
            'basic_accounting',
            'reporting',
        ]
        
        if not self.settings:
            self.settings = default_settings
        
        if not self.features:
            self.features = default_features
        
        self.save()
    
    def get_setting(self, key, default=None):
        """Get tenant-specific setting"""
        return self.settings.get(key, default)
    
    def set_setting(self, key, value):
        """Set tenant-specific setting"""
        self.settings[key] = value
        self.save(update_fields=['settings'])
    
    def has_feature(self, feature):
        """Check if tenant has specific feature enabled"""
        return feature in self.features
    
    def enable_feature(self, feature):
        """Enable feature for tenant"""
        if feature not in self.features:
            self.features.append(feature)
            self.save(update_fields=['features'])
    
    def disable_feature(self, feature):
        """Disable feature for tenant"""
        if feature in self.features:
            self.features.remove(feature)
            self.save(update_fields=['features'])


class TenantUser(models.Model):
    """
    Association between users and tenants
    Users can belong to multiple tenants with different roles
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='tenant_users')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tenant_memberships')
    
    # Role within tenant
    role = models.CharField(
        max_length=50,
        choices=[
            ('owner', 'Owner'),
            ('admin', 'Administrator'),
            ('manager', 'Manager'),
            ('user', 'User'),
            ('viewer', 'Viewer'),
        ],
        default='user'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    invited_at = models.DateTimeField(default=timezone.now)
    joined_at = models.DateTimeField(blank=True, null=True)
    last_accessed = models.DateTimeField(blank=True, null=True)
    
    # Permissions
    permissions = JSONField(default=list, blank=True, help_text="Additional permissions")
    
    class Meta:
        db_table = 'tenant_users'
        unique_together = ['tenant', 'user']
        indexes = [
            models.Index(fields=['tenant', 'user']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['role', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.username} @ {self.tenant.name} ({self.role})"
    
    def activate(self):
        """Activate user membership"""
        self.is_active = True
        self.joined_at = timezone.now()
        self.save()
    
    def deactivate(self):
        """Deactivate user membership"""
        self.is_active = False
        self.save()
    
    def update_last_access(self):
        """Update last access timestamp"""
        self.last_accessed = timezone.now()
        self.save(update_fields=['last_accessed'])


class TenantConfiguration(models.Model):
    """
    Tenant-specific configuration settings
    Allows for flexible configuration per tenant
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='configurations')
    
    # Configuration details
    category = models.CharField(max_length=100, help_text="Configuration category")
    key = models.CharField(max_length=100, help_text="Configuration key")
    value = JSONField(help_text="Configuration value")
    
    # Metadata
    description = models.TextField(blank=True, help_text="Configuration description")
    is_system = models.BooleanField(default=False, help_text="System configuration (not user-editable)")
    
    # Audit
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'tenant_configurations'
        unique_together = ['tenant', 'category', 'key']
        indexes = [
            models.Index(fields=['tenant', 'category']),
            models.Index(fields=['tenant', 'category', 'key']),
        ]
    
    def __str__(self):
        return f"{self.tenant.name}: {self.category}.{self.key}"


class TenantInvitation(models.Model):
    """
    Invitations for users to join tenants
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='invitations')
    
    # Invitation details
    email = models.EmailField(help_text="Email address of invitee")
    role = models.CharField(
        max_length=50,
        choices=[
            ('admin', 'Administrator'),
            ('manager', 'Manager'),
            ('user', 'User'),
            ('viewer', 'Viewer'),
        ],
        default='user'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('declined', 'Declined'),
            ('expired', 'Expired'),
        ],
        default='pending'
    )
    
    # Metadata
    token = models.CharField(max_length=255, unique=True, help_text="Invitation token")
    expires_at = models.DateTimeField(help_text="Invitation expiry")
    message = models.TextField(blank=True, help_text="Personal message")
    
    # Audit
    created_at = models.DateTimeField(default=timezone.now)
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    accepted_at = models.DateTimeField(blank=True, null=True)
    accepted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='accepted_invitations'
    )
    
    class Meta:
        db_table = 'tenant_invitations'
        unique_together = ['tenant', 'email']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['email', 'status']),
            models.Index(fields=['tenant', 'status']),
        ]
    
    def __str__(self):
        return f"Invitation to {self.email} for {self.tenant.name}"
    
    @property
    def is_expired(self):
        """Check if invitation has expired"""
        return timezone.now() > self.expires_at
    
    def accept(self, user):
        """Accept invitation and create tenant membership"""
        if self.is_expired:
            raise ValueError("Invitation has expired")
        
        if self.status != 'pending':
            raise ValueError("Invitation is not pending")
        
        # Create tenant user membership
        tenant_user, created = TenantUser.objects.get_or_create(
            tenant=self.tenant,
            user=user,
            defaults={
                'role': self.role,
                'joined_at': timezone.now(),
            }
        )
        
        # Update invitation status
        self.status = 'accepted'
        self.accepted_at = timezone.now()
        self.accepted_by = user
        self.save()
        
        return tenant_user
    
    def decline(self):
        """Decline invitation"""
        self.status = 'declined'
        self.save()
    
    def expire(self):
        """Mark invitation as expired"""
        self.status = 'expired'
        self.save()
