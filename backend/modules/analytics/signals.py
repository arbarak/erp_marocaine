"""
Signals for analytics module.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta

from modules.invoicing.models import Invoice
from modules.sales.models import SalesOrder
from modules.purchasing.models import PurchaseOrder
from .models import AnalyticsMetric, MetricValue
from .services import MetricsCalculationService


@receiver(post_save, sender=Invoice)
def update_invoice_metrics(sender, instance, created, **kwargs):
    """Update invoice-related metrics when an invoice is saved."""
    if created:
        # Find metrics that depend on invoice data
        invoice_metrics = AnalyticsMetric.objects.filter(
            company=instance.company,
            calculation_formula__icontains='invoice',
            is_active=True
        )
        
        # Calculate current period for each metric
        for metric in invoice_metrics:
            end_date = timezone.now()
            
            if metric.aggregation_period == 'DAILY':
                start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
            elif metric.aggregation_period == 'WEEKLY':
                start_date = end_date - timedelta(days=end_date.weekday())
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            elif metric.aggregation_period == 'MONTHLY':
                start_date = end_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif metric.aggregation_period == 'QUARTERLY':
                quarter_start_month = ((end_date.month - 1) // 3) * 3 + 1
                start_date = end_date.replace(month=quarter_start_month, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:  # YEARLY
                start_date = end_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Calculate and store metric value
            try:
                value = MetricsCalculationService.calculate_metric(metric, start_date, end_date)
                MetricValue.objects.update_or_create(
                    metric=metric,
                    period_start=start_date,
                    period_end=end_date,
                    defaults={'value': value}
                )
            except Exception:
                # Log error in production
                pass


@receiver(post_save, sender=SalesOrder)
def update_sales_metrics(sender, instance, created, **kwargs):
    """Update sales-related metrics when a sales order is saved."""
    if created:
        # Find metrics that depend on sales data
        sales_metrics = AnalyticsMetric.objects.filter(
            company=instance.company,
            calculation_formula__icontains='sales',
            is_active=True
        )
        
        # Calculate current period for each metric
        for metric in sales_metrics:
            end_date = timezone.now()
            
            if metric.aggregation_period == 'DAILY':
                start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
            elif metric.aggregation_period == 'WEEKLY':
                start_date = end_date - timedelta(days=end_date.weekday())
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            elif metric.aggregation_period == 'MONTHLY':
                start_date = end_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif metric.aggregation_period == 'QUARTERLY':
                quarter_start_month = ((end_date.month - 1) // 3) * 3 + 1
                start_date = end_date.replace(month=quarter_start_month, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:  # YEARLY
                start_date = end_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Calculate and store metric value
            try:
                value = MetricsCalculationService.calculate_metric(metric, start_date, end_date)
                MetricValue.objects.update_or_create(
                    metric=metric,
                    period_start=start_date,
                    period_end=end_date,
                    defaults={'value': value}
                )
            except Exception:
                # Log error in production
                pass


@receiver(post_save, sender=PurchaseOrder)
def update_purchase_metrics(sender, instance, created, **kwargs):
    """Update purchase-related metrics when a purchase order is saved."""
    if created:
        # Find metrics that depend on purchase data
        purchase_metrics = AnalyticsMetric.objects.filter(
            company=instance.company,
            calculation_formula__icontains='purchase',
            is_active=True
        )
        
        # Calculate current period for each metric
        for metric in purchase_metrics:
            end_date = timezone.now()
            
            if metric.aggregation_period == 'DAILY':
                start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
            elif metric.aggregation_period == 'WEEKLY':
                start_date = end_date - timedelta(days=end_date.weekday())
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            elif metric.aggregation_period == 'MONTHLY':
                start_date = end_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif metric.aggregation_period == 'QUARTERLY':
                quarter_start_month = ((end_date.month - 1) // 3) * 3 + 1
                start_date = end_date.replace(month=quarter_start_month, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:  # YEARLY
                start_date = end_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Calculate and store metric value
            try:
                value = MetricsCalculationService.calculate_metric(metric, start_date, end_date)
                MetricValue.objects.update_or_create(
                    metric=metric,
                    period_start=start_date,
                    period_end=end_date,
                    defaults={'value': value}
                )
            except Exception:
                # Log error in production
                pass
