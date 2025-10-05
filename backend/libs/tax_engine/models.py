"""
Tax engine models for Morocco tax compliance.
Supports TVA (VAT) and RAS/TVA (withheld VAT) with date versioning.
Enhanced for comprehensive Morocco tax compliance and regulations.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import uuid
from simple_history.models import HistoricalRecords


class Tax(models.Model):
    """
    Tax definition model (e.g., TVA, RAS/TVA).
    Enhanced for Moroccan tax compliance.
    """

    TAX_TYPES = [
        ('VAT', _('Value Added Tax (Taxe sur la Valeur Ajoutée - TVA)')),
        ('WHT', _('Withholding Tax (Retenue à la Source - RAS/TVA)')),
        ('EXCISE', _('Excise Tax (Droits d\'Accise)')),
        ('CUSTOMS', _('Customs Duty (Droits de Douane)')),
        ('OTHER', _('Other Tax')),
    ]

    TAX_SCOPES = [
        ('SALE', _('Sales Tax')),
        ('PURCHASE', _('Purchase Tax')),
        ('BOTH', _('Sales and Purchase Tax')),
    ]

    CALCULATION_METHODS = [
        ('PERCENTAGE', _('Percentage of Base Amount')),
        ('FIXED', _('Fixed Amount')),
        ('TIERED', _('Tiered Calculation')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(
        _('tax code'),
        max_length=20,
        unique=True,
        validators=[RegexValidator(r'^[A-Z0-9_]+$', _('Tax code must contain only uppercase letters, numbers, and underscores'))],
        help_text=_('Unique code for this tax (e.g., TVA, RAS_TVA, EXCISE)')
    )
    name = models.CharField(
        _('tax name'),
        max_length=100,
        help_text=_('Display name for this tax')
    )
    name_arabic = models.CharField(
        _('tax name (Arabic)'),
        max_length=100,
        blank=True,
        help_text=_('Arabic name for this tax')
    )
    type = models.CharField(
        _('tax type'),
        max_length=10,
        choices=TAX_TYPES,
        default='VAT'
    )
    scope = models.CharField(
        _('tax scope'),
        max_length=10,
        choices=TAX_SCOPES,
        default='BOTH',
        help_text=_('Whether this tax applies to sales, purchases, or both')
    )
    calculation_method = models.CharField(
        _('calculation method'),
        max_length=15,
        choices=CALCULATION_METHODS,
        default='PERCENTAGE'
    )
    recoverable = models.BooleanField(
        _('recoverable'),
        default=True,
        help_text=_('Whether this tax can be recovered/deducted')
    )
    inclusive = models.BooleanField(
        _('inclusive'),
        default=False,
        help_text=_('Whether this tax is included in the price by default')
    )
    compound = models.BooleanField(
        _('compound'),
        default=False,
        help_text=_('Whether this tax is calculated on top of other taxes')
    )

    # Moroccan-specific fields
    dgi_code = models.CharField(
        _('DGI code'),
        max_length=20,
        blank=True,
        help_text=_('Direction Générale des Impôts tax code')
    )
    legal_reference = models.CharField(
        _('legal reference'),
        max_length=200,
        blank=True,
        help_text=_('Legal reference (e.g., Article 87 du CGI)')
    )

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    is_active = models.BooleanField(_('is active'), default=True)

    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Tax')
        verbose_name_plural = _('Taxes')
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['type', 'scope']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    def get_current_rate(self, date=None, company=None):
        """Get the current tax rate for a given date and company."""
        if date is None:
            date = timezone.now().date()

        try:
            # Get active rate versions for this date
            rate_versions = TaxRateVersion.objects.filter(
                tax_rate__tax=self,
                valid_from__lte=date,
                valid_to__gte=date,
                is_active=True
            ).select_related('tax_rate')

            # If company-specific rates exist, prefer them
            if company:
                company_rate = rate_versions.filter(company=company).first()
                if company_rate:
                    return company_rate

            # Return default rate
            return rate_versions.filter(company__isnull=True).first()
        except Exception:
            return None

    def get_applicable_rates(self, date=None, company=None, transaction_type='SALE'):
        """Get all applicable rates for a transaction."""
        if date is None:
            date = timezone.now().date()

        # Check if tax applies to this transaction type
        if self.scope not in ['BOTH', transaction_type]:
            return []

        rate_version = self.get_current_rate(date, company)
        if rate_version:
            return [rate_version]
        return []

    @classmethod
    def get_moroccan_vat_taxes(cls):
        """Get standard Moroccan VAT taxes."""
        return cls.objects.filter(
            code__in=['TVA_20', 'TVA_14', 'TVA_10', 'TVA_7', 'TVA_0'],
            type='VAT',
            is_active=True
        )

    @classmethod
    def get_withholding_taxes(cls):
        """Get Moroccan withholding taxes (RAS/TVA)."""
        return cls.objects.filter(
            type='WHT',
            is_active=True
        )


class TaxRate(models.Model):
    """
    Tax rate definition (e.g., 20%, 14%, 10%, 7% for Moroccan TVA).
    Enhanced with fixed amounts and tiered calculations.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tax = models.ForeignKey(
        Tax,
        on_delete=models.CASCADE,
        related_name='rates',
        verbose_name=_('tax')
    )

    # Rate definition
    rate_pct = models.DecimalField(
        _('rate percentage'),
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('100.00'))
        ],
        help_text=_('Tax rate as percentage (e.g., 20.00 for 20%)')
    )
    fixed_amount = models.DecimalField(
        _('fixed amount'),
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text=_('Fixed tax amount (for fixed calculation method)')
    )

    # Thresholds for tiered calculations
    min_amount = models.DecimalField(
        _('minimum amount'),
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text=_('Minimum amount for this rate to apply')
    )
    max_amount = models.DecimalField(
        _('maximum amount'),
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text=_('Maximum amount for this rate to apply')
    )

    # Description and categorization
    description = models.CharField(
        _('description'),
        max_length=200,
        blank=True,
        help_text=_('Description of this tax rate')
    )
    category = models.CharField(
        _('category'),
        max_length=50,
        blank=True,
        help_text=_('Category for grouping rates (e.g., STANDARD, REDUCED, EXEMPT)')
    )

    # Moroccan-specific fields
    applicable_sectors = models.TextField(
        _('applicable sectors'),
        blank=True,
        help_text=_('Sectors where this rate applies (JSON list)')
    )
    exemption_conditions = models.TextField(
        _('exemption conditions'),
        blank=True,
        help_text=_('Conditions for exemption from this rate')
    )

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    is_active = models.BooleanField(_('is active'), default=True)

    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Tax Rate')
        verbose_name_plural = _('Tax Rates')
        ordering = ['tax', '-rate_pct', '-fixed_amount']
        indexes = [
            models.Index(fields=['tax', 'is_active']),
            models.Index(fields=['category']),
            models.Index(fields=['min_amount', 'max_amount']),
        ]

    def __str__(self):
        if self.rate_pct is not None:
            return f"{self.tax.code} - {self.rate_pct}%"
        elif self.fixed_amount is not None:
            return f"{self.tax.code} - {self.fixed_amount} MAD"
        else:
            return f"{self.tax.code} - {self.description}"

    @property
    def rate_decimal(self):
        """Get rate as decimal (e.g., 0.20 for 20%)."""
        if self.rate_pct is not None:
            return self.rate_pct / 100
        return Decimal('0.00')

    @property
    def rate_percent(self):
        """Alias for rate_pct for compatibility."""
        return self.rate_pct

    def clean(self):
        """Validate tax rate configuration."""
        if self.tax.calculation_method == 'PERCENTAGE' and self.rate_pct is None:
            raise ValidationError(_('Percentage rate is required for percentage calculation method'))

        if self.tax.calculation_method == 'FIXED' and self.fixed_amount is None:
            raise ValidationError(_('Fixed amount is required for fixed calculation method'))

        if self.min_amount is not None and self.max_amount is not None:
            if self.min_amount > self.max_amount:
                raise ValidationError(_('Minimum amount cannot be greater than maximum amount'))

    def is_applicable_for_amount(self, amount):
        """Check if this rate is applicable for a given amount."""
        if self.min_amount is not None and amount < self.min_amount:
            return False
        if self.max_amount is not None and amount > self.max_amount:
            return False
        return True

    def calculate_tax(self, base_amount, quantity=1):
        """Calculate tax amount for given base amount and quantity."""
        total_base = base_amount * quantity

        if not self.is_applicable_for_amount(total_base):
            return Decimal('0.00')

        if self.tax.calculation_method == 'PERCENTAGE':
            return total_base * self.rate_decimal
        elif self.tax.calculation_method == 'FIXED':
            return self.fixed_amount * quantity
        else:
            # Tiered calculation would be implemented here
            return Decimal('0.00')


