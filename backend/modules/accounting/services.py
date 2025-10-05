"""
Accounting services for journal entries and automatic posting.
"""
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass

from .models import Account, Journal, JournalEntry, JournalEntryLine
from modules.invoicing.models import Invoice, Payment, InvoicePayment
from modules.inventory.models import StockMove
from core.companies.models import Company
from core.accounts.models import User


@dataclass
class JournalEntryLineData:
    """Data class for journal entry line creation."""
    account_code: str
    description: str
    debit_amount: Decimal = Decimal('0.00')
    credit_amount: Decimal = Decimal('0.00')
    reference: str = ''


@dataclass
class AutomaticEntryTemplate:
    """Template for automatic journal entries."""
    description: str
    lines: List[JournalEntryLineData]
    journal_code: str = 'GEN'
    reference: str = ''


class JournalEntryService:
    """Service for creating and managing journal entries."""
    
    @classmethod
    def create_journal_entry(
        cls,
        company: Company,
        journal: Journal,
        date: timezone.datetime.date,
        description: str,
        lines_data: List[JournalEntryLineData],
        user: User,
        entry_type: str = 'MANUAL',
        reference: str = '',
        source_document_type: str = '',
        source_document_id: str = ''
    ) -> JournalEntry:
        """
        Create a journal entry with lines.
        
        Args:
            company: Company for the entry
            journal: Journal to post to
            date: Entry date
            description: Entry description
            lines_data: List of line data
            user: User creating the entry
            entry_type: Type of entry (MANUAL, AUTOMATIC, etc.)
            reference: Reference number
            source_document_type: Source document type
            source_document_id: Source document ID
            
        Returns:
            Created journal entry
        """
        with transaction.atomic():
            # Create journal entry
            entry = JournalEntry.objects.create(
                company=company,
                journal=journal,
                date=date,
                entry_type=entry_type,
                description=description,
                reference=reference,
                source_document_type=source_document_type,
                source_document_id=source_document_id,
                created_by=user
            )
            
            # Create lines
            sequence = 1
            for line_data in lines_data:
                account = Account.objects.get(
                    company=company,
                    code=line_data.account_code
                )
                
                JournalEntryLine.objects.create(
                    journal_entry=entry,
                    sequence=sequence,
                    account=account,
                    description=line_data.description,
                    debit_amount=line_data.debit_amount,
                    credit_amount=line_data.credit_amount,
                    reference=line_data.reference
                )
                sequence += 1
            
            # Calculate totals
            entry.calculate_totals()
            entry.save()
            
            return entry
    
    @classmethod
    def post_journal_entry(cls, entry: JournalEntry, user: User) -> JournalEntry:
        """
        Post a journal entry.
        
        Args:
            entry: Journal entry to post
            user: User posting the entry
            
        Returns:
            Posted journal entry
        """
        entry.post(user)
        return entry
    
    @classmethod
    def reverse_journal_entry(
        cls,
        entry: JournalEntry,
        user: User,
        reason: str = ''
    ) -> JournalEntry:
        """
        Reverse a journal entry.
        
        Args:
            entry: Journal entry to reverse
            user: User creating the reversal
            reason: Reason for reversal
            
        Returns:
            Reversal journal entry
        """
        return entry.reverse(user, reason)
    
    @classmethod
    def create_automatic_entry_from_template(
        cls,
        company: Company,
        template: AutomaticEntryTemplate,
        user: User,
        date: Optional[timezone.datetime.date] = None,
        source_document_type: str = '',
        source_document_id: str = ''
    ) -> JournalEntry:
        """
        Create automatic journal entry from template.
        
        Args:
            company: Company for the entry
            template: Entry template
            user: User creating the entry
            date: Entry date (defaults to today)
            source_document_type: Source document type
            source_document_id: Source document ID
            
        Returns:
            Created journal entry
        """
        if date is None:
            date = timezone.now().date()
        
        journal = Journal.objects.get(company=company, code=template.journal_code)
        
        return cls.create_journal_entry(
            company=company,
            journal=journal,
            date=date,
            description=template.description,
            lines_data=template.lines,
            user=user,
            entry_type='AUTOMATIC',
            reference=template.reference,
            source_document_type=source_document_type,
            source_document_id=source_document_id
        )


