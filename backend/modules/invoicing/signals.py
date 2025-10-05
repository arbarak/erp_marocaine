"""
Django signals for invoicing module.
"""
from django.db import models
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.core.cache import cache
from django.utils import timezone
from decimal import Decimal

from .models import Invoice, InvoiceLine, Payment, InvoicePayment


@receiver(pre_save, sender=Invoice)
def invoice_pre_save(sender, instance, **kwargs):
    """Handle invoice pre-save operations."""
    # Track original state for accounting integration
    if instance.pk:
        try:
            original = Invoice.objects.get(pk=instance.pk)
            instance._original_state = original.state
        except Invoice.DoesNotExist:
            instance._original_state = None
    else:
        instance._original_state = None


@receiver(post_save, sender=Invoice)
def invoice_post_save(sender, instance, created, **kwargs):
    """Handle invoice creation and updates."""
    # Clear invoice-related cache
    cache_keys = [
        f"invoice_{instance.id}",
        f"company_invoices_{instance.company.id}",
        f"customer_invoices_{instance.customer.id}" if instance.customer else None,
        f"supplier_invoices_{instance.supplier.id}" if instance.supplier else None,
    ]
    
    for key in cache_keys:
        if key:
            cache.delete(key)
    
    # Update totals if lines exist
    if not created and instance.lines.exists():
        instance.calculate_totals()


@receiver(post_save, sender=InvoiceLine)
def invoice_line_post_save(sender, instance, created, **kwargs):
    """Handle invoice line creation and updates."""
    # Recalculate invoice totals
    if instance.invoice:
        instance.invoice.calculate_totals()
        
        # Clear related cache
        cache_keys = [
            f"invoice_{instance.invoice.id}",
            f"invoice_lines_{instance.invoice.id}",
        ]
        
        for key in cache_keys:
            cache.delete(key)


@receiver(post_delete, sender=InvoiceLine)
def invoice_line_post_delete(sender, instance, **kwargs):
    """Handle invoice line deletion."""
    # Recalculate invoice totals
    if instance.invoice:
        instance.invoice.calculate_totals()
        
        # Clear related cache
        cache_keys = [
            f"invoice_{instance.invoice.id}",
            f"invoice_lines_{instance.invoice.id}",
        ]
        
        for key in cache_keys:
            cache.delete(key)


@receiver(post_save, sender=Payment)
def payment_post_save(sender, instance, created, **kwargs):
    """Handle payment creation and updates."""
    # Clear payment-related cache
    cache_keys = [
        f"payment_{instance.id}",
        f"company_payments_{instance.company.id}",
    ]
    
    for key in cache_keys:
        cache.delete(key)


@receiver(post_save, sender=InvoicePayment)
def invoice_payment_post_save(sender, instance, created, **kwargs):
    """Handle invoice payment creation and updates."""
    # Update invoice paid amount and state
    if instance.invoice:
        total_paid = instance.invoice.payments.aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')
        
        instance.invoice.paid_amount = total_paid
        instance.invoice.outstanding_amount = instance.invoice.total_amount - total_paid
        
        # Update invoice state based on payment
        if instance.invoice.outstanding_amount <= Decimal('0.00'):
            instance.invoice.state = 'PAID'
        elif instance.invoice.state == 'PAID' and instance.invoice.outstanding_amount > Decimal('0.00'):
            instance.invoice.state = 'POSTED'
        
        instance.invoice.save()
        
        # Clear related cache
        cache_keys = [
            f"invoice_{instance.invoice.id}",
            f"invoice_payments_{instance.invoice.id}",
        ]
        
        for key in cache_keys:
            cache.delete(key)


@receiver(post_delete, sender=InvoicePayment)
def invoice_payment_post_delete(sender, instance, **kwargs):
    """Handle invoice payment deletion."""
    # Update invoice paid amount and state
    if instance.invoice:
        total_paid = instance.invoice.payments.aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')
        
        instance.invoice.paid_amount = total_paid
        instance.invoice.outstanding_amount = instance.invoice.total_amount - total_paid
        
        # Update invoice state based on payment
        if instance.invoice.outstanding_amount > Decimal('0.00'):
            if instance.invoice.due_date < timezone.now().date():
                instance.invoice.state = 'OVERDUE'
            else:
                instance.invoice.state = 'POSTED'
        
        instance.invoice.save()
        
        # Clear related cache
        cache_keys = [
            f"invoice_{instance.invoice.id}",
            f"invoice_payments_{instance.invoice.id}",
        ]
        
        for key in cache_keys:
            cache.delete(key)
