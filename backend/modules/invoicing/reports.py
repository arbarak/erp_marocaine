"""
Payment management and reporting utilities for AR/AP.
"""
from django.db.models import Sum, Q, Count, Case, When, DecimalField
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

from .models import Invoice, Payment, InvoicePayment
from modules.sales.models import Customer
from modules.purchasing.models import Supplier
from core.companies.models import Company


@dataclass
class AgingBucket:
    """Data class for aging report buckets."""
    current: Decimal = Decimal('0.00')
    days_1_30: Decimal = Decimal('0.00')
    days_31_60: Decimal = Decimal('0.00')
    days_61_90: Decimal = Decimal('0.00')
    over_90_days: Decimal = Decimal('0.00')
    total: Decimal = Decimal('0.00')


@dataclass
class PaymentSummary:
    """Data class for payment summary."""
    total_invoiced: Decimal = Decimal('0.00')
    total_paid: Decimal = Decimal('0.00')
    total_outstanding: Decimal = Decimal('0.00')
    overdue_amount: Decimal = Decimal('0.00')
    current_amount: Decimal = Decimal('0.00')


class ARReportGenerator:
    """Generator for Accounts Receivable reports."""
    
    @classmethod
    def generate_aging_report(
        cls,
        company: Company,
        as_of_date: Optional[date] = None,
        customer_id: Optional[str] = None
    ) -> Dict:
        """
        Generate AR aging report.
        
        Args:
            company: Company to generate report for
            as_of_date: Date to calculate aging as of (defaults to today)
            customer_id: Optional customer filter
            
        Returns:
            Aging report data
        """
        as_of_date = as_of_date or timezone.now().date()
        
        # Base queryset
        invoices = Invoice.objects.filter(
            company=company,
            invoice_type='CUSTOMER',
            state='POSTED',
            outstanding_amount__gt=Decimal('0.00')
        )
        
        if customer_id:
            invoices = invoices.filter(customer_id=customer_id)
        
        # Group by customer
        customers_data = {}
        total_aging = AgingBucket()
        
        for invoice in invoices:
            customer = invoice.customer
            if customer.id not in customers_data:
                customers_data[customer.id] = {
                    'customer': customer,
                    'aging': AgingBucket(),
                    'invoices': []
                }
            
            # Calculate days overdue
            days_overdue = (as_of_date - invoice.due_date).days
            amount = invoice.outstanding_amount
            
            # Add to appropriate bucket
            if days_overdue <= 0:
                customers_data[customer.id]['aging'].current += amount
                total_aging.current += amount
            elif days_overdue <= 30:
                customers_data[customer.id]['aging'].days_1_30 += amount
                total_aging.days_1_30 += amount
            elif days_overdue <= 60:
                customers_data[customer.id]['aging'].days_31_60 += amount
                total_aging.days_31_60 += amount
            elif days_overdue <= 90:
                customers_data[customer.id]['aging'].days_61_90 += amount
                total_aging.days_61_90 += amount
            else:
                customers_data[customer.id]['aging'].over_90_days += amount
                total_aging.over_90_days += amount
            
            customers_data[customer.id]['aging'].total += amount
            total_aging.total += amount
            
            customers_data[customer.id]['invoices'].append({
                'invoice': invoice,
                'days_overdue': max(0, days_overdue),
                'amount': amount
            })
        
        return {
            'as_of_date': as_of_date,
            'customers': list(customers_data.values()),
            'total_aging': total_aging,
            'summary': {
                'total_customers': len(customers_data),
                'total_invoices': invoices.count(),
                'total_outstanding': total_aging.total
            }
        }
    
    @classmethod
    def generate_customer_statement(
        cls,
        customer: Customer,
        from_date: date,
        to_date: date
    ) -> Dict:
        """
        Generate customer statement.
        
        Args:
            customer: Customer to generate statement for
            from_date: Start date
            to_date: End date
            
        Returns:
            Customer statement data
        """
        # Get invoices in period
        invoices = Invoice.objects.filter(
            customer=customer,
            invoice_type='CUSTOMER',
            invoice_date__range=[from_date, to_date]
        ).order_by('invoice_date')
        
        # Get payments in period
        payments = Payment.objects.filter(
            customer=customer,
            payment_type='CUSTOMER_PAYMENT',
            payment_date__range=[from_date, to_date]
        ).order_by('payment_date')
        
        # Calculate opening balance
        opening_invoices = Invoice.objects.filter(
            customer=customer,
            invoice_type='CUSTOMER',
            invoice_date__lt=from_date,
            state__in=['POSTED', 'PAID']
        ).aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')
        
        opening_payments = Payment.objects.filter(
            customer=customer,
            payment_type='CUSTOMER_PAYMENT',
            payment_date__lt=from_date,
            state__in=['CONFIRMED', 'RECONCILED']
        ).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        opening_balance = opening_invoices - opening_payments
        
        # Build transaction list
        transactions = []
        running_balance = opening_balance
        
        # Add invoices
        for invoice in invoices:
            running_balance += invoice.total_amount
            transactions.append({
                'date': invoice.invoice_date,
                'type': 'invoice',
                'reference': invoice.invoice_number,
                'description': invoice.description or f"Invoice {invoice.invoice_number}",
                'debit': invoice.total_amount,
                'credit': Decimal('0.00'),
                'balance': running_balance,
                'object': invoice
            })
        
        # Add payments
        for payment in payments:
            running_balance -= payment.amount
            transactions.append({
                'date': payment.payment_date,
                'type': 'payment',
                'reference': payment.payment_number,
                'description': payment.description or f"Payment {payment.payment_number}",
                'debit': Decimal('0.00'),
                'credit': payment.amount,
                'balance': running_balance,
                'object': payment
            })
        
        # Sort by date
        transactions.sort(key=lambda x: x['date'])
        
        # Calculate totals
        period_invoices = sum(t['debit'] for t in transactions if t['type'] == 'invoice')
        period_payments = sum(t['credit'] for t in transactions if t['type'] == 'payment')
        closing_balance = opening_balance + period_invoices - period_payments
        
        return {
            'customer': customer,
            'from_date': from_date,
            'to_date': to_date,
            'opening_balance': opening_balance,
            'period_invoices': period_invoices,
            'period_payments': period_payments,
            'closing_balance': closing_balance,
            'transactions': transactions
        }
    
    @classmethod
    def generate_overdue_report(
        cls,
        company: Company,
        days_overdue: int = 1
    ) -> Dict:
        """
        Generate overdue invoices report.
        
        Args:
            company: Company to generate report for
            days_overdue: Minimum days overdue
            
        Returns:
            Overdue report data
        """
        cutoff_date = timezone.now().date() - timedelta(days=days_overdue)
        
        overdue_invoices = Invoice.objects.filter(
            company=company,
            invoice_type='CUSTOMER',
            state='POSTED',
            due_date__lte=cutoff_date,
            outstanding_amount__gt=Decimal('0.00')
        ).select_related('customer').order_by('due_date')
        
        # Group by customer
        customers_data = {}
        total_overdue = Decimal('0.00')
        
        for invoice in overdue_invoices:
            customer = invoice.customer
            if customer.id not in customers_data:
                customers_data[customer.id] = {
                    'customer': customer,
                    'total_overdue': Decimal('0.00'),
                    'invoices': []
                }
            
            days_overdue_calc = (timezone.now().date() - invoice.due_date).days
            customers_data[customer.id]['total_overdue'] += invoice.outstanding_amount
            total_overdue += invoice.outstanding_amount
            
            customers_data[customer.id]['invoices'].append({
                'invoice': invoice,
                'days_overdue': days_overdue_calc,
                'amount': invoice.outstanding_amount
            })
        
        return {
            'cutoff_date': cutoff_date,
            'customers': list(customers_data.values()),
            'total_overdue': total_overdue,
            'total_invoices': overdue_invoices.count()
        }


