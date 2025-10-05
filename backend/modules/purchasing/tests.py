"""
Tests for purchasing app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from datetime import date, timedelta

from core.companies.models import Company
from modules.catalog.models import Category, UnitOfMeasure, Product
from modules.inventory.models import Warehouse, LocationType, Location
from .models import (
    Supplier, SupplierContact, SupplierPriceList,
    RequestForQuotation, RFQLine, RFQSupplierInvitation,
    SupplierQuotation, SupplierQuotationLine,
    PurchaseOrder, PurchaseOrderLine,
    GoodsReceipt, GoodsReceiptLine
)

User = get_user_model()


class SupplierModelTest(TestCase):
    """Test cases for Supplier model."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            rc='RC123456',
            address='Test Address',
            city='Casablanca',
            country='Morocco'
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            current_company=self.company
        )
    
    def test_supplier_creation(self):
        """Test supplier creation."""
        supplier = Supplier.objects.create(
            company=self.company,
            supplier_code='SUP001',
            name='Test Supplier',
            supplier_type='COMPANY',
            ice='987654321098765',
            if_number='87654321',
            email='supplier@example.com',
            phone='+212522123456',
            city='Rabat',
            country='Morocco',
            created_by=self.user
        )
        
        self.assertEqual(supplier.supplier_code, 'SUP001')
        self.assertEqual(supplier.name, 'Test Supplier')
        self.assertEqual(supplier.ice, '987654321098765')
        self.assertTrue(supplier.is_active)
        self.assertFalse(supplier.is_approved)
        self.assertEqual(str(supplier), '[SUP001] Test Supplier')
    
    def test_supplier_ice_validation(self):
        """Test ICE validation."""
        with self.assertRaises(Exception):
            Supplier.objects.create(
                company=self.company,
                supplier_code='SUP002',
                name='Invalid ICE Supplier',
                ice='12345',  # Invalid ICE (too short)
                created_by=self.user
            )
    
    def test_supplier_full_address(self):
        """Test full address property."""
        supplier = Supplier.objects.create(
            company=self.company,
            supplier_code='SUP003',
            name='Address Test Supplier',
            address_line1='123 Main Street',
            address_line2='Suite 100',
            city='Casablanca',
            postal_code='20000',
            country='Morocco',
            created_by=self.user
        )
        
        expected_address = '123 Main Street, Suite 100, Casablanca, 20000, Morocco'
        self.assertEqual(supplier.full_address, expected_address)


