"""
Tests for accounting module.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from rest_framework.test import APITestCase
from rest_framework import status

from core.companies.models import Company
from .models import AccountType, Account, Journal, JournalEntry, JournalEntryLine
from .services import JournalEntryService, JournalEntryLineData, AutomaticAccountingService
from .financial_statements import FinancialStatementsService
from .chart_of_accounts import MoroccanChartOfAccountsService
from modules.invoicing.models import Invoice, Customer

User = get_user_model()


class AccountingModelsTestCase(TestCase):
    """Test cases for accounting models."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            created_by=self.user
        )
        
        # Create account types
        self.asset_type = AccountType.objects.create(
            company=self.company,
            code='1',
            name='Assets',
            name_arabic='الأصول',
            category='ASSET',
            normal_balance='DEBIT',
            created_by=self.user
        )
        
        self.cash_type = AccountType.objects.create(
            company=self.company,
            code='11',
            name='Cash',
            name_arabic='النقد',
            category='ASSET',
            normal_balance='DEBIT',
            parent=self.asset_type,
            created_by=self.user
        )
        
        # Create accounts
        self.cash_account = Account.objects.create(
            company=self.company,
            code='1101',
            name='Cash in Hand',
            account_type=self.cash_type,
            opening_balance=Decimal('1000.00'),
            created_by=self.user
        )
        
        # Create journal
        self.general_journal = Journal.objects.create(
            company=self.company,
            code='GEN',
            name='General Journal',
            journal_type='GENERAL',
            created_by=self.user
        )
    
    def test_account_type_hierarchy(self):
        """Test account type hierarchy."""
        self.assertEqual(self.asset_type.level, 0)
        self.assertEqual(self.cash_type.level, 1)
        self.assertEqual(self.cash_type.parent, self.asset_type)
        self.assertIn(self.cash_type, self.asset_type.children.all())
    
    def test_account_balance_calculation(self):
        """Test account balance calculation."""
        # Initial balance
        self.assertEqual(self.cash_account.current_balance, Decimal('1000.00'))
        
        # Create journal entry
        entry = JournalEntry.objects.create(
            company=self.company,
            journal=self.general_journal,
            date=timezone.now().date(),
            description='Test entry',
            created_by=self.user
        )
        
        # Add lines
        JournalEntryLine.objects.create(
            journal_entry=entry,
            account=self.cash_account,
            description='Cash increase',
            debit_amount=Decimal('500.00')
        )
        
        # Post entry
        entry.post(self.user)
        
        # Check updated balance
        self.cash_account.refresh_from_db()
        self.assertEqual(self.cash_account.current_balance, Decimal('1500.00'))
    
    def test_journal_entry_validation(self):
        """Test journal entry validation."""
        entry = JournalEntry.objects.create(
            company=self.company,
            journal=self.general_journal,
            date=timezone.now().date(),
            description='Test entry',
            created_by=self.user
        )
        
        # Entry without lines should not be balanced
        self.assertFalse(entry.is_balanced())
        
        # Add unbalanced lines
        JournalEntryLine.objects.create(
            journal_entry=entry,
            account=self.cash_account,
            description='Debit line',
            debit_amount=Decimal('100.00')
        )
        
        self.assertFalse(entry.is_balanced())
        
        # Add balancing credit line
        revenue_type = AccountType.objects.create(
            company=self.company,
            code='4',
            name='Revenue',
            name_arabic='الإيرادات',
            category='REVENUE',
            normal_balance='CREDIT',
            created_by=self.user
        )
        
        revenue_account = Account.objects.create(
            company=self.company,
            code='4001',
            name='Sales Revenue',
            account_type=revenue_type,
            created_by=self.user
        )
        
        JournalEntryLine.objects.create(
            journal_entry=entry,
            account=revenue_account,
            description='Credit line',
            credit_amount=Decimal('100.00')
        )
        
        self.assertTrue(entry.is_balanced())


