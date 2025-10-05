"""
Purchasing management models for ERP system.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, RegexValidator
from django.utils import timezone
from simple_history.models import HistoricalRecords
from decimal import Decimal
import uuid


class Supplier(models.Model):
    """
    Supplier model for vendor management with Moroccan compliance.
    """
    
    SUPPLIER_TYPES = [
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
        related_name='suppliers',
        verbose_name=_('company')
    )
    
    # Basic information
    name = models.CharField(_('name'), max_length=200)
    supplier_code = models.CharField(
        _('supplier code'),
        max_length=20,
        help_text=_('Unique supplier code')
    )
    supplier_type = models.CharField(
        _('supplier type'),
        max_length=15,
        choices=SUPPLIER_TYPES,
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
        help_text=_('Default currency for this supplier')
    )
    
    # Tax information
    is_subject_to_vat = models.BooleanField(
        _('subject to VAT'),
        default=True,
        help_text=_('Whether this supplier is subject to VAT')
    )
    vat_rate = models.DecimalField(
        _('VAT rate'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('20.00'),
        help_text=_('Default VAT rate for this supplier (%)')
    )
    is_subject_to_withholding = models.BooleanField(
        _('subject to withholding tax'),
        default=False,
        help_text=_('Whether purchases from this supplier are subject to withholding tax')
    )
    withholding_rate = models.DecimalField(
        _('withholding tax rate'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_('Withholding tax rate (%)')
    )
    
    # Performance metrics
    rating = models.IntegerField(
        _('rating'),
        default=5,
        validators=[MinValueValidator(1)],
        help_text=_('Supplier rating (1-10)')
    )
    
    # Status and settings
    is_active = models.BooleanField(_('is active'), default=True)
    is_approved = models.BooleanField(
        _('is approved'),
        default=False,
        help_text=_('Whether this supplier is approved for purchasing')
    )
    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_suppliers',
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
        related_name='created_suppliers',
        verbose_name=_('created by')
    )
    
    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Supplier')
        verbose_name_plural = _('Suppliers')
        unique_together = ['company', 'supplier_code']
        ordering = ['supplier_code', 'name']
        indexes = [
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['supplier_code']),
            models.Index(fields=['ice']),
            models.Index(fields=['if_number']),
            models.Index(fields=['is_approved']),
        ]
    
    def __str__(self):
        return f"[{self.supplier_code}] {self.name}"
    
    @property
    def display_name(self):
        """Get display name with code."""
        return f"[{self.supplier_code}] {self.name}"
    
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
        """Get outstanding balance for this supplier."""
        # This will be implemented when we add purchase invoices
        return Decimal('0.00')
    
    def get_total_purchases(self, year=None):
        """Get total purchase amount for this supplier."""
        # This will be implemented when we add purchase orders
        return Decimal('0.00')


class SupplierContact(models.Model):
    """
    Supplier contact person model.
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
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name='contacts',
        verbose_name=_('supplier')
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
        help_text=_('Primary contact for this supplier')
    )
    is_active = models.BooleanField(_('is active'), default=True)
    
    # Notes
    notes = models.TextField(_('notes'), blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Supplier Contact')
        verbose_name_plural = _('Supplier Contacts')
        ordering = ['supplier', 'last_name', 'first_name']
        indexes = [
            models.Index(fields=['supplier', 'is_active']),
            models.Index(fields=['is_primary']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.supplier.name})"
    
    @property
    def full_name(self):
        """Get full name."""
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        """Override save to handle primary contact logic."""
        if self.is_primary:
            # Ensure only one primary contact per supplier
            SupplierContact.objects.filter(
                supplier=self.supplier,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        
        super().save(*args, **kwargs)


class SupplierPriceList(models.Model):
    """
    Supplier price list model for product pricing.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name='price_lists',
        verbose_name=_('supplier')
    )
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.CASCADE,
        related_name='supplier_prices',
        verbose_name=_('product')
    )

    # Pricing information
    supplier_product_code = models.CharField(
        _('supplier product code'),
        max_length=100,
        blank=True,
        help_text=_('Supplier\'s internal product code')
    )
    supplier_product_name = models.CharField(
        _('supplier product name'),
        max_length=200,
        blank=True,
        help_text=_('Supplier\'s product name')
    )

    # Price and quantity
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

    # Lead time
    lead_time_days = models.IntegerField(
        _('lead time (days)'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text=_('Lead time in days for this product from this supplier')
    )

    # Quality and compliance
    quality_rating = models.IntegerField(
        _('quality rating'),
        default=5,
        validators=[MinValueValidator(1)],
        help_text=_('Quality rating for this product from this supplier (1-10)')
    )

    # Status
    is_active = models.BooleanField(_('is active'), default=True)
    is_preferred = models.BooleanField(
        _('is preferred'),
        default=False,
        help_text=_('Preferred supplier for this product')
    )

    # Notes
    notes = models.TextField(_('notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='created_supplier_prices',
        verbose_name=_('created by')
    )

    class Meta:
        verbose_name = _('Supplier Price List')
        verbose_name_plural = _('Supplier Price Lists')
        unique_together = ['supplier', 'product', 'valid_from']
        ordering = ['supplier', 'product', '-valid_from']
        indexes = [
            models.Index(fields=['supplier', 'product']),
            models.Index(fields=['valid_from', 'valid_to']),
            models.Index(fields=['is_active', 'is_preferred']),
        ]

    def __str__(self):
        return f"{self.supplier.name} - {self.product.name}: {self.unit_price} {self.currency}"

    def is_valid_on_date(self, date):
        """Check if price is valid on a specific date."""
        if date < self.valid_from:
            return False
        if self.valid_to and date > self.valid_to:
            return False
        return True

    @classmethod
    def get_current_price(cls, supplier, product, date=None):
        """Get current price for a supplier-product combination."""
        from django.utils import timezone

        if date is None:
            date = timezone.now().date()

        try:
            return cls.objects.filter(
                supplier=supplier,
                product=product,
                is_active=True,
                valid_from__lte=date
            ).filter(
                models.Q(valid_to__isnull=True) | models.Q(valid_to__gte=date)
            ).order_by('-valid_from').first()
        except cls.DoesNotExist:
            return None


class SupplierCategory(models.Model):
    """
    Supplier category model for supplier classification.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='supplier_categories',
        verbose_name=_('company')
    )

    # Basic information
    name = models.CharField(_('name'), max_length=100)
    code = models.CharField(_('code'), max_length=20)
    description = models.TextField(_('description'), blank=True)

    # Hierarchy
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('parent category')
    )

    # Settings
    is_active = models.BooleanField(_('is active'), default=True)
    sort_order = models.IntegerField(_('sort order'), default=0)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Supplier Category')
        verbose_name_plural = _('Supplier Categories')
        unique_together = ['company', 'code']
        ordering = ['sort_order', 'name']
        indexes = [
            models.Index(fields=['company', 'is_active']),
        ]

    def __str__(self):
        return f"[{self.code}] {self.name}"

    @property
    def full_path(self):
        """Get the full category path."""
        if self.parent:
            return f"{self.parent.full_path}/{self.name}"
        return self.name