class SupplierContactModelTest(TestCase):
    """Test cases for SupplierContact model."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345'
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            current_company=self.company
        )
        
        self.supplier = Supplier.objects.create(
            company=self.company,
            supplier_code='SUP001',
            name='Test Supplier',
            created_by=self.user
        )
    
    def test_contact_creation(self):
        """Test contact creation."""
        contact = SupplierContact.objects.create(
            supplier=self.supplier,
            first_name='John',
            last_name='Doe',
            title='Sales Manager',
            contact_type='SALES',
            email='john.doe@supplier.com',
            phone='+212522123456',
            is_primary=True
        )
        
        self.assertEqual(contact.full_name, 'John Doe')
        self.assertTrue(contact.is_primary)
        self.assertEqual(str(contact), 'John Doe (Test Supplier)')
    
    def test_primary_contact_uniqueness(self):
        """Test that only one primary contact per supplier is allowed."""
        # Create first primary contact
        contact1 = SupplierContact.objects.create(
            supplier=self.supplier,
            first_name='John',
            last_name='Doe',
            is_primary=True
        )
        
        # Create second primary contact
        contact2 = SupplierContact.objects.create(
            supplier=self.supplier,
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


class RFQModelTest(TestCase):
    """Test cases for RFQ models."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345'
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            current_company=self.company
        )
        
        # Create catalog data
        self.category = Category.objects.create(
            company=self.company,
            name='Test Category',
            code='CAT001'
        )
        
        self.uom = UnitOfMeasure.objects.create(
            company=self.company,
            name='Piece',
            symbol='pcs',
            type='UNIT'
        )
        
        self.product = Product.objects.create(
            company=self.company,
            internal_reference='PROD001',
            name='Test Product',
            category=self.category,
            uom=self.uom,
            list_price=Decimal('100.00'),
            cost_price=Decimal('80.00')
        )
        
        # Create warehouse and location
        self.warehouse = Warehouse.objects.create(
            company=self.company,
            code='WH001',
            name='Main Warehouse'
        )
        
        self.location_type = LocationType.objects.create(
            company=self.company,
            name='Internal',
            code='INT',
            usage='INTERNAL'
        )
        
        self.location = Location.objects.create(
            company=self.company,
            warehouse=self.warehouse,
            location_type=self.location_type,
            code='LOC001',
            name='Main Location'
        )
        
        # Create supplier
        self.supplier = Supplier.objects.create(
            company=self.company,
            supplier_code='SUP001',
            name='Test Supplier',
            created_by=self.user
        )
    
    def test_rfq_creation(self):
        """Test RFQ creation."""
        rfq = RequestForQuotation.objects.create(
            company=self.company,
            rfq_number='RFQ001',
            title='Test RFQ',
            rfq_date=date.today(),
            deadline=timezone.now() + timedelta(days=7),
            delivery_location=self.location,
            requested_delivery_date=date.today() + timedelta(days=14),
            created_by=self.user
        )
        
        self.assertEqual(rfq.rfq_number, 'RFQ001')
        self.assertEqual(rfq.state, 'DRAFT')
        self.assertEqual(str(rfq), 'RFQ001 - Test RFQ')
    
    def test_rfq_line_creation(self):
        """Test RFQ line creation."""
        rfq = RequestForQuotation.objects.create(
            company=self.company,
            rfq_number='RFQ001',
            title='Test RFQ',
            rfq_date=date.today(),
            deadline=timezone.now() + timedelta(days=7),
            delivery_location=self.location,
            requested_delivery_date=date.today() + timedelta(days=14),
            created_by=self.user
        )
        
        rfq_line = RFQLine.objects.create(
            rfq=rfq,
            product=self.product,
            quantity=Decimal('10.000000'),
            uom=self.uom,
            description='Test product for RFQ'
        )
        
        self.assertEqual(rfq_line.quantity, Decimal('10.000000'))
        self.assertEqual(str(rfq_line), 'RFQ001 - Test Product: 10.000000')
    
    def test_rfq_send_to_suppliers(self):
        """Test sending RFQ to suppliers."""
        rfq = RequestForQuotation.objects.create(
            company=self.company,
            rfq_number='RFQ001',
            title='Test RFQ',
            rfq_date=date.today(),
            deadline=timezone.now() + timedelta(days=7),
            delivery_location=self.location,
            requested_delivery_date=date.today() + timedelta(days=14),
            created_by=self.user
        )
        
        # Send to supplier
        rfq.send_to_suppliers([self.supplier.id], self.user)
        
        # Check state changed
        self.assertEqual(rfq.state, 'SENT')
        
        # Check invitation created
        invitation = RFQSupplierInvitation.objects.get(rfq=rfq, supplier=self.supplier)
        self.assertEqual(invitation.invited_by, self.user)
        self.assertFalse(invitation.response_received)