class JournalEntryServiceTestCase(TestCase):
    """Test cases for journal entry service."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            created_by=self.user
        )
        
        # Create Moroccan chart of accounts
        result = MoroccanChartOfAccountsService.create_moroccan_chart_of_accounts(
            company=self.company,
            user=self.user
        )
        
        MoroccanChartOfAccountsService.create_basic_accounts(
            company=self.company,
            user=self.user,
            account_types=result['account_types']
        )
        
        self.general_journal = Journal.objects.get(company=self.company, code='GEN')
    
    def test_create_journal_entry(self):
        """Test creating journal entry with service."""
        lines_data = [
            JournalEntryLineData(
                account_code='5611',
                description='Cash receipt',
                debit_amount=Decimal('1000.00')
            ),
            JournalEntryLineData(
                account_code='7111',
                description='Sales revenue',
                credit_amount=Decimal('1000.00')
            )
        ]
        
        entry = JournalEntryService.create_journal_entry(
            company=self.company,
            journal=self.general_journal,
            date=timezone.now().date(),
            description='Test sales entry',
            lines_data=lines_data,
            user=self.user
        )
        
        self.assertIsNotNone(entry.entry_number)
        self.assertEqual(entry.lines.count(), 2)
        self.assertTrue(entry.is_balanced())
        self.assertEqual(entry.total_debit, Decimal('1000.00'))
        self.assertEqual(entry.total_credit, Decimal('1000.00'))
    
    def test_post_journal_entry(self):
        """Test posting journal entry."""
        lines_data = [
            JournalEntryLineData(
                account_code='5611',
                description='Cash receipt',
                debit_amount=Decimal('500.00')
            ),
            JournalEntryLineData(
                account_code='7111',
                description='Sales revenue',
                credit_amount=Decimal('500.00')
            )
        ]
        
        entry = JournalEntryService.create_journal_entry(
            company=self.company,
            journal=self.general_journal,
            date=timezone.now().date(),
            description='Test entry',
            lines_data=lines_data,
            user=self.user
        )
        
        # Post the entry
        JournalEntryService.post_journal_entry(entry, self.user)
        
        entry.refresh_from_db()
        self.assertEqual(entry.state, 'POSTED')
        self.assertIsNotNone(entry.posted_at)
        self.assertEqual(entry.posted_by, self.user)
        
        # Check account balances updated
        cash_account = Account.objects.get(company=self.company, code='5611')
        self.assertEqual(cash_account.current_balance, Decimal('500.00'))


class FinancialStatementsTestCase(TestCase):
    """Test cases for financial statements."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            created_by=self.user
        )
        
        # Create Moroccan chart of accounts
        result = MoroccanChartOfAccountsService.create_moroccan_chart_of_accounts(
            company=self.company,
            user=self.user
        )
        
        MoroccanChartOfAccountsService.create_basic_accounts(
            company=self.company,
            user=self.user,
            account_types=result['account_types']
        )
    
    def test_trial_balance_generation(self):
        """Test trial balance generation."""
        trial_balance = FinancialStatementsService.generate_trial_balance(
            company=self.company,
            as_of_date=timezone.now().date()
        )
        
        self.assertEqual(trial_balance['company'], self.company)
        self.assertIsInstance(trial_balance['lines'], list)
        self.assertEqual(trial_balance['total_debits'], trial_balance['total_credits'])
        self.assertTrue(trial_balance['is_balanced'])
    
    def test_balance_sheet_generation(self):
        """Test balance sheet generation."""
        balance_sheet = FinancialStatementsService.generate_balance_sheet(
            company=self.company,
            as_of_date=timezone.now().date()
        )
        
        self.assertEqual(balance_sheet['company'], self.company)
        self.assertIsInstance(balance_sheet['assets'], list)
        self.assertIsInstance(balance_sheet['liabilities'], list)
        self.assertIsInstance(balance_sheet['equity'], list)
    
    def test_income_statement_generation(self):
        """Test income statement generation."""
        from_date = timezone.now().date().replace(month=1, day=1)
        to_date = timezone.now().date()
        
        income_statement = FinancialStatementsService.generate_income_statement(
            company=self.company,
            from_date=from_date,
            to_date=to_date
        )
        
        self.assertEqual(income_statement['company'], self.company)
        self.assertEqual(income_statement['from_date'], from_date)
        self.assertEqual(income_statement['to_date'], to_date)
        self.assertIsInstance(income_statement['operating_revenues'], list)
        self.assertIsInstance(income_statement['operating_expenses'], list)


class AccountingAPITestCase(APITestCase):
    """Test cases for accounting API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        self.client.defaults['HTTP_X_COMPANY_ID'] = str(self.company.id)
    
    def test_setup_moroccan_chart_of_accounts(self):
        """Test setting up Moroccan chart of accounts via API."""
        url = '/api/accounting/chart-of-accounts/setup_moroccan_chart/'
        data = {
            'create_moroccan_template': True,
            'create_basic_accounts': True
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('details', response.data)
        
        # Verify account types were created
        self.assertTrue(AccountType.objects.filter(company=self.company).exists())
        
        # Verify basic accounts were created
        self.assertTrue(Account.objects.filter(company=self.company).exists())
        
        # Verify journals were created
        self.assertTrue(Journal.objects.filter(company=self.company).exists())
    
    def test_create_journal_entry_via_api(self):
        """Test creating journal entry via API."""
        # First setup chart of accounts
        self.test_setup_moroccan_chart_of_accounts()
        
        url = '/api/accounting/journal-entries/'
        journal = Journal.objects.get(company=self.company, code='GEN')
        
        data = {
            'journal': str(journal.id),
            'date': timezone.now().date().isoformat(),
            'description': 'Test API entry',
            'reference': 'TEST001',
            'lines': [
                {
                    'account_code': '5611',
                    'description': 'Cash receipt',
                    'debit_amount': '1000.00',
                    'credit_amount': '0.00'
                },
                {
                    'account_code': '7111',
                    'description': 'Sales revenue',
                    'debit_amount': '0.00',
                    'credit_amount': '1000.00'
                }
            ]
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('entry_number', response.data)
        self.assertEqual(response.data['state'], 'DRAFT')
        self.assertEqual(len(response.data['lines']), 2)
    
    def test_generate_trial_balance_via_api(self):
        """Test generating trial balance via API."""
        # First setup chart of accounts
        self.test_setup_moroccan_chart_of_accounts()
        
        url = '/api/accounting/reports/trial_balance/'
        data = {
            'as_of_date': timezone.now().date().isoformat(),
            'include_zero_balances': False
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('lines', response.data)
        self.assertIn('total_debits', response.data)
        self.assertIn('total_credits', response.data)
        self.assertIn('is_balanced', response.data)
