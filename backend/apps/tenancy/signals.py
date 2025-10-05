# Tenant Signals and Event Handlers

import logging
from django.db.models.signals import post_save, post_delete, pre_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.contrib.auth.models import User

from .models import Tenant, TenantUser, TenantInvitation
from .utils import create_tenant_schema_tables

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Tenant)
def tenant_post_save(sender, instance, created, **kwargs):
    """Handle tenant creation and updates"""
    if created:
        logger.info(f"New tenant created: {instance.name} ({instance.subdomain})")
        
        # Create schema tables for new tenant
        try:
            create_tenant_schema_tables(instance)
            logger.info(f"Schema tables created for tenant {instance.name}")
        except Exception as e:
            logger.error(f"Failed to create schema tables for tenant {instance.name}: {str(e)}")
        
        # Send welcome email (implement as needed)
        # send_tenant_welcome_email(instance)
    
    # Clear tenant cache
    cache_keys = [
        f"tenant_by_host_{instance.subdomain}.erp.local",
        f"tenant_by_host_{instance.domain}" if instance.domain else None,
    ]
    
    for key in cache_keys:
        if key:
            cache.delete(key)


@receiver(pre_delete, sender=Tenant)
def tenant_pre_delete(sender, instance, **kwargs):
    """Handle tenant deletion"""
    logger.warning(f"Tenant being deleted: {instance.name} ({instance.subdomain})")
    
    # Archive tenant data before deletion (implement as needed)
    # archive_tenant_data(instance)


@receiver(post_delete, sender=Tenant)
def tenant_post_delete(sender, instance, **kwargs):
    """Clean up after tenant deletion"""
    logger.warning(f"Tenant deleted: {instance.name} ({instance.subdomain})")
    
    # Drop tenant schema (be very careful with this!)
    try:
        instance.drop_schema()
        logger.warning(f"Schema dropped for deleted tenant {instance.name}")
    except Exception as e:
        logger.error(f"Failed to drop schema for deleted tenant {instance.name}: {str(e)}")
    
    # Clear tenant cache
    cache_keys = [
        f"tenant_by_host_{instance.subdomain}.erp.local",
        f"tenant_by_host_{instance.domain}" if instance.domain else None,
    ]
    
    for key in cache_keys:
        if key:
            cache.delete(key)


@receiver(post_save, sender=TenantUser)
def tenant_user_post_save(sender, instance, created, **kwargs):
    """Handle tenant user creation and updates"""
    if created:
        logger.info(f"User {instance.user.username} added to tenant {instance.tenant.name} as {instance.role}")
        
        # Send welcome email to new tenant user
        # send_tenant_user_welcome_email(instance)
    
    # Clear user permissions cache
    cache.delete(f"user_permissions_{instance.user.id}")


@receiver(post_delete, sender=TenantUser)
def tenant_user_post_delete(sender, instance, **kwargs):
    """Handle tenant user removal"""
    logger.info(f"User {instance.user.username} removed from tenant {instance.tenant.name}")
    
    # Clear user permissions cache
    cache.delete(f"user_permissions_{instance.user.id}")
    
    # Send notification email
    # send_tenant_user_removal_email(instance)


@receiver(post_save, sender=TenantInvitation)
def tenant_invitation_post_save(sender, instance, created, **kwargs):
    """Handle tenant invitation creation and updates"""
    if created:
        logger.info(f"Invitation sent to {instance.email} for tenant {instance.tenant.name}")
        
        # Send invitation email
        # send_tenant_invitation_email(instance)
    
    elif instance.status == 'accepted':
        logger.info(f"Invitation accepted by {instance.email} for tenant {instance.tenant.name}")
        
        # Send welcome email
        # send_tenant_invitation_accepted_email(instance)


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    """Handle user creation and updates"""
    if created:
        # Check for pending invitations
        pending_invitations = TenantInvitation.objects.filter(
            email=instance.email,
            status='pending'
        )
        
        for invitation in pending_invitations:
            # Auto-accept invitations for new users
            try:
                invitation.accept(instance)
                logger.info(f"Auto-accepted invitation for {instance.email} to tenant {invitation.tenant.name}")
            except Exception as e:
                logger.error(f"Failed to auto-accept invitation for {instance.email}: {str(e)}")


# Custom signals for tenant events
from django.dispatch import Signal

# Tenant lifecycle signals
tenant_created = Signal()
tenant_activated = Signal()
tenant_deactivated = Signal()
tenant_trial_expired = Signal()

# Tenant user signals
tenant_user_joined = Signal()
tenant_user_left = Signal()
tenant_user_role_changed = Signal()

# Tenant feature signals
tenant_feature_enabled = Signal()
tenant_feature_disabled = Signal()


def send_tenant_created_signal(tenant):
    """Send tenant created signal"""
    tenant_created.send(sender=Tenant, tenant=tenant)


def send_tenant_user_joined_signal(tenant_user):
    """Send tenant user joined signal"""
    tenant_user_joined.send(sender=TenantUser, tenant_user=tenant_user)


# Signal handlers for custom signals
@receiver(tenant_created)
def handle_tenant_created(sender, tenant, **kwargs):
    """Handle tenant created signal"""
    logger.info(f"Tenant created signal received for {tenant.name}")
    
    # Initialize tenant with default data
    # setup_tenant_defaults(tenant)


@receiver(tenant_user_joined)
def handle_tenant_user_joined(sender, tenant_user, **kwargs):
    """Handle tenant user joined signal"""
    logger.info(f"Tenant user joined signal received for {tenant_user.user.username} @ {tenant_user.tenant.name}")
    
    # Setup user defaults for tenant
    # setup_tenant_user_defaults(tenant_user)
