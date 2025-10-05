"""
Invoice models for AR/AP management with French compliance.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
from simple_history.models import HistoricalRecords

from core.companies.models import Company
from core.accounts.models import User
from core.sequences.models import DocumentSequence
from modules.sales.models import Customer, SalesOrder
from modules.purchasing.models import Supplier, PurchaseOrder
from libs.tax_engine.calculator import TaxCalculator, TaxLineItem


class Invoice(models.Model):
    """
    Invoice model for both customer invoices (AR) and supplier invoices (AP).
    """
    
    INVOICE_TYPES = [
        ('CUSTOMER', _('Customer Invoice (AR)')),
        ('SUPPLIER', _('Supplier Invoice (AP)')),
        ('CREDIT_NOTE', _('Credit Note')),
        ('DEBIT_NOTE', _('Debit Note')),
    ]
    
    INVOICE_STATES = [
        ('DRAFT', _('Draft')),
        ('VALIDATED', _('Validated')),
        ('POSTED', _('Posted')),
        ('PAID', _('Paid')),
        ('CANCELLED', _('Cancelled')),
        ('OVERDUE', _('Overdue')),
    ]
    
    PAYMENT_TERMS = [
        (0, _('Immediate')),
        (15, _('15 days')),
        (30, _('30 days')),
        (45, _('45 days')),
        (60, _('60 days')),
        (90, _('90 days')),
    ]
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        verbose_name=_('company')
    )
    
    # Invoice identification
    invoice_number = models.CharField(
        _('invoice number'),
        max_length=50,
        unique=True
    )
    invoice_type = models.CharField(
        _('invoice type'),
        max_length=15,
        choices=INVOICE_TYPES,
        default='CUSTOMER'
    )
    state = models.CharField(
        _('state'),
        max_length=15,
        choices=INVOICE_STATES,
        default='DRAFT'
    )
    
    # Parties
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        verbose_name=_('customer'),
        help_text=_('Customer for AR invoices')
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        verbose_name=_('supplier'),
        help_text=_('Supplier for AP invoices')
    )
    
    # Source documents
    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('sales order')
    )
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('purchase order')
    )
    
    # Dates
    invoice_date = models.DateField(_('invoice date'), default=timezone.now)
    due_date = models.DateField(_('due date'))
    payment_terms_days = models.IntegerField(
        _('payment terms (days)'),
        choices=PAYMENT_TERMS,
        default=30
    )
    
    # Financial amounts
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
    paid_amount = models.DecimalField(
        _('paid amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    outstanding_amount = models.DecimalField(
        _('outstanding amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # French compliance fields
    supplier_invoice_number = models.CharField(
        _('supplier invoice number'),
        max_length=50,
        blank=True,
        help_text=_('Original invoice number from supplier')
    )
    supplier_invoice_date = models.DateField(
        _('supplier invoice date'),
        null=True,
        blank=True
    )
    
    # Additional information
    reference = models.CharField(
        _('reference'),
        max_length=100,
        blank=True
    )
    description = models.TextField(
        _('description'),
        blank=True
    )
    notes = models.TextField(
        _('notes'),
        blank=True
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_invoices',
        verbose_name=_('created by')
    )
    validated_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='validated_invoices',
        verbose_name=_('validated by')
    )
    validated_at = models.DateTimeField(
        _('validated at'),
        null=True,
        blank=True
    )
    
    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Invoice')
        verbose_name_plural = _('Invoices')
        ordering = ['-invoice_date', '-created_at']
        unique_together = [['company', 'invoice_number']]
        indexes = [
            models.Index(fields=['company', 'invoice_type', 'state']),
            models.Index(fields=['company', 'customer', 'state']),
            models.Index(fields=['company', 'supplier', 'state']),
            models.Index(fields=['invoice_date']),
            models.Index(fields=['due_date']),
            models.Index(fields=['state']),
        ]
    
    def __str__(self):
        return f"{self.invoice_number} - {self.get_party_name()}"
    
    def save(self, *args, **kwargs):
        """Override save to generate invoice number and calculate due date."""
        if not self.invoice_number:
            self.invoice_number = self._generate_invoice_number()
        
        if not self.due_date:
            self.due_date = self.invoice_date + timedelta(days=self.payment_terms_days)
        
        # Calculate outstanding amount
        self.outstanding_amount = self.total_amount - self.paid_amount
        
        # Update state based on payment
        if self.state == 'POSTED':
            if self.outstanding_amount <= Decimal('0.00'):
                self.state = 'PAID'
            elif self.due_date < timezone.now().date() and self.outstanding_amount > Decimal('0.00'):
                self.state = 'OVERDUE'
        
        super().save(*args, **kwargs)
    
    def _generate_invoice_number(self):
        """Generate invoice number using document sequence."""
        prefix_map = {
            'CUSTOMER': 'INV',
            'SUPPLIER': 'BILL',
            'CREDIT_NOTE': 'CN',
            'DEBIT_NOTE': 'DN',
        }
        prefix = prefix_map.get(self.invoice_type, 'INV')
        
        return DocumentSequence.get_next_number(
            company=self.company,
            document_type=f'invoice_{self.invoice_type.lower()}',
            prefix=prefix
        )
    
    def get_party_name(self):
        """Get the name of the invoice party (customer or supplier)."""
        if self.customer:
            return self.customer.name
        elif self.supplier:
            return self.supplier.name
        return _('Unknown')
    
    def get_party(self):
        """Get the invoice party object."""
        return self.customer or self.supplier
    
    def is_customer_invoice(self):
        """Check if this is a customer invoice (AR)."""
        return self.invoice_type in ['CUSTOMER', 'DEBIT_NOTE']
    
    def is_supplier_invoice(self):
        """Check if this is a supplier invoice (AP)."""
        return self.invoice_type in ['SUPPLIER', 'CREDIT_NOTE']
    
    def validate_invoice(self, user):
        """Validate the invoice."""
        if self.state != 'DRAFT':
            raise ValueError(_('Only draft invoices can be validated'))
        
        if not self.lines.exists():
            raise ValueError(_('Invoice must have at least one line'))
        
        self.state = 'VALIDATED'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.save()
    
    def post_invoice(self):
        """Post the invoice to accounting."""
        if self.state != 'VALIDATED':
            raise ValueError(_('Only validated invoices can be posted'))
        
        self.state = 'POSTED'
        self.save()
        
        # TODO: Create accounting entries
    
    def cancel_invoice(self, reason=None):
        """Cancel the invoice."""
        if self.state in ['PAID', 'CANCELLED']:
            raise ValueError(_('Cannot cancel paid or already cancelled invoices'))
        
        self.state = 'CANCELLED'
        if reason:
            self.notes = f"{self.notes}\n\nCancellation reason: {reason}".strip()
        self.save()
    
    def calculate_totals(self):
        """Calculate invoice totals from lines using tax engine."""
        lines = self.lines.all()
        self.subtotal = sum(line.total_price for line in lines)
        
        # Use tax engine for accurate calculation
        if lines.exists():
            calculator = TaxCalculator(
                company=self.company,
                calculation_date=self.invoice_date
            )
            
            # Convert invoice lines to tax line items
            tax_line_items = []
            for line in lines:
                tax_line_items.append(TaxLineItem(
                    product_id=str(line.product.id) if line.product else 'service',
                    description=line.description,
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    discount_amount=line.discount_amount,
                    tax_exempt=False
                ))
            
            # Calculate taxes
            transaction_type = 'SALE' if self.is_customer_invoice() else 'PURCHASE'
            tax_summary = calculator.calculate_line_taxes(
                line_items=tax_line_items,
                transaction_type=transaction_type,
                customer_type='COMPANY',
                apply_withholding=self.is_supplier_invoice()
            )
            
            self.tax_amount = tax_summary.total_tax_amount
            self.total_amount = tax_summary.grand_total
        else:
            self.tax_amount = Decimal('0.00')
            self.total_amount = self.subtotal - self.discount_amount
        
        # Update outstanding amount
        self.outstanding_amount = self.total_amount - self.paid_amount
        self.save()
    
    @property
    def is_overdue(self):
        """Check if invoice is overdue."""
        return (
            self.state == 'POSTED' and 
            self.due_date < timezone.now().date() and 
            self.outstanding_amount > Decimal('0.00')
        )
    
    @property
    def days_overdue(self):
        """Get number of days overdue."""
        if not self.is_overdue:
            return 0
        return (timezone.now().date() - self.due_date).days
    
    @property
    def payment_status(self):
        """Get payment status description."""
        if self.outstanding_amount <= Decimal('0.00'):
            return _('Paid')
        elif self.is_overdue:
            return _('Overdue')
        elif self.state == 'POSTED':
            return _('Outstanding')
        else:
            return _('Not posted')


class InvoiceLine(models.Model):
    """
    Invoice line item model.
    """
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('invoice')
    )
    
    # Product information
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        verbose_name=_('product')
    )
    description = models.CharField(
        _('description'),
        max_length=500
    )
    
    # Quantities and pricing
    quantity = models.DecimalField(
        _('quantity'),
        max_digits=15,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0.000001'))]
    )
    unit_price = models.DecimalField(
        _('unit price'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    discount_percent = models.DecimalField(
        _('discount percentage'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))]
    )
    discount_amount = models.DecimalField(
        _('discount amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_price = models.DecimalField(
        _('total price'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Tax information
    tax_rate = models.DecimalField(
        _('tax rate'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('20.00')
    )
    tax_amount = models.DecimalField(
        _('tax amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Invoice Line')
        verbose_name_plural = _('Invoice Lines')
        ordering = ['invoice', 'id']
        indexes = [
            models.Index(fields=['invoice', 'product']),
        ]
    
    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.description}: {self.quantity}"
    
    def save(self, *args, **kwargs):
        """Calculate total price on save."""
        line_total = self.quantity * self.unit_price
        
        # Apply discount
        if self.discount_percent > 0:
            self.discount_amount = line_total * (self.discount_percent / 100)
        
        self.total_price = line_total - self.discount_amount
        
        super().save(*args, **kwargs)
        
        # Recalculate invoice totals
        if self.invoice_id:
            self.invoice.calculate_totals()


class Payment(models.Model):
    """
    Payment model for tracking invoice payments.
    """

    PAYMENT_TYPES = [
        ('CUSTOMER_PAYMENT', _('Customer Payment (AR)')),
        ('SUPPLIER_PAYMENT', _('Supplier Payment (AP)')),
        ('REFUND', _('Refund')),
        ('ADVANCE', _('Advance Payment')),
    ]

    PAYMENT_METHODS = [
        ('CASH', _('Cash')),
        ('CHECK', _('Check')),
        ('BANK_TRANSFER', _('Bank Transfer')),
        ('CREDIT_CARD', _('Credit Card')),
        ('ELECTRONIC', _('Electronic Payment')),
        ('OTHER', _('Other')),
    ]

    PAYMENT_STATES = [
        ('DRAFT', _('Draft')),
        ('CONFIRMED', _('Confirmed')),
        ('RECONCILED', _('Reconciled')),
        ('CANCELLED', _('Cancelled')),
    ]

    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        verbose_name=_('company')
    )

    # Payment identification
    payment_number = models.CharField(
        _('payment number'),
        max_length=50,
        unique=True
    )
    payment_type = models.CharField(
        _('payment type'),
        max_length=20,
        choices=PAYMENT_TYPES
    )
    state = models.CharField(
        _('state'),
        max_length=15,
        choices=PAYMENT_STATES,
        default='DRAFT'
    )

    # Payment details
    amount = models.DecimalField(
        _('amount'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    payment_date = models.DateField(_('payment date'), default=timezone.now)
    payment_method = models.CharField(
        _('payment method'),
        max_length=20,
        choices=PAYMENT_METHODS,
        default='BANK_TRANSFER'
    )

    # Parties
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        verbose_name=_('customer')
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        verbose_name=_('supplier')
    )

    # Payment instrument details
    check_number = models.CharField(
        _('check number'),
        max_length=50,
        blank=True
    )
    bank_reference = models.CharField(
        _('bank reference'),
        max_length=100,
        blank=True
    )

    # Additional information
    reference = models.CharField(
        _('reference'),
        max_length=100,
        blank=True
    )
    description = models.TextField(
        _('description'),
        blank=True
    )
    notes = models.TextField(
        _('notes'),
        blank=True
    )

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_payments',
        verbose_name=_('created by')
    )
    confirmed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='confirmed_payments',
        verbose_name=_('confirmed by')
    )
    confirmed_at = models.DateTimeField(
        _('confirmed at'),
        null=True,
        blank=True
    )

    # History tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
        ordering = ['-payment_date', '-created_at']
        unique_together = [['company', 'payment_number']]
        indexes = [
            models.Index(fields=['company', 'payment_type', 'state']),
            models.Index(fields=['company', 'customer', 'state']),
            models.Index(fields=['company', 'supplier', 'state']),
            models.Index(fields=['payment_date']),
            models.Index(fields=['state']),
        ]

    def __str__(self):
        return f"{self.payment_number} - {self.get_party_name()} - {self.amount}"

    def save(self, *args, **kwargs):
        """Override save to generate payment number."""
        if not self.payment_number:
            self.payment_number = self._generate_payment_number()

        super().save(*args, **kwargs)

    def _generate_payment_number(self):
        """Generate payment number using document sequence."""
        prefix_map = {
            'CUSTOMER_PAYMENT': 'PAY',
            'SUPPLIER_PAYMENT': 'BILL_PAY',
            'REFUND': 'REF',
            'ADVANCE': 'ADV',
        }
        prefix = prefix_map.get(self.payment_type, 'PAY')

        return DocumentSequence.get_next_number(
            company=self.company,
            document_type=f'payment_{self.payment_type.lower()}',
            prefix=prefix
        )

    def get_party_name(self):
        """Get the name of the payment party."""
        if self.customer:
            return self.customer.name
        elif self.supplier:
            return self.supplier.name
        return _('Unknown')

    def get_party(self):
        """Get the payment party object."""
        return self.customer or self.supplier

    def confirm_payment(self, user):
        """Confirm the payment."""
        if self.state != 'DRAFT':
            raise ValueError(_('Only draft payments can be confirmed'))

        self.state = 'CONFIRMED'
        self.confirmed_by = user
        self.confirmed_at = timezone.now()
        self.save()

    def cancel_payment(self, reason=None):
        """Cancel the payment."""
        if self.state in ['RECONCILED', 'CANCELLED']:
            raise ValueError(_('Cannot cancel reconciled or already cancelled payments'))

        self.state = 'CANCELLED'
        if reason:
            self.notes = f"{self.notes}\n\nCancellation reason: {reason}".strip()
        self.save()

    def reconcile_payment(self):
        """Mark payment as reconciled."""
        if self.state != 'CONFIRMED':
            raise ValueError(_('Only confirmed payments can be reconciled'))

        self.state = 'RECONCILED'
        self.save()


class InvoicePayment(models.Model):
    """
    Link between invoices and payments for allocation tracking.
    """

    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='payment_allocations',
        verbose_name=_('invoice')
    )
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='invoice_allocations',
        verbose_name=_('payment')
    )

    # Allocation details
    allocated_amount = models.DecimalField(
        _('allocated amount'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    allocation_date = models.DateField(_('allocation date'), default=timezone.now)

    # Additional information
    notes = models.TextField(
        _('notes'),
        blank=True
    )

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        verbose_name=_('created by')
    )

    class Meta:
        verbose_name = _('Invoice Payment Allocation')
        verbose_name_plural = _('Invoice Payment Allocations')
        ordering = ['-allocation_date', '-created_at']
        unique_together = [['invoice', 'payment']]
        indexes = [
            models.Index(fields=['invoice', 'payment']),
            models.Index(fields=['allocation_date']),
        ]

    def __str__(self):
        return f"{self.invoice.invoice_number} ← {self.payment.payment_number}: {self.allocated_amount}"

    def save(self, *args, **kwargs):
        """Update invoice paid amount on save."""
        super().save(*args, **kwargs)

        # Update invoice paid amount
        self.invoice.paid_amount = sum(
            allocation.allocated_amount
            for allocation in self.invoice.payment_allocations.all()
        )
        self.invoice.save()

    def delete(self, *args, **kwargs):
        """Update invoice paid amount on delete."""
        invoice = self.invoice
        super().delete(*args, **kwargs)

        # Update invoice paid amount
        invoice.paid_amount = sum(
            allocation.allocated_amount
            for allocation in invoice.payment_allocations.all()
        )
        invoice.save()
