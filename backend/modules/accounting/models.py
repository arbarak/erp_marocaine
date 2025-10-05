"""
Accounting models for double-entry bookkeeping system.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from decimal import Decimal
from simple_history.models import HistoricalRecords

from core.companies.models import Company
from core.accounts.models import User


class AccountType(models.Model):
    """
    Account types for chart of accounts classification.
    Based on Moroccan accounting standards (Plan Comptable Général Marocain).
    """
    
    ACCOUNT_CATEGORIES = [
        ('ASSET', _('Asset')),
        ('LIABILITY', _('Liability')),
        ('EQUITY', _('Equity')),
        ('REVENUE', _('Revenue')),
        ('EXPENSE', _('Expense')),
    ]
    
    NORMAL_BALANCES = [
        ('DEBIT', _('Debit')),
        ('CREDIT', _('Credit')),
    ]
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        verbose_name=_('company')
    )
    
    # Account type details
    code = models.CharField(
        _('code'),
        max_length=10,
        validators=[RegexValidator(r'^[0-9]+$', _('Code must contain only digits'))]
    )
    name = models.CharField(_('name'), max_length=100)
    name_arabic = models.CharField(_('name (Arabic)'), max_length=100, blank=True)
    category = models.CharField(
        _('category'),
        max_length=10,
        choices=ACCOUNT_CATEGORIES
    )
    normal_balance = models.CharField(
        _('normal balance'),
        max_length=6,
        choices=NORMAL_BALANCES
    )
    
    # Hierarchy
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('parent account type')
    )
    level = models.PositiveIntegerField(_('level'), default=0)
    
    # Configuration
    is_active = models.BooleanField(_('is active'), default=True)
    allow_posting = models.BooleanField(_('allow posting'), default=True)
    require_reconciliation = models.BooleanField(_('require reconciliation'), default=False)
    
    # Description
    description = models.TextField(_('description'), blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_account_types',
        verbose_name=_('created by')
    )
    
    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Account Type')
        verbose_name_plural = _('Account Types')
        ordering = ['code']
        unique_together = [['company', 'code']]
        indexes = [
            models.Index(fields=['company', 'category']),
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['parent']),
            models.Index(fields=['level']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def save(self, *args, **kwargs):
        """Set level based on parent."""
        if self.parent:
            self.level = self.parent.level + 1
        else:
            self.level = 0
        super().save(*args, **kwargs)
    
    @property
    def full_code(self):
        """Get full hierarchical code."""
        if self.parent:
            return f"{self.parent.full_code}.{self.code}"
        return self.code
    
    @property
    def full_name(self):
        """Get full hierarchical name."""
        if self.parent:
            return f"{self.parent.full_name} > {self.name}"
        return self.name
    
    def get_descendants(self):
        """Get all descendant account types."""
        descendants = []
        for child in self.children.all():
            descendants.append(child)
            descendants.extend(child.get_descendants())
        return descendants


class Account(models.Model):
    """
    Chart of accounts - individual accounts for posting transactions.
    """
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        verbose_name=_('company')
    )
    
    # Account identification
    code = models.CharField(
        _('account code'),
        max_length=20,
        validators=[RegexValidator(r'^[0-9A-Z\-\.]+$', _('Invalid account code format'))]
    )
    name = models.CharField(_('account name'), max_length=150)
    name_arabic = models.CharField(_('account name (Arabic)'), max_length=150, blank=True)
    
    # Account classification
    account_type = models.ForeignKey(
        AccountType,
        on_delete=models.PROTECT,
        verbose_name=_('account type')
    )
    
    # Hierarchy
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('parent account')
    )
    level = models.PositiveIntegerField(_('level'), default=0)
    
    # Configuration
    is_active = models.BooleanField(_('is active'), default=True)
    allow_posting = models.BooleanField(_('allow posting'), default=True)
    require_reconciliation = models.BooleanField(_('require reconciliation'), default=False)
    
    # Currency and balances
    currency = models.CharField(
        _('currency'),
        max_length=3,
        default='MAD'
    )
    opening_balance = models.DecimalField(
        _('opening balance'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    current_balance = models.DecimalField(
        _('current balance'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Additional information
    description = models.TextField(_('description'), blank=True)
    notes = models.TextField(_('notes'), blank=True)
    
    # External references
    external_code = models.CharField(
        _('external code'),
        max_length=50,
        blank=True,
        help_text=_('External system account code')
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_accounts',
        verbose_name=_('created by')
    )
    
    # History tracking
    history = HistoricalRecords()
    
    class Meta:
        verbose_name = _('Account')
        verbose_name_plural = _('Accounts')
        ordering = ['code']
        unique_together = [['company', 'code']]
        indexes = [
            models.Index(fields=['company', 'account_type']),
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['parent']),
            models.Index(fields=['level']),
            models.Index(fields=['code']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def save(self, *args, **kwargs):
        """Set level based on parent and inherit configurations."""
        if self.parent:
            self.level = self.parent.level + 1
            # Inherit some properties from parent if not explicitly set
            if not hasattr(self, '_explicit_allow_posting'):
                self.allow_posting = self.parent.allow_posting
        else:
            self.level = 0
        super().save(*args, **kwargs)
    
    @property
    def full_code(self):
        """Get full hierarchical code."""
        if self.parent:
            return f"{self.parent.full_code}.{self.code}"
        return self.code
    
    @property
    def full_name(self):
        """Get full hierarchical name."""
        if self.parent:
            return f"{self.parent.full_name} > {self.name}"
        return self.name
    
    @property
    def category(self):
        """Get account category from account type."""
        return self.account_type.category
    
    @property
    def normal_balance(self):
        """Get normal balance from account type."""
        return self.account_type.normal_balance
    
    def get_balance(self, as_of_date=None):
        """
        Get account balance as of a specific date.
        
        Args:
            as_of_date: Date to calculate balance as of (defaults to today)
            
        Returns:
            Account balance as Decimal
        """
        if as_of_date is None:
            as_of_date = timezone.now().date()
        
        # Get all journal entry lines for this account up to the date
        from .models import JournalEntryLine  # Avoid circular import
        
        lines = JournalEntryLine.objects.filter(
            account=self,
            journal_entry__date__lte=as_of_date,
            journal_entry__state='POSTED'
        )
        
        total_debits = sum(line.debit_amount for line in lines)
        total_credits = sum(line.credit_amount for line in lines)
        
        # Calculate balance based on normal balance
        if self.normal_balance == 'DEBIT':
            balance = self.opening_balance + total_debits - total_credits
        else:
            balance = self.opening_balance + total_credits - total_debits
        
        return balance
    
    def get_descendants(self):
        """Get all descendant accounts."""
        descendants = []
        for child in self.children.all():
            descendants.append(child)
            descendants.extend(child.get_descendants())
        return descendants
    
    def is_debit_account(self):
        """Check if this is a debit normal balance account."""
        return self.normal_balance == 'DEBIT'
    
    def is_credit_account(self):
        """Check if this is a credit normal balance account."""
        return self.normal_balance == 'CREDIT'


class Journal(models.Model):
    """
    Journals for organizing journal entries by type.
    """

    JOURNAL_TYPES = [
        ('GENERAL', _('General Journal')),
        ('SALES', _('Sales Journal')),
        ('PURCHASES', _('Purchases Journal')),
        ('CASH_RECEIPTS', _('Cash Receipts Journal')),
        ('CASH_PAYMENTS', _('Cash Payments Journal')),
        ('BANK', _('Bank Journal')),
        ('INVENTORY', _('Inventory Journal')),
        ('PAYROLL', _('Payroll Journal')),
        ('ADJUSTING', _('Adjusting Entries Journal')),
        ('CLOSING', _('Closing Entries Journal')),
    ]

    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        verbose_name=_('company')
    )

    # Journal identification
    code = models.CharField(_('journal code'), max_length=10)
    name = models.CharField(_('journal name'), max_length=100)
    journal_type = models.CharField(
        _('journal type'),
        max_length=15,
        choices=JOURNAL_TYPES,
        default='GENERAL'
    )

    # Configuration
    is_active = models.BooleanField(_('is active'), default=True)
    auto_sequence = models.BooleanField(_('auto sequence'), default=True)
    sequence_prefix = models.CharField(
        _('sequence prefix'),
        max_length=10,
        blank=True
    )

    # Default accounts
    default_debit_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='journals_as_default_debit',
        verbose_name=_('default debit account')
    )
    default_credit_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='journals_as_default_credit',
        verbose_name=_('default credit account')
    )

    # Additional information
    description = models.TextField(_('description'), blank=True)

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_journals',
        verbose_name=_('created by')
    )

    # History tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _('Journal')
        verbose_name_plural = _('Journals')
        ordering = ['code']
        unique_together = [['company', 'code']]
        indexes = [
            models.Index(fields=['company', 'journal_type']),
            models.Index(fields=['company', 'is_active']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class JournalEntry(models.Model):
    """
    Journal entries for double-entry bookkeeping.
    """

    ENTRY_STATES = [
        ('DRAFT', _('Draft')),
        ('POSTED', _('Posted')),
        ('REVERSED', _('Reversed')),
        ('CANCELLED', _('Cancelled')),
    ]

    ENTRY_TYPES = [
        ('MANUAL', _('Manual Entry')),
        ('AUTOMATIC', _('Automatic Entry')),
        ('ADJUSTING', _('Adjusting Entry')),
        ('CLOSING', _('Closing Entry')),
        ('REVERSAL', _('Reversal Entry')),
    ]

    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        verbose_name=_('company')
    )

    # Entry identification
    entry_number = models.CharField(
        _('entry number'),
        max_length=50,
        unique=True
    )
    journal = models.ForeignKey(
        Journal,
        on_delete=models.PROTECT,
        verbose_name=_('journal')
    )

    # Entry details
    date = models.DateField(_('date'))
    entry_type = models.CharField(
        _('entry type'),
        max_length=10,
        choices=ENTRY_TYPES,
        default='MANUAL'
    )
    state = models.CharField(
        _('state'),
        max_length=10,
        choices=ENTRY_STATES,
        default='DRAFT'
    )

    # Amounts
    total_debit = models.DecimalField(
        _('total debit'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_credit = models.DecimalField(
        _('total credit'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )

    # References
    reference = models.CharField(
        _('reference'),
        max_length=100,
        blank=True
    )
    description = models.TextField(_('description'))

    # Source document references
    source_document_type = models.CharField(
        _('source document type'),
        max_length=50,
        blank=True
    )
    source_document_id = models.CharField(
        _('source document ID'),
        max_length=50,
        blank=True
    )

    # Reversal tracking
    reversed_entry = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reversal_entries',
        verbose_name=_('reversed entry')
    )
    reversal_reason = models.TextField(
        _('reversal reason'),
        blank=True
    )

    # Posting information
    posted_at = models.DateTimeField(
        _('posted at'),
        null=True,
        blank=True
    )
    posted_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='posted_journal_entries',
        verbose_name=_('posted by')
    )

    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_journal_entries',
        verbose_name=_('created by')
    )

    # History tracking
    history = HistoricalRecords()

    class Meta:
        verbose_name = _('Journal Entry')
        verbose_name_plural = _('Journal Entries')
        ordering = ['-date', '-created_at']
        unique_together = [['company', 'entry_number']]
        indexes = [
            models.Index(fields=['company', 'journal', 'state']),
            models.Index(fields=['company', 'date', 'state']),
            models.Index(fields=['state']),
            models.Index(fields=['date']),
            models.Index(fields=['source_document_type', 'source_document_id']),
        ]

    def __str__(self):
        return f"{self.entry_number} - {self.description[:50]}"

    def save(self, *args, **kwargs):
        """Generate entry number if not provided."""
        if not self.entry_number:
            self.entry_number = self._generate_entry_number()
        super().save(*args, **kwargs)

    def _generate_entry_number(self):
        """Generate journal entry number."""
        from core.sequences.models import DocumentSequence

        prefix = self.journal.sequence_prefix or self.journal.code
        return DocumentSequence.get_next_number(
            company=self.company,
            document_type=f'journal_entry_{self.journal.code.lower()}',
            prefix=prefix
        )

    def calculate_totals(self):
        """Calculate total debits and credits from lines."""
        lines = self.lines.all()
        self.total_debit = sum(line.debit_amount for line in lines)
        self.total_credit = sum(line.credit_amount for line in lines)

    def is_balanced(self):
        """Check if journal entry is balanced (debits = credits)."""
        self.calculate_totals()
        return self.total_debit == self.total_credit

    def post(self, user):
        """Post the journal entry."""
        if self.state != 'DRAFT':
            raise ValueError(_('Only draft entries can be posted'))

        if not self.is_balanced():
            raise ValueError(_('Journal entry must be balanced before posting'))

        if not self.lines.exists():
            raise ValueError(_('Journal entry must have at least one line'))

        self.state = 'POSTED'
        self.posted_at = timezone.now()
        self.posted_by = user
        self.save()

        # Update account balances
        self._update_account_balances()

    def reverse(self, user, reason=''):
        """Create a reversal entry."""
        if self.state != 'POSTED':
            raise ValueError(_('Only posted entries can be reversed'))

        # Create reversal entry
        reversal_entry = JournalEntry.objects.create(
            company=self.company,
            journal=self.journal,
            date=timezone.now().date(),
            entry_type='REVERSAL',
            description=f"Reversal of {self.entry_number}: {reason}",
            reference=self.reference,
            reversed_entry=self,
            reversal_reason=reason,
            created_by=user
        )

        # Create reversal lines (swap debits and credits)
        for line in self.lines.all():
            JournalEntryLine.objects.create(
                journal_entry=reversal_entry,
                account=line.account,
                description=f"Reversal: {line.description}",
                debit_amount=line.credit_amount,
                credit_amount=line.debit_amount,
                reference=line.reference
            )

        # Post the reversal
        reversal_entry.post(user)

        # Mark original as reversed
        self.state = 'REVERSED'
        self.save()

        return reversal_entry

    def _update_account_balances(self):
        """Update account balances after posting."""
        for line in self.lines.all():
            account = line.account
            if account.normal_balance == 'DEBIT':
                account.current_balance += line.debit_amount - line.credit_amount
            else:
                account.current_balance += line.credit_amount - line.debit_amount
            account.save()


class JournalEntryLine(models.Model):
    """
    Individual lines within journal entries.
    """

    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    journal_entry = models.ForeignKey(
        JournalEntry,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name=_('journal entry')
    )

    # Line details
    sequence = models.PositiveIntegerField(_('sequence'), default=1)
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        verbose_name=_('account')
    )
    description = models.CharField(_('description'), max_length=200)

    # Amounts
    debit_amount = models.DecimalField(
        _('debit amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    credit_amount = models.DecimalField(
        _('credit amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    # Additional information
    reference = models.CharField(
        _('reference'),
        max_length=100,
        blank=True
    )

    # Reconciliation
    reconciled = models.BooleanField(_('reconciled'), default=False)
    reconciled_at = models.DateTimeField(
        _('reconciled at'),
        null=True,
        blank=True
    )
    reconciled_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='reconciled_journal_lines',
        verbose_name=_('reconciled by')
    )

    class Meta:
        verbose_name = _('Journal Entry Line')
        verbose_name_plural = _('Journal Entry Lines')
        ordering = ['journal_entry', 'sequence']
        indexes = [
            models.Index(fields=['journal_entry', 'sequence']),
            models.Index(fields=['account']),
            models.Index(fields=['reconciled']),
        ]

    def __str__(self):
        return f"{self.journal_entry.entry_number} - {self.account.code} - {self.description[:30]}"

    def clean(self):
        """Validate that either debit or credit is specified, but not both."""
        from django.core.exceptions import ValidationError

        if self.debit_amount > 0 and self.credit_amount > 0:
            raise ValidationError(_('A line cannot have both debit and credit amounts'))

        if self.debit_amount == 0 and self.credit_amount == 0:
            raise ValidationError(_('A line must have either a debit or credit amount'))

        # Validate account allows posting
        if not self.account.allow_posting:
            raise ValidationError(_('Cannot post to this account - posting not allowed'))

    @property
    def amount(self):
        """Get the line amount (debit or credit)."""
        return self.debit_amount if self.debit_amount > 0 else self.credit_amount

    @property
    def is_debit(self):
        """Check if this is a debit line."""
        return self.debit_amount > 0

    @property
    def is_credit(self):
        """Check if this is a credit line."""
        return self.credit_amount > 0
