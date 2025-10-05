"""
Financial statements generation for Moroccan accounting standards.
Supports French language and MAD currency formatting.
"""
from django.db.models import Sum, Q
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

from .models import Account, AccountType, JournalEntry, JournalEntryLine
from core.companies.models import Company


@dataclass
class FinancialStatementLine:
    """Data class for financial statement line items."""
    code: str
    name: str
    name_arabic: str
    amount: Decimal
    level: int
    is_total: bool = False
    parent_code: str = ''


@dataclass
class TrialBalanceLine:
    """Data class for trial balance line items."""
    account_code: str
    account_name: str
    opening_balance: Decimal
    debit_total: Decimal
    credit_total: Decimal
    closing_balance: Decimal


class FinancialStatementsService:
    """Service for generating financial statements in French with MAD currency support."""
    
    @classmethod
    def generate_trial_balance(
        cls,
        company: Company,
        as_of_date: date,
        include_zero_balances: bool = False
    ) -> Dict:
        """
        Generate trial balance.
        
        Args:
            company: Company to generate trial balance for
            as_of_date: Date to generate trial balance as of
            include_zero_balances: Whether to include accounts with zero balances
            
        Returns:
            Trial balance data
        """
        accounts = Account.objects.filter(
            company=company,
            is_active=True,
            allow_posting=True
        ).order_by('code')
        
        trial_balance_lines = []
        total_debits = Decimal('0.00')
        total_credits = Decimal('0.00')
        
        for account in accounts:
            # Get opening balance (beginning of fiscal year)
            fiscal_year_start = date(as_of_date.year, 1, 1)
            opening_balance = account.opening_balance
            
            # Get movements for the period
            lines = JournalEntryLine.objects.filter(
                account=account,
                journal_entry__date__range=[fiscal_year_start, as_of_date],
                journal_entry__state='POSTED'
            )
            
            debit_total = sum(line.debit_amount for line in lines)
            credit_total = sum(line.credit_amount for line in lines)
            
            # Calculate closing balance
            if account.normal_balance == 'DEBIT':
                closing_balance = opening_balance + debit_total - credit_total
            else:
                closing_balance = opening_balance + credit_total - debit_total
            
            # Include in trial balance if has balance or movements
            if (include_zero_balances or 
                closing_balance != 0 or 
                debit_total != 0 or 
                credit_total != 0):
                
                trial_balance_lines.append(
                    TrialBalanceLine(
                        account_code=account.code,
                        account_name=account.name,
                        opening_balance=opening_balance,
                        debit_total=debit_total,
                        credit_total=credit_total,
                        closing_balance=closing_balance
                    )
                )
                
                # Add to totals (always show debits as positive, credits as positive)
                if closing_balance >= 0:
                    if account.normal_balance == 'DEBIT':
                        total_debits += closing_balance
                    else:
                        total_credits += abs(closing_balance)
                else:
                    if account.normal_balance == 'DEBIT':
                        total_credits += abs(closing_balance)
                    else:
                        total_debits += abs(closing_balance)
        
        return {
            'company': company,
            'as_of_date': as_of_date,
            'lines': trial_balance_lines,
            'total_debits': total_debits,
            'total_credits': total_credits,
            'is_balanced': total_debits == total_credits
        }
    
    @classmethod
    def generate_balance_sheet(
        cls,
        company: Company,
        as_of_date: date
    ) -> Dict:
        """
        Generate balance sheet (Bilan) according to Moroccan standards.
        
        Args:
            company: Company to generate balance sheet for
            as_of_date: Date to generate balance sheet as of
            
        Returns:
            Balance sheet data
        """
        # Get account types for balance sheet
        asset_types = AccountType.objects.filter(
            company=company,
            category='ASSET'
        ).order_by('code')
        
        liability_types = AccountType.objects.filter(
            company=company,
            category='LIABILITY'
        ).order_by('code')
        
        equity_types = AccountType.objects.filter(
            company=company,
            category='EQUITY'
        ).order_by('code')
        
        # Calculate assets
        assets = cls._calculate_account_type_balances(asset_types, as_of_date)
        total_assets = sum(item.amount for item in assets)
        
        # Calculate liabilities
        liabilities = cls._calculate_account_type_balances(liability_types, as_of_date)
        total_liabilities = sum(item.amount for item in liabilities)
        
        # Calculate equity
        equity = cls._calculate_account_type_balances(equity_types, as_of_date)
        
        # Add current year result to equity
        current_year_result = cls._calculate_current_year_result(company, as_of_date)
        if current_year_result != 0:
            equity.append(
                FinancialStatementLine(
                    code='119',
                    name='Résultat net de l\'exercice',
                    name_arabic='النتيجة الصافية للسنة المالية',
                    amount=current_year_result,
                    level=2
                )
            )
        
        total_equity = sum(item.amount for item in equity)
        total_liabilities_equity = total_liabilities + total_equity
        
        return {
            'company': company,
            'as_of_date': as_of_date,
            'assets': assets,
            'liabilities': liabilities,
            'equity': equity,
            'total_assets': total_assets,
            'total_liabilities': total_liabilities,
            'total_equity': total_equity,
            'total_liabilities_equity': total_liabilities_equity,
            'is_balanced': abs(total_assets - total_liabilities_equity) < Decimal('0.01')
        }
    
    @classmethod
    def generate_income_statement(
        cls,
        company: Company,
        from_date: date,
        to_date: date
    ) -> Dict:
        """
        Generate income statement (Compte de Résultat) according to Moroccan standards.
        
        Args:
            company: Company to generate income statement for
            from_date: Start date of the period
            to_date: End date of the period
            
        Returns:
            Income statement data
        """
        # Get revenue account types
        revenue_types = AccountType.objects.filter(
            company=company,
            category='REVENUE'
        ).order_by('code')
        
        # Get expense account types
        expense_types = AccountType.objects.filter(
            company=company,
            category='EXPENSE'
        ).order_by('code')
        
        # Calculate revenues
        revenues = cls._calculate_account_type_balances_for_period(
            revenue_types, from_date, to_date
        )
        total_revenues = sum(item.amount for item in revenues)
        
        # Calculate expenses
        expenses = cls._calculate_account_type_balances_for_period(
            expense_types, from_date, to_date
        )
        total_expenses = sum(item.amount for item in expenses)
        
        # Calculate net income
        net_income = total_revenues - total_expenses
        
        # Organize by Moroccan P&L structure
        operating_revenues = [item for item in revenues if item.code.startswith('71')]
        financial_revenues = [item for item in revenues if item.code.startswith('73')]
        non_current_revenues = [item for item in revenues if item.code.startswith('75')]
        
        operating_expenses = [item for item in expenses if item.code.startswith('61')]
        financial_expenses = [item for item in expenses if item.code.startswith('63')]
        non_current_expenses = [item for item in expenses if item.code.startswith('65')]
        tax_expenses = [item for item in expenses if item.code.startswith('67')]
        
        # Calculate subtotals
        total_operating_revenues = sum(item.amount for item in operating_revenues)
        total_operating_expenses = sum(item.amount for item in operating_expenses)
        operating_result = total_operating_revenues - total_operating_expenses
        
        total_financial_revenues = sum(item.amount for item in financial_revenues)
        total_financial_expenses = sum(item.amount for item in financial_expenses)
        financial_result = total_financial_revenues - total_financial_expenses
        
        current_result = operating_result + financial_result
        
        total_non_current_revenues = sum(item.amount for item in non_current_revenues)
        total_non_current_expenses = sum(item.amount for item in non_current_expenses)
        non_current_result = total_non_current_revenues - total_non_current_expenses
        
        result_before_tax = current_result + non_current_result
        total_tax_expenses = sum(item.amount for item in tax_expenses)
        
        return {
            'company': company,
            'from_date': from_date,
            'to_date': to_date,
            'operating_revenues': operating_revenues,
            'operating_expenses': operating_expenses,
            'financial_revenues': financial_revenues,
            'financial_expenses': financial_expenses,
            'non_current_revenues': non_current_revenues,
            'non_current_expenses': non_current_expenses,
            'tax_expenses': tax_expenses,
            'total_operating_revenues': total_operating_revenues,
            'total_operating_expenses': total_operating_expenses,
            'operating_result': operating_result,
            'total_financial_revenues': total_financial_revenues,
            'total_financial_expenses': total_financial_expenses,
            'financial_result': financial_result,
            'current_result': current_result,
            'total_non_current_revenues': total_non_current_revenues,
            'total_non_current_expenses': total_non_current_expenses,
            'non_current_result': non_current_result,
            'result_before_tax': result_before_tax,
            'total_tax_expenses': total_tax_expenses,
            'net_income': net_income
        }
    
    @classmethod
    def generate_cash_flow_statement(
        cls,
        company: Company,
        from_date: date,
        to_date: date
    ) -> Dict:
        """
        Generate cash flow statement according to Moroccan standards.
        
        Args:
            company: Company to generate cash flow statement for
            from_date: Start date of the period
            to_date: End date of the period
            
        Returns:
            Cash flow statement data
        """
        # Get cash and cash equivalent accounts
        cash_accounts = Account.objects.filter(
            company=company,
            code__startswith='5',  # Treasury accounts
            is_active=True
        )
        
        # Calculate opening and closing cash balances
        opening_cash = sum(
            account.get_balance(from_date - timedelta(days=1))
            for account in cash_accounts
        )
        
        closing_cash = sum(
            account.get_balance(to_date)
            for account in cash_accounts
        )
        
        net_cash_change = closing_cash - opening_cash
        
        # Get net income from income statement
        income_statement = cls.generate_income_statement(company, from_date, to_date)
        net_income = income_statement['net_income']
        
        # Calculate operating cash flows (simplified)
        # This would need more detailed implementation based on specific requirements
        operating_cash_flows = net_income  # Simplified - would need adjustments for non-cash items
        
        # Calculate investing cash flows
        investing_cash_flows = Decimal('0.00')  # Would need implementation
        
        # Calculate financing cash flows
        financing_cash_flows = Decimal('0.00')  # Would need implementation
        
        return {
            'company': company,
            'from_date': from_date,
            'to_date': to_date,
            'opening_cash': opening_cash,
            'closing_cash': closing_cash,
            'net_cash_change': net_cash_change,
            'operating_cash_flows': operating_cash_flows,
            'investing_cash_flows': investing_cash_flows,
            'financing_cash_flows': financing_cash_flows,
            'net_income': net_income
        }
    
    @classmethod
    def _calculate_account_type_balances(
        cls,
        account_types: List[AccountType],
        as_of_date: date
    ) -> List[FinancialStatementLine]:
        """Calculate balances for account types."""
        lines = []
        
        for account_type in account_types:
            accounts = Account.objects.filter(
                account_type=account_type,
                is_active=True
            )
            
            total_balance = Decimal('0.00')
            for account in accounts:
                balance = account.get_balance(as_of_date)
                total_balance += balance
            
            if total_balance != 0:
                lines.append(
                    FinancialStatementLine(
                        code=account_type.code,
                        name=account_type.name,
                        name_arabic=account_type.name_arabic,
                        amount=abs(total_balance),  # Always show positive amounts
                        level=account_type.level
                    )
                )
        
        return lines
    
    @classmethod
    def _calculate_account_type_balances_for_period(
        cls,
        account_types: List[AccountType],
        from_date: date,
        to_date: date
    ) -> List[FinancialStatementLine]:
        """Calculate balances for account types for a specific period."""
        lines = []
        
        for account_type in account_types:
            accounts = Account.objects.filter(
                account_type=account_type,
                is_active=True
            )
            
            total_balance = Decimal('0.00')
            for account in accounts:
                # Get movements for the period
                journal_lines = JournalEntryLine.objects.filter(
                    account=account,
                    journal_entry__date__range=[from_date, to_date],
                    journal_entry__state='POSTED'
                )
                
                period_debits = sum(line.debit_amount for line in journal_lines)
                period_credits = sum(line.credit_amount for line in journal_lines)
                
                if account.normal_balance == 'DEBIT':
                    period_balance = period_debits - period_credits
                else:
                    period_balance = period_credits - period_debits
                
                total_balance += period_balance
            
            if total_balance != 0:
                lines.append(
                    FinancialStatementLine(
                        code=account_type.code,
                        name=account_type.name,
                        name_arabic=account_type.name_arabic,
                        amount=abs(total_balance),  # Always show positive amounts
                        level=account_type.level
                    )
                )
        
        return lines
    
    @classmethod
    def _calculate_current_year_result(cls, company: Company, as_of_date: date) -> Decimal:
        """Calculate current year result (net income)."""
        fiscal_year_start = date(as_of_date.year, 1, 1)
        
        # Get revenue and expense accounts
        revenue_accounts = Account.objects.filter(
            company=company,
            account_type__category='REVENUE',
            is_active=True
        )
        
        expense_accounts = Account.objects.filter(
            company=company,
            account_type__category='EXPENSE',
            is_active=True
        )
        
        total_revenues = Decimal('0.00')
        total_expenses = Decimal('0.00')
        
        # Calculate total revenues for the year
        for account in revenue_accounts:
            lines = JournalEntryLine.objects.filter(
                account=account,
                journal_entry__date__range=[fiscal_year_start, as_of_date],
                journal_entry__state='POSTED'
            )
            
            period_credits = sum(line.credit_amount for line in lines)
            period_debits = sum(line.debit_amount for line in lines)
            total_revenues += period_credits - period_debits
        
        # Calculate total expenses for the year
        for account in expense_accounts:
            lines = JournalEntryLine.objects.filter(
                account=account,
                journal_entry__date__range=[fiscal_year_start, as_of_date],
                journal_entry__state='POSTED'
            )
            
            period_debits = sum(line.debit_amount for line in lines)
            period_credits = sum(line.credit_amount for line in lines)
            total_expenses += period_debits - period_credits
        
        return total_revenues - total_expenses

    @classmethod
    def format_amount_mad(cls, amount: Decimal) -> str:
        """
        Format amount in MAD currency with French number formatting.

        Args:
            amount: Amount to format

        Returns:
            Formatted amount string (e.g., "1 234,56 DH")
        """
        # French number formatting: space as thousands separator, comma as decimal
        formatted = f"{amount:,.2f}".replace(',', ' ').replace('.', ',')
        return f"{formatted} DH"

    @classmethod
    def get_french_month_name(cls, month: int) -> str:
        """
        Get French month name.

        Args:
            month: Month number (1-12)

        Returns:
            French month name
        """
        french_months = {
            1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril',
            5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août',
            9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre'
        }
        return french_months.get(month, str(month))
