"""
Tests for reporting module.
"""
from decimal import Decimal
from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from core.companies.models import Company
from modules.accounting.models import AccountType, Account, Journal, JournalEntry, JournalEntryLine
from modules.invoicing.models import Invoice, InvoiceLine, Payment
from modules.sales.models import Customer
from modules.purchasing.models import Supplier
from .models import ReportTemplate, ReportExecution, Dashboard, AuditLog
from .financial_reports import AdvancedFinancialReportService, KPIAnalyticsService
from .tax_compliance import MoroccanTaxComplianceService
from .dashboard_service import ManagementDashboardService
from .audit_service import AuditTrailService

User = get_user_model()


class ReportingModelsTestCase(TestCase):
    """Test cases for reporting models."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            rc='RC123456'
        )
        
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.user.current_company = self.company
        self.user.save()
    
    def test_report_template_creation(self):
        """Test report template creation."""
        template = ReportTemplate.objects.create(
            company=self.company,
            name='Test Financial Report',
            description='Test description',
            report_type='FINANCIAL',
            template_config={'test': 'config'},
            created_by=self.user
        )
        
        self.assertEqual(template.name, 'Test Financial Report')
        self.assertEqual(template.report_type, 'FINANCIAL')
        self.assertEqual(template.company, self.company)
        self.assertEqual(template.created_by, self.user)
        self.assertTrue(template.is_active)
    
    def test_report_execution_creation(self):
        """Test report execution creation."""
        template = ReportTemplate.objects.create(
            company=self.company,
            name='Test Template',
            report_type='FINANCIAL',
            created_by=self.user
        )
        
        execution = ReportExecution.objects.create(
            company=self.company,
            template=template,
            name='Test Execution',
            parameters={'start_date': '2024-01-01'},
            format='PDF',
            created_by=self.user
        )
        
        self.assertEqual(execution.template, template)
        self.assertEqual(execution.status, 'PENDING')
        self.assertEqual(execution.progress, 0)
    
    def test_dashboard_creation(self):
        """Test dashboard creation."""
        dashboard = Dashboard.objects.create(
            company=self.company,
            name='Executive Dashboard',
            description='Main executive dashboard',
            layout_config={'widgets': []},
            created_by=self.user
        )
        
        self.assertEqual(dashboard.name, 'Executive Dashboard')
        self.assertEqual(dashboard.refresh_interval, 300)
        self.assertFalse(dashboard.is_default)
    
    def test_audit_log_creation(self):
        """Test audit log creation."""
        audit_log = AuditLog.objects.create(
            company=self.company,
            action_type='CREATE',
            description='Created test invoice',
            user=self.user,
            ip_address='127.0.0.1',
            severity='MEDIUM'
        )
        
        self.assertEqual(audit_log.action_type, 'CREATE')
        self.assertEqual(audit_log.user, self.user)
        self.assertEqual(audit_log.severity, 'MEDIUM')


class FinancialReportsServiceTestCase(TestCase):
    """Test cases for financial reports service."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345'
        )
        
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        # Create account types
        self.revenue_type = AccountType.objects.create(
            company=self.company,
            name='Revenue',
            category='REVENUE',
            normal_balance='CREDIT'
        )
        
        self.expense_type = AccountType.objects.create(
            company=self.company,
            name='Expenses',
            category='EXPENSE',
            normal_balance='DEBIT'
        )
        
        # Create accounts
        self.revenue_account = Account.objects.create(
            company=self.company,
            account_type=self.revenue_type,
            code='7111',
            name='Sales Revenue'
        )
        
        self.expense_account = Account.objects.create(
            company=self.company,
            account_type=self.expense_type,
            code='6111',
            name='Cost of Sales'
        )
        
        # Create journal
        self.journal = Journal.objects.create(
            company=self.company,
            name='General Journal',
            code='GJ',
            journal_type='GENERAL'
        )
        
        self.service = AdvancedFinancialReportService(self.company)
    
    def test_generate_detailed_pnl(self):
        """Test detailed P&L generation."""
        start_date = date(2024, 1, 1)
        end_date = date(2024, 1, 31)
        
        # Create test journal entry
        entry = JournalEntry.objects.create(
            company=self.company,
            journal=self.journal,
            reference='TEST001',
            date=date(2024, 1, 15),
            description='Test entry',
            state='POSTED'
        )
        
        # Add lines
        JournalEntryLine.objects.create(
            journal_entry=entry,
            account=self.revenue_account,
            description='Revenue',
            credit_amount=Decimal('1000.00')
        )
        
        JournalEntryLine.objects.create(
            journal_entry=entry,
            account=self.expense_account,
            description='Expense',
            debit_amount=Decimal('1000.00')
        )
        
        entry.calculate_totals()
        entry.save()
        
        # Generate report
        report = self.service.generate_detailed_pnl(start_date, end_date)
        
        self.assertIn('period', report)
        self.assertEqual(report['period']['start_date'], start_date)
        self.assertEqual(report['period']['end_date'], end_date)
        self.assertIn('revenue', report['period']['data'])
        self.assertIn('expenses', report['period']['data'])


