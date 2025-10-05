"""
Tests for inventory app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from django.utils import timezone
from core.companies.models import Company, CompanySettings
from modules.catalog.models import Category, UnitOfMeasure, Product
from .models import Warehouse, LocationType, Location, StockQuant, StockMove, StockMoveLine

User = get_user_model()


class WarehouseModelTest(TestCase):
    """Test Warehouse model."""
    
    def setUp(self):
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345",
            if_number="12345678"
        )
        CompanySettings.objects.create(company=self.company)
    
    def test_create_warehouse(self):
        """Test creating a warehouse."""
        warehouse = Warehouse.objects.create(
            company=self.company,
            name="Main Warehouse",
            code="MAIN",
            address_line1="123 Main St",
            city="Casablanca"
        )
        
        self.assertEqual(warehouse.name, "Main Warehouse")
        self.assertEqual(warehouse.code, "MAIN")
        self.assertEqual(str(warehouse), "[MAIN] Main Warehouse")
    
    def test_default_warehouse(self):
        """Test default warehouse logic."""
        warehouse1 = Warehouse.objects.create(
            company=self.company,
            name="Warehouse 1",
            code="WH1",
            is_default=True
        )
        
        warehouse2 = Warehouse.objects.create(
            company=self.company,
            name="Warehouse 2",
            code="WH2",
            is_default=True
        )
        
        # Refresh from database
        warehouse1.refresh_from_db()
        warehouse2.refresh_from_db()
        
        # Only warehouse2 should be default
        self.assertFalse(warehouse1.is_default)
        self.assertTrue(warehouse2.is_default)


class LocationModelTest(TestCase):
    """Test Location model."""
    
    def setUp(self):
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345",
            if_number="12345678"
        )
        CompanySettings.objects.create(company=self.company)
        
        self.warehouse = Warehouse.objects.create(
            company=self.company,
            name="Main Warehouse",
            code="MAIN"
        )
        
        self.location_type = LocationType.objects.create(
            company=self.company,
            name="Storage",
            code="STORAGE",
            usage="INTERNAL"
        )
    
    def test_create_location(self):
        """Test creating a location."""
        location = Location.objects.create(
            warehouse=self.warehouse,
            location_type=self.location_type,
            name="Aisle A",
            code="A-01"
        )
        
        self.assertEqual(location.name, "Aisle A")
        self.assertEqual(location.code, "A-01")
        self.assertEqual(str(location), "MAIN/A-01")
    
    def test_location_hierarchy(self):
        """Test location parent-child relationships."""
        parent = Location.objects.create(
            warehouse=self.warehouse,
            location_type=self.location_type,
            name="Aisle A",
            code="A"
        )
        
        child = Location.objects.create(
            warehouse=self.warehouse,
            location_type=self.location_type,
            name="Shelf 1",
            code="01",
            parent=parent
        )
        
        self.assertEqual(child.parent, parent)
        self.assertEqual(child.full_path, "MAIN/A/01")


class StockQuantModelTest(TestCase):
    """Test StockQuant model."""
    
    def setUp(self):
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345",
            if_number="12345678"
        )
        CompanySettings.objects.create(company=self.company)
        
        self.warehouse = Warehouse.objects.create(
            company=self.company,
            name="Main Warehouse",
            code="MAIN"
        )
        
        self.location_type = LocationType.objects.create(
            company=self.company,
            name="Storage",
            code="STORAGE",
            usage="INTERNAL"
        )
        
        self.location = Location.objects.create(
            warehouse=self.warehouse,
            location_type=self.location_type,
            name="Aisle A",
            code="A-01"
        )
        
        self.category = Category.objects.create(
            company=self.company,
            name="Electronics",
            code="ELEC"
        )
        
        self.uom = UnitOfMeasure.objects.create(
            company=self.company,
            name="Unit",
            symbol="u",
            type="UNIT"
        )
        
        self.product = Product.objects.create(
            company=self.company,
            name="Smartphone",
            internal_reference="PHONE001",
            category=self.category,
            uom=self.uom,
            cost_price=Decimal('500.00')
        )
    
    def test_create_stock_quant(self):
        """Test creating a stock quantity."""
        quant = StockQuant.objects.create(
            product=self.product,
            location=self.location,
            quantity=Decimal('100.000000'),
            cost_price=Decimal('500.00')
        )
        
        self.assertEqual(quant.quantity, Decimal('100.000000'))
        self.assertEqual(quant.available_quantity, Decimal('100.000000'))
        self.assertEqual(quant.total_value, Decimal('50000.00'))
    
    def test_available_quantity(self):
        """Test available quantity calculation."""
        quant = StockQuant.objects.create(
            product=self.product,
            location=self.location,
            quantity=Decimal('100.000000'),
            reserved_quantity=Decimal('20.000000'),
            cost_price=Decimal('500.00')
        )
        
        self.assertEqual(quant.available_quantity, Decimal('80.000000'))


class StockMoveModelTest(TestCase):
    """Test StockMove model."""
    
    def setUp(self):
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345",
            if_number="12345678"
        )
        CompanySettings.objects.create(company=self.company)
        
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            current_company=self.company
        )
        
        self.warehouse = Warehouse.objects.create(
            company=self.company,
            name="Main Warehouse",
            code="MAIN"
        )
        
        self.location_type = LocationType.objects.create(
            company=self.company,
            name="Storage",
            code="STORAGE",
            usage="INTERNAL"
        )
        
        self.source_location = Location.objects.create(
            warehouse=self.warehouse,
            location_type=self.location_type,
            name="Source",
            code="SRC"
        )
        
        self.dest_location = Location.objects.create(
            warehouse=self.warehouse,
            location_type=self.location_type,
            name="Destination",
            code="DEST"
        )
        
        self.category = Category.objects.create(
            company=self.company,
            name="Electronics",
            code="ELEC"
        )
        
        self.uom = UnitOfMeasure.objects.create(
            company=self.company,
            name="Unit",
            symbol="u",
            type="UNIT"
        )
        
        self.product = Product.objects.create(
            company=self.company,
            name="Smartphone",
            internal_reference="PHONE001",
            category=self.category,
            uom=self.uom,
            cost_price=Decimal('500.00')
        )
    
    def test_create_stock_move(self):
        """Test creating a stock move."""
        move = StockMove.objects.create(
            company=self.company,
            name="MOVE001",
            move_type="INTERNAL",
            scheduled_date=timezone.now(),
            source_location=self.source_location,
            destination_location=self.dest_location,
            created_by=self.user
        )
        
        self.assertEqual(move.name, "MOVE001")
        self.assertEqual(move.state, "DRAFT")
        self.assertEqual(str(move), "MOVE001 (Draft)")
    
    def test_stock_move_confirm(self):
        """Test confirming a stock move."""
        move = StockMove.objects.create(
            company=self.company,
            name="MOVE001",
            move_type="INTERNAL",
            scheduled_date=timezone.now(),
            source_location=self.source_location,
            destination_location=self.dest_location,
            created_by=self.user
        )
        
        # Add a move line
        line = StockMoveLine.objects.create(
            move=move,
            product=self.product,
            quantity_planned=Decimal('10.000000'),
            quantity_done=Decimal('10.000000'),
            unit_cost=Decimal('500.00')
        )
        
        # Confirm the move
        move.confirm(self.user)
        
        self.assertEqual(move.state, "CONFIRMED")
        self.assertEqual(move.confirmed_by, self.user)
        
        # Check line state
        line.refresh_from_db()
        self.assertEqual(line.state, "CONFIRMED")


class InventoryAPITest(APITestCase):
    """Test Inventory API endpoints."""
    
    def setUp(self):
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345",
            if_number="12345678"
        )
        CompanySettings.objects.create(company=self.company)
        
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            current_company=self.company
        )
        
        self.warehouse = Warehouse.objects.create(
            company=self.company,
            name="Main Warehouse",
            code="MAIN"
        )
        
        self.location_type = LocationType.objects.create(
            company=self.company,
            name="Storage",
            code="STORAGE",
            usage="INTERNAL"
        )
        
        self.location = Location.objects.create(
            warehouse=self.warehouse,
            location_type=self.location_type,
            name="Aisle A",
            code="A-01"
        )
        
        self.client.force_authenticate(user=self.user)
    
    def test_create_warehouse(self):
        """Test creating warehouse via API."""
        data = {
            'name': 'Secondary Warehouse',
            'code': 'SEC',
            'address_line1': '456 Second St',
            'city': 'Rabat'
        }
        
        response = self.client.post('/api/v1/inventory/warehouses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Secondary Warehouse')
        self.assertEqual(response.data['code'], 'SEC')
    
    def test_list_warehouses(self):
        """Test listing warehouses via API."""
        response = self.client.get('/api/v1/inventory/warehouses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_create_location(self):
        """Test creating location via API."""
        data = {
            'warehouse': str(self.warehouse.id),
            'location_type': str(self.location_type.id),
            'name': 'Aisle B',
            'code': 'B-01'
        }
        
        response = self.client.post('/api/v1/inventory/locations/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Aisle B')
        self.assertEqual(response.data['code'], 'B-01')
    
    def test_warehouse_stock_summary(self):
        """Test warehouse stock summary endpoint."""
        # Create some stock
        category = Category.objects.create(
            company=self.company,
            name="Electronics",
            code="ELEC"
        )
        
        uom = UnitOfMeasure.objects.create(
            company=self.company,
            name="Unit",
            symbol="u",
            type="UNIT"
        )
        
        product = Product.objects.create(
            company=self.company,
            name="Smartphone",
            internal_reference="PHONE001",
            category=category,
            uom=uom,
            cost_price=Decimal('500.00')
        )
        
        StockQuant.objects.create(
            product=product,
            location=self.location,
            quantity=Decimal('100.000000'),
            cost_price=Decimal('500.00')
        )
        
        response = self.client.get(f'/api/v1/inventory/warehouses/{self.warehouse.id}/stock_summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_products'], Decimal('100.000000'))
        self.assertEqual(response.data['total_value'], Decimal('50000.00'))