class APReportGenerator:
    """Generator for Accounts Payable reports."""
    
    @classmethod
    def generate_aging_report(
        cls,
        company: Company,
        as_of_date: Optional[date] = None,
        supplier_id: Optional[str] = None
    ) -> Dict:
        """
        Generate AP aging report.
        
        Args:
            company: Company to generate report for
            as_of_date: Date to calculate aging as of (defaults to today)
            supplier_id: Optional supplier filter
            
        Returns:
            Aging report data
        """
        as_of_date = as_of_date or timezone.now().date()
        
        # Base queryset
        invoices = Invoice.objects.filter(
            company=company,
            invoice_type='SUPPLIER',
            state='POSTED',
            outstanding_amount__gt=Decimal('0.00')
        )
        
        if supplier_id:
            invoices = invoices.filter(supplier_id=supplier_id)
        
        # Group by supplier
        suppliers_data = {}
        total_aging = AgingBucket()
        
        for invoice in invoices:
            supplier = invoice.supplier
            if supplier.id not in suppliers_data:
                suppliers_data[supplier.id] = {
                    'supplier': supplier,
                    'aging': AgingBucket(),
                    'invoices': []
                }
            
            # Calculate days overdue
            days_overdue = (as_of_date - invoice.due_date).days
            amount = invoice.outstanding_amount
            
            # Add to appropriate bucket
            if days_overdue <= 0:
                suppliers_data[supplier.id]['aging'].current += amount
                total_aging.current += amount
            elif days_overdue <= 30:
                suppliers_data[supplier.id]['aging'].days_1_30 += amount
                total_aging.days_1_30 += amount
            elif days_overdue <= 60:
                suppliers_data[supplier.id]['aging'].days_31_60 += amount
                total_aging.days_31_60 += amount
            elif days_overdue <= 90:
                suppliers_data[supplier.id]['aging'].days_61_90 += amount
                total_aging.days_61_90 += amount
            else:
                suppliers_data[supplier.id]['aging'].over_90_days += amount
                total_aging.over_90_days += amount
            
            suppliers_data[supplier.id]['aging'].total += amount
            total_aging.total += amount
            
            suppliers_data[supplier.id]['invoices'].append({
                'invoice': invoice,
                'days_overdue': max(0, days_overdue),
                'amount': amount
            })
        
        return {
            'as_of_date': as_of_date,
            'suppliers': list(suppliers_data.values()),
            'total_aging': total_aging,
            'summary': {
                'total_suppliers': len(suppliers_data),
                'total_invoices': invoices.count(),
                'total_outstanding': total_aging.total
            }
        }
    
    @classmethod
    def generate_payment_schedule(
        cls,
        company: Company,
        from_date: date,
        to_date: date
    ) -> Dict:
        """
        Generate payment schedule for AP.
        
        Args:
            company: Company to generate schedule for
            from_date: Start date
            to_date: End date
            
        Returns:
            Payment schedule data
        """
        invoices = Invoice.objects.filter(
            company=company,
            invoice_type='SUPPLIER',
            state='POSTED',
            due_date__range=[from_date, to_date],
            outstanding_amount__gt=Decimal('0.00')
        ).select_related('supplier').order_by('due_date')
        
        # Group by due date
        schedule = {}
        total_amount = Decimal('0.00')
        
        for invoice in invoices:
            due_date = invoice.due_date
            if due_date not in schedule:
                schedule[due_date] = {
                    'date': due_date,
                    'total_amount': Decimal('0.00'),
                    'invoices': []
                }
            
            schedule[due_date]['total_amount'] += invoice.outstanding_amount
            total_amount += invoice.outstanding_amount
            
            schedule[due_date]['invoices'].append({
                'invoice': invoice,
                'supplier': invoice.supplier,
                'amount': invoice.outstanding_amount
            })
        
        return {
            'from_date': from_date,
            'to_date': to_date,
            'schedule': sorted(schedule.values(), key=lambda x: x['date']),
            'total_amount': total_amount,
            'total_invoices': invoices.count()
        }


