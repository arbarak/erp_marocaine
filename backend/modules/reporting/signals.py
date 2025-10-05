"""
Signals for automatic audit logging.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from modules.invoicing.models import Invoice, Payment
from modules.sales.models import SalesOrder
from modules.purchasing.models import PurchaseOrder
from modules.accounting.models import JournalEntry
from .audit_service import AuditTrailService

User = get_user_model()


@receiver(post_save, sender=Invoice)
def log_invoice_changes(sender, instance, created, **kwargs):
    """Log invoice creation and updates."""
    if not hasattr(instance, '_audit_user'):
        return
    
    user = getattr(instance, '_audit_user', None)
    if not user:
        return
    
    audit_service = AuditTrailService(instance.company)
    
    if created:
        audit_service.log_user_action(
            user=user,
            action_type='CREATE',
            description=f'Created {instance.get_invoice_type_display().lower()} {instance.invoice_number}',
            content_object=instance,
            severity='MEDIUM'
        )
    else:
        audit_service.log_user_action(
            user=user,
            action_type='UPDATE',
            description=f'Updated {instance.get_invoice_type_display().lower()} {instance.invoice_number}',
            content_object=instance,
            severity='LOW'
        )


@receiver(post_save, sender=Payment)
def log_payment_changes(sender, instance, created, **kwargs):
    """Log payment creation and updates."""
    if not hasattr(instance, '_audit_user'):
        return
    
    user = getattr(instance, '_audit_user', None)
    if not user:
        return
    
    audit_service = AuditTrailService(instance.company)
    
    if created:
        audit_service.log_user_action(
            user=user,
            action_type='CREATE',
            description=f'Created {instance.get_payment_type_display().lower()} payment {instance.payment_number}',
            content_object=instance,
            severity='MEDIUM'
        )
    else:
        audit_service.log_user_action(
            user=user,
            action_type='UPDATE',
            description=f'Updated {instance.get_payment_type_display().lower()} payment {instance.payment_number}',
            content_object=instance,
            severity='LOW'
        )


@receiver(post_save, sender=JournalEntry)
def log_journal_entry_changes(sender, instance, created, **kwargs):
    """Log journal entry creation and updates."""
    if not hasattr(instance, '_audit_user'):
        return
    
    user = getattr(instance, '_audit_user', None)
    if not user:
        return
    
    audit_service = AuditTrailService(instance.company)
    
    if created:
        audit_service.log_user_action(
            user=user,
            action_type='CREATE',
            description=f'Created journal entry {instance.reference}',
            content_object=instance,
            severity='HIGH'  # Journal entries are critical for accounting
        )
    else:
        # Check if state changed to POSTED
        if instance.state == 'POSTED':
            audit_service.log_user_action(
                user=user,
                action_type='UPDATE',
                description=f'Posted journal entry {instance.reference}',
                content_object=instance,
                severity='HIGH'
            )
        else:
            audit_service.log_user_action(
                user=user,
                action_type='UPDATE',
                description=f'Updated journal entry {instance.reference}',
                content_object=instance,
                severity='MEDIUM'
            )


@receiver(post_save, sender=SalesOrder)
def log_sales_order_changes(sender, instance, created, **kwargs):
    """Log sales order creation and updates."""
    if not hasattr(instance, '_audit_user'):
        return
    
    user = getattr(instance, '_audit_user', None)
    if not user:
        return
    
    audit_service = AuditTrailService(instance.company)
    
    if created:
        audit_service.log_user_action(
            user=user,
            action_type='CREATE',
            description=f'Created sales order {instance.order_number}',
            content_object=instance,
            severity='MEDIUM'
        )
    else:
        audit_service.log_user_action(
            user=user,
            action_type='UPDATE',
            description=f'Updated sales order {instance.order_number}',
            content_object=instance,
            severity='LOW'
        )


@receiver(post_save, sender=PurchaseOrder)
def log_purchase_order_changes(sender, instance, created, **kwargs):
    """Log purchase order creation and updates."""
    if not hasattr(instance, '_audit_user'):
        return
    
    user = getattr(instance, '_audit_user', None)
    if not user:
        return
    
    audit_service = AuditTrailService(instance.company)
    
    if created:
        audit_service.log_user_action(
            user=user,
            action_type='CREATE',
            description=f'Created purchase order {instance.order_number}',
            content_object=instance,
            severity='MEDIUM'
        )
    else:
        audit_service.log_user_action(
            user=user,
            action_type='UPDATE',
            description=f'Updated purchase order {instance.order_number}',
            content_object=instance,
            severity='LOW'
        )


@receiver(post_delete, sender=Invoice)
def log_invoice_deletion(sender, instance, **kwargs):
    """Log invoice deletion."""
    if not hasattr(instance, '_audit_user'):
        return
    
    user = getattr(instance, '_audit_user', None)
    if not user:
        return
    
    audit_service = AuditTrailService(instance.company)
    
    audit_service.log_user_action(
        user=user,
        action_type='DELETE',
        description=f'Deleted {instance.get_invoice_type_display().lower()} {instance.invoice_number}',
        severity='HIGH'  # Deletions are high severity
    )


@receiver(post_delete, sender=JournalEntry)
def log_journal_entry_deletion(sender, instance, **kwargs):
    """Log journal entry deletion."""
    if not hasattr(instance, '_audit_user'):
        return
    
    user = getattr(instance, '_audit_user', None)
    if not user:
        return
    
    audit_service = AuditTrailService(instance.company)
    
    audit_service.log_user_action(
        user=user,
        action_type='DELETE',
        description=f'Deleted journal entry {instance.reference}',
        severity='CRITICAL'  # Journal entry deletions are critical
    )
