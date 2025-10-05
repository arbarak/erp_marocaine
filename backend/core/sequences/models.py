"""
Document sequence models for generating sequential numbers.
"""
from django.db import models, transaction
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError


class DocumentSequence(models.Model):
    """
    Model for managing document sequences per company and fiscal year.
    Ensures sequential, immutable numbering for legal compliance.
    """
    
    DOCUMENT_TYPES = [
        ('INVOICE', _('Invoice')),
        ('CREDIT_NOTE', _('Credit Note')),
        ('QUOTE', _('Quote')),
        ('SALES_ORDER', _('Sales Order')),
        ('PURCHASE_ORDER', _('Purchase Order')),
        ('GOODS_RECEIPT', _('Goods Receipt Note')),
        ('DELIVERY', _('Delivery Note')),
        ('RETURN', _('Return Note')),
        ('ADJUSTMENT', _('Stock Adjustment')),
        ('TRANSFER', _('Stock Transfer')),
    ]
    
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='sequences',
        verbose_name=_('company')
    )
    document_type = models.CharField(
        _('document type'),
        max_length=20,
        choices=DOCUMENT_TYPES
    )
    fiscal_year = models.IntegerField(
        _('fiscal year'),
        help_text=_('Fiscal year for this sequence')
    )
    last_number = models.PositiveIntegerField(
        _('last number'),
        default=0,
        help_text=_('Last generated number in sequence')
    )
    pattern = models.CharField(
        _('number pattern'),
        max_length=50,
        default='{PREFIX}-{YYYY}-{NNNN}',
        help_text=_('Pattern for generating numbers. Use {PREFIX}, {YYYY}, {MM}, {NNNN}')
    )
    prefix = models.CharField(
        _('prefix'),
        max_length=10,
        blank=True,
        help_text=_('Prefix for document numbers')
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    is_active = models.BooleanField(_('is active'), default=True)
    
    class Meta:
        verbose_name = _('Document Sequence')
        verbose_name_plural = _('Document Sequences')
        unique_together = ['company', 'document_type', 'fiscal_year']
        indexes = [
            models.Index(fields=['company', 'document_type', 'fiscal_year']),
            models.Index(fields=['company', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.company.name} - {self.get_document_type_display()} - {self.fiscal_year}"
    
    def clean(self):
        """Validate the sequence configuration."""
        if self.fiscal_year < 2000 or self.fiscal_year > 2100:
            raise ValidationError(_('Fiscal year must be between 2000 and 2100'))
        
        if not self.pattern:
            raise ValidationError(_('Pattern cannot be empty'))
        
        # Validate pattern contains required placeholders
        if '{NNNN}' not in self.pattern:
            raise ValidationError(_('Pattern must contain {NNNN} placeholder for number'))
    
    @transaction.atomic
    def get_next_number(self):
        """
        Get the next number in sequence.
        Thread-safe implementation using database-level locking.
        """
        # Lock the row for update to prevent race conditions
        sequence = DocumentSequence.objects.select_for_update().get(pk=self.pk)
        
        # Increment the counter
        sequence.last_number += 1
        sequence.save(update_fields=['last_number', 'updated_at'])
        
        return sequence.last_number
    
    def format_number(self, number=None):
        """
        Format a number according to the pattern.
        """
        if number is None:
            number = self.last_number + 1
        
        # Get company settings for prefix if not set
        if not self.prefix and hasattr(self.company, 'settings'):
            prefix_map = {
                'INVOICE': self.company.settings.invoice_prefix,
                'QUOTE': self.company.settings.quote_prefix,
                'PURCHASE_ORDER': self.company.settings.po_prefix,
                'SALES_ORDER': self.company.settings.so_prefix,
            }
            self.prefix = prefix_map.get(self.document_type, self.document_type[:3])
        
        # Replace placeholders
        formatted = self.pattern
        formatted = formatted.replace('{PREFIX}', self.prefix or '')
        formatted = formatted.replace('{YYYY}', str(self.fiscal_year))
        formatted = formatted.replace('{YY}', str(self.fiscal_year)[-2:])
        formatted = formatted.replace('{MM}', f'{self.fiscal_year % 100:02d}')
        formatted = formatted.replace('{NNNN}', f'{number:04d}')
        formatted = formatted.replace('{NNN}', f'{number:03d}')
        formatted = formatted.replace('{NN}', f'{number:02d}')
        formatted = formatted.replace('{N}', str(number))
        
        return formatted
    
    def preview_next_number(self):
        """Preview what the next number would be without incrementing."""
        return self.format_number(self.last_number + 1)


class DocumentNumber(models.Model):
    """
    Model to track generated document numbers for audit purposes.
    Immutable once created to ensure legal compliance.
    """
    
    sequence = models.ForeignKey(
        DocumentSequence,
        on_delete=models.PROTECT,  # Protect to maintain audit trail
        related_name='generated_numbers',
        verbose_name=_('sequence')
    )
    number = models.PositiveIntegerField(_('number'))
    formatted_number = models.CharField(_('formatted number'), max_length=100)
    
    # Document reference
    document_type = models.CharField(_('document type'), max_length=20)
    document_id = models.PositiveIntegerField(_('document ID'))
    
    # Audit fields
    generated_at = models.DateTimeField(_('generated at'), auto_now_add=True)
    generated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='generated_numbers',
        verbose_name=_('generated by')
    )
    
    class Meta:
        verbose_name = _('Document Number')
        verbose_name_plural = _('Document Numbers')
        unique_together = ['sequence', 'number']
        indexes = [
            models.Index(fields=['document_type', 'document_id']),
            models.Index(fields=['formatted_number']),
            models.Index(fields=['generated_at']),
        ]
    
    def __str__(self):
        return self.formatted_number
    
    def save(self, *args, **kwargs):
        """Override save to prevent modifications after creation."""
        if self.pk:
            raise ValidationError(_('Document numbers cannot be modified once created'))
        super().save(*args, **kwargs)