class TaxRateVersion(models.Model):
    """
    Date-versioned tax rates for compliance with changing tax laws.
    Enhanced for Moroccan tax compliance with company-specific rates.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tax_rate = models.ForeignKey(
        TaxRate,
        on_delete=models.CASCADE,
        related_name='versions',
        verbose_name=_('tax rate')
    )

    # Date versioning
    valid_from = models.DateField(
        _('valid from'),
        help_text=_('Date from which this rate version is valid')
    )
    valid_to = models.DateField(
        _('valid to'),
        help_text=_('Date until which this rate version is valid')
    )

    # Company-specific rates
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='tax_rate_versions',
        verbose_name=_('company'),
        help_text=_('Company-specific rate version (null for default rates)')
    )

    # Withholding tax configuration
    withheld_flag = models.BooleanField(
        _('withheld flag'),
        default=False,
        help_text=_('Whether this rate applies to withheld tax (RAS/TVA)')
    )
    withholding_rate_pct = models.DecimalField(
        _('withholding rate percentage'),
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('100.00'))
        ],
        help_text=_('Withholding rate percentage (for RAS/TVA calculations)')
    )

    # Moroccan-specific configuration
    dgi_rate_code = models.CharField(
        _('DGI rate code'),
        max_length=20,
        blank=True,
        help_text=_('Direction Générale des Impôts rate code')
    )
    legal_basis = models.TextField(
        _('legal basis'),
        blank=True,
        help_text=_('Legal basis for this rate version')
    )

    # Override rate values for this version
    override_rate_pct = models.DecimalField(
        _('override rate percentage'),
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('100.00'))
        ],
        help_text=_('Override the base rate percentage for this version')
    )
    override_fixed_amount = models.DecimalField(
        _('override fixed amount'),
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text=_('Override the base fixed amount for this version')
    )

    # Audit fields
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='created_tax_rate_versions',
        verbose_name=_('created by')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    is_active = models.BooleanField(_('is active'), default=True)

    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Tax Rate Version')
        verbose_name_plural = _('Tax Rate Versions')
        ordering = ['tax_rate', '-valid_from']
        unique_together = [
            ['tax_rate', 'valid_from', 'company'],  # Prevent overlapping versions
        ]
        indexes = [
            models.Index(fields=['valid_from', 'valid_to']),
            models.Index(fields=['tax_rate', 'valid_from']),
            models.Index(fields=['company', 'valid_from']),
            models.Index(fields=['withheld_flag']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        company_str = f" ({self.company.name})" if self.company else ""
        return f"{self.tax_rate} ({self.valid_from} - {self.valid_to}){company_str}"

    def clean(self):
        """Validate date ranges and configuration."""
        if self.valid_from and self.valid_to and self.valid_from > self.valid_to:
            raise ValidationError(_('Valid from date must be before valid to date'))

        # Check for overlapping versions for the same tax rate and company
        overlapping = TaxRateVersion.objects.filter(
            tax_rate=self.tax_rate,
            company=self.company,
            is_active=True
        ).exclude(pk=self.pk)

        for version in overlapping:
            if (self.valid_from <= version.valid_to and
                self.valid_to >= version.valid_from):
                raise ValidationError(
                    _('Date range overlaps with existing version: {}').format(version)
                )

        # Validate withholding configuration
        if self.withheld_flag and self.withholding_rate_pct is None:
            raise ValidationError(_('Withholding rate percentage is required when withheld flag is set'))

    def is_valid_for_date(self, date):
        """Check if this version is valid for a given date."""
        return self.valid_from <= date <= self.valid_to and self.is_active

    @property
    def effective_rate_pct(self):
        """Get the effective rate percentage (override or base)."""
        if self.override_rate_pct is not None:
            return self.override_rate_pct
        return self.tax_rate.rate_pct

    @property
    def effective_fixed_amount(self):
        """Get the effective fixed amount (override or base)."""
        if self.override_fixed_amount is not None:
            return self.override_fixed_amount
        return self.tax_rate.fixed_amount

    @property
    def effective_rate_decimal(self):
        """Get effective rate as decimal."""
        if self.effective_rate_pct is not None:
            return self.effective_rate_pct / 100
        return Decimal('0.00')

    def calculate_tax(self, base_amount, quantity=1, apply_withholding=False):
        """Calculate tax amount with optional withholding."""
        if not self.is_active:
            return Decimal('0.00')

        total_base = base_amount * quantity

        # Check if rate is applicable for this amount
        if not self.tax_rate.is_applicable_for_amount(total_base):
            return Decimal('0.00')

        # Calculate base tax
        if self.tax_rate.tax.calculation_method == 'PERCENTAGE':
            tax_amount = total_base * self.effective_rate_decimal
        elif self.tax_rate.tax.calculation_method == 'FIXED':
            tax_amount = (self.effective_fixed_amount or Decimal('0.00')) * quantity
        else:
            tax_amount = Decimal('0.00')

        # Apply withholding if requested and configured
        if apply_withholding and self.withheld_flag and self.withholding_rate_pct:
            withholding_amount = tax_amount * (self.withholding_rate_pct / 100)
            return {
                'tax_amount': tax_amount,
                'withholding_amount': withholding_amount,
                'net_tax_amount': tax_amount - withholding_amount
            }

        return tax_amount

    def get_withholding_amount(self, tax_amount):
        """Calculate withholding amount for a given tax amount."""
        if self.withheld_flag and self.withholding_rate_pct:
            return tax_amount * (self.withholding_rate_pct / 100)
        return Decimal('0.00')


class TaxProfile(models.Model):
    """
    Tax profile for products/services to define applicable taxes.
    """
    
    name = models.CharField(
        _('profile name'),
        max_length=100,
        help_text=_('Name of this tax profile')
    )
    description = models.TextField(
        _('description'),
        blank=True,
        help_text=_('Description of when to use this profile')
    )
    taxes = models.ManyToManyField(
        TaxRate,
        through='TaxProfileRate',
        related_name='profiles',
        verbose_name=_('tax rates')
    )
    
    # Company-specific profiles
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='tax_profiles',
        verbose_name=_('company')
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    is_active = models.BooleanField(_('is active'), default=True)
    
    class Meta:
        verbose_name = _('Tax Profile')
        verbose_name_plural = _('Tax Profiles')
        unique_together = ['name', 'company']
        ordering = ['name']
    
    def __str__(self):
        if self.company:
            return f"{self.name} ({self.company.name})"
        return self.name


class TaxProfileRate(models.Model):
    """
    Through model for TaxProfile and TaxRate relationship.
    """
    
    profile = models.ForeignKey(
        TaxProfile,
        on_delete=models.CASCADE,
        verbose_name=_('tax profile')
    )
    tax_rate = models.ForeignKey(
        TaxRate,
        on_delete=models.CASCADE,
        verbose_name=_('tax rate')
    )
    is_default = models.BooleanField(
        _('is default'),
        default=False,
        help_text=_('Whether this is the default rate for this profile')
    )
    order = models.PositiveIntegerField(
        _('order'),
        default=0,
        help_text=_('Order in which taxes are applied')
    )
    
    class Meta:
        verbose_name = _('Tax Profile Rate')
        verbose_name_plural = _('Tax Profile Rates')
        unique_together = ['profile', 'tax_rate']
        ordering = ['profile', 'order', 'tax_rate']
    
    def __str__(self):
        return f"{self.profile.name} - {self.tax_rate}"
