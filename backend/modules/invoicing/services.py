"""
Invoice workflow services for automated invoice generation and management.
"""
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from datetime import date, timedelta
from typing import List, Dict, Optional

from .models import Invoice, InvoiceLine, Payment, InvoicePayment
from modules.sales.models import SalesOrder, SalesOrderLine
from modules.purchasing.models import PurchaseOrder, PurchaseOrderLine
from core.companies.models import Company
from core.accounts.models import User


class InvoiceGenerationService:
    """Service for generating invoices from sales/purchase orders."""
    
    @classmethod
    def create_customer_invoice_from_sales_order(
        cls, 
        sales_order: SalesOrder, 
        created_by: User,
        invoice_date: Optional[date] = None,
        partial_lines: Optional[List[Dict]] = None
    ) -> Invoice:
        """
        Create a customer invoice from a sales order.
        
        Args:
            sales_order: Source sales order
            created_by: User creating the invoice
            invoice_date: Invoice date (defaults to today)
            partial_lines: List of partial line data for partial invoicing
            
        Returns:
            Created invoice
        """
        if sales_order.state not in ['CONFIRMED', 'IN_PROGRESS', 'PARTIALLY_DELIVERED', 'DELIVERED']:
            raise ValueError(_('Can only invoice confirmed or delivered sales orders'))
        
        invoice_date = invoice_date or timezone.now().date()
        
        with transaction.atomic():
            # Create invoice
            invoice = Invoice.objects.create(
                company=sales_order.company,
                invoice_type='CUSTOMER',
                customer=sales_order.customer,
                sales_order=sales_order,
                invoice_date=invoice_date,
                payment_terms_days=sales_order.payment_terms_days,
                reference=sales_order.order_number,
                description=f"Invoice for Sales Order {sales_order.order_number}",
                created_by=created_by
            )
            
            # Create invoice lines
            if partial_lines:
                # Partial invoicing with specified quantities
                for partial_line in partial_lines:
                    so_line = SalesOrderLine.objects.get(
                        id=partial_line['sales_order_line_id'],
                        order=sales_order
                    )
                    quantity = partial_line['quantity']
                    
                    if quantity > so_line.quantity:
                        raise ValueError(
                            f"Cannot invoice {quantity} of {so_line.product.name}, "
                            f"only {so_line.quantity} ordered"
                        )
                    
                    InvoiceLine.objects.create(
                        invoice=invoice,
                        product=so_line.product,
                        description=so_line.description or so_line.product.name,
                        quantity=quantity,
                        unit_price=so_line.unit_price,
                        discount_percent=so_line.discount_percent,
                        discount_amount=(quantity * so_line.unit_price * so_line.discount_percent / 100),
                        tax_rate=Decimal('20.00')  # Will be calculated by tax engine
                    )
            else:
                # Full invoicing
                for so_line in sales_order.lines.all():
                    InvoiceLine.objects.create(
                        invoice=invoice,
                        product=so_line.product,
                        description=so_line.description or so_line.product.name,
                        quantity=so_line.quantity,
                        unit_price=so_line.unit_price,
                        discount_percent=so_line.discount_percent,
                        discount_amount=so_line.discount_amount,
                        tax_rate=Decimal('20.00')  # Will be calculated by tax engine
                    )
            
            # Calculate totals
            invoice.calculate_totals()
            
            return invoice
    
    @classmethod
    def create_supplier_invoice_from_purchase_order(
        cls,
        purchase_order: PurchaseOrder,
        created_by: User,
        supplier_invoice_number: str,
        supplier_invoice_date: date,
        invoice_date: Optional[date] = None,
        partial_lines: Optional[List[Dict]] = None
    ) -> Invoice:
        """
        Create a supplier invoice from a purchase order.
        
        Args:
            purchase_order: Source purchase order
            created_by: User creating the invoice
            supplier_invoice_number: Original supplier invoice number
            supplier_invoice_date: Original supplier invoice date
            invoice_date: Our invoice date (defaults to today)
            partial_lines: List of partial line data for partial invoicing
            
        Returns:
            Created invoice
        """
        if purchase_order.state not in ['CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED']:
            raise ValueError(_('Can only invoice confirmed or received purchase orders'))
        
        invoice_date = invoice_date or timezone.now().date()
        
        with transaction.atomic():
            # Create invoice
            invoice = Invoice.objects.create(
                company=purchase_order.company,
                invoice_type='SUPPLIER',
                supplier=purchase_order.supplier,
                purchase_order=purchase_order,
                invoice_date=invoice_date,
                payment_terms_days=purchase_order.payment_terms_days,
                supplier_invoice_number=supplier_invoice_number,
                supplier_invoice_date=supplier_invoice_date,
                reference=purchase_order.order_number,
                description=f"Supplier Invoice for PO {purchase_order.order_number}",
                created_by=created_by
            )
            
            # Create invoice lines
            if partial_lines:
                # Partial invoicing with specified quantities
                for partial_line in partial_lines:
                    po_line = PurchaseOrderLine.objects.get(
                        id=partial_line['purchase_order_line_id'],
                        order=purchase_order
                    )
                    quantity = partial_line['quantity']
                    
                    if quantity > po_line.quantity:
                        raise ValueError(
                            f"Cannot invoice {quantity} of {po_line.product.name}, "
                            f"only {po_line.quantity} ordered"
                        )
                    
                    InvoiceLine.objects.create(
                        invoice=invoice,
                        product=po_line.product,
                        description=po_line.description or po_line.product.name,
                        quantity=quantity,
                        unit_price=po_line.unit_price,
                        discount_percent=po_line.discount_percent,
                        discount_amount=(quantity * po_line.unit_price * po_line.discount_percent / 100),
                        tax_rate=Decimal('20.00')  # Will be calculated by tax engine
                    )
            else:
                # Full invoicing
                for po_line in purchase_order.lines.all():
                    InvoiceLine.objects.create(
                        invoice=invoice,
                        product=po_line.product,
                        description=po_line.description or po_line.product.name,
                        quantity=po_line.quantity,
                        unit_price=po_line.unit_price,
                        discount_percent=po_line.discount_percent,
                        discount_amount=po_line.discount_amount,
                        tax_rate=Decimal('20.00')  # Will be calculated by tax engine
                    )
            
            # Calculate totals
            invoice.calculate_totals()
            
            return invoice
    
    @classmethod
    def create_credit_note(
        cls,
        original_invoice: Invoice,
        created_by: User,
        credit_lines: List[Dict],
        reason: str = ''
    ) -> Invoice:
        """
        Create a credit note for an invoice.
        
        Args:
            original_invoice: Original invoice to credit
            created_by: User creating the credit note
            credit_lines: List of lines to credit with quantities
            reason: Reason for credit note
            
        Returns:
            Created credit note
        """
        if original_invoice.state not in ['POSTED', 'PAID']:
            raise ValueError(_('Can only create credit notes for posted invoices'))
        
        with transaction.atomic():
            # Create credit note
            credit_note = Invoice.objects.create(
                company=original_invoice.company,
                invoice_type='CREDIT_NOTE',
                customer=original_invoice.customer,
                supplier=original_invoice.supplier,
                invoice_date=timezone.now().date(),
                payment_terms_days=0,  # Credit notes are immediate
                reference=original_invoice.invoice_number,
                description=f"Credit Note for {original_invoice.invoice_number}",
                notes=reason,
                created_by=created_by
            )
            
            # Create credit note lines
            for credit_line in credit_lines:
                original_line = InvoiceLine.objects.get(
                    id=credit_line['invoice_line_id'],
                    invoice=original_invoice
                )
                credit_quantity = credit_line['quantity']
                
                if credit_quantity > original_line.quantity:
                    raise ValueError(
                        f"Cannot credit {credit_quantity} of {original_line.description}, "
                        f"only {original_line.quantity} invoiced"
                    )
                
                # Create credit line with negative quantities
                InvoiceLine.objects.create(
                    invoice=credit_note,
                    product=original_line.product,
                    description=f"Credit: {original_line.description}",
                    quantity=-credit_quantity,  # Negative for credit
                    unit_price=original_line.unit_price,
                    discount_percent=original_line.discount_percent,
                    tax_rate=original_line.tax_rate
                )
            
            # Calculate totals
            credit_note.calculate_totals()
            
            return credit_note


