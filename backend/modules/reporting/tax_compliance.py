"""
Moroccan tax compliance reporting services.
"""
from decimal import Decimal
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional
from django.db.models import Q, Sum, Count, F, Case, When, Value
from django.db.models.functions import Coalesce, Extract, TruncMonth, TruncQuarter, TruncYear
from django.utils.translation import gettext_lazy as _

from modules.accounting.models import Account, JournalEntry, JournalEntryLine
from modules.invoicing.models import Invoice, Payment
from libs.tax_engine.models import Tax, TaxRateVersion
from core.companies.models import Company


class MoroccanTaxComplianceService:
    """Service for generating Moroccan tax compliance reports."""
    
    def __init__(self, company: Company):
        self.company = company
    
    def generate_tva_declaration(
        self,
        start_date: date,
        end_date: date,
        declaration_type: str = 'MONTHLY'
    ) -> Dict[str, Any]:
        """Generate TVA (VAT) declaration for DGI."""
        
        # Get TVA collected (on sales)
        tva_collected = self._calculate_tva_collected(start_date, end_date)
        
        # Get TVA paid (on purchases)
        tva_paid = self._calculate_tva_paid(start_date, end_date)
        
        # Calculate net TVA due
        net_tva_due = tva_collected['total'] - tva_paid['total']
        
        # Get previous period credit/debit
        previous_balance = self._get_previous_tva_balance(start_date)
        
        # Calculate final amount due
        final_amount_due = net_tva_due + previous_balance
        
        return {
            'declaration_info': {
                'company': {
                    'name': self.company.name,
                    'ice': self.company.ice,
                    'if_number': self.company.if_number,
                    'rc': self.company.rc
                },
                'period': {
                    'start_date': start_date,
                    'end_date': end_date,
                    'type': declaration_type
                }
            },
            'tva_collected': tva_collected,
            'tva_paid': tva_paid,
            'net_tva_due': net_tva_due,
            'previous_balance': previous_balance,
            'final_amount_due': final_amount_due,
            'payment_due_date': self._calculate_payment_due_date(end_date, declaration_type)
        }
    
    def _calculate_tva_collected(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Calculate TVA collected on sales."""
        
        # Get customer invoices in period
        invoices = Invoice.objects.filter(
            company=self.company,
            invoice_type='CUSTOMER',
            state='POSTED',
            invoice_date__range=[start_date, end_date]
        )
        
        tva_by_rate = {}
        total_tva = Decimal('0')
        total_ht = Decimal('0')
        
        for invoice in invoices:
            # Group by tax rate
            for line in invoice.lines.all():
                if line.tax_amount > 0:
                    tax_rate = line.tax_rate
                    if tax_rate not in tva_by_rate:
                        tva_by_rate[tax_rate] = {
                            'rate': tax_rate,
                            'base_amount': Decimal('0'),
                            'tax_amount': Decimal('0'),
                            'invoice_count': 0
                        }
                    
                    tva_by_rate[tax_rate]['base_amount'] += line.subtotal
                    tva_by_rate[tax_rate]['tax_amount'] += line.tax_amount
                    tva_by_rate[tax_rate]['invoice_count'] += 1
                    
                    total_tva += line.tax_amount
                    total_ht += line.subtotal
        
        return {
            'by_rate': tva_by_rate,
            'total_ht': total_ht,
            'total': total_tva,
            'invoice_count': invoices.count()
        }
    
    def _calculate_tva_paid(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Calculate TVA paid on purchases."""
        
        # Get supplier invoices in period
        invoices = Invoice.objects.filter(
            company=self.company,
            invoice_type='SUPPLIER',
            state='POSTED',
            invoice_date__range=[start_date, end_date]
        )
        
        tva_by_rate = {}
        total_tva = Decimal('0')
        total_ht = Decimal('0')
        
        for invoice in invoices:
            # Group by tax rate
            for line in invoice.lines.all():
                if line.tax_amount > 0:
                    tax_rate = line.tax_rate
                    if tax_rate not in tva_by_rate:
                        tva_by_rate[tax_rate] = {
                            'rate': tax_rate,
                            'base_amount': Decimal('0'),
                            'tax_amount': Decimal('0'),
                            'invoice_count': 0
                        }
                    
                    tva_by_rate[tax_rate]['base_amount'] += line.subtotal
                    tva_by_rate[tax_rate]['tax_amount'] += line.tax_amount
                    tva_by_rate[tax_rate]['invoice_count'] += 1
                    
                    total_tva += line.tax_amount
                    total_ht += line.subtotal
        
        return {
            'by_rate': tva_by_rate,
            'total_ht': total_ht,
            'total': total_tva,
            'invoice_count': invoices.count()
        }
    
    def _get_previous_tva_balance(self, period_start: date) -> Decimal:
        """Get TVA balance from previous period."""
        
        # Get TVA payable account balance
        tva_account = Account.objects.filter(
            company=self.company,
            code='44551',  # TVA à Payer
            is_active=True
        ).first()
        
        if not tva_account:
            return Decimal('0')
        
        # Get balance as of period start
        lines = JournalEntryLine.objects.filter(
            account=tva_account,
            journal_entry__date__lt=period_start,
            journal_entry__state='POSTED'
        )
        
        credits = lines.aggregate(
            total=Coalesce(Sum('credit_amount'), Decimal('0'))
        )['total']
        
        debits = lines.aggregate(
            total=Coalesce(Sum('debit_amount'), Decimal('0'))
        )['total']
        
        # TVA payable has credit normal balance
        return credits - debits
    
    def _calculate_payment_due_date(self, period_end: date, declaration_type: str) -> date:
        """Calculate TVA payment due date."""
        
        if declaration_type == 'MONTHLY':
            # Due by 20th of following month
            if period_end.month == 12:
                return date(period_end.year + 1, 1, 20)
            else:
                return date(period_end.year, period_end.month + 1, 20)
        elif declaration_type == 'QUARTERLY':
            # Due by 20th of month following quarter end
            quarter_end_month = period_end.month
            if quarter_end_month in [3, 6, 9]:
                return date(period_end.year, quarter_end_month + 1, 20)
            else:  # December
                return date(period_end.year + 1, 1, 20)
        
        return period_end + timedelta(days=30)  # Default
    
    def generate_ras_tva_report(
        self,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Generate RAS/TVA (withheld VAT) report."""
        
        # Get supplier payments with RAS/TVA
        payments_with_ras = Payment.objects.filter(
            company=self.company,
            payment_type='SUPPLIER',
            state='CONFIRMED',
            payment_date__range=[start_date, end_date],
            ras_tva_amount__gt=0
        )
        
        total_ras_tva = Decimal('0')
        supplier_details = {}
        
        for payment in payments_with_ras:
            supplier_id = payment.supplier.id
            if supplier_id not in supplier_details:
                supplier_details[supplier_id] = {
                    'supplier': {
                        'name': payment.supplier.name,
                        'ice': payment.supplier.ice,
                        'if_number': payment.supplier.if_number
                    },
                    'payments': [],
                    'total_ras_tva': Decimal('0'),
                    'total_payment': Decimal('0')
                }
            
            supplier_details[supplier_id]['payments'].append({
                'payment_number': payment.payment_number,
                'payment_date': payment.payment_date,
                'amount': payment.amount,
                'ras_tva_amount': payment.ras_tva_amount,
                'ras_tva_rate': payment.ras_tva_rate
            })
            
            supplier_details[supplier_id]['total_ras_tva'] += payment.ras_tva_amount
            supplier_details[supplier_id]['total_payment'] += payment.amount
            total_ras_tva += payment.ras_tva_amount
        
        return {
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'company_info': {
                'name': self.company.name,
                'ice': self.company.ice,
                'if_number': self.company.if_number
            },
            'suppliers': supplier_details,
            'summary': {
                'total_ras_tva': total_ras_tva,
                'supplier_count': len(supplier_details),
                'payment_count': payments_with_ras.count()
            }
        }
    
    def generate_tax_summary_report(
        self,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Generate comprehensive tax summary report."""
        
        # TVA summary
        tva_declaration = self.generate_tva_declaration(start_date, end_date)
        
        # RAS/TVA summary
        ras_tva_report = self.generate_ras_tva_report(start_date, end_date)
        
        # Corporate tax provisions (estimated)
        corporate_tax = self._calculate_corporate_tax_provision(start_date, end_date)
        
        # Professional tax
        professional_tax = self._calculate_professional_tax(start_date, end_date)
        
        return {
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'company_info': {
                'name': self.company.name,
                'ice': self.company.ice,
                'if_number': self.company.if_number,
                'rc': self.company.rc
            },
            'tva_summary': {
                'collected': tva_declaration['tva_collected']['total'],
                'paid': tva_declaration['tva_paid']['total'],
                'net_due': tva_declaration['net_tva_due']
            },
            'ras_tva_summary': {
                'total_withheld': ras_tva_report['summary']['total_ras_tva'],
                'supplier_count': ras_tva_report['summary']['supplier_count']
            },
            'corporate_tax': corporate_tax,
            'professional_tax': professional_tax,
            'total_tax_liability': (
                tva_declaration['final_amount_due'] +
                corporate_tax['provision'] +
                professional_tax['amount']
            )
        }
    
    def _calculate_corporate_tax_provision(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Calculate corporate tax provision."""
        
        # Get net income for the period
        revenue_accounts = Account.objects.filter(
            company=self.company,
            code__startswith='7',
            is_active=True
        )
        
        expense_accounts = Account.objects.filter(
            company=self.company,
            code__startswith='6',
            is_active=True
        )
        
        total_revenue = Decimal('0')
        for account in revenue_accounts:
            lines = JournalEntryLine.objects.filter(
                account=account,
                journal_entry__date__range=[start_date, end_date],
                journal_entry__state='POSTED'
            )
            total_revenue += lines.aggregate(
                total=Coalesce(Sum('credit_amount'), Decimal('0'))
            )['total']
        
        total_expenses = Decimal('0')
        for account in expense_accounts:
            lines = JournalEntryLine.objects.filter(
                account=account,
                journal_entry__date__range=[start_date, end_date],
                journal_entry__state='POSTED'
            )
            total_expenses += lines.aggregate(
                total=Coalesce(Sum('debit_amount'), Decimal('0'))
            )['total']
        
        net_income = total_revenue - total_expenses
        
        # Corporate tax rate in Morocco is typically 31% for companies
        # with revenue > 3M MAD, 17.5% for smaller companies
        if total_revenue > Decimal('3000000'):  # 3M MAD
            tax_rate = Decimal('0.31')
        else:
            tax_rate = Decimal('0.175')
        
        tax_provision = net_income * tax_rate if net_income > 0 else Decimal('0')
        
        return {
            'net_income': net_income,
            'tax_rate': tax_rate * 100,
            'provision': tax_provision
        }
    
    def _calculate_professional_tax(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Calculate professional tax (Taxe Professionnelle)."""
        
        # Professional tax is based on rental value of business premises
        # This is a simplified calculation - actual calculation is more complex
        
        # Get rental expenses (account 6132)
        rental_account = Account.objects.filter(
            company=self.company,
            code='6132',  # Redevances de crédit-bail et contrats assimilés
            is_active=True
        ).first()
        
        annual_rental = Decimal('0')
        if rental_account:
            lines = JournalEntryLine.objects.filter(
                account=rental_account,
                journal_entry__date__range=[start_date, end_date],
                journal_entry__state='POSTED'
            )
            period_rental = lines.aggregate(
                total=Coalesce(Sum('debit_amount'), Decimal('0'))
            )['total']
            
            # Annualize the rental amount
            period_days = (end_date - start_date).days
            annual_rental = period_rental * 365 / period_days if period_days > 0 else Decimal('0')
        
        # Professional tax rate is typically 10.5% of rental value
        tax_rate = Decimal('0.105')
        professional_tax = annual_rental * tax_rate
        
        return {
            'annual_rental_value': annual_rental,
            'tax_rate': tax_rate * 100,
            'amount': professional_tax
        }
    
    def generate_dgi_compliance_checklist(self) -> Dict[str, Any]:
        """Generate DGI compliance checklist."""
        
        checklist_items = [
            {
                'category': 'Company Registration',
                'items': [
                    {
                        'description': 'ICE number registered',
                        'status': bool(self.company.ice),
                        'value': self.company.ice or 'Not set'
                    },
                    {
                        'description': 'IF number registered',
                        'status': bool(self.company.if_number),
                        'value': self.company.if_number or 'Not set'
                    },
                    {
                        'description': 'RC number registered',
                        'status': bool(self.company.rc),
                        'value': self.company.rc or 'Not set'
                    }
                ]
            },
            {
                'category': 'Tax Accounts Setup',
                'items': [
                    {
                        'description': 'TVA à Payer account (44551)',
                        'status': Account.objects.filter(
                            company=self.company,
                            code='44551',
                            is_active=True
                        ).exists()
                    },
                    {
                        'description': 'TVA Récupérable account (34552)',
                        'status': Account.objects.filter(
                            company=self.company,
                            code='34552',
                            is_active=True
                        ).exists()
                    },
                    {
                        'description': 'RAS/TVA account (34553)',
                        'status': Account.objects.filter(
                            company=self.company,
                            code='34553',
                            is_active=True
                        ).exists()
                    }
                ]
            },
            {
                'category': 'Recent Activity',
                'items': [
                    {
                        'description': 'Customer invoices this month',
                        'status': Invoice.objects.filter(
                            company=self.company,
                            invoice_type='CUSTOMER',
                            invoice_date__month=date.today().month,
                            invoice_date__year=date.today().year
                        ).exists()
                    },
                    {
                        'description': 'Supplier invoices this month',
                        'status': Invoice.objects.filter(
                            company=self.company,
                            invoice_type='SUPPLIER',
                            invoice_date__month=date.today().month,
                            invoice_date__year=date.today().year
                        ).exists()
                    }
                ]
            }
        ]
        
        # Calculate overall compliance score
        total_items = sum(len(category['items']) for category in checklist_items)
        passed_items = sum(
            sum(1 for item in category['items'] if item['status'])
            for category in checklist_items
        )
        
        compliance_score = (passed_items / total_items * 100) if total_items > 0 else 0
        
        return {
            'company_info': {
                'name': self.company.name,
                'ice': self.company.ice,
                'if_number': self.company.if_number,
                'rc': self.company.rc
            },
            'checklist': checklist_items,
            'summary': {
                'total_items': total_items,
                'passed_items': passed_items,
                'compliance_score': compliance_score
            },
            'generated_at': datetime.now()
        }
