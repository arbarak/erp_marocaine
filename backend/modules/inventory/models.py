"""
Inventory management models for ERP system.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from simple_history.models import HistoricalRecords
from decimal import Decimal
import uuid


class Warehouse(models.Model):
    """
    Warehouse model for inventory management.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='warehouses',
        verbose_name=_('company')
    )
    
    # Basic information
    name = models.CharField(_('name'), max_length=100)
    code = models.CharField(
        _('code'),
        max_length=20,
        help_text=_('Unique warehouse code')
    )
    description = models.TextField(_('description'), blank=True)
    
    # Address information
    address_line1 = models.CharField(_('address line 1'), max_length=200, blank=True)
    address_line2 = models.CharField(_('address line 2'), max_length=200, blank=True)
    city = models.CharField(_('city'), max_length=100, blank=True)
    postal_code = models.CharField(_('postal code'), max_length=20, blank=True)
    state_province = models.CharField(_('state/province'), max_length=100, blank=True)
    country = models.CharField(_('country'), max_length=100, blank=True)
    
    # Contact information
    phone = models.CharField(_('phone'), max_length=20, blank=True)
    email = models.EmailField(_('email'), blank=True)
    
    # Settings
    is_active = models.BooleanField(_('is active'), default=True)
    is_default = models.BooleanField(
        _('is default'),
        default=False,
        help_text=_('Default warehouse for this company')
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Warehouse')
        verbose_name_plural = _('Warehouses')
        unique_together = ['company', 'code']
        ordering = ['name']
        indexes = [
            models.Index(fields=['company', 'is_active']),
        ]
    
    def __str__(self):
        return f"[{self.code}] {self.name}"
    
    def save(self, *args, **kwargs):
        """Override save to handle default warehouse logic."""
        if self.is_default:
            # Ensure only one default warehouse per company
            Warehouse.objects.filter(
                company=self.company,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        
        super().save(*args, **kwargs)


class LocationType(models.Model):
    """
    Location type model for categorizing storage locations.
    """
    
    LOCATION_USAGE = [
        ('INTERNAL', _('Internal Location')),
        ('CUSTOMER', _('Customer Location')),
        ('SUPPLIER', _('Supplier Location')),
        ('INVENTORY', _('Inventory Loss')),
        ('PRODUCTION', _('Production')),
        ('TRANSIT', _('Transit Location')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='location_types',
        verbose_name=_('company')
    )
    
    name = models.CharField(_('name'), max_length=100)
    code = models.CharField(_('code'), max_length=20)
    usage = models.CharField(
        _('usage'),
        max_length=15,
        choices=LOCATION_USAGE,
        default='INTERNAL'
    )
    description = models.TextField(_('description'), blank=True)
    
    # Settings
    is_active = models.BooleanField(_('is active'), default=True)
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Location Type')
        verbose_name_plural = _('Location Types')
        unique_together = ['company', 'code']
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Location(models.Model):
    """
    Storage location model for detailed inventory tracking.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='locations',
        verbose_name=_('warehouse')
    )
    location_type = models.ForeignKey(
        LocationType,
        on_delete=models.PROTECT,
        related_name='locations',
        verbose_name=_('location type')
    )
    
    # Basic information
    name = models.CharField(_('name'), max_length=100)
    code = models.CharField(
        _('code'),
        max_length=30,
        help_text=_('Location code (e.g., A-01-01)')
    )
    description = models.TextField(_('description'), blank=True)
    
    # Hierarchical structure
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('parent location')
    )
    
    # Physical attributes
    barcode = models.CharField(_('barcode'), max_length=50, blank=True)
    
    # Settings
    is_active = models.BooleanField(_('is active'), default=True)
    is_scrap_location = models.BooleanField(
        _('is scrap location'),
        default=False,
        help_text=_('Location for scrapped/damaged goods')
    )
    is_return_location = models.BooleanField(
        _('is return location'),
        default=False,
        help_text=_('Location for returned goods')
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Location')
        verbose_name_plural = _('Locations')
        unique_together = ['warehouse', 'code']
        ordering = ['warehouse', 'code']
        indexes = [
            models.Index(fields=['warehouse', 'is_active']),
            models.Index(fields=['location_type']),
        ]
    
    def __str__(self):
        return f"{self.warehouse.code}/{self.code}"
    
    @property
    def full_path(self):
        """Get the full location path."""
        if self.parent:
            return f"{self.parent.full_path}/{self.code}"
        return f"{self.warehouse.code}/{self.code}"
    
    @property
    def company(self):
        """Get the company from warehouse."""
        return self.warehouse.company


class StockQuant(models.Model):
    """
    Stock quantity model for tracking inventory at location level.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.CASCADE,
        related_name='stock_quants',
        verbose_name=_('product')
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name='stock_quants',
        verbose_name=_('location')
    )
    
    # Quantities
    quantity = models.DecimalField(
        _('quantity'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('0.000000'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    reserved_quantity = models.DecimalField(
        _('reserved quantity'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('0.000000'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    
    # Costing information
    cost_price = models.DecimalField(
        _('cost price'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_value = models.DecimalField(
        _('total value'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Lot/Serial tracking
    lot_number = models.CharField(_('lot number'), max_length=50, blank=True)
    serial_number = models.CharField(_('serial number'), max_length=50, blank=True)
    expiry_date = models.DateField(_('expiry date'), null=True, blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Stock Quantity')
        verbose_name_plural = _('Stock Quantities')
        unique_together = ['product', 'location', 'lot_number', 'serial_number']
        ordering = ['product', 'location']
        indexes = [
            models.Index(fields=['product', 'location']),
            models.Index(fields=['location']),
            models.Index(fields=['lot_number']),
            models.Index(fields=['serial_number']),
        ]
    
    def __str__(self):
        return f"{self.product.internal_reference} @ {self.location}: {self.quantity}"
    
    @property
    def available_quantity(self):
        """Get available quantity (on hand - reserved)."""
        return self.quantity - self.reserved_quantity
    
    def save(self, *args, **kwargs):
        """Override save to calculate total value."""
        self.total_value = self.quantity * self.cost_price
        super().save(*args, **kwargs)


class StockMove(models.Model):
    """
    Stock movement model for tracking inventory transactions.
    """

    MOVE_TYPES = [
        ('IN', _('Incoming')),
        ('OUT', _('Outgoing')),
        ('INTERNAL', _('Internal Transfer')),
        ('ADJUSTMENT', _('Inventory Adjustment')),
    ]

    MOVE_STATES = [
        ('DRAFT', _('Draft')),
        ('CONFIRMED', _('Confirmed')),
        ('ASSIGNED', _('Assigned')),
        ('DONE', _('Done')),
        ('CANCELLED', _('Cancelled')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='stock_moves',
        verbose_name=_('company')
    )

    # Document information
    name = models.CharField(_('reference'), max_length=100)
    move_type = models.CharField(_('move type'), max_length=15, choices=MOVE_TYPES)
    state = models.CharField(_('state'), max_length=15, choices=MOVE_STATES, default='DRAFT')

    # Dates
    scheduled_date = models.DateTimeField(_('scheduled date'))
    effective_date = models.DateTimeField(_('effective date'), null=True, blank=True)

    # Origin information
    origin_document = models.CharField(_('origin document'), max_length=100, blank=True)
    origin_reference = models.CharField(_('origin reference'), max_length=100, blank=True)

    # Locations
    source_location = models.ForeignKey(
        Location,
        on_delete=models.PROTECT,
        related_name='outgoing_moves',
        verbose_name=_('source location')
    )
    destination_location = models.ForeignKey(
        Location,
        on_delete=models.PROTECT,
        related_name='incoming_moves',
        verbose_name=_('destination location')
    )

    # User information
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='created_stock_moves',
        verbose_name=_('created by')
    )
    confirmed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='confirmed_stock_moves',
        verbose_name=_('confirmed by')
    )

    # Notes
    notes = models.TextField(_('notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    # History tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _('Stock Move')
        verbose_name_plural = _('Stock Moves')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'state']),
            models.Index(fields=['move_type', 'state']),
            models.Index(fields=['scheduled_date']),
            models.Index(fields=['source_location']),
            models.Index(fields=['destination_location']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_state_display()})"

    def confirm(self, user):
        """Confirm the stock move."""
        if self.state != 'DRAFT':
            raise ValueError(_('Only draft moves can be confirmed'))

        self.state = 'CONFIRMED'
        self.confirmed_by = user
        self.save()

        # Confirm all move lines
        for line in self.lines.all():
            line.confirm()

    def process(self, user):
        """Process the stock move and update inventory."""
        if self.state not in ['CONFIRMED', 'ASSIGNED']:
            raise ValueError(_('Move must be confirmed before processing'))

        from django.utils import timezone

        # Process all move lines
        for line in self.lines.all():
            line.process()

        self.state = 'DONE'
        self.effective_date = timezone.now()
        self.save()

    def cancel(self):
        """Cancel the stock move."""
        if self.state == 'DONE':
            raise ValueError(_('Cannot cancel processed moves'))

        self.state = 'CANCELLED'
        self.save()

        # Cancel all move lines
        for line in self.lines.all():
            line.cancel()


class StockMoveLine(models.Model):
    """
    Stock move line model for individual product movements.
    """

    LINE_STATES = [
        ('DRAFT', _('Draft')),
        ('CONFIRMED', _('Confirmed')),
        ('ASSIGNED', _('Assigned')),
        ('DONE', _('Done')),
        ('CANCELLED', _('Cancelled')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    move = models.ForeignKey(
        StockMove,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('stock move')
    )

    # Product information
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        related_name='stock_move_lines',
        verbose_name=_('product')
    )

    # Quantities
    quantity_planned = models.DecimalField(
        _('planned quantity'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0.000001'))]
    )
    quantity_done = models.DecimalField(
        _('done quantity'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('0.000000'),
        validators=[MinValueValidator(Decimal('0'))]
    )

    # Costing
    unit_cost = models.DecimalField(
        _('unit cost'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )

    # Lot/Serial tracking
    lot_number = models.CharField(_('lot number'), max_length=50, blank=True)
    serial_number = models.CharField(_('serial number'), max_length=50, blank=True)

    # State
    state = models.CharField(_('state'), max_length=15, choices=LINE_STATES, default='DRAFT')

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Stock Move Line')
        verbose_name_plural = _('Stock Move Lines')
        ordering = ['move', 'product']
        indexes = [
            models.Index(fields=['move', 'product']),
            models.Index(fields=['product', 'state']),
        ]

    def __str__(self):
        return f"{self.product.internal_reference}: {self.quantity_planned}"

    def confirm(self):
        """Confirm the move line."""
        self.state = 'CONFIRMED'
        self.save()

    def process(self):
        """Process the move line and update stock quantities."""
        if self.state != 'CONFIRMED':
            raise ValueError(_('Line must be confirmed before processing'))

        # Update source location (decrease stock)
        if self.move.move_type in ['OUT', 'INTERNAL']:
            self._update_stock_quant(
                self.move.source_location,
                -self.quantity_done
            )

        # Update destination location (increase stock)
        if self.move.move_type in ['IN', 'INTERNAL']:
            self._update_stock_quant(
                self.move.destination_location,
                self.quantity_done
            )

        self.state = 'DONE'
        self.save()

    def cancel(self):
        """Cancel the move line."""
        self.state = 'CANCELLED'
        self.save()

    def _update_stock_quant(self, location, quantity_delta):
        """Update stock quantity at a location."""
        quant, created = StockQuant.objects.get_or_create(
            product=self.product,
            location=location,
            lot_number=self.lot_number,
            serial_number=self.serial_number,
            defaults={
                'quantity': Decimal('0'),
                'cost_price': self.unit_cost,
            }
        )

        quant.quantity += quantity_delta

        # Update cost price using weighted average
        if quantity_delta > 0 and self.unit_cost > 0:
            total_value = (quant.quantity - quantity_delta) * quant.cost_price
            total_value += quantity_delta * self.unit_cost
            if quant.quantity > 0:
                quant.cost_price = total_value / quant.quantity

        quant.save()

        # Remove quant if quantity becomes zero
        if quant.quantity <= 0:
            quant.delete()