class PaymentService:
    """Service for payment processing and allocation."""
    
    @classmethod
    def create_customer_payment(
        cls,
        customer,
        amount: Decimal,
        payment_date: date,
        payment_method: str,
        created_by: User,
        reference: str = '',
        description: str = '',
        **payment_details
    ) -> Payment:
        """
        Create a customer payment.
        
        Args:
            customer: Customer making the payment
            amount: Payment amount
            payment_date: Date of payment
            payment_method: Payment method
            created_by: User creating the payment
            reference: Payment reference
            description: Payment description
            **payment_details: Additional payment details (check_number, bank_reference, etc.)
            
        Returns:
            Created payment
        """
        payment = Payment.objects.create(
            company=customer.company,
            payment_type='CUSTOMER_PAYMENT',
            customer=customer,
            amount=amount,
            payment_date=payment_date,
            payment_method=payment_method,
            reference=reference,
            description=description,
            created_by=created_by,
            **{k: v for k, v in payment_details.items() if hasattr(Payment, k)}
        )
        
        return payment
    
    @classmethod
    def create_supplier_payment(
        cls,
        supplier,
        amount: Decimal,
        payment_date: date,
        payment_method: str,
        created_by: User,
        reference: str = '',
        description: str = '',
        **payment_details
    ) -> Payment:
        """
        Create a supplier payment.
        
        Args:
            supplier: Supplier receiving the payment
            amount: Payment amount
            payment_date: Date of payment
            payment_method: Payment method
            created_by: User creating the payment
            reference: Payment reference
            description: Payment description
            **payment_details: Additional payment details
            
        Returns:
            Created payment
        """
        payment = Payment.objects.create(
            company=supplier.company,
            payment_type='SUPPLIER_PAYMENT',
            supplier=supplier,
            amount=amount,
            payment_date=payment_date,
            payment_method=payment_method,
            reference=reference,
            description=description,
            created_by=created_by,
            **{k: v for k, v in payment_details.items() if hasattr(Payment, k)}
        )
        
        return payment
    
    @classmethod
    def allocate_payment_to_invoices(
        cls,
        payment: Payment,
        invoice_allocations: List[Dict],
        created_by: User
    ) -> List[InvoicePayment]:
        """
        Allocate a payment to multiple invoices.
        
        Args:
            payment: Payment to allocate
            invoice_allocations: List of {'invoice_id': str, 'amount': Decimal}
            created_by: User creating the allocations
            
        Returns:
            List of created invoice payment allocations
        """
        if payment.state != 'CONFIRMED':
            raise ValueError(_('Can only allocate confirmed payments'))
        
        total_allocated = sum(allocation['amount'] for allocation in invoice_allocations)
        if total_allocated > payment.amount:
            raise ValueError(_('Total allocation exceeds payment amount'))
        
        allocations = []
        
        with transaction.atomic():
            for allocation_data in invoice_allocations:
                invoice = Invoice.objects.get(
                    id=allocation_data['invoice_id'],
                    company=payment.company
                )
                
                # Validate allocation
                if payment.customer and invoice.customer != payment.customer:
                    raise ValueError(_('Payment customer must match invoice customer'))
                if payment.supplier and invoice.supplier != payment.supplier:
                    raise ValueError(_('Payment supplier must match invoice supplier'))
                
                allocation = InvoicePayment.objects.create(
                    invoice=invoice,
                    payment=payment,
                    allocated_amount=allocation_data['amount'],
                    created_by=created_by
                )
                allocations.append(allocation)
        
        return allocations
    
    @classmethod
    def auto_allocate_payment(
        cls,
        payment: Payment,
        created_by: User
    ) -> List[InvoicePayment]:
        """
        Automatically allocate payment to oldest outstanding invoices.
        
        Args:
            payment: Payment to allocate
            created_by: User creating the allocations
            
        Returns:
            List of created invoice payment allocations
        """
        if payment.state != 'CONFIRMED':
            raise ValueError(_('Can only allocate confirmed payments'))
        
        # Get outstanding invoices for the party
        if payment.customer:
            invoices = Invoice.objects.filter(
                company=payment.company,
                customer=payment.customer,
                state='POSTED',
                outstanding_amount__gt=Decimal('0.00')
            ).order_by('due_date', 'invoice_date')
        elif payment.supplier:
            invoices = Invoice.objects.filter(
                company=payment.company,
                supplier=payment.supplier,
                state='POSTED',
                outstanding_amount__gt=Decimal('0.00')
            ).order_by('due_date', 'invoice_date')
        else:
            raise ValueError(_('Payment must have a customer or supplier'))
        
        remaining_amount = payment.amount
        allocations = []
        
        with transaction.atomic():
            for invoice in invoices:
                if remaining_amount <= Decimal('0.00'):
                    break
                
                allocation_amount = min(remaining_amount, invoice.outstanding_amount)
                
                allocation = InvoicePayment.objects.create(
                    invoice=invoice,
                    payment=payment,
                    allocated_amount=allocation_amount,
                    created_by=created_by
                )
                allocations.append(allocation)
                
                remaining_amount -= allocation_amount
        
        return allocations