class PaymentReconciliationService:
    """Service for payment reconciliation."""
    
    @classmethod
    def get_unreconciled_payments(
        cls,
        company: Company,
        payment_type: str = 'CUSTOMER_PAYMENT'
    ) -> List[Payment]:
        """
        Get unreconciled payments.
        
        Args:
            company: Company to get payments for
            payment_type: Type of payments to get
            
        Returns:
            List of unreconciled payments
        """
        return Payment.objects.filter(
            company=company,
            payment_type=payment_type,
            state='CONFIRMED'
        ).order_by('payment_date')
    
    @classmethod
    def get_unallocated_payments(
        cls,
        company: Company,
        payment_type: str = 'CUSTOMER_PAYMENT'
    ) -> List[Payment]:
        """
        Get payments with unallocated amounts.
        
        Args:
            company: Company to get payments for
            payment_type: Type of payments to get
            
        Returns:
            List of payments with unallocated amounts
        """
        payments = Payment.objects.filter(
            company=company,
            payment_type=payment_type,
            state__in=['CONFIRMED', 'RECONCILED']
        ).annotate(
            allocated_amount=Sum('invoice_allocations__allocated_amount')
        )
        
        unallocated = []
        for payment in payments:
            allocated = payment.allocated_amount or Decimal('0.00')
            if payment.amount > allocated:
                payment.unallocated_amount = payment.amount - allocated
                unallocated.append(payment)
        
        return unallocated
    
    @classmethod
    def suggest_payment_allocations(
        cls,
        payment: Payment
    ) -> List[Dict]:
        """
        Suggest invoice allocations for a payment.
        
        Args:
            payment: Payment to suggest allocations for
            
        Returns:
            List of suggested allocations
        """
        if payment.customer:
            invoices = Invoice.objects.filter(
                company=payment.company,
                customer=payment.customer,
                invoice_type='CUSTOMER',
                state='POSTED',
                outstanding_amount__gt=Decimal('0.00')
            ).order_by('due_date', 'invoice_date')
        elif payment.supplier:
            invoices = Invoice.objects.filter(
                company=payment.company,
                supplier=payment.supplier,
                invoice_type='SUPPLIER',
                state='POSTED',
                outstanding_amount__gt=Decimal('0.00')
            ).order_by('due_date', 'invoice_date')
        else:
            return []
        
        suggestions = []
        remaining_amount = payment.amount
        
        # Get already allocated amount
        allocated = payment.invoice_allocations.aggregate(
            total=Sum('allocated_amount')
        )['total'] or Decimal('0.00')
        remaining_amount -= allocated
        
        for invoice in invoices:
            if remaining_amount <= Decimal('0.00'):
                break
            
            suggested_amount = min(remaining_amount, invoice.outstanding_amount)
            suggestions.append({
                'invoice': invoice,
                'suggested_amount': suggested_amount,
                'invoice_outstanding': invoice.outstanding_amount
            })
            remaining_amount -= suggested_amount
        
        return suggestions


