"""
Comprehensive tests for invoicing module.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta

from .models import Invoice, InvoiceLine, Payment, InvoicePayment
from .services import InvoiceGenerationService, PaymentService, InvoiceWorkflowService
from .reports import ARReportGenerator, APReportGenerator
from modules.sales.models import Customer, SalesOrder, SalesOrderLine
from modules.purchasing.models import Supplier, PurchaseOrder, PurchaseOrderLine
from modules.catalog.models import Product, ProductCategory, UnitOfMeasure
from core.companies.models import Company
from core.sequences.models import DocumentSequence

User = get_user_model()


class InvoiceModelTest(TestCase):
    """Test cases for Invoice model."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345",
            if_number="12345678",
            rc="RC123456"
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            company=self.company
        )
        
        self.customer = Customer.objects.create(
            company=self.company,
            name="Test Customer",
            ice="987654321098765",
            email="customer@example.com"
        )
        
        self.supplier = Supplier.objects.create(
            company=self.company,
            name="Test Supplier",
            ice="555666777888999",
            email="supplier@example.com"
        )
        
        # Create document sequences
        DocumentSequence.objects.create(
            company=self.company,
            document_type="invoice_customer",
            prefix="INV",
            next_number=1
        )
        
        DocumentSequence.objects.create(
            company=self.company,
            document_type="invoice_supplier",
            prefix="BILL",
            next_number=1
        )
    
    def test_customer_invoice_creation(self):
        """Test creating a customer invoice."""
        invoice = Invoice.objects.create(
            company=self.company,
            invoice_type='CUSTOMER',
            customer=self.customer,
            invoice_date=timezone.now().date(),
            payment_terms_days=30,
            created_by=self.user
        )
        
        self.assertEqual(invoice.invoice_type, 'CUSTOMER')
        self.assertEqual(invoice.customer, self.customer)
        self.assertIsNone(invoice.supplier)
        self.assertTrue(invoice.invoice_number.startswith('INV'))
        self.assertEqual(invoice.state, 'DRAFT')
        self.assertTrue(invoice.is_customer_invoice())
        self.assertFalse(invoice.is_supplier_invoice())
    
    def test_supplier_invoice_creation(self):
        """Test creating a supplier invoice."""
        invoice = Invoice.objects.create(
            company=self.company,
            invoice_type='SUPPLIER',
            supplier=self.supplier,
            invoice_date=timezone.now().date(),
            supplier_invoice_number="SUP-001",
            supplier_invoice_date=timezone.now().date(),
            payment_terms_days=15,
            created_by=self.user
        )
        
        self.assertEqual(invoice.invoice_type, 'SUPPLIER')
        self.assertEqual(invoice.supplier, self.supplier)
        self.assertIsNone(invoice.customer)
        self.assertTrue(invoice.invoice_number.startswith('BILL'))
        self.assertEqual(invoice.supplier_invoice_number, "SUP-001")
        self.assertTrue(invoice.is_supplier_invoice())
        self.assertFalse(invoice.is_customer_invoice())
    
    def test_invoice_totals_calculation(self):
        """Test invoice totals calculation."""
        # Create product and category
        category = ProductCategory.objects.create(
            company=self.company,
            name="Test Category",
            code="TEST"
        )
        
        uom = UnitOfMeasure.objects.create(
            company=self.company,
            name="Unit",
            code="UN"
        )
        
        product = Product.objects.create(
            company=self.company,
            name="Test Product",
            code="PROD001",
            category=category,
            uom=uom,
            sale_price=Decimal('100.00')
        )
        
        invoice = Invoice.objects.create(
            company=self.company,
            invoice_type='CUSTOMER',
            customer=self.customer,
            invoice_date=timezone.now().date(),
            created_by=self.user
        )
        
        # Add invoice lines
        InvoiceLine.objects.create(
            invoice=invoice,
            product=product,
            description="Test Product",
            quantity=Decimal('2.00'),
            unit_price=Decimal('100.00'),
            tax_rate=Decimal('20.00')
        )
        
        InvoiceLine.objects.create(
            invoice=invoice,
            product=product,
            description="Test Product 2",
            quantity=Decimal('1.00'),
            unit_price=Decimal('50.00'),
            discount_percent=Decimal('10.00'),
            tax_rate=Decimal('20.00')
        )
        
        # Calculate totals
        invoice.calculate_totals()
        
        # Check calculations
        # Line 1: 2 * 100 = 200
        # Line 2: 1 * 50 - 10% = 45
        # Subtotal: 200 + 45 = 245
        # Tax: (200 * 20%) + (45 * 20%) = 40 + 9 = 49
        # Total: 245 + 49 = 294
        
        self.assertEqual(invoice.subtotal, Decimal('245.00'))
        self.assertEqual(invoice.tax_amount, Decimal('49.00'))
        self.assertEqual(invoice.total_amount, Decimal('294.00'))
    
    def test_invoice_state_transitions(self):
        """Test invoice state transitions."""
        invoice = Invoice.objects.create(
            company=self.company,
            invoice_type='CUSTOMER',
            customer=self.customer,
            invoice_date=timezone.now().date(),
            created_by=self.user
        )
        
        # Test validation
        self.assertEqual(invoice.state, 'DRAFT')
        invoice.validate_invoice(self.user)
        self.assertEqual(invoice.state, 'VALIDATED')
        
        # Test posting
        invoice.post_invoice()
        self.assertEqual(invoice.state, 'POSTED')
        
        # Test cancellation
        invoice.cancel_invoice("Test cancellation")
        self.assertEqual(invoice.state, 'CANCELLED')
        self.assertIn("Test cancellation", invoice.notes)
    
    def test_overdue_calculation(self):
        """Test overdue calculation."""
        past_date = timezone.now().date() - timedelta(days=10)
        
        invoice = Invoice.objects.create(
            company=self.company,
            invoice_type='CUSTOMER',
            customer=self.customer,
            invoice_date=past_date,
            due_date=past_date + timedelta(days=5),  # Due 5 days ago
            state='POSTED',
            total_amount=Decimal('100.00'),
            outstanding_amount=Decimal('100.00'),
            created_by=self.user
        )
        
        self.assertTrue(invoice.is_overdue())
        self.assertEqual(invoice.days_overdue(), 5)