class TaxComplianceServiceTestCase(TestCase):
    """Test cases for tax compliance service."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678'
        )
        
        self.customer = Customer.objects.create(
            company=self.company,
            name='Test Customer',
            email='customer@test.com'
        )
        
        self.service = MoroccanTaxComplianceService(self.company)
    
    def test_generate_tva_declaration(self):
        """Test TVA declaration generation."""
        start_date = date(2024, 1, 1)
        end_date = date(2024, 1, 31)
        
        # Create test invoice
        invoice = Invoice.objects.create(
            company=self.company,
            customer=self.customer,
            invoice_type='CUSTOMER',
            invoice_number='INV001',
            invoice_date=date(2024, 1, 15),
            state='POSTED',
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('200.00'),
            total_amount=Decimal('1200.00')
        )
        
        # Add invoice line
        InvoiceLine.objects.create(
            invoice=invoice,
            description='Test product',
            quantity=Decimal('1'),
            unit_price=Decimal('1000.00'),
            subtotal=Decimal('1000.00'),
            tax_rate=Decimal('20.00'),
            tax_amount=Decimal('200.00'),
            total=Decimal('1200.00')
        )
        
        # Generate declaration
        declaration = self.service.generate_tva_declaration(start_date, end_date)
        
        self.assertIn('declaration_info', declaration)
        self.assertIn('tva_collected', declaration)
        self.assertIn('tva_paid', declaration)
        self.assertIn('net_tva_due', declaration)
        
        # Check company info
        self.assertEqual(declaration['declaration_info']['company']['ice'], self.company.ice)
    
    def test_generate_dgi_compliance_checklist(self):
        """Test DGI compliance checklist generation."""
        checklist = self.service.generate_dgi_compliance_checklist()
        
        self.assertIn('company_info', checklist)
        self.assertIn('checklist', checklist)
        self.assertIn('summary', checklist)
        
        # Check that checklist has categories
        self.assertGreater(len(checklist['checklist']), 0)
        
        # Check compliance score calculation
        self.assertIn('compliance_score', checklist['summary'])
        self.assertGreaterEqual(checklist['summary']['compliance_score'], 0)
        self.assertLessEqual(checklist['summary']['compliance_score'], 100)


class ReportingAPITestCase(APITestCase):
    """Test cases for reporting API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345'
        )
        
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.user.current_company = self.company
        self.user.save()
        
        self.client.force_authenticate(user=self.user)
    
    def test_report_template_crud(self):
        """Test report template CRUD operations."""
        # Create
        data = {
            'name': 'Test Template',
            'description': 'Test description',
            'report_type': 'FINANCIAL',
            'template_config': {'test': 'config'}
        }
        
        response = self.client.post('/api/v1/reporting/templates/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        template_id = response.data['id']
        
        # Read
        response = self.client.get(f'/api/v1/reporting/templates/{template_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Template')
        
        # Update
        data['name'] = 'Updated Template'
        response = self.client.patch(f'/api/v1/reporting/templates/{template_id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Template')
        
        # Delete
        response = self.client.delete(f'/api/v1/reporting/templates/{template_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_executive_dashboard_endpoint(self):
        """Test executive dashboard endpoint."""
        data = {
            'period_days': 30,
            'refresh_data': True
        }
        
        response = self.client.post('/api/v1/reporting/management/executive_dashboard/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response structure
        self.assertIn('period', response.data)
        self.assertIn('financial_metrics', response.data)
        self.assertIn('sales_metrics', response.data)
        self.assertIn('generated_at', response.data)
    
    def test_tax_compliance_checklist_endpoint(self):
        """Test tax compliance checklist endpoint."""
        response = self.client.get('/api/v1/reporting/tax-compliance/compliance_checklist/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response structure
        self.assertIn('company_info', response.data)
        self.assertIn('checklist', response.data)
        self.assertIn('summary', response.data)
    
    def test_data_integrity_endpoint(self):
        """Test data integrity check endpoint."""
        response = self.client.get('/api/v1/reporting/audit/data_integrity/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response structure
        self.assertIn('company', response.data)
        self.assertIn('checks', response.data)
        self.assertIn('summary', response.data)


class AuditServiceTestCase(TestCase):
    """Test cases for audit service."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345'
        )
        
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        self.service = AuditTrailService(self.company)
    
    def test_log_user_action(self):
        """Test logging user actions."""
        audit_log = self.service.log_user_action(
            user=self.user,
            action_type='CREATE',
            description='Created test record',
            severity='MEDIUM'
        )
        
        self.assertEqual(audit_log.user, self.user)
        self.assertEqual(audit_log.action_type, 'CREATE')
        self.assertEqual(audit_log.severity, 'MEDIUM')
        self.assertEqual(audit_log.company, self.company)
    
    def test_generate_audit_report(self):
        """Test audit report generation."""
        # Create some audit logs
        for i in range(5):
            self.service.log_user_action(
                user=self.user,
                action_type='CREATE',
                description=f'Test action {i}',
                severity='LOW'
            )
        
        start_date = date.today() - timedelta(days=1)
        end_date = date.today()
        
        report = self.service.generate_audit_report(start_date, end_date)
        
        self.assertIn('period', report)
        self.assertIn('summary', report)
        self.assertIn('daily_activity', report)
        self.assertEqual(report['summary']['total_actions'], 5)
    
    def test_check_data_integrity(self):
        """Test data integrity checks."""
        report = self.service.check_data_integrity()
        
        self.assertIn('company', report)
        self.assertIn('checks', report)
        self.assertIn('summary', report)
        
        # Should have multiple integrity checks
        self.assertGreater(len(report['checks']), 0)
        
        # Each check should have required fields
        for check in report['checks']:
            self.assertIn('check', check)
            self.assertIn('description', check)
            self.assertIn('status', check)
            self.assertIn(['PASS', 'FAIL'], check['status'])
