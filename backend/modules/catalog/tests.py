"""
Tests for catalog app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from core.companies.models import Company, CompanySettings
from .models import Category, UnitOfMeasure, Product

User = get_user_model()


class CategoryModelTest(TestCase):
    """Test Category model."""
    
    def setUp(self):
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345",
            if_number="12345678"
        )
        CompanySettings.objects.create(company=self.company)
    
    def test_create_category(self):
        """Test creating a category."""
        category = Category.objects.create(
            company=self.company,
            name="Electronics",
            code="ELEC",
            description="Electronic products"
        )
        
        self.assertEqual(category.name, "Electronics")
        self.assertEqual(category.code, "ELEC")
        self.assertEqual(str(category), "[ELEC] Electronics")
    
    def test_category_hierarchy(self):
        """Test category parent-child relationships."""
        parent = Category.objects.create(
            company=self.company,
            name="Electronics",
            code="ELEC"
        )
        
        child = Category.objects.create(
            company=self.company,
            name="Smartphones",
            code="PHONE",
            parent=parent
        )
        
        self.assertEqual(child.parent, parent)
        self.assertEqual(child.full_path, "Electronics/Smartphones")
        self.assertIn(child, parent.get_descendants())
    
    def test_category_unique_code_per_company(self):
        """Test that category codes are unique per company."""
        Category.objects.create(
            company=self.company,
            name="Electronics",
            code="ELEC"
        )
        
        # Should raise IntegrityError for duplicate code in same company
        with self.assertRaises(Exception):
            Category.objects.create(
                company=self.company,
                name="Electrical",
                code="ELEC"
            )


class UnitOfMeasureModelTest(TestCase):
    """Test UnitOfMeasure model."""
    
    def setUp(self):
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345",
            if_number="12345678"
        )
        CompanySettings.objects.create(company=self.company)
    
    def test_create_uom(self):
        """Test creating a unit of measure."""
        uom = UnitOfMeasure.objects.create(
            company=self.company,
            name="Kilogram",
            symbol="kg",
            type="WEIGHT"
        )
        
        self.assertEqual(uom.name, "Kilogram")
        self.assertEqual(uom.symbol, "kg")
        self.assertEqual(str(uom), "Kilogram (kg)")
    
    def test_uom_conversion(self):
        """Test unit of measure conversions."""
        # Base unit
        kg = UnitOfMeasure.objects.create(
            company=self.company,
            name="Kilogram",
            symbol="kg",
            type="WEIGHT"
        )
        
        # Derived unit
        gram = UnitOfMeasure.objects.create(
            company=self.company,
            name="Gram",
            symbol="g",
            type="WEIGHT",
            base_unit=kg,
            conversion_factor=Decimal('0.001')
        )
        
        # Test conversions
        self.assertEqual(gram.convert_to_base(1000), Decimal('1.000000'))
        self.assertEqual(gram.convert_from_base(1), Decimal('1000.000000'))


class ProductModelTest(TestCase):
    """Test Product model."""
    
    def setUp(self):
        self.company = Company.objects.create(
            name="Test Company",
            ice="123456789012345",
            if_number="12345678"
        )
        CompanySettings.objects.create(company=self.company)
        
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
    
    def test_create_product(self):
        """Test creating a product."""
        product = Product.objects.create(
            company=self.company,
            name="Smartphone",
            internal_reference="PHONE001",
            category=self.category,
            uom=self.uom,
            list_price=Decimal('999.99'),
            cost_price=Decimal('500.00')
        )
        
        self.assertEqual(product.name, "Smartphone")
        self.assertEqual(product.internal_reference, "PHONE001")
        self.assertEqual(str(product), "[PHONE001] Smartphone")
    
    def test_product_display_name(self):
        """Test product display name property."""
        product = Product.objects.create(
            company=self.company,
            name="Smartphone",
            internal_reference="PHONE001",
            category=self.category,
            uom=self.uom
        )
        
        self.assertEqual(product.display_name, "[PHONE001] Smartphone")
    
    def test_product_unique_reference_per_company(self):
        """Test that product references are unique per company."""
        Product.objects.create(
            company=self.company,
            name="Smartphone",
            internal_reference="PHONE001",
            category=self.category,
            uom=self.uom
        )
        
        # Should raise IntegrityError for duplicate reference in same company
        with self.assertRaises(Exception):
            Product.objects.create(
                company=self.company,
                name="Tablet",
                internal_reference="PHONE001",
                category=self.category,
                uom=self.uom
            )


class CategoryAPITest(APITestCase):
    """Test Category API endpoints."""
    
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
        
        self.client.force_authenticate(user=self.user)
    
    def test_create_category(self):
        """Test creating category via API."""
        data = {
            'name': 'Electronics',
            'code': 'ELEC',
            'description': 'Electronic products'
        }
        
        response = self.client.post('/api/v1/catalog/categories/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Electronics')
        self.assertEqual(response.data['code'], 'ELEC')
    
    def test_list_categories(self):
        """Test listing categories via API."""
        Category.objects.create(
            company=self.company,
            name="Electronics",
            code="ELEC"
        )
        
        response = self.client.get('/api/v1/catalog/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_category_tree(self):
        """Test category tree endpoint."""
        parent = Category.objects.create(
            company=self.company,
            name="Electronics",
            code="ELEC"
        )
        
        Category.objects.create(
            company=self.company,
            name="Smartphones",
            code="PHONE",
            parent=parent
        )
        
        response = self.client.get('/api/v1/catalog/categories/tree/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(len(response.data[0]['children']), 1)


class ProductAPITest(APITestCase):
    """Test Product API endpoints."""
    
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
        
        self.client.force_authenticate(user=self.user)
    
    def test_create_product(self):
        """Test creating product via API."""
        data = {
            'name': 'Smartphone',
            'internal_reference': 'PHONE001',
            'category': str(self.category.id),
            'uom': str(self.uom.id),
            'list_price': '999.99',
            'cost_price': '500.00',
            'product_type': 'PRODUCT'
        }
        
        response = self.client.post('/api/v1/catalog/products/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Smartphone')
        self.assertEqual(response.data['internal_reference'], 'PHONE001')
    
    def test_list_products(self):
        """Test listing products via API."""
        Product.objects.create(
            company=self.company,
            name="Smartphone",
            internal_reference="PHONE001",
            category=self.category,
            uom=self.uom
        )
        
        response = self.client.get('/api/v1/catalog/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_product_search(self):
        """Test product search functionality."""
        Product.objects.create(
            company=self.company,
            name="iPhone 15",
            internal_reference="PHONE001",
            category=self.category,
            uom=self.uom
        )
        
        Product.objects.create(
            company=self.company,
            name="Samsung Galaxy",
            internal_reference="PHONE002",
            category=self.category,
            uom=self.uom
        )
        
        # Search by name
        response = self.client.get('/api/v1/catalog/products/?search=iPhone')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
        # Search by reference
        response = self.client.get('/api/v1/catalog/products/?search=PHONE002')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_product_filtering(self):
        """Test product filtering."""
        product1 = Product.objects.create(
            company=self.company,
            name="Smartphone",
            internal_reference="PHONE001",
            category=self.category,
            uom=self.uom,
            can_be_sold=True,
            can_be_purchased=False
        )
        
        product2 = Product.objects.create(
            company=self.company,
            name="Laptop",
            internal_reference="LAPTOP001",
            category=self.category,
            uom=self.uom,
            can_be_sold=False,
            can_be_purchased=True
        )
        
        # Filter by can_be_sold
        response = self.client.get('/api/v1/catalog/products/?can_be_sold=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['internal_reference'], 'PHONE001')
        
        # Filter by can_be_purchased
        response = self.client.get('/api/v1/catalog/products/?can_be_purchased=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['internal_reference'], 'LAPTOP001')
