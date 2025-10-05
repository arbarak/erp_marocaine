"""
Costing engine models for inventory valuation.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


class CostLayer(models.Model):
    """
    Cost layer model for FIFO/LIFO costing methods.
    Tracks individual cost layers for each product at each location.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.CASCADE,
        related_name='cost_layers',
        verbose_name=_('product')
    )
    location = models.ForeignKey(
        'inventory.Location',
        on_delete=models.CASCADE,
        related_name='cost_layers',
        verbose_name=_('location')
    )
    
    # Layer information
    layer_date = models.DateTimeField(_('layer date'))
    unit_cost = models.DecimalField(
        _('unit cost'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))]
    )
    
    # Quantities
    original_quantity = models.DecimalField(
        _('original quantity'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0.000001'))]
    )
    remaining_quantity = models.DecimalField(
        _('remaining quantity'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0'))]
    )
    
    # Lot/Serial tracking
    lot_number = models.CharField(_('lot number'), max_length=50, blank=True)
    serial_number = models.CharField(_('serial number'), max_length=50, blank=True)
    
    # Reference to source move
    source_move_line = models.ForeignKey(
        'inventory.StockMoveLine',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cost_layers',
        verbose_name=_('source move line')
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Cost Layer')
        verbose_name_plural = _('Cost Layers')
        ordering = ['product', 'location', 'layer_date']
        indexes = [
            models.Index(fields=['product', 'location']),
            models.Index(fields=['layer_date']),
            models.Index(fields=['remaining_quantity']),
        ]
    
    def __str__(self):
        return f"{self.product.internal_reference} @ {self.location}: {self.remaining_quantity} @ {self.unit_cost}"
    
    @property
    def remaining_value(self):
        """Calculate remaining value of this layer."""
        return self.remaining_quantity * self.unit_cost
    
    def consume(self, quantity):
        """Consume quantity from this layer and return the cost."""
        if quantity > self.remaining_quantity:
            raise ValueError(_('Cannot consume more than remaining quantity'))
        
        cost = quantity * self.unit_cost
        self.remaining_quantity -= quantity
        self.save()
        
        # Delete layer if fully consumed
        if self.remaining_quantity == 0:
            self.delete()
        
        return cost


class StockValuation(models.Model):
    """
    Stock valuation model for tracking inventory values over time.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='costing_stock_valuations',
        verbose_name=_('company')
    )
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.CASCADE,
        related_name='costing_stock_valuations',
        verbose_name=_('product')
    )
    location = models.ForeignKey(
        'inventory.Location',
        on_delete=models.CASCADE,
        related_name='costing_stock_valuations',
        verbose_name=_('location')
    )
    
    # Valuation data
    valuation_date = models.DateTimeField(_('valuation date'))
    quantity = models.DecimalField(
        _('quantity'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('0')
    )
    unit_cost = models.DecimalField(
        _('unit cost'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0')
    )
    total_value = models.DecimalField(
        _('total value'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0')
    )
    
    # Costing method used
    costing_method = models.CharField(
        _('costing method'),
        max_length=10,
        choices=[
            ('FIFO', _('First In, First Out')),
            ('LIFO', _('Last In, First Out')),
            ('WAC', _('Weighted Average Cost')),
        ]
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Stock Valuation')
        verbose_name_plural = _('Stock Valuations')
        unique_together = ['product', 'location', 'valuation_date']
        ordering = ['product', 'location', '-valuation_date']
        indexes = [
            models.Index(fields=['company', 'valuation_date']),
            models.Index(fields=['product', 'location']),
        ]
    
    def __str__(self):
        return f"{self.product.internal_reference} @ {self.location} on {self.valuation_date.date()}"


class CostAdjustment(models.Model):
    """
    Cost adjustment model for manual cost corrections.
    """
    
    ADJUSTMENT_TYPES = [
        ('REVALUATION', _('Inventory Revaluation')),
        ('CORRECTION', _('Cost Correction')),
        ('WRITE_OFF', _('Inventory Write-off')),
        ('WRITE_UP', _('Inventory Write-up')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='cost_adjustments',
        verbose_name=_('company')
    )
    
    # Document information
    reference = models.CharField(_('reference'), max_length=100)
    adjustment_type = models.CharField(
        _('adjustment type'),
        max_length=15,
        choices=ADJUSTMENT_TYPES
    )
    adjustment_date = models.DateTimeField(_('adjustment date'))
    
    # Description
    description = models.TextField(_('description'))
    reason = models.TextField(_('reason'), blank=True)
    
    # User information
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='cost_adjustments',
        verbose_name=_('created by')
    )
    
    # Status
    is_posted = models.BooleanField(_('is posted'), default=False)
    posted_at = models.DateTimeField(_('posted at'), null=True, blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Cost Adjustment')
        verbose_name_plural = _('Cost Adjustments')
        ordering = ['-adjustment_date']
        indexes = [
            models.Index(fields=['company', 'adjustment_date']),
            models.Index(fields=['is_posted']),
        ]
    
    def __str__(self):
        return f"{self.reference} - {self.get_adjustment_type_display()}"


class CostAdjustmentLine(models.Model):
    """
    Cost adjustment line model for individual product adjustments.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    adjustment = models.ForeignKey(
        CostAdjustment,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('cost adjustment')
    )
    
    # Product and location
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        related_name='cost_adjustment_lines',
        verbose_name=_('product')
    )
    location = models.ForeignKey(
        'inventory.Location',
        on_delete=models.PROTECT,
        related_name='cost_adjustment_lines',
        verbose_name=_('location')
    )
    
    # Adjustment amounts
    quantity = models.DecimalField(
        _('quantity'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('0')
    )
    old_unit_cost = models.DecimalField(
        _('old unit cost'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0')
    )
    new_unit_cost = models.DecimalField(
        _('new unit cost'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0')
    )
    adjustment_amount = models.DecimalField(
        _('adjustment amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0')
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Cost Adjustment Line')
        verbose_name_plural = _('Cost Adjustment Lines')
        ordering = ['adjustment', 'product']
    
    def __str__(self):
        return f"{self.product.internal_reference}: {self.adjustment_amount}"
    
    def save(self, *args, **kwargs):
        """Calculate adjustment amount on save."""
        self.adjustment_amount = (self.new_unit_cost - self.old_unit_cost) * self.quantity
        super().save(*args, **kwargs)
