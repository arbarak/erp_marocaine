"""
Sales management models for ERP system.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, RegexValidator
from django.utils import timezone
from simple_history.models import HistoricalRecords
from decimal import Decimal
import uuid


class Customer(models.Model):
    """
    Customer model for client management with Moroccan compliance.
    """
    
    CUSTOMER_TYPES = [
        ('COMPANY', _('Company')),
        ('INDIVIDUAL', _('Individual')),
        ('GOVERNMENT', _('Government Entity')),
        ('NGO', _('Non-Governmental Organization')),
    ]
    
    PAYMENT_TERMS = [
        ('IMMEDIATE', _('Immediate')),
        ('NET_15', _('Net 15 days')),
        ('NET_30', _('Net 30 days')),
        ('NET_45', _('Net 45 days')),
        ('NET_60', _('Net 60 days')),
        ('NET_90', _('Net 90 days')),
        ('COD', _('Cash on Delivery')),
        ('PREPAID', _('Prepaid')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='customers',
        verbose_name=_('company')
    )
    
    # Basic information
    customer_code = models.CharField(
        _('customer code'),
        max_length=20,
        help_text=_('Unique customer code')
    )
    name = models.CharField(_('name'), max_length=200)
    customer_type = models.CharField(
        _('customer type'),
        max_length=15,
        choices=CUSTOMER_TYPES,
        default='COMPANY'
    )
    
    # Moroccan business identifiers
    ice = models.CharField(
        _('ICE'),
        max_length=15,
        blank=True,
        validators=[RegexValidator(r'^\d{15}$', _('ICE must be exactly 15 digits'))],
        help_text=_('Identifiant Commun de l\'Entreprise (15 digits)')
    )
    if_number = models.CharField(
        _('IF number'),
        max_length=8,
        blank=True,
        validators=[RegexValidator(r'^\d{7,8}$', _('IF must be 7 or 8 digits'))],
        help_text=_('Identifiant Fiscal (7-8 digits)')
    )
    rc = models.CharField(
        _('RC'),
        max_length=50,
        blank=True,
        help_text=_('Registre de Commerce')
    )
    
    # Contact information
    email = models.EmailField(_('email'), blank=True)
    phone = models.CharField(_('phone'), max_length=20, blank=True)
    mobile = models.CharField(_('mobile'), max_length=20, blank=True)
    fax = models.CharField(_('fax'), max_length=20, blank=True)
    website = models.URLField(_('website'), blank=True)
    
    # Address information
    address_line1 = models.CharField(_('address line 1'), max_length=200, blank=True)
    address_line2 = models.CharField(_('address line 2'), max_length=200, blank=True)
    city = models.CharField(_('city'), max_length=100, blank=True)
    postal_code = models.CharField(_('postal code'), max_length=20, blank=True)
    state_province = models.CharField(_('state/province'), max_length=100, blank=True)
    country = models.CharField(_('country'), max_length=100, default='Morocco')
    
    # Business terms
    payment_terms = models.CharField(
        _('payment terms'),
        max_length=15,
        choices=PAYMENT_TERMS,
        default='NET_30'
    )
    credit_limit = models.DecimalField(
        _('credit limit'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    currency = models.CharField(
        _('currency'),
        max_length=3,
        default='MAD',
        help_text=_('Default currency for this customer')
    )
    
    # Tax information
    is_subject_to_vat = models.BooleanField(
        _('subject to VAT'),
        default=True,
        help_text=_('Whether this customer is subject to VAT')
    )
    vat_rate = models.DecimalField(
        _('VAT rate'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('20.00'),
        help_text=_('Default VAT rate for this customer (%)')
    )
    is_subject_to_withholding = models.BooleanField(
        _('subject to withholding tax'),
        default=False,
        help_text=_('Whether sales to this customer are subject to withholding tax')
    )
    withholding_rate = models.DecimalField(
        _('withholding tax rate'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_('Withholding tax rate (%)')
    )
    
    # Sales settings
    sales_person = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_customers',
        verbose_name=_('sales person')
    )
    # price_list = models.ForeignKey(
    #     'catalog.PriceList',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='customers',
    #     verbose_name=_('price list')
    # )
    
    # Performance metrics
    rating = models.IntegerField(
        _('rating'),
        default=5,
        validators=[MinValueValidator(1)],
        help_text=_('Customer rating (1-10)')
    )
    
    # Status and settings
    is_active = models.BooleanField(_('is active'), default=True)
    is_approved = models.BooleanField(
        _('is approved'),
        default=True,
        help_text=_('Whether this customer is approved for sales')
    )
    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_customers',
        verbose_name=_('approved by')
    )
    approved_at = models.DateTimeField(_('approved at'), null=True, blank=True)
    
    # Notes
    notes = models.TextField(_('notes'), blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='created_customers',
        verbose_name=_('created by')
    )
    
    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Customer')
        verbose_name_plural = _('Customers')
        unique_together = ['company', 'customer_code']
        ordering = ['customer_code', 'name']
        indexes = [
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['customer_code']),
            models.Index(fields=['ice']),
            models.Index(fields=['if_number']),
            models.Index(fields=['is_approved']),
            models.Index(fields=['sales_person']),
        ]
    
    def __str__(self):
        return f"[{self.customer_code}] {self.name}"
    
    @property
    def display_name(self):
        """Get display name with code."""
        return f"[{self.customer_code}] {self.name}"
    
    @property
    def full_address(self):
        """Get formatted full address."""
        address_parts = []
        if self.address_line1:
            address_parts.append(self.address_line1)
        if self.address_line2:
            address_parts.append(self.address_line2)
        if self.city:
            address_parts.append(self.city)
        if self.postal_code:
            address_parts.append(self.postal_code)
        if self.state_province:
            address_parts.append(self.state_province)
        if self.country:
            address_parts.append(self.country)
        
        return ', '.join(address_parts)
    
    def get_outstanding_balance(self):
        """Get outstanding balance for this customer."""
        # This will be implemented when we add sales invoices
        return Decimal('0.00')
    
    def get_total_sales(self, year=None):
        """Get total sales amount for this customer."""
        # This will be implemented when we add sales orders
        return Decimal('0.00')
    
    def get_credit_available(self):
        """Get available credit for this customer."""
        outstanding = self.get_outstanding_balance()
        return self.credit_limit - outstanding


class CustomerContact(models.Model):
    """
    Customer contact person model.
    """
    
    CONTACT_TYPES = [
        ('PRIMARY', _('Primary Contact')),
        ('SALES', _('Sales Contact')),
        ('TECHNICAL', _('Technical Contact')),
        ('BILLING', _('Billing Contact')),
        ('SHIPPING', _('Shipping Contact')),
        ('OTHER', _('Other')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='contacts',
        verbose_name=_('customer')
    )
    
    # Contact information
    first_name = models.CharField(_('first name'), max_length=100)
    last_name = models.CharField(_('last name'), max_length=100)
    title = models.CharField(_('title'), max_length=100, blank=True)
    department = models.CharField(_('department'), max_length=100, blank=True)
    contact_type = models.CharField(
        _('contact type'),
        max_length=15,
        choices=CONTACT_TYPES,
        default='OTHER'
    )
    
    # Contact details
    email = models.EmailField(_('email'), blank=True)
    phone = models.CharField(_('phone'), max_length=20, blank=True)
    mobile = models.CharField(_('mobile'), max_length=20, blank=True)
    
    # Settings
    is_primary = models.BooleanField(
        _('is primary'),
        default=False,
        help_text=_('Primary contact for this customer')
    )
    is_active = models.BooleanField(_('is active'), default=True)
    
    # Notes
    notes = models.TextField(_('notes'), blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Customer Contact')
        verbose_name_plural = _('Customer Contacts')
        ordering = ['customer', 'last_name', 'first_name']
        indexes = [
            models.Index(fields=['customer', 'is_active']),
            models.Index(fields=['is_primary']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.customer.name})"
    
    @property
    def full_name(self):
        """Get full name."""
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        """Override save to handle primary contact logic."""
        if self.is_primary:
            # Ensure only one primary contact per customer
            CustomerContact.objects.filter(
                customer=self.customer,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        
        super().save(*args, **kwargs)


class CustomerPriceList(models.Model):
    """
    Customer price list model for special pricing.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='price_lists',
        verbose_name=_('customer')
    )
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.CASCADE,
        related_name='customer_prices',
        verbose_name=_('product')
    )

    # Pricing information
    unit_price = models.DecimalField(
        _('unit price'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))]
    )
    currency = models.CharField(
        _('currency'),
        max_length=3,
        default='MAD'
    )
    minimum_quantity = models.DecimalField(
        _('minimum quantity'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('1.000000'),
        validators=[MinValueValidator(Decimal('0.000001'))]
    )

    # Validity period
    valid_from = models.DateField(_('valid from'))
    valid_to = models.DateField(_('valid to'), null=True, blank=True)

    # Status
    is_active = models.BooleanField(_('is active'), default=True)

    # Notes
    notes = models.TextField(_('notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='created_customer_prices',
        verbose_name=_('created by')
    )

    class Meta:
        verbose_name = _('Customer Price List')
        verbose_name_plural = _('Customer Price Lists')
        unique_together = ['customer', 'product', 'valid_from']
        ordering = ['customer', 'product', '-valid_from']
        indexes = [
            models.Index(fields=['customer', 'product']),
            models.Index(fields=['valid_from', 'valid_to']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.customer.name} - {self.product.name}: {self.unit_price} {self.currency}"

    def is_valid_on_date(self, date):
        """Check if price is valid on a specific date."""
        if date < self.valid_from:
            return False
        if self.valid_to and date > self.valid_to:
            return False
        return True

    @classmethod
    def get_current_price(cls, customer, product, date=None):
        """Get current price for a customer-product combination."""
        from django.utils import timezone

        if date is None:
            date = timezone.now().date()

        try:
            return cls.objects.filter(
                customer=customer,
                product=product,
                is_active=True,
                valid_from__lte=date
            ).filter(
                models.Q(valid_to__isnull=True) | models.Q(valid_to__gte=date)
            ).order_by('-valid_from').first()
        except cls.DoesNotExist:
            return None


class SalesQuotation(models.Model):
    """
    Sales quotation model for customer quotes.
    """

    QUOTATION_STATES = [
        ('DRAFT', _('Draft')),
        ('SENT', _('Sent to Customer')),
        ('CONFIRMED', _('Confirmed by Customer')),
        ('EXPIRED', _('Expired')),
        ('CANCELLED', _('Cancelled')),
        ('CONVERTED', _('Converted to Order')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='sales_quotations',
        verbose_name=_('company')
    )

    # Document information
    quotation_number = models.CharField(_('quotation number'), max_length=100)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='quotations',
        verbose_name=_('customer')
    )

    # Dates
    quotation_date = models.DateField(_('quotation date'))
    valid_until = models.DateField(_('valid until'))

    # Status
    state = models.CharField(_('state'), max_length=15, choices=QUOTATION_STATES, default='DRAFT')

    # Delivery information
    delivery_location = models.ForeignKey(
        'inventory.Location',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='sales_quotations',
        verbose_name=_('delivery location')
    )
    delivery_address = models.TextField(_('delivery address'), blank=True)
    expected_delivery_date = models.DateField(_('expected delivery date'), null=True, blank=True)

    # Terms and conditions
    payment_terms = models.CharField(
        _('payment terms'),
        max_length=15,
        choices=Customer.PAYMENT_TERMS,
        default='NET_30'
    )
    delivery_terms = models.CharField(_('delivery terms'), max_length=200, blank=True)

    # Financial information
    currency = models.CharField(_('currency'), max_length=3, default='MAD')
    subtotal = models.DecimalField(
        _('subtotal'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    discount_amount = models.DecimalField(
        _('discount amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    tax_amount = models.DecimalField(
        _('tax amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_amount = models.DecimalField(
        _('total amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )

    # User information
    sales_person = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='sales_quotations',
        verbose_name=_('sales person')
    )
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='created_quotations',
        verbose_name=_('created by')
    )

    # Customer confirmation
    confirmed_by_customer = models.BooleanField(_('confirmed by customer'), default=False)
    customer_confirmation_date = models.DateTimeField(_('customer confirmation date'), null=True, blank=True)
    customer_reference = models.CharField(_('customer reference'), max_length=100, blank=True)

    # Notes
    notes = models.TextField(_('notes'), blank=True)
    terms_and_conditions = models.TextField(_('terms and conditions'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    # History tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _('Sales Quotation')
        verbose_name_plural = _('Sales Quotations')
        unique_together = ['company', 'quotation_number']
        ordering = ['-quotation_date', '-created_at']
        indexes = [
            models.Index(fields=['company', 'state']),
            models.Index(fields=['customer', 'state']),
            models.Index(fields=['quotation_date']),
            models.Index(fields=['valid_until']),
            models.Index(fields=['sales_person']),
        ]

    def __str__(self):
        return f"{self.quotation_number} - {self.customer.name}"

    def send_to_customer(self):
        """Send quotation to customer."""
        if self.state != 'DRAFT':
            raise ValueError(_('Only draft quotations can be sent'))

        self.state = 'SENT'
        self.save()

    def confirm_by_customer(self, customer_reference=''):
        """Confirm quotation by customer."""
        if self.state != 'SENT':
            raise ValueError(_('Only sent quotations can be confirmed'))

        self.state = 'CONFIRMED'
        self.confirmed_by_customer = True
        self.customer_confirmation_date = timezone.now()
        self.customer_reference = customer_reference
        self.save()

    def cancel(self, reason=''):
        """Cancel the quotation."""
        if self.state in ['CONVERTED']:
            raise ValueError(_('Cannot cancel converted quotations'))

        self.state = 'CANCELLED'
        if reason:
            self.notes = f"{self.notes}\n\nCancellation reason: {reason}".strip()
        self.save()

    def is_expired(self):
        """Check if quotation has expired."""
        from django.utils import timezone
        return timezone.now().date() > self.valid_until

    def calculate_totals(self):
        """Calculate quotation totals from lines using tax engine."""
        from libs.tax_engine.calculator import MoroccanTaxCalculator, TaxLineItem

        lines = self.lines.all()
        self.subtotal = sum(line.total_price for line in lines)
        discounted_subtotal = self.subtotal - self.discount_amount

        # Use tax engine for accurate calculation
        if lines.exists():
            calculator = MoroccanTaxCalculator(
                company=self.company,
                calculation_date=self.quotation_date
            )

            # Convert quotation lines to tax line items
            tax_line_items = []
            for line in lines:
                tax_line_items.append(TaxLineItem(
                    product_id=str(line.product.id),
                    description=line.description or line.product.name,
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    discount_amount=line.discount_amount,
                    tax_exempt=False
                ))

            # Calculate taxes
            tax_summary = calculator.calculate_line_taxes(
                line_items=tax_line_items,
                transaction_type='SALE',
                customer_type='COMPANY',
                apply_withholding=False
            )

            self.tax_amount = tax_summary.total_tax_amount
            self.total_amount = tax_summary.grand_total
        else:
            self.tax_amount = Decimal('0.00')
            self.total_amount = discounted_subtotal

        self.save()


class SalesQuotationLine(models.Model):
    """
    Sales quotation line item model.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation = models.ForeignKey(
        SalesQuotation,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('quotation')
    )

    # Product information
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        related_name='quotation_lines',
        verbose_name=_('product')
    )
    description = models.TextField(
        _('description'),
        blank=True,
        help_text=_('Additional description or specifications')
    )

    # Quantity and pricing
    quantity = models.DecimalField(
        _('quantity'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0.000001'))]
    )
    uom = models.ForeignKey(
        'catalog.UnitOfMeasure',
        on_delete=models.PROTECT,
        related_name='quotation_lines',
        verbose_name=_('unit of measure')
    )
    unit_price = models.DecimalField(
        _('unit price'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))]
    )
    discount_percent = models.DecimalField(
        _('discount (%)'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    discount_amount = models.DecimalField(
        _('discount amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    total_price = models.DecimalField(
        _('total price'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )

    # Delivery
    expected_delivery_date = models.DateField(_('expected delivery date'), null=True, blank=True)

    # Tax information
    tax_rate = models.DecimalField(
        _('tax rate'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('20.00'),
        help_text=_('Tax rate (%)')
    )

    # Notes
    notes = models.TextField(_('notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Sales Quotation Line')
        verbose_name_plural = _('Sales Quotation Lines')
        ordering = ['quotation', 'product']
        indexes = [
            models.Index(fields=['quotation', 'product']),
        ]

    def __str__(self):
        return f"{self.quotation.quotation_number} - {self.product.name}: {self.quantity}"

    def save(self, *args, **kwargs):
        """Calculate total price on save."""
        line_total = self.quantity * self.unit_price

        # Apply discount
        if self.discount_percent > 0:
            self.discount_amount = line_total * (self.discount_percent / 100)

        self.total_price = line_total - self.discount_amount
        super().save(*args, **kwargs)


class SalesOrder(models.Model):
    """
    Sales order model for confirmed customer orders.
    """

    ORDER_STATES = [
        ('DRAFT', _('Draft')),
        ('CONFIRMED', _('Confirmed')),
        ('IN_PROGRESS', _('In Progress')),
        ('PARTIALLY_DELIVERED', _('Partially Delivered')),
        ('DELIVERED', _('Fully Delivered')),
        ('CANCELLED', _('Cancelled')),
        ('CLOSED', _('Closed')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='sales_orders',
        verbose_name=_('company')
    )

    # Document information
    order_number = models.CharField(_('order number'), max_length=100)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='sales_orders',
        verbose_name=_('customer')
    )

    # Reference documents
    quotation = models.ForeignKey(
        SalesQuotation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales_orders',
        verbose_name=_('quotation')
    )
    customer_reference = models.CharField(_('customer reference'), max_length=100, blank=True)

    # Dates
    order_date = models.DateField(_('order date'))
    requested_delivery_date = models.DateField(_('requested delivery date'))
    confirmed_delivery_date = models.DateField(_('confirmed delivery date'), null=True, blank=True)

    # Status
    state = models.CharField(_('state'), max_length=20, choices=ORDER_STATES, default='DRAFT')

    # Delivery information
    delivery_location = models.ForeignKey(
        'inventory.Location',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='sales_orders',
        verbose_name=_('delivery location')
    )
    delivery_address = models.TextField(_('delivery address'), blank=True)
    shipping_method = models.CharField(_('shipping method'), max_length=100, blank=True)

    # Terms and conditions
    payment_terms = models.CharField(
        _('payment terms'),
        max_length=15,
        choices=Customer.PAYMENT_TERMS,
        default='NET_30'
    )
    delivery_terms = models.CharField(_('delivery terms'), max_length=200, blank=True)

    # Financial information
    currency = models.CharField(_('currency'), max_length=3, default='MAD')
    subtotal = models.DecimalField(
        _('subtotal'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    discount_amount = models.DecimalField(
        _('discount amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    tax_amount = models.DecimalField(
        _('tax amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_amount = models.DecimalField(
        _('total amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )

    # User information
    sales_person = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='sales_orders',
        verbose_name=_('sales person')
    )
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='created_sales_orders',
        verbose_name=_('created by')
    )

    # Notes
    notes = models.TextField(_('notes'), blank=True)
    terms_and_conditions = models.TextField(_('terms and conditions'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    # History tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _('Sales Order')
        verbose_name_plural = _('Sales Orders')
        unique_together = ['company', 'order_number']
        ordering = ['-order_date', '-created_at']
        indexes = [
            models.Index(fields=['company', 'state']),
            models.Index(fields=['customer', 'state']),
            models.Index(fields=['order_date']),
            models.Index(fields=['requested_delivery_date']),
            models.Index(fields=['sales_person']),
        ]

    def __str__(self):
        return f"{self.order_number} - {self.customer.name}"

    def confirm(self):
        """Confirm the sales order."""
        if self.state != 'DRAFT':
            raise ValueError(_('Only draft orders can be confirmed'))

        self.state = 'CONFIRMED'
        self.save()

    def start_processing(self):
        """Start processing the order."""
        if self.state != 'CONFIRMED':
            raise ValueError(_('Only confirmed orders can be processed'))

        self.state = 'IN_PROGRESS'
        self.save()

    def cancel(self, reason=''):
        """Cancel the sales order."""
        if self.state in ['DELIVERED', 'CLOSED']:
            raise ValueError(_('Cannot cancel delivered or closed orders'))

        self.state = 'CANCELLED'
        if reason:
            self.notes = f"{self.notes}\n\nCancellation reason: {reason}".strip()
        self.save()

    def calculate_totals(self):
        """Calculate order totals from lines using tax engine."""
        from libs.tax_engine.calculator import MoroccanTaxCalculator, TaxLineItem

        lines = self.lines.all()
        self.subtotal = sum(line.total_price for line in lines)
        discounted_subtotal = self.subtotal - self.discount_amount

        # Use tax engine for accurate calculation
        if lines.exists():
            calculator = MoroccanTaxCalculator(
                company=self.company,
                calculation_date=self.order_date
            )

            # Convert order lines to tax line items
            tax_line_items = []
            for line in lines:
                tax_line_items.append(TaxLineItem(
                    product_id=str(line.product.id),
                    description=line.description or line.product.name,
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    discount_amount=line.discount_amount,
                    tax_exempt=False
                ))

            # Calculate taxes
            tax_summary = calculator.calculate_line_taxes(
                line_items=tax_line_items,
                transaction_type='SALE',
                customer_type='COMPANY',
                apply_withholding=False
            )

            self.tax_amount = tax_summary.total_tax_amount
            self.total_amount = tax_summary.grand_total
        else:
            self.tax_amount = Decimal('0.00')
            self.total_amount = discounted_subtotal

        self.save()

    def check_delivery_status(self):
        """Check and update delivery status based on delivered quantities."""
        lines = self.lines.all()
        total_lines = lines.count()

        if total_lines == 0:
            return

        fully_delivered_lines = 0
        partially_delivered_lines = 0

        for line in lines:
            if line.quantity_delivered >= line.quantity:
                fully_delivered_lines += 1
            elif line.quantity_delivered > 0:
                partially_delivered_lines += 1

        if fully_delivered_lines == total_lines:
            self.state = 'DELIVERED'
        elif fully_delivered_lines > 0 or partially_delivered_lines > 0:
            self.state = 'PARTIALLY_DELIVERED'

        self.save()


class SalesOrderLine(models.Model):
    """
    Sales order line item model.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('sales order')
    )

    # Product information
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        related_name='sales_order_lines',
        verbose_name=_('product')
    )
    description = models.TextField(
        _('description'),
        blank=True,
        help_text=_('Additional description or specifications')
    )

    # Quantity and pricing
    quantity = models.DecimalField(
        _('quantity'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0.000001'))]
    )
    uom = models.ForeignKey(
        'catalog.UnitOfMeasure',
        on_delete=models.PROTECT,
        related_name='sales_order_lines',
        verbose_name=_('unit of measure')
    )
    unit_price = models.DecimalField(
        _('unit price'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))]
    )
    discount_percent = models.DecimalField(
        _('discount (%)'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    discount_amount = models.DecimalField(
        _('discount amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    total_price = models.DecimalField(
        _('total price'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )

    # Delivery tracking
    quantity_delivered = models.DecimalField(
        _('quantity delivered'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('0.000000'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    quantity_pending = models.DecimalField(
        _('quantity pending'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('0.000000'),
        validators=[MinValueValidator(Decimal('0'))]
    )

    # Delivery
    requested_delivery_date = models.DateField(_('requested delivery date'), null=True, blank=True)

    # Tax information
    tax_rate = models.DecimalField(
        _('tax rate'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('20.00'),
        help_text=_('Tax rate (%)')
    )

    # Notes
    notes = models.TextField(_('notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Sales Order Line')
        verbose_name_plural = _('Sales Order Lines')
        ordering = ['sales_order', 'product']
        indexes = [
            models.Index(fields=['sales_order', 'product']),
        ]

    def __str__(self):
        return f"{self.sales_order.order_number} - {self.product.name}: {self.quantity}"

    @property
    def quantity_remaining(self):
        """Get remaining quantity to deliver."""
        return self.quantity - self.quantity_delivered

    @property
    def is_fully_delivered(self):
        """Check if line is fully delivered."""
        return self.quantity_delivered >= self.quantity

    def save(self, *args, **kwargs):
        """Calculate total price and pending quantity on save."""
        line_total = self.quantity * self.unit_price

        # Apply discount
        if self.discount_percent > 0:
            self.discount_amount = line_total * (self.discount_percent / 100)

        self.total_price = line_total - self.discount_amount
        self.quantity_pending = self.quantity - self.quantity_delivered
        super().save(*args, **kwargs)


class DeliveryNote(models.Model):
    """
    Delivery note model for shipping goods to customers.
    """

    DELIVERY_STATES = [
        ('DRAFT', _('Draft')),
        ('READY', _('Ready for Delivery')),
        ('IN_TRANSIT', _('In Transit')),
        ('DELIVERED', _('Delivered')),
        ('RETURNED', _('Returned')),
        ('CANCELLED', _('Cancelled')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='delivery_notes',
        verbose_name=_('company')
    )

    # Document information
    delivery_number = models.CharField(_('delivery number'), max_length=100)
    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.PROTECT,
        related_name='delivery_notes',
        verbose_name=_('sales order')
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='delivery_notes',
        verbose_name=_('customer')
    )

    # Delivery information
    delivery_date = models.DateField(_('delivery date'))
    actual_delivery_date = models.DateField(_('actual delivery date'), null=True, blank=True)
    delivery_address = models.TextField(_('delivery address'))

    # Status
    state = models.CharField(_('state'), max_length=15, choices=DELIVERY_STATES, default='DRAFT')

    # Shipping information
    shipping_method = models.CharField(_('shipping method'), max_length=100, blank=True)
    tracking_number = models.CharField(_('tracking number'), max_length=100, blank=True)
    carrier = models.CharField(_('carrier'), max_length=100, blank=True)
    vehicle_number = models.CharField(_('vehicle number'), max_length=50, blank=True)
    driver_name = models.CharField(_('driver name'), max_length=100, blank=True)
    driver_phone = models.CharField(_('driver phone'), max_length=20, blank=True)

    # Source location
    source_location = models.ForeignKey(
        'inventory.Location',
        on_delete=models.PROTECT,
        related_name='delivery_notes',
        verbose_name=_('source location')
    )

    # User information
    prepared_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='prepared_deliveries',
        verbose_name=_('prepared by')
    )
    delivered_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delivered_deliveries',
        verbose_name=_('delivered by')
    )

    # Customer confirmation
    received_by_customer = models.CharField(_('received by customer'), max_length=100, blank=True)
    customer_signature = models.TextField(_('customer signature'), blank=True)
    delivery_confirmation_date = models.DateTimeField(_('delivery confirmation date'), null=True, blank=True)

    # Notes
    notes = models.TextField(_('notes'), blank=True)
    delivery_instructions = models.TextField(_('delivery instructions'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    # History tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _('Delivery Note')
        verbose_name_plural = _('Delivery Notes')
        unique_together = ['company', 'delivery_number']
        ordering = ['-delivery_date', '-created_at']
        indexes = [
            models.Index(fields=['company', 'state']),
            models.Index(fields=['sales_order']),
            models.Index(fields=['customer']),
            models.Index(fields=['delivery_date']),
            models.Index(fields=['tracking_number']),
        ]

    def __str__(self):
        return f"{self.delivery_number} - {self.sales_order.order_number}"

    def prepare_for_delivery(self, user):
        """Prepare delivery and create stock moves."""
        if self.state != 'DRAFT':
            raise ValueError(_('Only draft deliveries can be prepared'))

        from modules.inventory.models import StockMove, StockMoveLine
        from core.sequences.services import SequenceService

        # Generate stock move number
        _, move_number = SequenceService.get_next_number(
            company=self.company,
            document_type='DELIVERY',
            user=user
        )

        # Create stock move for delivery
        stock_move = StockMove.objects.create(
            company=self.company,
            name=move_number,
            move_type='OUT',
            state='DRAFT',
            scheduled_date=timezone.now(),
            origin_document='DELIVERY',
            origin_reference=self.delivery_number,
            source_location=self.source_location,
            destination_location=self.source_location,  # Customer location would be external
            created_by=user,
            notes=f"Delivery: {self.delivery_number}"
        )

        # Create move lines for delivery quantities
        for delivery_line in self.lines.all():
            if delivery_line.quantity_to_deliver > 0:
                StockMoveLine.objects.create(
                    move=stock_move,
                    product=delivery_line.product,
                    quantity_planned=delivery_line.quantity_to_deliver,
                    quantity_done=delivery_line.quantity_to_deliver,
                    lot_number=delivery_line.lot_number,
                    serial_number=delivery_line.serial_number
                )

                # Update SO line delivered quantity
                delivery_line.so_line.quantity_delivered += delivery_line.quantity_to_deliver
                delivery_line.so_line.save()

        # Confirm and process the stock move
        stock_move.confirm(user)
        stock_move.process(user)

        # Update delivery status
        self.state = 'READY'
        self.prepared_by = user
        self.save()

        # Update SO delivery status
        self.sales_order.check_delivery_status()

    def mark_in_transit(self):
        """Mark delivery as in transit."""
        if self.state != 'READY':
            raise ValueError(_('Only ready deliveries can be marked in transit'))

        self.state = 'IN_TRANSIT'
        self.save()

    def confirm_delivery(self, received_by='', signature=''):
        """Confirm delivery by customer."""
        if self.state != 'IN_TRANSIT':
            raise ValueError(_('Only in-transit deliveries can be confirmed'))

        self.state = 'DELIVERED'
        self.actual_delivery_date = timezone.now().date()
        self.received_by_customer = received_by
        self.customer_signature = signature
        self.delivery_confirmation_date = timezone.now()
        self.save()


class DeliveryNoteLine(models.Model):
    """
    Delivery note line item model.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delivery_note = models.ForeignKey(
        DeliveryNote,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('delivery note')
    )
    so_line = models.ForeignKey(
        SalesOrderLine,
        on_delete=models.PROTECT,
        related_name='delivery_lines',
        verbose_name=_('SO line')
    )

    # Product information (denormalized for performance)
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        related_name='delivery_lines',
        verbose_name=_('product')
    )

    # Quantities
    quantity_ordered = models.DecimalField(
        _('quantity ordered'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0'))]
    )
    quantity_to_deliver = models.DecimalField(
        _('quantity to deliver'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0'))]
    )
    quantity_delivered = models.DecimalField(
        _('quantity delivered'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('0.000000'),
        validators=[MinValueValidator(Decimal('0'))]
    )

    # Lot/Serial tracking
    lot_number = models.CharField(_('lot number'), max_length=50, blank=True)
    serial_number = models.CharField(_('serial number'), max_length=50, blank=True)

    # Notes
    notes = models.TextField(_('notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Delivery Note Line')
        verbose_name_plural = _('Delivery Note Lines')
        unique_together = ['delivery_note', 'so_line']
        ordering = ['delivery_note', 'product']
        indexes = [
            models.Index(fields=['delivery_note', 'product']),
        ]

    def __str__(self):
        return f"{self.delivery_note.delivery_number} - {self.product.name}: {self.quantity_to_deliver}"


class ReturnNote(models.Model):
    """
    Return note model for customer returns.
    """

    RETURN_STATES = [
        ('DRAFT', _('Draft')),
        ('RECEIVED', _('Received')),
        ('QUALITY_CHECK', _('Quality Check')),
        ('ACCEPTED', _('Accepted')),
        ('REJECTED', _('Rejected')),
        ('PARTIAL', _('Partially Accepted')),
        ('POSTED', _('Posted to Inventory')),
    ]

    RETURN_REASONS = [
        ('DEFECTIVE', _('Defective Product')),
        ('WRONG_ITEM', _('Wrong Item Delivered')),
        ('DAMAGED', _('Damaged in Transit')),
        ('NOT_NEEDED', _('No Longer Needed')),
        ('QUALITY_ISSUE', _('Quality Issue')),
        ('OTHER', _('Other')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='return_notes',
        verbose_name=_('company')
    )

    # Document information
    return_number = models.CharField(_('return number'), max_length=100)
    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='return_notes',
        verbose_name=_('sales order')
    )
    delivery_note = models.ForeignKey(
        DeliveryNote,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='return_notes',
        verbose_name=_('delivery note')
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='return_notes',
        verbose_name=_('customer')
    )

    # Return information
    return_date = models.DateField(_('return date'))
    return_reason = models.CharField(
        _('return reason'),
        max_length=15,
        choices=RETURN_REASONS,
        default='OTHER'
    )
    return_description = models.TextField(_('return description'), blank=True)

    # Status
    state = models.CharField(_('state'), max_length=15, choices=RETURN_STATES, default='DRAFT')

    # Location
    return_location = models.ForeignKey(
        'inventory.Location',
        on_delete=models.PROTECT,
        related_name='return_notes',
        verbose_name=_('return location')
    )

    # Quality control
    quality_check_required = models.BooleanField(
        _('quality check required'),
        default=True
    )
    quality_check_passed = models.BooleanField(
        _('quality check passed'),
        default=False
    )
    quality_check_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quality_checked_returns',
        verbose_name=_('quality checked by')
    )
    quality_check_date = models.DateTimeField(_('quality check date'), null=True, blank=True)
    quality_notes = models.TextField(_('quality notes'), blank=True)

    # User information
    received_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='received_returns',
        verbose_name=_('received by')
    )
    posted_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_returns',
        verbose_name=_('posted by')
    )
    posted_at = models.DateTimeField(_('posted at'), null=True, blank=True)

    # Notes
    notes = models.TextField(_('notes'), blank=True)
    rejection_reason = models.TextField(_('rejection reason'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    # History tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _('Return Note')
        verbose_name_plural = _('Return Notes')
        unique_together = ['company', 'return_number']
        ordering = ['-return_date', '-created_at']
        indexes = [
            models.Index(fields=['company', 'state']),
            models.Index(fields=['sales_order']),
            models.Index(fields=['customer']),
            models.Index(fields=['return_date']),
            models.Index(fields=['return_reason']),
        ]

    def __str__(self):
        return f"{self.return_number} - {self.customer.name}"

    def perform_quality_check(self, user, passed=True, notes=''):
        """Perform quality check on the return."""
        if self.state != 'QUALITY_CHECK':
            raise ValueError(_('Quality check can only be performed on returns in quality check state'))

        self.quality_check_passed = passed
        self.quality_check_by = user
        self.quality_check_date = timezone.now()
        self.quality_notes = notes

        if passed:
            # Check if all lines are accepted
            all_accepted = all(line.quality_status == 'ACCEPTED' for line in self.lines.all())
            if all_accepted:
                self.state = 'ACCEPTED'
            else:
                self.state = 'PARTIAL'
        else:
            self.state = 'REJECTED'

        self.save()

    def post_to_inventory(self, user):
        """Post the return to inventory."""
        if self.state not in ['ACCEPTED', 'PARTIAL']:
            raise ValueError(_('Only accepted returns can be posted to inventory'))

        from modules.inventory.models import StockMove, StockMoveLine
        from core.sequences.services import SequenceService

        # Generate stock move number
        _, move_number = SequenceService.get_next_number(
            company=self.company,
            document_type='RETURN',
            user=user
        )

        # Create stock move for return
        stock_move = StockMove.objects.create(
            company=self.company,
            name=move_number,
            move_type='IN',
            state='DRAFT',
            scheduled_date=timezone.now(),
            origin_document='RETURN',
            origin_reference=self.return_number,
            source_location=self.return_location,  # Dummy source for return
            destination_location=self.return_location,
            created_by=user,
            notes=f"Customer return: {self.return_number}"
        )

        # Create move lines for accepted quantities
        for return_line in self.lines.filter(quality_status='ACCEPTED'):
            if return_line.quantity_accepted > 0:
                StockMoveLine.objects.create(
                    move=stock_move,
                    product=return_line.product,
                    quantity_planned=return_line.quantity_accepted,
                    quantity_done=return_line.quantity_accepted,
                    lot_number=return_line.lot_number,
                    serial_number=return_line.serial_number
                )

        # Confirm and process the stock move
        stock_move.confirm(user)
        stock_move.process(user)

        # Update return status
        self.state = 'POSTED'
        self.posted_by = user
        self.posted_at = timezone.now()
        self.save()


class ReturnNoteLine(models.Model):
    """
    Return note line item model.
    """

    QUALITY_STATUS = [
        ('PENDING', _('Pending')),
        ('ACCEPTED', _('Accepted')),
        ('REJECTED', _('Rejected')),
        ('PARTIAL', _('Partially Accepted')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    return_note = models.ForeignKey(
        ReturnNote,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('return note')
    )
    delivery_line = models.ForeignKey(
        DeliveryNoteLine,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='return_lines',
        verbose_name=_('delivery line')
    )

    # Product information
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        related_name='return_lines',
        verbose_name=_('product')
    )

    # Quantities
    quantity_delivered = models.DecimalField(
        _('quantity delivered'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0'))]
    )
    quantity_returned = models.DecimalField(
        _('quantity returned'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0'))]
    )
    quantity_accepted = models.DecimalField(
        _('quantity accepted'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('0.000000'),
        validators=[MinValueValidator(Decimal('0'))]
    )
    quantity_rejected = models.DecimalField(
        _('quantity rejected'),
        max_digits=15,
        decimal_places=6,
        default=Decimal('0.000000'),
        validators=[MinValueValidator(Decimal('0'))]
    )

    # Quality control
    quality_status = models.CharField(
        _('quality status'),
        max_length=15,
        choices=QUALITY_STATUS,
        default='PENDING'
    )
    quality_notes = models.TextField(_('quality notes'), blank=True)

    # Lot/Serial tracking
    lot_number = models.CharField(_('lot number'), max_length=50, blank=True)
    serial_number = models.CharField(_('serial number'), max_length=50, blank=True)

    # Return reason
    return_reason = models.CharField(
        _('return reason'),
        max_length=15,
        choices=ReturnNote.RETURN_REASONS,
        default='OTHER'
    )
    damage_description = models.TextField(_('damage description'), blank=True)

    # Notes
    notes = models.TextField(_('notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Return Note Line')
        verbose_name_plural = _('Return Note Lines')
        ordering = ['return_note', 'product']
        indexes = [
            models.Index(fields=['return_note', 'product']),
            models.Index(fields=['quality_status']),
        ]

    def __str__(self):
        return f"{self.return_note.return_number} - {self.product.name}: {self.quantity_returned}"

    def accept_quantity(self, quantity, notes=''):
        """Accept a specific quantity."""
        if quantity > self.quantity_returned:
            raise ValueError(_('Cannot accept more than returned quantity'))

        if quantity < 0:
            raise ValueError(_('Accepted quantity cannot be negative'))

        self.quantity_accepted = quantity
        self.quantity_rejected = self.quantity_returned - quantity

        if quantity == 0:
            self.quality_status = 'REJECTED'
        elif quantity == self.quantity_returned:
            self.quality_status = 'ACCEPTED'
        else:
            self.quality_status = 'PARTIAL'

        if notes:
            self.quality_notes = notes

        self.save()

    def save(self, *args, **kwargs):
        """Validate quantities on save."""
        if self.quantity_accepted + self.quantity_rejected > self.quantity_returned:
            raise ValueError(_('Accepted + Rejected quantities cannot exceed returned quantity'))

        super().save(*args, **kwargs)
