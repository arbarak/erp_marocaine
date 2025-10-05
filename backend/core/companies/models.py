"""
Company models for multi-tenant ERP system with Moroccan compliance.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from simple_history.models import HistoricalRecords


class Company(models.Model):
    """
    Company model with Moroccan business compliance fields.
    """
    # Basic company information
    name = models.CharField(_('company name'), max_length=200)
    legal_name = models.CharField(_('legal name'), max_length=200, blank=True)
    
    # Moroccan business identifiers
    ice = models.CharField(
        _('ICE (Identifiant Commun de l\'Entreprise)'),
        max_length=15,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\d{15}$',
                message=_('ICE must be exactly 15 digits')
            )
        ]
    )
    if_number = models.CharField(
        _('IF (Identifiant Fiscal)'),
        max_length=8,
        validators=[
            RegexValidator(
                regex=r'^\d{7,8}$',
                message=_('IF must be 7 or 8 digits')
            )
        ]
    )
    rc = models.CharField(
        _('RC (Registre de Commerce)'),
        max_length=20,
        blank=True,
        help_text=_('Commercial register number')
    )
    
    # Contact information
    email = models.EmailField(_('email'), blank=True)
    phone = models.CharField(_('phone'), max_length=20, blank=True)
    fax = models.CharField(_('fax'), max_length=20, blank=True)
    website = models.URLField(_('website'), blank=True)
    
    # Address (French format for Morocco)
    address_line1 = models.CharField(_('address line 1'), max_length=200)
    address_line2 = models.CharField(_('address line 2'), max_length=200, blank=True)
    city = models.CharField(_('city'), max_length=100)
    postal_code = models.CharField(_('postal code'), max_length=10, blank=True)
    state_province = models.CharField(_('state/province'), max_length=100, blank=True)
    country = models.CharField(_('country'), max_length=100, default='Maroc')
    
    # Business settings
    currency = models.CharField(
        _('base currency'),
        max_length=3,
        default='MAD',
        choices=[
            ('MAD', 'Dirham Marocain (MAD)'),
            ('EUR', 'Euro (EUR)'),
            ('USD', 'US Dollar (USD)'),
        ]
    )
    locale = models.CharField(
        _('locale'),
        max_length=10,
        default='fr-MA',
        choices=[
            ('fr-MA', 'Français (Maroc)'),
            ('ar-MA', 'العربية (المغرب)'),
            ('en-US', 'English (US)'),
        ]
    )
    
    # Fiscal year settings
    fiscal_year_start_month = models.IntegerField(
        _('fiscal year start month'),
        default=1,
        choices=[(i, _(f'Month {i}')) for i in range(1, 13)]
    )
    
    # Tax settings
    vat_number = models.CharField(_('VAT number'), max_length=20, blank=True)
    tax_rounding_method = models.CharField(
        _('tax rounding method'),
        max_length=20,
        default='ROUND_HALF_UP',
        choices=[
            ('ROUND_HALF_UP', _('Round Half Up')),
            ('ROUND_HALF_DOWN', _('Round Half Down')),
            ('ROUND_UP', _('Round Up')),
            ('ROUND_DOWN', _('Round Down')),
        ]
    )
    inclusive_taxes = models.BooleanField(
        _('inclusive taxes'),
        default=False,
        help_text=_('Whether prices include taxes by default')
    )
    
    # Logo and branding
    logo = models.ImageField(_('logo'), upload_to='company_logos/', blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    is_active = models.BooleanField(_('is active'), default=True)

    # History tracking - will be added after User model is created
    # history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Company')
        verbose_name_plural = _('Companies')
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def full_address(self):
        """Return the complete address as a formatted string."""
        parts = [self.address_line1]
        if self.address_line2:
            parts.append(self.address_line2)
        parts.append(f"{self.postal_code} {self.city}" if self.postal_code else self.city)
        if self.state_province:
            parts.append(self.state_province)
        parts.append(self.country)
        return '\n'.join(parts)
    
    def get_current_fiscal_year(self):
        """Get the current fiscal year based on fiscal_year_start_month."""
        from datetime import date
        today = date.today()
        if today.month >= self.fiscal_year_start_month:
            return today.year
        else:
            return today.year - 1


class CompanySettings(models.Model):
    """
    Additional company-specific settings and configurations.
    """

    # Costing method choices
    COSTING_METHODS = [
        ('FIFO', _('First In, First Out')),
        ('LIFO', _('Last In, First Out')),
        ('WAC', _('Weighted Average Cost')),
    ]

    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name='settings',
        verbose_name=_('company')
    )
    
    # Numbering settings
    invoice_prefix = models.CharField(_('invoice prefix'), max_length=10, default='INV')
    quote_prefix = models.CharField(_('quote prefix'), max_length=10, default='QUO')
    po_prefix = models.CharField(_('purchase order prefix'), max_length=10, default='PO')
    so_prefix = models.CharField(_('sales order prefix'), max_length=10, default='SO')
    
    # Default terms and conditions
    default_payment_terms = models.IntegerField(
        _('default payment terms (days)'),
        default=30
    )
    default_quote_validity = models.IntegerField(
        _('default quote validity (days)'),
        default=30
    )
    
    # Email settings
    email_signature = models.TextField(_('email signature'), blank=True)
    
    # Inventory settings
    default_costing_method = models.CharField(
        _('default costing method'),
        max_length=10,
        default='FIFO',
        choices=COSTING_METHODS
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Company Settings')
        verbose_name_plural = _('Company Settings')
    
    def __str__(self):
        return f"Settings for {self.company.name}"