class PaymentModelTest(TestCase):
    """Test cases for Payment model."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345"
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            company=self.company
        )
        
        self.customer = Customer.objects.create(
            company=self.company,
            name="Test Customer",
            ice="987654321098765"
        )
        
        # Create document sequence
        DocumentSequence.objects.create(
            company=self.company,
            document_type="payment_customer_payment",
            prefix="PAY",
            next_number=1
        )
    
    def test_customer_payment_creation(self):
        """Test creating a customer payment."""
        payment = Payment.objects.create(
            company=self.company,
            payment_type='CUSTOMER_PAYMENT',
            customer=self.customer,
            amount=Decimal('500.00'),
            payment_date=timezone.now().date(),
            payment_method='BANK_TRANSFER',
            created_by=self.user
        )
        
        self.assertEqual(payment.payment_type, 'CUSTOMER_PAYMENT')
        self.assertEqual(payment.customer, self.customer)
        self.assertEqual(payment.amount, Decimal('500.00'))
        self.assertTrue(payment.payment_number.startswith('PAY'))
        self.assertEqual(payment.state, 'DRAFT')
    
    def test_payment_confirmation(self):
        """Test payment confirmation."""
        payment = Payment.objects.create(
            company=self.company,
            payment_type='CUSTOMER_PAYMENT',
            customer=self.customer,
            amount=Decimal('500.00'),
            payment_date=timezone.now().date(),
            created_by=self.user
        )
        
        self.assertEqual(payment.state, 'DRAFT')
        
        payment.confirm_payment(self.user)
        
        self.assertEqual(payment.state, 'CONFIRMED')
        self.assertEqual(payment.confirmed_by, self.user)
        self.assertIsNotNone(payment.confirmed_at)


class InvoiceGenerationServiceTest(TestCase):
    """Test cases for InvoiceGenerationService."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345"
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            company=self.company
        )
        
        self.customer = Customer.objects.create(
            company=self.company,
            name="Test Customer",
            ice="987654321098765"
        )
        
        # Create product
        category = ProductCategory.objects.create(
            company=self.company,
            name="Test Category",
            code="TEST"
        )
        
        uom = UnitOfMeasure.objects.create(
            company=self.company,
            name="Unit",
            code="UN"
        )
        
        self.product = Product.objects.create(
            company=self.company,
            name="Test Product",
            code="PROD001",
            category=category,
            uom=uom,
            sale_price=Decimal('100.00')
        )
        
        # Create sales order
        self.sales_order = SalesOrder.objects.create(
            company=self.company,
            customer=self.customer,
            order_date=timezone.now().date(),
            state='CONFIRMED',
            created_by=self.user
        )
        
        SalesOrderLine.objects.create(
            order=self.sales_order,
            product=self.product,
            quantity=Decimal('5.00'),
            unit_price=Decimal('100.00')
        )
        
        # Create document sequence
        DocumentSequence.objects.create(
            company=self.company,
            document_type="invoice_customer",
            prefix="INV",
            next_number=1
        )
    
    def test_create_invoice_from_sales_order(self):
        """Test creating invoice from sales order."""
        invoice = InvoiceGenerationService.create_customer_invoice_from_sales_order(
            sales_order=self.sales_order,
            created_by=self.user
        )
        
        self.assertEqual(invoice.invoice_type, 'CUSTOMER')
        self.assertEqual(invoice.customer, self.customer)
        self.assertEqual(invoice.sales_order, self.sales_order)
        self.assertEqual(invoice.lines.count(), 1)
        
        line = invoice.lines.first()
        self.assertEqual(line.product, self.product)
        self.assertEqual(line.quantity, Decimal('5.00'))
        self.assertEqual(line.unit_price, Decimal('100.00'))


