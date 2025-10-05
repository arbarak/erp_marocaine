"""
Tests for companies app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Company, CompanySettings
from core.accounts.models import UserCompanyMembership

User = get_user_model()


class CompanyModelTest(TestCase):
    """Test Company model functionality."""
    
    def test_create_company(self):
        """Test creating a company with valid data."""
        company = Company.objects.create(
            name='Test Company SARL',
            legal_name='Test Company SARL',
            ice='123456789012345',
            if_number='12345678',
            rc='RC123456',
            email='contact@testcompany.ma',
            phone='+212 5 22 12 34 56',
            address_line1='123 Avenue Mohammed V',
            city='Casablanca',
            postal_code='20000',
            country='Maroc',
            currency='MAD'
        )
        
        self.assertEqual(company.name, 'Test Company SARL')
        self.assertEqual(company.ice, '123456789012345')
        self.assertEqual(company.currency, 'MAD')
        self.assertTrue(company.is_active)
    
    def test_company_string_representation(self):
        """Test company string representation."""
        company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            email='test@company.ma'
        )
        
        self.assertEqual(str(company), 'Test Company')
    
    def test_ice_validation(self):
        """Test ICE validation."""
        # Test valid ICE
        company = Company(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            email='test@company.ma'
        )
        company.full_clean()  # Should not raise
        
        # Test invalid ICE (wrong length)
        company.ice = '12345678901234'  # 14 digits
        with self.assertRaises(ValidationError):
            company.full_clean()
    
    def test_if_number_validation(self):
        """Test IF number validation."""
        # Test valid IF number (7 digits)
        company = Company(
            name='Test Company',
            ice='123456789012345',
            if_number='1234567',
            email='test@company.ma'
        )
        company.full_clean()  # Should not raise
        
        # Test valid IF number (8 digits)
        company.if_number = '12345678'
        company.full_clean()  # Should not raise
        
        # Test invalid IF number (too short)
        company.if_number = '123456'  # 6 digits
        with self.assertRaises(ValidationError):
            company.full_clean()
    
    def test_fiscal_year_methods(self):
        """Test fiscal year calculation methods."""
        company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            email='test@company.ma',
            fiscal_year_start_month=1  # January start
        )
        
        # Test fiscal year dates
        start_date, end_date = company.get_fiscal_year_dates(2024)
        self.assertEqual(start_date.year, 2024)
        self.assertEqual(start_date.month, 1)
        self.assertEqual(start_date.day, 1)
        self.assertEqual(end_date.year, 2024)
        self.assertEqual(end_date.month, 12)
        self.assertEqual(end_date.day, 31)
    
    def test_full_address_property(self):
        """Test full address property."""
        company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            email='test@company.ma',
            address_line1='123 Avenue Mohammed V',
            address_line2='Quartier Maarif',
            city='Casablanca',
            postal_code='20000',
            country='Maroc'
        )
        
        expected_address = '123 Avenue Mohammed V, Quartier Maarif, Casablanca, 20000, Maroc'
        self.assertEqual(company.full_address, expected_address)


class CompanySettingsTest(TestCase):
    """Test CompanySettings model."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            email='test@company.ma'
        )
    
    def test_create_company_settings(self):
        """Test creating company settings."""
        settings = CompanySettings.objects.create(
            company=self.company,
            invoice_prefix='INV',
            quote_prefix='QUO',
            po_prefix='PO',
            so_prefix='SO',
            default_payment_terms=30,
            default_quote_validity=30,
            default_costing_method='FIFO'
        )
        
        self.assertEqual(settings.company, self.company)
        self.assertEqual(settings.invoice_prefix, 'INV')
        self.assertEqual(settings.default_costing_method, 'FIFO')


class CompanyAPITest(APITestCase):
    """Test Company API endpoints."""
    
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
            email='test@company.ma'
        )
        
        # Create membership
        UserCompanyMembership.objects.create(
            user=self.user,
            company=self.company,
            is_admin=True,
            is_active=True
        )
        
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def test_list_companies(self):
        """Test listing companies."""
        url = reverse('companies:company-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Company')
    
    def test_create_company(self):
        """Test creating a new company."""
        url = reverse('companies:company-list')
        company_data = {
            'name': 'New Company SARL',
            'legal_name': 'New Company SARL',
            'ice': '123456789012346',
            'if_number': '12345679',
            'email': 'new@company.ma',
            'city': 'Rabat',
            'currency': 'MAD',
            'invoice_prefix': 'NEW',
            'default_payment_terms': 30
        }
        
        response = self.client.post(url, company_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Company SARL')
        
        # Check company was created
        company = Company.objects.get(ice='123456789012346')
        self.assertEqual(company.name, 'New Company SARL')
        
        # Check user was added as admin
        membership = UserCompanyMembership.objects.get(
            user=self.user,
            company=company
        )
        self.assertTrue(membership.is_admin)
    
    def test_company_validation(self):
        """Test company identifier validation."""
        url = reverse('companies:company-validate-identifiers')
        
        # Test valid identifiers
        valid_data = {
            'ice': '123456789012347',
            'if_number': '12345680'
        }
        response = self.client.post(url, valid_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])
        
        # Test duplicate ICE
        duplicate_data = {
            'ice': '123456789012345',  # Already exists
            'if_number': '12345680'
        }
        response = self.client.post(url, duplicate_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['valid'])
    
    def test_company_stats(self):
        """Test company statistics endpoint."""
        url = reverse('companies:company-stats', kwargs={'pk': self.company.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('active_users', response.data)
        self.assertEqual(response.data['total_users'], 1)
        self.assertEqual(response.data['active_users'], 1)
    
    def test_company_members(self):
        """Test listing company members."""
        url = reverse('companies:company-members', kwargs={'pk': self.company.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['user_email'], self.user.email)
    
    def test_add_company_member(self):
        """Test adding a member to company."""
        # Create another user
        new_user = User.objects.create_user(
            username='newuser',
            email='newuser@example.com',
            password='newpass123'
        )
        
        url = reverse('companies:company-add-member', kwargs={'pk': self.company.pk})
        member_data = {
            'email': 'newuser@example.com',
            'is_admin': False
        }
        
        response = self.client.post(url, member_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check membership was created
        membership = UserCompanyMembership.objects.get(
            user=new_user,
            company=self.company
        )
        self.assertFalse(membership.is_admin)
        self.assertTrue(membership.is_active)
