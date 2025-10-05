"""
Django signals for tax engine module.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

from .models import Tax, TaxRate, TaxRateVersion


@receiver(post_save, sender=Tax)
def tax_post_save(sender, instance, created, **kwargs):
    """Handle tax creation and updates."""
    # Clear tax-related cache
    cache_keys = [
        f"tax_{instance.code}",
        f"tax_rates_{instance.id}",
        "moroccan_vat_taxes",
        "withholding_taxes",
    ]
    
    for key in cache_keys:
        cache.delete(key)


@receiver(post_save, sender=TaxRate)
def tax_rate_post_save(sender, instance, created, **kwargs):
    """Handle tax rate creation and updates."""
    # Clear tax rate cache
    cache_keys = [
        f"tax_rate_{instance.id}",
        f"tax_rates_{instance.tax.id}",
        f"tax_{instance.tax.code}",
    ]
    
    for key in cache_keys:
        cache.delete(key)


@receiver(post_save, sender=TaxRateVersion)
def tax_rate_version_post_save(sender, instance, created, **kwargs):
    """Handle tax rate version creation and updates."""
    # Clear tax rate version cache
    cache_keys = [
        f"tax_rate_version_{instance.id}",
        f"tax_rate_{instance.tax_rate.id}",
        f"tax_rates_{instance.tax_rate.tax.id}",
        f"tax_{instance.tax_rate.tax.code}",
    ]
    
    for key in cache_keys:
        cache.delete(key)


@receiver(post_delete, sender=Tax)
def tax_post_delete(sender, instance, **kwargs):
    """Handle tax deletion."""
    # Clear tax-related cache
    cache_keys = [
        f"tax_{instance.code}",
        f"tax_rates_{instance.id}",
        "moroccan_vat_taxes",
        "withholding_taxes",
    ]
    
    for key in cache_keys:
        cache.delete(key)


@receiver(post_delete, sender=TaxRate)
def tax_rate_post_delete(sender, instance, **kwargs):
    """Handle tax rate deletion."""
    # Clear tax rate cache
    cache_keys = [
        f"tax_rate_{instance.id}",
        f"tax_rates_{instance.tax.id}",
        f"tax_{instance.tax.code}",
    ]
    
    for key in cache_keys:
        cache.delete(key)


@receiver(post_delete, sender=TaxRateVersion)
def tax_rate_version_post_delete(sender, instance, **kwargs):
    """Handle tax rate version deletion."""
    # Clear tax rate version cache
    cache_keys = [
        f"tax_rate_version_{instance.id}",
        f"tax_rate_{instance.tax_rate.id}",
        f"tax_rates_{instance.tax_rate.tax.id}",
        f"tax_{instance.tax_rate.tax.code}",
    ]
    
    for key in cache_keys:
        cache.delete(key)