class InvoiceWorkflowService:
    """Service for invoice workflow management."""
    
    @classmethod
    def bulk_validate_invoices(
        cls,
        invoice_ids: List[str],
        validated_by: User
    ) -> Dict[str, str]:
        """
        Bulk validate multiple invoices.
        
        Args:
            invoice_ids: List of invoice IDs to validate
            validated_by: User validating the invoices
            
        Returns:
            Dict with results: {'success': [...], 'errors': {...}}
        """
        results = {'success': [], 'errors': {}}
        
        for invoice_id in invoice_ids:
            try:
                invoice = Invoice.objects.get(id=invoice_id)
                invoice.validate_invoice(validated_by)
                results['success'].append(invoice_id)
            except Exception as e:
                results['errors'][invoice_id] = str(e)
        
        return results
    
    @classmethod
    def bulk_post_invoices(
        cls,
        invoice_ids: List[str]
    ) -> Dict[str, str]:
        """
        Bulk post multiple invoices.
        
        Args:
            invoice_ids: List of invoice IDs to post
            
        Returns:
            Dict with results: {'success': [...], 'errors': {...}}
        """
        results = {'success': [], 'errors': {}}
        
        for invoice_id in invoice_ids:
            try:
                invoice = Invoice.objects.get(id=invoice_id)
                invoice.post_invoice()
                results['success'].append(invoice_id)
            except Exception as e:
                results['errors'][invoice_id] = str(e)
        
        return results
    
    @classmethod
    def get_overdue_invoices(
        cls,
        company: Company,
        days_overdue: Optional[int] = None
    ) -> List[Invoice]:
        """
        Get overdue invoices for a company.
        
        Args:
            company: Company to get overdue invoices for
            days_overdue: Minimum days overdue (optional)
            
        Returns:
            List of overdue invoices
        """
        today = timezone.now().date()
        
        invoices = Invoice.objects.filter(
            company=company,
            state='POSTED',
            due_date__lt=today,
            outstanding_amount__gt=Decimal('0.00')
        )
        
        if days_overdue is not None:
            cutoff_date = today - timedelta(days=days_overdue)
            invoices = invoices.filter(due_date__lte=cutoff_date)
        
        return invoices.order_by('due_date')
    
    @classmethod
    def get_aging_report(
        cls,
        company: Company,
        party_type: str = 'customer'  # 'customer' or 'supplier'
    ) -> Dict:
        """
        Generate aging report for AR or AP.
        
        Args:
            company: Company to generate report for
            party_type: 'customer' for AR, 'supplier' for AP
            
        Returns:
            Aging report data
        """
        today = timezone.now().date()
        
        if party_type == 'customer':
            invoices = Invoice.objects.filter(
                company=company,
                invoice_type='CUSTOMER',
                state='POSTED',
                outstanding_amount__gt=Decimal('0.00')
            )
        else:
            invoices = Invoice.objects.filter(
                company=company,
                invoice_type='SUPPLIER',
                state='POSTED',
                outstanding_amount__gt=Decimal('0.00')
            )
        
        aging_buckets = {
            'current': Decimal('0.00'),
            '1_30_days': Decimal('0.00'),
            '31_60_days': Decimal('0.00'),
            '61_90_days': Decimal('0.00'),
            'over_90_days': Decimal('0.00'),
        }
        
        for invoice in invoices:
            days_overdue = (today - invoice.due_date).days
            
            if days_overdue <= 0:
                aging_buckets['current'] += invoice.outstanding_amount
            elif days_overdue <= 30:
                aging_buckets['1_30_days'] += invoice.outstanding_amount
            elif days_overdue <= 60:
                aging_buckets['31_60_days'] += invoice.outstanding_amount
            elif days_overdue <= 90:
                aging_buckets['61_90_days'] += invoice.outstanding_amount
            else:
                aging_buckets['over_90_days'] += invoice.outstanding_amount
        
        aging_buckets['total'] = sum(aging_buckets.values())
        
        return aging_buckets