class PurchaseOrderModelTest(TestCase):
    """Test cases for PurchaseOrder models."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345'
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            current_company=self.company
        )
        
        # Create catalog data
        self.category = Category.objects.create(
            company=self.company,
            name='Test Category',
            code='CAT001'
        )
        
        self.uom = UnitOfMeasure.objects.create(
            company=self.company,
            name='Piece',
            symbol='pcs',
            type='UNIT'
        )
        
        self.product = Product.objects.create(
            company=self.company,
            internal_reference='PROD001',
            name='Test Product',
            category=self.category,
            uom=self.uom,
            list_price=Decimal('100.00'),
            cost_price=Decimal('80.00')
        )
        
        # Create warehouse and location
        self.warehouse = Warehouse.objects.create(
            company=self.company,
            code='WH001',
            name='Main Warehouse'
        )
        
        self.location_type = LocationType.objects.create(
            company=self.company,
            name='Internal',
            code='INT',
            usage='INTERNAL'
        )
        
        self.location = Location.objects.create(
            company=self.company,
            warehouse=self.warehouse,
            location_type=self.location_type,
            code='LOC001',
            name='Main Location'
        )
        
        # Create supplier
        self.supplier = Supplier.objects.create(
            company=self.company,
            supplier_code='SUP001',
            name='Test Supplier',
            created_by=self.user
        )
    
    def test_purchase_order_creation(self):
        """Test purchase order creation."""
        po = PurchaseOrder.objects.create(
            company=self.company,
            po_number='PO001',
            supplier=self.supplier,
            order_date=date.today(),
            expected_delivery_date=date.today() + timedelta(days=14),
            delivery_location=self.location,
            created_by=self.user
        )
        
        self.assertEqual(po.po_number, 'PO001')
        self.assertEqual(po.state, 'DRAFT')
        self.assertEqual(po.approval_state, 'PENDING')
        self.assertEqual(str(po), 'PO001 - Test Supplier')
    
    def test_purchase_order_approval(self):
        """Test purchase order approval."""
        po = PurchaseOrder.objects.create(
            company=self.company,
            po_number='PO001',
            supplier=self.supplier,
            order_date=date.today(),
            expected_delivery_date=date.today() + timedelta(days=14),
            delivery_location=self.location,
            created_by=self.user
        )
        
        # Approve the PO
        po.approve(self.user)
        
        self.assertEqual(po.approval_state, 'APPROVED')
        self.assertEqual(po.approved_by, self.user)
        self.assertIsNotNone(po.approved_at)
    
    def test_purchase_order_line_creation(self):
        """Test purchase order line creation."""
        po = PurchaseOrder.objects.create(
            company=self.company,
            po_number='PO001',
            supplier=self.supplier,
            order_date=date.today(),
            expected_delivery_date=date.today() + timedelta(days=14),
            delivery_location=self.location,
            created_by=self.user
        )
        
        po_line = PurchaseOrderLine.objects.create(
            purchase_order=po,
            product=self.product,
            quantity=Decimal('5.000000'),
            uom=self.uom,
            unit_price=Decimal('80.00')
        )
        
        self.assertEqual(po_line.total_price, Decimal('400.00'))
        self.assertEqual(po_line.quantity_remaining, Decimal('5.000000'))
        self.assertFalse(po_line.is_fully_received)
    
    def test_purchase_order_totals_calculation(self):
        """Test purchase order totals calculation."""
        po = PurchaseOrder.objects.create(
            company=self.company,
            po_number='PO001',
            supplier=self.supplier,
            order_date=date.today(),
            expected_delivery_date=date.today() + timedelta(days=14),
            delivery_location=self.location,
            created_by=self.user
        )
        
        # Create PO lines
        PurchaseOrderLine.objects.create(
            purchase_order=po,
            product=self.product,
            quantity=Decimal('5.000000'),
            uom=self.uom,
            unit_price=Decimal('80.00')
        )
        
        # Calculate totals
        po.calculate_totals()
        
        self.assertEqual(po.subtotal, Decimal('400.00'))
        self.assertEqual(po.tax_amount, Decimal('80.00'))  # 20% VAT
        self.assertEqual(po.total_amount, Decimal('480.00'))


class SupplierAPITest(APITestCase):
    """Test cases for Supplier API."""

    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345'
        )

        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            current_company=self.company
        )

        self.client.force_authenticate(user=self.user)

    def test_create_supplier(self):
        """Test creating a supplier via API."""
        data = {
            'supplier_code': 'SUP001',
            'name': 'Test Supplier',
            'supplier_type': 'COMPANY',
            'ice': '987654321098765',
            'if_number': '87654321',
            'email': 'supplier@example.com',
            'phone': '+212522123456',
            'city': 'Rabat',
            'country': 'Morocco'
        }

        response = self.client.post('/api/purchasing/suppliers/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        supplier = Supplier.objects.get(supplier_code='SUP001')
        self.assertEqual(supplier.name, 'Test Supplier')
        self.assertEqual(supplier.company, self.company)
        self.assertEqual(supplier.created_by, self.user)

    def test_list_suppliers(self):
        """Test listing suppliers via API."""
        # Create test supplier
        Supplier.objects.create(
            company=self.company,
            supplier_code='SUP001',
            name='Test Supplier',
            created_by=self.user
        )

        response = self.client.get('/api/purchasing/suppliers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_approve_supplier(self):
        """Test approving a supplier via API."""
        supplier = Supplier.objects.create(
            company=self.company,
            supplier_code='SUP001',
            name='Test Supplier',
            created_by=self.user
        )

        response = self.client.post(f'/api/purchasing/suppliers/{supplier.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        supplier.refresh_from_db()
        self.assertTrue(supplier.is_approved)
        self.assertEqual(supplier.approved_by, self.user)


class RFQAPITest(APITestCase):
    """Test cases for RFQ API."""

    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345'
        )

        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            current_company=self.company
        )

        # Create catalog data
        self.category = Category.objects.create(
            company=self.company,
            name='Test Category',
            code='CAT001'
        )

        self.uom = UnitOfMeasure.objects.create(
            company=self.company,
            name='Piece',
            symbol='pcs',
            type='UNIT'
        )

        self.product = Product.objects.create(
            company=self.company,
            internal_reference='PROD001',
            name='Test Product',
            category=self.category,
            uom=self.uom,
            list_price=Decimal('100.00'),
            cost_price=Decimal('80.00')
        )

        # Create warehouse and location
        self.warehouse = Warehouse.objects.create(
            company=self.company,
            code='WH001',
            name='Main Warehouse'
        )

        self.location_type = LocationType.objects.create(
            company=self.company,
            name='Internal',
            code='INT',
            usage='INTERNAL'
        )

        self.location = Location.objects.create(
            company=self.company,
            warehouse=self.warehouse,
            location_type=self.location_type,
            code='LOC001',
            name='Main Location'
        )

        self.client.force_authenticate(user=self.user)

    def test_create_rfq(self):
        """Test creating an RFQ via API."""
        data = {
            'rfq_number': 'RFQ001',
            'title': 'Test RFQ',
            'rfq_date': date.today().isoformat(),
            'deadline': (timezone.now() + timedelta(days=7)).isoformat(),
            'delivery_location': str(self.location.id),
            'requested_delivery_date': (date.today() + timedelta(days=14)).isoformat(),
            'lines': [
                {
                    'product': str(self.product.id),
                    'quantity': '10.000000',
                    'uom': str(self.uom.id),
                    'description': 'Test product for RFQ'
                }
            ]
        }

        response = self.client.post('/api/purchasing/rfqs/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        rfq = RequestForQuotation.objects.get(rfq_number='RFQ001')
        self.assertEqual(rfq.title, 'Test RFQ')
        self.assertEqual(rfq.lines.count(), 1)


class PurchaseOrderAPITest(APITestCase):
    """Test cases for PurchaseOrder API."""

    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345'
        )

        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            current_company=self.company
        )

        # Create catalog data
        self.category = Category.objects.create(
            company=self.company,
            name='Test Category',
            code='CAT001'
        )

        self.uom = UnitOfMeasure.objects.create(
            company=self.company,
            name='Piece',
            symbol='pcs',
            type='UNIT'
        )

        self.product = Product.objects.create(
            company=self.company,
            internal_reference='PROD001',
            name='Test Product',
            category=self.category,
            uom=self.uom,
            list_price=Decimal('100.00'),
            cost_price=Decimal('80.00')
        )

        # Create warehouse and location
        self.warehouse = Warehouse.objects.create(
            company=self.company,
            code='WH001',
            name='Main Warehouse'
        )

        self.location_type = LocationType.objects.create(
            company=self.company,
            name='Internal',
            code='INT',
            usage='INTERNAL'
        )

        self.location = Location.objects.create(
            company=self.company,
            warehouse=self.warehouse,
            location_type=self.location_type,
            code='LOC001',
            name='Main Location'
        )

        # Create supplier
        self.supplier = Supplier.objects.create(
            company=self.company,
            supplier_code='SUP001',
            name='Test Supplier',
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)

    def test_create_purchase_order(self):
        """Test creating a purchase order via API."""
        data = {
            'po_number': 'PO001',
            'supplier': str(self.supplier.id),
            'order_date': date.today().isoformat(),
            'expected_delivery_date': (date.today() + timedelta(days=14)).isoformat(),
            'delivery_location': str(self.location.id),
            'lines': [
                {
                    'product': str(self.product.id),
                    'quantity': '5.000000',
                    'uom': str(self.uom.id),
                    'unit_price': '80.00'
                }
            ]
        }

        response = self.client.post('/api/purchasing/purchase-orders/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        po = PurchaseOrder.objects.get(po_number='PO001')
        self.assertEqual(po.supplier, self.supplier)
        self.assertEqual(po.lines.count(), 1)
        self.assertEqual(po.total_amount, Decimal('480.00'))  # Including tax

    def test_approve_purchase_order(self):
        """Test approving a purchase order via API."""
        po = PurchaseOrder.objects.create(
            company=self.company,
            po_number='PO001',
            supplier=self.supplier,
            order_date=date.today(),
            expected_delivery_date=date.today() + timedelta(days=14),
            delivery_location=self.location,
            created_by=self.user
        )

        response = self.client.post(f'/api/purchasing/purchase-orders/{po.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        po.refresh_from_db()
        self.assertEqual(po.approval_state, 'APPROVED')
        self.assertEqual(po.approved_by, self.user)
