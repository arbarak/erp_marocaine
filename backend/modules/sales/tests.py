"""
Tests for sales app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from datetime import date, timedelta

from core.companies.models import Company
from modules.catalog.models import Product, Category, UnitOfMeasure
from modules.inventory.models import Warehouse, Location
from .models import (
    Customer, CustomerContact, CustomerPriceList,
    SalesQuotation, SalesQuotationLine,
    SalesOrder, SalesOrderLine,
    DeliveryNote, DeliveryNoteLine,
    ReturnNote, ReturnNoteLine
)

User = get_user_model()


class CustomerModelTest(TestCase):
    """Test Customer model."""
    
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
            if_number='12345678',
            rc='RC123456',
            created_by=self.user
        )
        self.user.current_company = self.company
        self.user.save()
    
    def test_customer_creation(self):
        """Test customer creation."""
        customer = Customer.objects.create(
            company=self.company,
            customer_code='CUST001',
            name='Test Customer',
            customer_type='COMPANY',
            ice='987654321098765',
            if_number='87654321',
            email='customer@example.com',
            phone='+212612345678',
            city='Casablanca',
            country='Morocco',
            created_by=self.user
        )
        
        self.assertEqual(customer.customer_code, 'CUST001')
        self.assertEqual(customer.name, 'Test Customer')
        self.assertEqual(customer.ice, '987654321098765')
        self.assertTrue(customer.is_active)
        self.assertTrue(customer.is_approved)
    
    def test_customer_str_representation(self):
        """Test customer string representation."""
        customer = Customer.objects.create(
            company=self.company,
            customer_code='CUST001',
            name='Test Customer',
            created_by=self.user
        )
        
        self.assertEqual(str(customer), 'CUST001 - Test Customer')
    
    def test_customer_full_address(self):
        """Test customer full address property."""
        customer = Customer.objects.create(
            company=self.company,
            customer_code='CUST001',
            name='Test Customer',
            address_line1='123 Main St',
            address_line2='Apt 4B',
            city='Casablanca',
            postal_code='20000',
            country='Morocco',
            created_by=self.user
        )
        
        expected_address = '123 Main St, Apt 4B, Casablanca 20000, Morocco'
        self.assertEqual(customer.full_address, expected_address)
    
    def test_customer_outstanding_balance(self):
        """Test customer outstanding balance calculation."""
        customer = Customer.objects.create(
            company=self.company,
            customer_code='CUST001',
            name='Test Customer',
            created_by=self.user
        )
        
        # Placeholder test - would be implemented with invoice data
        balance = customer.get_outstanding_balance()
        self.assertEqual(balance, Decimal('0.00'))
    
    def test_customer_credit_available(self):
        """Test customer credit available calculation."""
        customer = Customer.objects.create(
            company=self.company,
            customer_code='CUST001',
            name='Test Customer',
            credit_limit=Decimal('10000.00'),
            created_by=self.user
        )
        
        credit_available = customer.get_credit_available()
        self.assertEqual(credit_available, Decimal('10000.00'))


class CustomerContactModelTest(TestCase):
    """Test CustomerContact model."""
    
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
        self.customer = Customer.objects.create(
            company=self.company,
            customer_code='CUST001',
            name='Test Customer',
            created_by=self.user
        )
    
    def test_contact_creation(self):
        """Test contact creation."""
        contact = CustomerContact.objects.create(
            customer=self.customer,
            first_name='John',
            last_name='Doe',
            email='john.doe@example.com',
            phone='+212612345678',
            contact_type='SALES',
            is_primary=True
        )
        
        self.assertEqual(contact.first_name, 'John')
        self.assertEqual(contact.last_name, 'Doe')
        self.assertEqual(contact.full_name, 'John Doe')
        self.assertTrue(contact.is_primary)
    
    def test_primary_contact_uniqueness(self):
        """Test that only one primary contact is allowed per customer."""
        # Create first primary contact
        contact1 = CustomerContact.objects.create(
            customer=self.customer,
            first_name='John',
            last_name='Doe',
            is_primary=True
        )
        
        # Create second primary contact
        contact2 = CustomerContact.objects.create(
            customer=self.customer,
            first_name='Jane',
            last_name='Smith',
            is_primary=True
        )
        
        # Refresh from database
        contact1.refresh_from_db()
        contact2.refresh_from_db()
        
        # Only the second contact should be primary
        self.assertFalse(contact1.is_primary)
        self.assertTrue(contact2.is_primary)


class SalesQuotationModelTest(TestCase):
    """Test SalesQuotation model."""
    
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
        self.customer = Customer.objects.create(
            company=self.company,
            customer_code='CUST001',
            name='Test Customer',
            created_by=self.user
        )
        
        # Create product and UoM
        self.category = Category.objects.create(
            company=self.company,
            name='Test Category',
            code='CAT001',
            created_by=self.user
        )
        self.uom = UnitOfMeasure.objects.create(
            company=self.company,
            name='Unit',
            symbol='UN',
            uom_type='UNIT',
            created_by=self.user
        )
        self.product = Product.objects.create(
            company=self.company,
            name='Test Product',
            internal_reference='PROD001',
            category=self.category,
            uom=self.uom,
            list_price=Decimal('100.00'),
            created_by=self.user
        )
    
    def test_quotation_creation(self):
        """Test quotation creation."""
        quotation = SalesQuotation.objects.create(
            company=self.company,
            quotation_number='QUOTE001',
            customer=self.customer,
            quotation_date=date.today(),
            valid_until=date.today() + timedelta(days=30),
            sales_person=self.user,
            created_by=self.user
        )
        
        self.assertEqual(quotation.quotation_number, 'QUOTE001')
        self.assertEqual(quotation.customer, self.customer)
        self.assertEqual(quotation.state, 'DRAFT')
    
    def test_quotation_send_to_customer(self):
        """Test sending quotation to customer."""
        quotation = SalesQuotation.objects.create(
            company=self.company,
            quotation_number='QUOTE001',
            customer=self.customer,
            quotation_date=date.today(),
            valid_until=date.today() + timedelta(days=30),
            sales_person=self.user,
            created_by=self.user
        )
        
        quotation.send_to_customer()
        self.assertEqual(quotation.state, 'SENT')
    
    def test_quotation_calculate_totals(self):
        """Test quotation total calculation."""
        quotation = SalesQuotation.objects.create(
            company=self.company,
            quotation_number='QUOTE001',
            customer=self.customer,
            quotation_date=date.today(),
            valid_until=date.today() + timedelta(days=30),
            sales_person=self.user,
            created_by=self.user
        )
        
        # Add quotation line
        SalesQuotationLine.objects.create(
            quotation=quotation,
            product=self.product,
            quantity=Decimal('5.0'),
            uom=self.uom,
            unit_price=Decimal('100.00')
        )
        
        quotation.calculate_totals()
        self.assertEqual(quotation.subtotal, Decimal('500.00'))
        self.assertEqual(quotation.tax_amount, Decimal('100.00'))  # 20% VAT
        self.assertEqual(quotation.total_amount, Decimal('600.00'))


class SalesOrderModelTest(TestCase):
    """Test SalesOrder model."""
    
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
        self.customer = Customer.objects.create(
            company=self.company,
            customer_code='CUST001',
            name='Test Customer',
            created_by=self.user
        )
    
    def test_sales_order_creation(self):
        """Test sales order creation."""
        sales_order = SalesOrder.objects.create(
            company=self.company,
            order_number='SO001',
            customer=self.customer,
            order_date=date.today(),
            requested_delivery_date=date.today() + timedelta(days=7),
            sales_person=self.user,
            created_by=self.user
        )
        
        self.assertEqual(sales_order.order_number, 'SO001')
        self.assertEqual(sales_order.customer, self.customer)
        self.assertEqual(sales_order.state, 'DRAFT')
    
    def test_sales_order_confirm(self):
        """Test sales order confirmation."""
        sales_order = SalesOrder.objects.create(
            company=self.company,
            order_number='SO001',
            customer=self.customer,
            order_date=date.today(),
            requested_delivery_date=date.today() + timedelta(days=7),
            sales_person=self.user,
            created_by=self.user
        )
        
        sales_order.confirm()
        self.assertEqual(sales_order.state, 'CONFIRMED')
    
    def test_sales_order_cancel(self):
        """Test sales order cancellation."""
        sales_order = SalesOrder.objects.create(
            company=self.company,
            order_number='SO001',
            customer=self.customer,
            order_date=date.today(),
            requested_delivery_date=date.today() + timedelta(days=7),
            sales_person=self.user,
            created_by=self.user
        )
        
        sales_order.cancel('Customer request')
        self.assertEqual(sales_order.state, 'CANCELLED')
        self.assertIn('Customer request', sales_order.notes)


class CustomerAPITest(APITestCase):
    """Test Customer API endpoints."""
    
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
        self.user.current_company = self.company
        self.user.save()
        
        self.client.force_authenticate(user=self.user)
    
    def test_create_customer(self):
        """Test customer creation via API."""
        url = reverse('customer-list')
        data = {
            'customer_code': 'CUST001',
            'name': 'Test Customer',
            'customer_type': 'COMPANY',
            'email': 'customer@example.com',
            'phone': '+212612345678',
            'city': 'Casablanca',
            'country': 'Morocco'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.count(), 1)
        
        customer = Customer.objects.first()
        self.assertEqual(customer.customer_code, 'CUST001')
        self.assertEqual(customer.company, self.company)
    
    def test_list_customers(self):
        """Test customer list API."""
        # Create test customers
        Customer.objects.create(
            company=self.company,
            customer_code='CUST001',
            name='Customer 1',
            created_by=self.user
        )
        Customer.objects.create(
            company=self.company,
            customer_code='CUST002',
            name='Customer 2',
            created_by=self.user
        )
        
        url = reverse('customer-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_customer_approval(self):
        """Test customer approval API."""
        customer = Customer.objects.create(
            company=self.company,
            customer_code='CUST001',
            name='Test Customer',
            is_approved=False,
            created_by=self.user
        )
        
        url = reverse('customer-approve', kwargs={'pk': customer.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        customer.refresh_from_db()
        self.assertTrue(customer.is_approved)
        self.assertEqual(customer.approved_by, self.user)