class AutomaticAccountingService:
    """Service for automatic accounting entries from business transactions."""
    
    @classmethod
    def create_invoice_entries(cls, invoice: Invoice, user: User) -> List[JournalEntry]:
        """
        Create accounting entries for an invoice.
        
        Args:
            invoice: Invoice to create entries for
            user: User creating the entries
            
        Returns:
            List of created journal entries
        """
        entries = []
        
        if invoice.invoice_type == 'CUSTOMER':
            entries.extend(cls._create_customer_invoice_entries(invoice, user))
        elif invoice.invoice_type == 'SUPPLIER':
            entries.extend(cls._create_supplier_invoice_entries(invoice, user))
        elif invoice.invoice_type == 'CREDIT_NOTE':
            entries.extend(cls._create_credit_note_entries(invoice, user))
        
        return entries
    
    @classmethod
    def _create_customer_invoice_entries(cls, invoice: Invoice, user: User) -> List[JournalEntry]:
        """Create entries for customer invoice."""
        entries = []
        
        # Customer Invoice Entry
        # DR: Accounts Receivable (Customer)
        # CR: Sales Revenue
        # CR: VAT Payable
        
        lines_data = [
            JournalEntryLineData(
                account_code='3421',  # Clients
                description=f"Facture client {invoice.invoice_number}",
                debit_amount=invoice.total_amount,
                reference=invoice.invoice_number
            ),
            JournalEntryLineData(
                account_code='7111',  # Ventes de Marchandises
                description=f"Vente - Facture {invoice.invoice_number}",
                credit_amount=invoice.subtotal,
                reference=invoice.invoice_number
            )
        ]
        
        # Add VAT line if applicable
        if invoice.tax_amount > 0:
            lines_data.append(
                JournalEntryLineData(
                    account_code='44551',  # TVA à Payer
                    description=f"TVA - Facture {invoice.invoice_number}",
                    credit_amount=invoice.tax_amount,
                    reference=invoice.invoice_number
                )
            )
        
        template = AutomaticEntryTemplate(
            description=f"Facture client {invoice.invoice_number}",
            lines=lines_data,
            journal_code='VTE',
            reference=invoice.invoice_number
        )
        
        entry = JournalEntryService.create_automatic_entry_from_template(
            company=invoice.company,
            template=template,
            user=user,
            date=invoice.invoice_date,
            source_document_type='invoice',
            source_document_id=str(invoice.id)
        )
        
        # Auto-post the entry
        JournalEntryService.post_journal_entry(entry, user)
        entries.append(entry)
        
        return entries
    
    @classmethod
    def _create_supplier_invoice_entries(cls, invoice: Invoice, user: User) -> List[JournalEntry]:
        """Create entries for supplier invoice."""
        entries = []
        
        # Supplier Invoice Entry
        # DR: Purchases/Expenses
        # DR: VAT Recoverable
        # CR: Accounts Payable (Supplier)
        
        lines_data = [
            JournalEntryLineData(
                account_code='6111',  # Achats de Marchandises
                description=f"Achat - Facture {invoice.supplier_invoice_number}",
                debit_amount=invoice.subtotal,
                reference=invoice.supplier_invoice_number or invoice.invoice_number
            )
        ]
        
        # Add VAT line if applicable
        if invoice.tax_amount > 0:
            lines_data.append(
                JournalEntryLineData(
                    account_code='34551',  # TVA Récupérable
                    description=f"TVA récupérable - Facture {invoice.supplier_invoice_number}",
                    debit_amount=invoice.tax_amount,
                    reference=invoice.supplier_invoice_number or invoice.invoice_number
                )
            )
        
        lines_data.append(
            JournalEntryLineData(
                account_code='4411',  # Fournisseurs
                description=f"Facture fournisseur {invoice.supplier_invoice_number}",
                credit_amount=invoice.total_amount,
                reference=invoice.supplier_invoice_number or invoice.invoice_number
            )
        )
        
        template = AutomaticEntryTemplate(
            description=f"Facture fournisseur {invoice.supplier_invoice_number or invoice.invoice_number}",
            lines=lines_data,
            journal_code='ACH',
            reference=invoice.supplier_invoice_number or invoice.invoice_number
        )
        
        entry = JournalEntryService.create_automatic_entry_from_template(
            company=invoice.company,
            template=template,
            user=user,
            date=invoice.invoice_date,
            source_document_type='invoice',
            source_document_id=str(invoice.id)
        )
        
        # Auto-post the entry
        JournalEntryService.post_journal_entry(entry, user)
        entries.append(entry)
        
        return entries
    
    @classmethod
    def _create_credit_note_entries(cls, invoice: Invoice, user: User) -> List[JournalEntry]:
        """Create entries for credit note."""
        entries = []
        
        if invoice.customer:
            # Customer Credit Note
            # DR: Sales Revenue
            # DR: VAT Payable
            # CR: Accounts Receivable (Customer)
            
            lines_data = [
                JournalEntryLineData(
                    account_code='7111',  # Ventes de Marchandises
                    description=f"Avoir client {invoice.invoice_number}",
                    debit_amount=abs(invoice.subtotal),
                    reference=invoice.invoice_number
                )
            ]
            
            if invoice.tax_amount > 0:
                lines_data.append(
                    JournalEntryLineData(
                        account_code='44551',  # TVA à Payer
                        description=f"TVA - Avoir {invoice.invoice_number}",
                        debit_amount=abs(invoice.tax_amount),
                        reference=invoice.invoice_number
                    )
                )
            
            lines_data.append(
                JournalEntryLineData(
                    account_code='3421',  # Clients
                    description=f"Avoir client {invoice.invoice_number}",
                    credit_amount=abs(invoice.total_amount),
                    reference=invoice.invoice_number
                )
            )
            
            journal_code = 'VTE'
        
        else:
            # Supplier Credit Note
            # DR: Accounts Payable (Supplier)
            # CR: Purchases/Expenses
            # CR: VAT Recoverable
            
            lines_data = [
                JournalEntryLineData(
                    account_code='4411',  # Fournisseurs
                    description=f"Avoir fournisseur {invoice.invoice_number}",
                    debit_amount=abs(invoice.total_amount),
                    reference=invoice.invoice_number
                ),
                JournalEntryLineData(
                    account_code='6111',  # Achats de Marchandises
                    description=f"Avoir - Achat {invoice.invoice_number}",
                    credit_amount=abs(invoice.subtotal),
                    reference=invoice.invoice_number
                )
            ]
            
            if invoice.tax_amount > 0:
                lines_data.append(
                    JournalEntryLineData(
                        account_code='34551',  # TVA Récupérable
                        description=f"TVA - Avoir {invoice.invoice_number}",
                        credit_amount=abs(invoice.tax_amount),
                        reference=invoice.invoice_number
                    )
                )
            
            journal_code = 'ACH'
        
        template = AutomaticEntryTemplate(
            description=f"Avoir {invoice.invoice_number}",
            lines=lines_data,
            journal_code=journal_code,
            reference=invoice.invoice_number
        )
        
        entry = JournalEntryService.create_automatic_entry_from_template(
            company=invoice.company,
            template=template,
            user=user,
            date=invoice.invoice_date,
            source_document_type='credit_note',
            source_document_id=str(invoice.id)
        )
        
        # Auto-post the entry
        JournalEntryService.post_journal_entry(entry, user)
        entries.append(entry)
        
        return entries
    
    @classmethod
    def create_payment_entries(cls, payment: Payment, user: User) -> List[JournalEntry]:
        """
        Create accounting entries for a payment.
        
        Args:
            payment: Payment to create entries for
            user: User creating the entries
            
        Returns:
            List of created journal entries
        """
        entries = []
        
        if payment.payment_type == 'CUSTOMER_PAYMENT':
            entries.extend(cls._create_customer_payment_entries(payment, user))
        elif payment.payment_type == 'SUPPLIER_PAYMENT':
            entries.extend(cls._create_supplier_payment_entries(payment, user))
        
        return entries
    
    @classmethod
    def _create_customer_payment_entries(cls, payment: Payment, user: User) -> List[JournalEntry]:
        """Create entries for customer payment."""
        entries = []
        
        # Customer Payment Entry
        # DR: Cash/Bank
        # CR: Accounts Receivable (Customer)
        
        # Determine cash/bank account based on payment method
        if payment.payment_method == 'CASH':
            cash_account_code = '5611'  # Caisse Centrale
        else:
            cash_account_code = '5411'  # Banque Principale
        
        lines_data = [
            JournalEntryLineData(
                account_code=cash_account_code,
                description=f"Encaissement client {payment.payment_number}",
                debit_amount=payment.amount,
                reference=payment.reference or payment.payment_number
            ),
            JournalEntryLineData(
                account_code='3421',  # Clients
                description=f"Paiement client {payment.payment_number}",
                credit_amount=payment.amount,
                reference=payment.reference or payment.payment_number
            )
        ]
        
        template = AutomaticEntryTemplate(
            description=f"Encaissement client {payment.payment_number}",
            lines=lines_data,
            journal_code='CAI' if payment.payment_method == 'CASH' else 'BAN',
            reference=payment.reference or payment.payment_number
        )
        
        entry = JournalEntryService.create_automatic_entry_from_template(
            company=payment.company,
            template=template,
            user=user,
            date=payment.payment_date,
            source_document_type='payment',
            source_document_id=str(payment.id)
        )
        
        # Auto-post the entry
        JournalEntryService.post_journal_entry(entry, user)
        entries.append(entry)
        
        return entries
    
    @classmethod
    def _create_supplier_payment_entries(cls, payment: Payment, user: User) -> List[JournalEntry]:
        """Create entries for supplier payment."""
        entries = []
        
        # Supplier Payment Entry
        # DR: Accounts Payable (Supplier)
        # CR: Cash/Bank
        
        # Determine cash/bank account based on payment method
        if payment.payment_method == 'CASH':
            cash_account_code = '5611'  # Caisse Centrale
        else:
            cash_account_code = '5411'  # Banque Principale
        
        lines_data = [
            JournalEntryLineData(
                account_code='4411',  # Fournisseurs
                description=f"Paiement fournisseur {payment.payment_number}",
                debit_amount=payment.amount,
                reference=payment.reference or payment.payment_number
            ),
            JournalEntryLineData(
                account_code=cash_account_code,
                description=f"Décaissement fournisseur {payment.payment_number}",
                credit_amount=payment.amount,
                reference=payment.reference or payment.payment_number
            )
        ]
        
        template = AutomaticEntryTemplate(
            description=f"Paiement fournisseur {payment.payment_number}",
            lines=lines_data,
            journal_code='CAI' if payment.payment_method == 'CASH' else 'BAN',
            reference=payment.reference or payment.payment_number
        )
        
        entry = JournalEntryService.create_automatic_entry_from_template(
            company=payment.company,
            template=template,
            user=user,
            date=payment.payment_date,
            source_document_type='payment',
            source_document_id=str(payment.id)
        )
        
        # Auto-post the entry
        JournalEntryService.post_journal_entry(entry, user)
        entries.append(entry)
        
        return entries
    
    @classmethod
    def create_inventory_entries(cls, stock_move: StockMove, user: User) -> List[JournalEntry]:
        """
        Create accounting entries for inventory movements.
        
        Args:
            stock_move: Stock move to create entries for
            user: User creating the entries
            
        Returns:
            List of created journal entries
        """
        entries = []
        
        if stock_move.move_type in ['IN', 'PRODUCTION']:
            # Inventory increase
            # DR: Inventory
            # CR: Various (depending on source)
            pass  # Implementation depends on costing method
        elif stock_move.move_type in ['OUT', 'SALE']:
            # Inventory decrease
            # DR: Cost of Goods Sold
            # CR: Inventory
            pass  # Implementation depends on costing method
        
        return entries