class ARReportGeneratorTest(TestCase):
    """Test cases for AR report generation."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345"
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            company=self.company
        )
        
        self.customer = Customer.objects.create(
            company=self.company,
            name="Test Customer",
            ice="987654321098765"
        )
        
        # Create overdue invoice
        past_date = timezone.now().date() - timedelta(days=45)
        self.overdue_invoice = Invoice.objects.create(
            company=self.company,
            invoice_type='CUSTOMER',
            customer=self.customer,
            invoice_date=past_date,
            due_date=past_date + timedelta(days=30),  # Due 15 days ago
            state='POSTED',
            total_amount=Decimal('1000.00'),
            outstanding_amount=Decimal('1000.00'),
            created_by=self.user
        )
        
        # Create current invoice
        self.current_invoice = Invoice.objects.create(
            company=self.company,
            invoice_type='CUSTOMER',
            customer=self.customer,
            invoice_date=timezone.now().date(),
            due_date=timezone.now().date() + timedelta(days=30),
            state='POSTED',
            total_amount=Decimal('500.00'),
            outstanding_amount=Decimal('500.00'),
            created_by=self.user
        )
    
    def test_aging_report_generation(self):
        """Test aging report generation."""
        report = ARReportGenerator.generate_aging_report(
            company=self.company
        )
        
        self.assertIn('customers', report)
        self.assertIn('total_aging', report)
        self.assertEqual(len(report['customers']), 1)
        
        customer_data = report['customers'][0]
        self.assertEqual(customer_data['customer'], self.customer)
        
        # Check aging buckets
        aging = customer_data['aging']
        self.assertEqual(aging.current, Decimal('500.00'))  # Current invoice
        self.assertEqual(aging.days_1_30, Decimal('1000.00'))  # Overdue invoice
        self.assertEqual(aging.total, Decimal('1500.00'))
    
    def test_overdue_report_generation(self):
        """Test overdue report generation."""
        report = ARReportGenerator.generate_overdue_report(
            company=self.company,
            days_overdue=1
        )
        
        self.assertIn('customers', report)
        self.assertEqual(len(report['customers']), 1)
        
        customer_data = report['customers'][0]
        self.assertEqual(len(customer_data['invoices']), 1)
        
        overdue_invoice = customer_data['invoices'][0]
        self.assertEqual(overdue_invoice['invoice'], self.overdue_invoice)
        self.assertGreater(overdue_invoice['days_overdue'], 0)