class RequestForQuotation(models.Model):
    """
    Request for Quotation (RFQ) model for supplier quotation requests.
    """

    RFQ_STATES = [
        ('DRAFT', _('Draft')),
        ('SENT', _('Sent to Suppliers')),
        ('PARTIAL', _('Partially Quoted')),
        ('QUOTED', _('Fully Quoted')),
        ('CANCELLED', _('Cancelled')),
        ('EXPIRED', _('Expired')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='rfqs',
        verbose_name=_('company')
    )

    # Document information
    rfq_number = models.CharField(_('RFQ number'), max_length=100)
    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    state = models.CharField(_('state'), max_length=15, choices=RFQ_STATES, default='DRAFT')

    # Dates
    rfq_date = models.DateField(_('RFQ date'))
    deadline = models.DateTimeField(_('deadline'))

    # Delivery information
    delivery_location = models.ForeignKey(
        'inventory.Location',
        on_delete=models.PROTECT,
        related_name='rfqs',
        verbose_name=_('delivery location')
    )
    requested_delivery_date = models.DateField(_('requested delivery date'))

    # Terms and conditions
    payment_terms = models.CharField(
        _('payment terms'),
        max_length=15,
        choices=Supplier.PAYMENT_TERMS,
        default='NET_30'
    )
    currency = models.CharField(_('currency'), max_length=3, default='MAD')

    # User information
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='created_rfqs',
        verbose_name=_('created by')
    )
    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_rfqs',
        verbose_name=_('approved by')
    )
    approved_at = models.DateTimeField(_('approved at'), null=True, blank=True)

    # Notes
    notes = models.TextField(_('notes'), blank=True)
    terms_and_conditions = models.TextField(_('terms and conditions'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    # History tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _('Request for Quotation')
        verbose_name_plural = _('Requests for Quotation')
        unique_together = ['company', 'rfq_number']
        ordering = ['-rfq_date', '-created_at']
        indexes = [
            models.Index(fields=['company', 'state']),
            models.Index(fields=['rfq_date']),
            models.Index(fields=['deadline']),
        ]

    def __str__(self):
        return f"{self.rfq_number} - {self.title}"

    def send_to_suppliers(self, supplier_ids, user):
        """Send RFQ to selected suppliers."""
        if self.state != 'DRAFT':
            raise ValueError(_('Only draft RFQs can be sent'))

        # Create supplier invitations
        for supplier_id in supplier_ids:
            supplier = Supplier.objects.get(id=supplier_id, company=self.company)
            RFQSupplierInvitation.objects.get_or_create(
                rfq=self,
                supplier=supplier,
                defaults={
                    'invited_by': user,
                    'invited_at': timezone.now()
                }
            )

        self.state = 'SENT'
        self.save()

    def check_quotation_status(self):
        """Check and update quotation status based on responses."""
        invitations = self.supplier_invitations.all()
        total_invitations = invitations.count()

        if total_invitations == 0:
            return

        responded_invitations = invitations.filter(response_received=True).count()

        if responded_invitations == 0:
            self.state = 'SENT'
        elif responded_invitations == total_invitations:
            self.state = 'QUOTED'
        else:
            self.state = 'PARTIAL'

        self.save()

    def is_expired(self):
        """Check if RFQ has expired."""
        from django.utils import timezone
        return timezone.now() > self.deadline


class RFQLine(models.Model):
    """
    RFQ line item model for requested products.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rfq = models.ForeignKey(
        RequestForQuotation,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('RFQ')
    )

    # Product information
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        related_name='rfq_lines',
        verbose_name=_('product')
    )
    description = models.TextField(
        _('description'),
        blank=True,
        help_text=_('Additional description or specifications')
    )

    # Quantity and unit
    quantity = models.DecimalField(
        _('quantity'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0.000001'))]
    )
    uom = models.ForeignKey(
        'catalog.UnitOfMeasure',
        on_delete=models.PROTECT,
        related_name='rfq_lines',
        verbose_name=_('unit of measure')
    )

    # Specifications
    specifications = models.TextField(_('specifications'), blank=True)
    quality_requirements = models.TextField(_('quality requirements'), blank=True)

    # Delivery
    required_delivery_date = models.DateField(_('required delivery date'), null=True, blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('RFQ Line')
        verbose_name_plural = _('RFQ Lines')
        ordering = ['rfq', 'product']
        indexes = [
            models.Index(fields=['rfq', 'product']),
        ]

    def __str__(self):
        return f"{self.rfq.rfq_number} - {self.product.name}: {self.quantity}"


class RFQSupplierInvitation(models.Model):
    """
    RFQ supplier invitation model for tracking supplier invitations.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rfq = models.ForeignKey(
        RequestForQuotation,
        on_delete=models.CASCADE,
        related_name='supplier_invitations',
        verbose_name=_('RFQ')
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name='rfq_invitations',
        verbose_name=_('supplier')
    )

    # Invitation details
    invited_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='sent_rfq_invitations',
        verbose_name=_('invited by')
    )
    invited_at = models.DateTimeField(_('invited at'))

    # Response tracking
    response_received = models.BooleanField(_('response received'), default=False)
    response_date = models.DateTimeField(_('response date'), null=True, blank=True)

    # Notes
    invitation_notes = models.TextField(_('invitation notes'), blank=True)
    response_notes = models.TextField(_('response notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('RFQ Supplier Invitation')
        verbose_name_plural = _('RFQ Supplier Invitations')
        unique_together = ['rfq', 'supplier']
        ordering = ['rfq', 'supplier']
        indexes = [
            models.Index(fields=['rfq', 'response_received']),
            models.Index(fields=['supplier', 'invited_at']),
        ]

    def __str__(self):
        return f"{self.rfq.rfq_number} - {self.supplier.name}"


class SupplierQuotation(models.Model):
    """
    Supplier quotation model for supplier responses to RFQs.
    """

    QUOTATION_STATES = [
        ('DRAFT', _('Draft')),
        ('SUBMITTED', _('Submitted')),
        ('UNDER_REVIEW', _('Under Review')),
        ('ACCEPTED', _('Accepted')),
        ('REJECTED', _('Rejected')),
        ('EXPIRED', _('Expired')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rfq_invitation = models.OneToOneField(
        RFQSupplierInvitation,
        on_delete=models.CASCADE,
        related_name='quotation',
        verbose_name=_('RFQ invitation')
    )

    # Quotation information
    quotation_number = models.CharField(_('quotation number'), max_length=100)
    quotation_date = models.DateField(_('quotation date'))
    valid_until = models.DateField(_('valid until'))
    state = models.CharField(_('state'), max_length=15, choices=QUOTATION_STATES, default='DRAFT')

    # Terms
    payment_terms = models.CharField(
        _('payment terms'),
        max_length=15,
        choices=Supplier.PAYMENT_TERMS,
        default='NET_30'
    )
    delivery_terms = models.CharField(_('delivery terms'), max_length=200, blank=True)
    warranty_terms = models.CharField(_('warranty terms'), max_length=200, blank=True)

    # Totals
    subtotal = models.DecimalField(
        _('subtotal'),
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
    currency = models.CharField(_('currency'), max_length=3, default='MAD')

    # Review information
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_quotations',
        verbose_name=_('reviewed by')
    )
    reviewed_at = models.DateTimeField(_('reviewed at'), null=True, blank=True)
    review_notes = models.TextField(_('review notes'), blank=True)

    # Notes
    notes = models.TextField(_('notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Supplier Quotation')
        verbose_name_plural = _('Supplier Quotations')
        ordering = ['-quotation_date']
        indexes = [
            models.Index(fields=['quotation_date']),
            models.Index(fields=['valid_until']),
            models.Index(fields=['state']),
        ]

    def __str__(self):
        return f"{self.quotation_number} - {self.rfq_invitation.supplier.name}"

    def submit(self):
        """Submit the quotation."""
        if self.state != 'DRAFT':
            raise ValueError(_('Only draft quotations can be submitted'))

        self.state = 'SUBMITTED'
        self.save()

        # Update invitation response status
        self.rfq_invitation.response_received = True
        self.rfq_invitation.response_date = timezone.now()
        self.rfq_invitation.save()

        # Update RFQ status
        self.rfq_invitation.rfq.check_quotation_status()

    def calculate_totals(self):
        """Calculate quotation totals from lines."""
        lines = self.lines.all()

        self.subtotal = sum(line.total_price for line in lines)
        # Tax calculation would be implemented here
        self.tax_amount = self.subtotal * Decimal('0.20')  # 20% VAT placeholder
        self.total_amount = self.subtotal + self.tax_amount

        self.save()


class SupplierQuotationLine(models.Model):
    """
    Supplier quotation line model for quoted products.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation = models.ForeignKey(
        SupplierQuotation,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('quotation')
    )
    rfq_line = models.ForeignKey(
        RFQLine,
        on_delete=models.PROTECT,
        related_name='quotation_lines',
        verbose_name=_('RFQ line')
    )

    # Pricing
    unit_price = models.DecimalField(
        _('unit price'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))]
    )
    quantity = models.DecimalField(
        _('quantity'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0.000001'))]
    )
    total_price = models.DecimalField(
        _('total price'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )

    # Delivery
    lead_time_days = models.IntegerField(
        _('lead time (days)'),
        default=0,
        validators=[MinValueValidator(0)]
    )
    delivery_date = models.DateField(_('delivery date'), null=True, blank=True)

    # Product details
    supplier_product_code = models.CharField(
        _('supplier product code'),
        max_length=100,
        blank=True
    )
    supplier_product_name = models.CharField(
        _('supplier product name'),
        max_length=200,
        blank=True
    )

    # Notes
    notes = models.TextField(_('notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Supplier Quotation Line')
        verbose_name_plural = _('Supplier Quotation Lines')
        unique_together = ['quotation', 'rfq_line']
        ordering = ['quotation', 'rfq_line']

    def __str__(self):
        return f"{self.quotation.quotation_number} - {self.rfq_line.product.name}"

    def save(self, *args, **kwargs):
        """Calculate total price on save."""
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class PurchaseOrder(models.Model):
    """
    Purchase Order model for supplier orders.
    """

    PO_STATES = [
        ('DRAFT', _('Draft')),
        ('SENT', _('Sent to Supplier')),
        ('CONFIRMED', _('Confirmed by Supplier')),
        ('PARTIALLY_RECEIVED', _('Partially Received')),
        ('RECEIVED', _('Fully Received')),
        ('CANCELLED', _('Cancelled')),
        ('CLOSED', _('Closed')),
    ]

    APPROVAL_STATES = [
        ('PENDING', _('Pending Approval')),
        ('APPROVED', _('Approved')),
        ('REJECTED', _('Rejected')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='purchase_orders',
        verbose_name=_('company')
    )

    # Document information
    po_number = models.CharField(_('PO number'), max_length=100)
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name='purchase_orders',
        verbose_name=_('supplier')
    )

    # Reference documents
    rfq = models.ForeignKey(
        RequestForQuotation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='purchase_orders',
        verbose_name=_('RFQ')
    )
    supplier_quotation = models.ForeignKey(
        SupplierQuotation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='purchase_orders',
        verbose_name=_('supplier quotation')
    )

    # Dates
    order_date = models.DateField(_('order date'))
    expected_delivery_date = models.DateField(_('expected delivery date'))
    confirmed_delivery_date = models.DateField(_('confirmed delivery date'), null=True, blank=True)

    # Status
    state = models.CharField(_('state'), max_length=20, choices=PO_STATES, default='DRAFT')
    approval_state = models.CharField(
        _('approval state'),
        max_length=15,
        choices=APPROVAL_STATES,
        default='PENDING'
    )

    # Delivery information
    delivery_location = models.ForeignKey(
        'inventory.Location',
        on_delete=models.PROTECT,
        related_name='purchase_orders',
        verbose_name=_('delivery location')
    )
    delivery_address = models.TextField(_('delivery address'), blank=True)

    # Terms and conditions
    payment_terms = models.CharField(
        _('payment terms'),
        max_length=15,
        choices=Supplier.PAYMENT_TERMS,
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
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='created_purchase_orders',
        verbose_name=_('created by')
    )
    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_purchase_orders',
        verbose_name=_('approved by')
    )
    approved_at = models.DateTimeField(_('approved at'), null=True, blank=True)

    # Notes
    notes = models.TextField(_('notes'), blank=True)
    terms_and_conditions = models.TextField(_('terms and conditions'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    # History tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _('Purchase Order')
        verbose_name_plural = _('Purchase Orders')
        unique_together = ['company', 'po_number']
        ordering = ['-order_date', '-created_at']
        indexes = [
            models.Index(fields=['company', 'state']),
            models.Index(fields=['supplier', 'state']),
            models.Index(fields=['order_date']),
            models.Index(fields=['expected_delivery_date']),
            models.Index(fields=['approval_state']),
        ]

    def __str__(self):
        return f"{self.po_number} - {self.supplier.name}"

    def approve(self, user):
        """Approve the purchase order."""
        if self.approval_state != 'PENDING':
            raise ValueError(_('Only pending orders can be approved'))

        self.approval_state = 'APPROVED'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save()

    def reject(self, user, reason=''):
        """Reject the purchase order."""
        if self.approval_state != 'PENDING':
            raise ValueError(_('Only pending orders can be rejected'))

        self.approval_state = 'REJECTED'
        self.approved_by = user
        self.approved_at = timezone.now()
        if reason:
            self.notes = f"{self.notes}\n\nRejection reason: {reason}".strip()
        self.save()

    def send_to_supplier(self):
        """Send purchase order to supplier."""
        if self.approval_state != 'APPROVED':
            raise ValueError(_('Only approved orders can be sent'))

        if self.state != 'DRAFT':
            raise ValueError(_('Only draft orders can be sent'))

        self.state = 'SENT'
        self.save()

    def confirm_by_supplier(self, confirmed_delivery_date=None):
        """Confirm purchase order by supplier."""
        if self.state != 'SENT':
            raise ValueError(_('Only sent orders can be confirmed'))

        self.state = 'CONFIRMED'
        if confirmed_delivery_date:
            self.confirmed_delivery_date = confirmed_delivery_date
        self.save()

    def cancel(self, reason=''):
        """Cancel the purchase order."""
        if self.state in ['RECEIVED', 'CLOSED']:
            raise ValueError(_('Cannot cancel received or closed orders'))

        self.state = 'CANCELLED'
        if reason:
            self.notes = f"{self.notes}\n\nCancellation reason: {reason}".strip()
        self.save()

    def calculate_totals(self):
        """Calculate order totals from lines."""
        lines = self.lines.all()

        self.subtotal = sum(line.total_price for line in lines)
        # Tax calculation would use the tax engine
        self.tax_amount = self.subtotal * Decimal('0.20')  # 20% VAT placeholder
        self.total_amount = self.subtotal + self.tax_amount

        self.save()

    def check_receipt_status(self):
        """Check and update receipt status based on received quantities."""
        lines = self.lines.all()
        total_lines = lines.count()

        if total_lines == 0:
            return

        fully_received_lines = 0
        partially_received_lines = 0

        for line in lines:
            if line.quantity_received >= line.quantity:
                fully_received_lines += 1
            elif line.quantity_received > 0:
                partially_received_lines += 1

        if fully_received_lines == total_lines:
            self.state = 'RECEIVED'
        elif fully_received_lines > 0 or partially_received_lines > 0:
            self.state = 'PARTIALLY_RECEIVED'

        self.save()


class PurchaseOrderLine(models.Model):
    """
    Purchase Order line item model.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('purchase order')
    )

    # Product information
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        related_name='purchase_order_lines',
        verbose_name=_('product')
    )
    description = models.TextField(
        _('description'),
        blank=True,
        help_text=_('Additional description or specifications')
    )

    # Supplier product information
    supplier_product_code = models.CharField(
        _('supplier product code'),
        max_length=100,
        blank=True
    )
    supplier_product_name = models.CharField(
        _('supplier product name'),
        max_length=200,
        blank=True
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
        related_name='purchase_order_lines',
        verbose_name=_('unit of measure')
    )
    unit_price = models.DecimalField(
        _('unit price'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))]
    )
    total_price = models.DecimalField(
        _('total price'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )

    # Receipt tracking
    quantity_received = models.DecimalField(
        _('quantity received'),
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
        verbose_name = _('Purchase Order Line')
        verbose_name_plural = _('Purchase Order Lines')
        ordering = ['purchase_order', 'product']
        indexes = [
            models.Index(fields=['purchase_order', 'product']),
        ]

    def __str__(self):
        return f"{self.purchase_order.po_number} - {self.product.name}: {self.quantity}"

    @property
    def quantity_remaining(self):
        """Get remaining quantity to receive."""
        return self.quantity - self.quantity_received

    @property
    def is_fully_received(self):
        """Check if line is fully received."""
        return self.quantity_received >= self.quantity

    def save(self, *args, **kwargs):
        """Calculate total price and pending quantity on save."""
        self.total_price = self.quantity * self.unit_price
        self.quantity_pending = self.quantity - self.quantity_received
        super().save(*args, **kwargs)


class GoodsReceipt(models.Model):
    """
    Goods Receipt Note (GRN) model for receiving purchased goods.
    """

    GRN_STATES = [
        ('DRAFT', _('Draft')),
        ('RECEIVED', _('Received')),
        ('QUALITY_CHECK', _('Quality Check')),
        ('ACCEPTED', _('Accepted')),
        ('REJECTED', _('Rejected')),
        ('PARTIAL', _('Partially Accepted')),
        ('POSTED', _('Posted to Inventory')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='goods_receipts',
        verbose_name=_('company')
    )

    # Document information
    grn_number = models.CharField(_('GRN number'), max_length=100)
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.PROTECT,
        related_name='goods_receipts',
        verbose_name=_('purchase order')
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name='goods_receipts',
        verbose_name=_('supplier')
    )

    # Receipt information
    receipt_date = models.DateField(_('receipt date'))
    delivery_note_number = models.CharField(
        _('delivery note number'),
        max_length=100,
        blank=True,
        help_text=_('Supplier\'s delivery note number')
    )
    vehicle_number = models.CharField(_('vehicle number'), max_length=50, blank=True)
    driver_name = models.CharField(_('driver name'), max_length=100, blank=True)

    # Status
    state = models.CharField(_('state'), max_length=15, choices=GRN_STATES, default='DRAFT')

    # Location
    receiving_location = models.ForeignKey(
        'inventory.Location',
        on_delete=models.PROTECT,
        related_name='goods_receipts',
        verbose_name=_('receiving location')
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
        related_name='quality_checked_receipts',
        verbose_name=_('quality checked by')
    )
    quality_check_date = models.DateTimeField(_('quality check date'), null=True, blank=True)
    quality_notes = models.TextField(_('quality notes'), blank=True)

    # User information
    received_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='received_goods_receipts',
        verbose_name=_('received by')
    )
    posted_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_goods_receipts',
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
        verbose_name = _('Goods Receipt')
        verbose_name_plural = _('Goods Receipts')
        unique_together = ['company', 'grn_number']
        ordering = ['-receipt_date', '-created_at']
        indexes = [
            models.Index(fields=['company', 'state']),
            models.Index(fields=['purchase_order']),
            models.Index(fields=['supplier']),
            models.Index(fields=['receipt_date']),
        ]

    def __str__(self):
        return f"{self.grn_number} - {self.purchase_order.po_number}"

    def perform_quality_check(self, user, passed=True, notes=''):
        """Perform quality check on the receipt."""
        if self.state != 'QUALITY_CHECK':
            raise ValueError(_('Quality check can only be performed on receipts in quality check state'))

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
        """Post the receipt to inventory."""
        if self.state not in ['ACCEPTED', 'PARTIAL']:
            raise ValueError(_('Only accepted receipts can be posted to inventory'))

        from modules.inventory.models import StockMove, StockMoveLine
        from core.sequences.services import SequenceService

        # Generate stock move number
        _, move_number = SequenceService.get_next_number(
            company=self.company,
            document_type='RECEIPT',
            user=user
        )

        # Create stock move for receipt
        stock_move = StockMove.objects.create(
            company=self.company,
            name=move_number,
            move_type='IN',
            state='DRAFT',
            scheduled_date=timezone.now(),
            origin_document='GRN',
            origin_reference=self.grn_number,
            source_location=self.receiving_location,  # Dummy source for receipt
            destination_location=self.receiving_location,
            created_by=user,
            notes=f"Goods receipt: {self.grn_number}"
        )

        # Create move lines for accepted quantities
        for grn_line in self.lines.filter(quality_status='ACCEPTED'):
            if grn_line.quantity_accepted > 0:
                StockMoveLine.objects.create(
                    move=stock_move,
                    product=grn_line.product,
                    quantity_planned=grn_line.quantity_accepted,
                    quantity_done=grn_line.quantity_accepted,
                    unit_cost=grn_line.po_line.unit_price,
                    lot_number=grn_line.lot_number,
                    serial_number=grn_line.serial_number
                )

                # Update PO line received quantity
                grn_line.po_line.quantity_received += grn_line.quantity_accepted
                grn_line.po_line.save()

        # Confirm and process the stock move
        stock_move.confirm(user)
        stock_move.process(user)

        # Update receipt status
        self.state = 'POSTED'
        self.posted_by = user
        self.posted_at = timezone.now()
        self.save()

        # Update PO receipt status
        self.purchase_order.check_receipt_status()

    def reject_receipt(self, user, reason=''):
        """Reject the entire receipt."""
        if self.state not in ['RECEIVED', 'QUALITY_CHECK']:
            raise ValueError(_('Only received receipts can be rejected'))

        self.state = 'REJECTED'
        self.rejection_reason = reason
        self.quality_check_by = user
        self.quality_check_date = timezone.now()
        self.save()

        # Reject all lines
        for line in self.lines.all():
            line.quality_status = 'REJECTED'
            line.quantity_accepted = Decimal('0')
            line.save()


class GoodsReceiptLine(models.Model):
    """
    Goods Receipt line item model.
    """

    QUALITY_STATUS = [
        ('PENDING', _('Pending')),
        ('ACCEPTED', _('Accepted')),
        ('REJECTED', _('Rejected')),
        ('PARTIAL', _('Partially Accepted')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goods_receipt = models.ForeignKey(
        GoodsReceipt,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('goods receipt')
    )
    po_line = models.ForeignKey(
        PurchaseOrderLine,
        on_delete=models.PROTECT,
        related_name='receipt_lines',
        verbose_name=_('PO line')
    )

    # Product information (denormalized for performance)
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        related_name='receipt_lines',
        verbose_name=_('product')
    )

    # Quantities
    quantity_ordered = models.DecimalField(
        _('quantity ordered'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0'))]
    )
    quantity_received = models.DecimalField(
        _('quantity received'),
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
    expiry_date = models.DateField(_('expiry date'), null=True, blank=True)

    # Damage/defect tracking
    damage_description = models.TextField(_('damage description'), blank=True)
    defect_type = models.CharField(_('defect type'), max_length=100, blank=True)

    # Notes
    notes = models.TextField(_('notes'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Goods Receipt Line')
        verbose_name_plural = _('Goods Receipt Lines')
        unique_together = ['goods_receipt', 'po_line']
        ordering = ['goods_receipt', 'product']
        indexes = [
            models.Index(fields=['goods_receipt', 'product']),
            models.Index(fields=['quality_status']),
        ]

    def __str__(self):
        return f"{self.goods_receipt.grn_number} - {self.product.name}: {self.quantity_received}"

    def accept_quantity(self, quantity, notes=''):
        """Accept a specific quantity."""
        if quantity > self.quantity_received:
            raise ValueError(_('Cannot accept more than received quantity'))

        if quantity < 0:
            raise ValueError(_('Accepted quantity cannot be negative'))

        self.quantity_accepted = quantity
        self.quantity_rejected = self.quantity_received - quantity

        if quantity == 0:
            self.quality_status = 'REJECTED'
        elif quantity == self.quantity_received:
            self.quality_status = 'ACCEPTED'
        else:
            self.quality_status = 'PARTIAL'

        if notes:
            self.quality_notes = notes

        self.save()

    def reject_quantity(self, quantity, reason=''):
        """Reject a specific quantity."""
        if quantity > self.quantity_received:
            raise ValueError(_('Cannot reject more than received quantity'))

        if quantity < 0:
            raise ValueError(_('Rejected quantity cannot be negative'))

        self.quantity_rejected = quantity
        self.quantity_accepted = self.quantity_received - quantity

        if quantity == self.quantity_received:
            self.quality_status = 'REJECTED'
        elif quantity == 0:
            self.quality_status = 'ACCEPTED'
        else:
            self.quality_status = 'PARTIAL'

        if reason:
            self.damage_description = reason

        self.save()

    def save(self, *args, **kwargs):
        """Validate quantities on save."""
        if self.quantity_accepted + self.quantity_rejected > self.quantity_received:
            raise ValueError(_('Accepted + Rejected quantities cannot exceed received quantity'))

        super().save(*args, **kwargs)