class CashFlowReportGenerator:
    """Generator for cash flow reports."""
    
    @classmethod
    def generate_cash_flow_forecast(
        cls,
        company: Company,
        from_date: date,
        to_date: date
    ) -> Dict:
        """
        Generate cash flow forecast.
        
        Args:
            company: Company to generate forecast for
            from_date: Start date
            to_date: End date
            
        Returns:
            Cash flow forecast data
        """
        # Expected receipts (AR)
        ar_invoices = Invoice.objects.filter(
            company=company,
            invoice_type='CUSTOMER',
            state='POSTED',
            due_date__range=[from_date, to_date],
            outstanding_amount__gt=Decimal('0.00')
        )
        
        # Expected payments (AP)
        ap_invoices = Invoice.objects.filter(
            company=company,
            invoice_type='SUPPLIER',
            state='POSTED',
            due_date__range=[from_date, to_date],
            outstanding_amount__gt=Decimal('0.00')
        )
        
        # Group by month
        forecast = {}
        current_date = from_date
        
        while current_date <= to_date:
            month_key = current_date.strftime('%Y-%m')
            if month_key not in forecast:
                forecast[month_key] = {
                    'month': current_date.strftime('%B %Y'),
                    'expected_receipts': Decimal('0.00'),
                    'expected_payments': Decimal('0.00'),
                    'net_flow': Decimal('0.00')
                }
            
            # Move to next month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)
        
        # Add AR to forecast
        for invoice in ar_invoices:
            month_key = invoice.due_date.strftime('%Y-%m')
            if month_key in forecast:
                forecast[month_key]['expected_receipts'] += invoice.outstanding_amount
        
        # Add AP to forecast
        for invoice in ap_invoices:
            month_key = invoice.due_date.strftime('%Y-%m')
            if month_key in forecast:
                forecast[month_key]['expected_payments'] += invoice.outstanding_amount
        
        # Calculate net flow
        for month_data in forecast.values():
            month_data['net_flow'] = month_data['expected_receipts'] - month_data['expected_payments']
        
        return {
            'from_date': from_date,
            'to_date': to_date,
            'forecast': sorted(forecast.values(), key=lambda x: x['month'])
        }
