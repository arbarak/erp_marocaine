"""
Product catalog models for ERP system.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from simple_history.models import HistoricalRecords
from decimal import Decimal
import uuid


class Category(models.Model):
    """
    Product category model with hierarchical structure.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='categories',
        verbose_name=_('company')
    )
    
    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True)
    code = models.CharField(
        _('code'),
        max_length=20,
        help_text=_('Unique code for this category')
    )
    
    # Hierarchical structure
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('parent category')
    )
    
    # Display settings
    image = models.ImageField(_('image'), upload_to='categories/', blank=True)
    is_active = models.BooleanField(_('is active'), default=True)
    sort_order = models.PositiveIntegerField(_('sort order'), default=0)
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        unique_together = ['company', 'code']
        ordering = ['sort_order', 'name']
        indexes = [
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['parent']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def full_path(self):
        """Get the full category path."""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name
    
    def get_descendants(self):
        """Get all descendant categories."""
        descendants = []
        for child in self.children.all():
            descendants.append(child)
            descendants.extend(child.get_descendants())
        return descendants


class UnitOfMeasure(models.Model):
    """
    Unit of measure model for products.
    """
    
    UOM_TYPES = [
        ('UNIT', _('Unit')),
        ('WEIGHT', _('Weight')),
        ('VOLUME', _('Volume')),
        ('LENGTH', _('Length')),
        ('AREA', _('Area')),
        ('TIME', _('Time')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='units_of_measure',
        verbose_name=_('company')
    )
    
    name = models.CharField(_('name'), max_length=50)
    symbol = models.CharField(_('symbol'), max_length=10)
    type = models.CharField(_('type'), max_length=10, choices=UOM_TYPES)
    
    # Conversion settings
    base_unit = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='derived_units',
        verbose_name=_('base unit')
    )
    conversion_factor = models.DecimalField(
        _('conversion factor'),
        max_digits=12,
        decimal_places=6,
        default=Decimal('1.000000'),
        help_text=_('Factor to convert to base unit')
    )
    
    # Settings
    is_active = models.BooleanField(_('is active'), default=True)
    rounding_precision = models.PositiveIntegerField(
        _('rounding precision'),
        default=2,
        validators=[MinValueValidator(0), MaxValueValidator(6)]
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Unit of Measure')
        verbose_name_plural = _('Units of Measure')
        unique_together = ['company', 'symbol']
        ordering = ['type', 'name']
        indexes = [
            models.Index(fields=['company', 'type', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.symbol})"
    
    def convert_to_base(self, quantity):
        """Convert quantity to base unit."""
        return quantity * self.conversion_factor
    
    def convert_from_base(self, quantity):
        """Convert quantity from base unit."""
        if self.conversion_factor == 0:
            return Decimal('0')
        return quantity / self.conversion_factor


class Product(models.Model):
    """
    Product model for catalog management.
    """
    
    PRODUCT_TYPES = [
        ('PRODUCT', _('Stockable Product')),
        ('SERVICE', _('Service')),
        ('CONSUMABLE', _('Consumable')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('company')
    )
    
    # Basic information
    name = models.CharField(_('name'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    internal_reference = models.CharField(
        _('internal reference'),
        max_length=50,
        help_text=_('Internal product code/SKU')
    )
    barcode = models.CharField(
        _('barcode'),
        max_length=50,
        blank=True,
        help_text=_('Product barcode (EAN13, UPC, etc.)')
    )
    
    # Classification
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name=_('category')
    )
    product_type = models.CharField(
        _('product type'),
        max_length=15,
        choices=PRODUCT_TYPES,
        default='PRODUCT'
    )
    
    # Units and measurements
    uom = models.ForeignKey(
        UnitOfMeasure,
        on_delete=models.PROTECT,
        related_name='products',
        verbose_name=_('unit of measure')
    )
    purchase_uom = models.ForeignKey(
        UnitOfMeasure,
        on_delete=models.PROTECT,
        related_name='products_purchase',
        null=True,
        blank=True,
        verbose_name=_('purchase unit of measure')
    )
    
    # Pricing
    list_price = models.DecimalField(
        _('list price'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    cost_price = models.DecimalField(
        _('cost price'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Tax configuration
    tax_profile = models.ForeignKey(
        'tax_engine.TaxProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name=_('tax profile')
    )
    
    # Inventory settings
    track_inventory = models.BooleanField(
        _('track inventory'),
        default=True,
        help_text=_('Whether to track inventory for this product')
    )
    
    # Media
    image = models.ImageField(_('image'), upload_to='products/', blank=True)
    
    # Status
    is_active = models.BooleanField(_('is active'), default=True)
    can_be_sold = models.BooleanField(_('can be sold'), default=True)
    can_be_purchased = models.BooleanField(_('can be purchased'), default=True)
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Product')
        verbose_name_plural = _('Products')
        unique_together = ['company', 'internal_reference']
        ordering = ['name']
        indexes = [
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['company', 'product_type']),
            models.Index(fields=['internal_reference']),
            models.Index(fields=['barcode']),
        ]
    
    def __str__(self):
        return f"[{self.internal_reference}] {self.name}"
    
    @property
    def display_name(self):
        """Get display name with reference."""
        return f"[{self.internal_reference}] {self.name}"
    
    def get_current_stock(self, location=None):
        """Get current stock quantity."""
        from modules.inventory.models import StockQuant
        
        queryset = StockQuant.objects.filter(
            product=self,
            location__warehouse__company=self.company
        )
        
        if location:
            queryset = queryset.filter(location=location)
        
        return queryset.aggregate(
            total=models.Sum('quantity')
        )['total'] or Decimal('0')
    
    def get_available_stock(self, location=None):
        """Get available stock (on hand - reserved)."""
        from modules.inventory.models import StockQuant
        
        queryset = StockQuant.objects.filter(
            product=self,
            location__warehouse__company=self.company
        )
        
        if location:
            queryset = queryset.filter(location=location)
        
        result = queryset.aggregate(
            on_hand=models.Sum('quantity'),
            reserved=models.Sum('reserved_quantity')
        )
        
        on_hand = result['on_hand'] or Decimal('0')
        reserved = result['reserved'] or Decimal('0')
        
        return on_hand - reserved
