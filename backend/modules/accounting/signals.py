"""
Django signals for automatic accounting integration.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone

from modules.invoicing.models import Invoice, Payment, InvoicePayment
from modules.inventory.models import StockMove
from modules.purchasing.models import PurchaseOrder
from modules.sales.models import SalesOrder
from .services import AutomaticAccountingService


@receiver(post_save, sender=Invoice)
def create_invoice_accounting_entries(sender, instance, created, **kwargs):
    """
    Create accounting entries when an invoice is posted.
    """
    # Only create entries when invoice is posted for the first time
    if (instance.state == 'POSTED' and 
        hasattr(instance, '_state_changed') and 
        instance._state_changed):
        
        try:
            # Use the user who posted the invoice, or fall back to created_by
            user = getattr(instance, '_posted_by', instance.created_by)
            
            AutomaticAccountingService.create_invoice_entries(
                invoice=instance,
                user=user
            )
        except Exception as e:
            # Log the error but don't prevent the invoice from being saved
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create accounting entries for invoice {instance.id}: {str(e)}")


@receiver(post_save, sender=Payment)
def create_payment_accounting_entries(sender, instance, created, **kwargs):
    """
    Create accounting entries when a payment is confirmed.
    """
    # Only create entries when payment is confirmed for the first time
    if (instance.state == 'CONFIRMED' and 
        hasattr(instance, '_state_changed') and 
        instance._state_changed):
        
        try:
            # Use the user who confirmed the payment, or fall back to created_by
            user = getattr(instance, '_confirmed_by', instance.created_by)
            
            AutomaticAccountingService.create_payment_entries(
                payment=instance,
                user=user
            )
        except Exception as e:
            # Log the error but don't prevent the payment from being saved
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create accounting entries for payment {instance.id}: {str(e)}")


@receiver(post_save, sender=StockMove)
def create_inventory_accounting_entries(sender, instance, created, **kwargs):
    """
    Create accounting entries for inventory movements.
    """
    # Only create entries when stock move is done for the first time
    if (instance.state == 'DONE' and 
        hasattr(instance, '_state_changed') and 
        instance._state_changed):
        
        try:
            # Use the user who completed the move, or fall back to created_by
            user = getattr(instance, '_completed_by', instance.created_by)
            
            AutomaticAccountingService.create_inventory_entries(
                stock_move=instance,
                user=user
            )
        except Exception as e:
            # Log the error but don't prevent the stock move from being saved
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create accounting entries for stock move {instance.id}: {str(e)}")


# Signal handlers for tracking state changes
@receiver(post_save, sender=Invoice)
def track_invoice_state_changes(sender, instance, **kwargs):
    """Track invoice state changes for accounting integration."""
    if hasattr(instance, '_original_state'):
        if instance._original_state != instance.state:
            instance._state_changed = True
            if instance.state == 'POSTED':
                instance._posted_by = getattr(instance, '_current_user', instance.created_by)
    else:
        instance._state_changed = False


@receiver(post_save, sender=Payment)
def track_payment_state_changes(sender, instance, **kwargs):
    """Track payment state changes for accounting integration."""
    if hasattr(instance, '_original_state'):
        if instance._original_state != instance.state:
            instance._state_changed = True
            if instance.state == 'CONFIRMED':
                instance._confirmed_by = getattr(instance, '_current_user', instance.created_by)
    else:
        instance._state_changed = False


@receiver(post_save, sender=StockMove)
def track_stock_move_state_changes(sender, instance, **kwargs):
    """Track stock move state changes for accounting integration."""
    if hasattr(instance, '_original_state'):
        if instance._original_state != instance.state:
            instance._state_changed = True
            if instance.state == 'DONE':
                instance._completed_by = getattr(instance, '_current_user', instance.created_by)
    else:
        instance._state_changed = False
