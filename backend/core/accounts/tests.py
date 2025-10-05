"""
Tests for accounts app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from core.companies.models import Company
from .models import Role, UserCompanyMembership

User = get_user_model()


class UserModelTest(TestCase):
    """Test User model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            email='test@company.ma'
        )
    
    def test_create_user(self):
        """Test creating a user."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.is_active)
    
    def test_create_superuser(self):
        """Test creating a superuser."""
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_active)
    
    def test_user_string_representation(self):
        """Test user string representation."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        
        self.assertEqual(str(user), 'test@example.com')


class UserCompanyMembershipTest(TestCase):
    """Test UserCompanyMembership model."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            email='test@company.ma'
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_membership(self):
        """Test creating a company membership."""
        membership = UserCompanyMembership.objects.create(
            user=self.user,
            company=self.company,
            is_admin=True
        )
        
        self.assertEqual(membership.user, self.user)
        self.assertEqual(membership.company, self.company)
        self.assertTrue(membership.is_admin)
        self.assertTrue(membership.is_active)


class AuthenticationAPITest(APITestCase):
    """Test authentication API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            email='test@company.ma'
        )
        
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        self.user = User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='existingpass123'
        )
    
    def test_user_registration(self):
        """Test user registration endpoint."""
        url = reverse('accounts:register')
        response = self.client.post(url, self.user_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        
        # Check user was created
        user = User.objects.get(email=self.user_data['email'])
        self.assertEqual(user.username, self.user_data['username'])
    
    def test_user_login(self):
        """Test user login endpoint."""
        url = reverse('accounts:login')
        login_data = {
            'email': 'existing@example.com',
            'password': 'existingpass123'
        }
        
        response = self.client.post(url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        url = reverse('accounts:login')
        login_data = {
            'email': 'existing@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_user_profile_access(self):
        """Test accessing user profile."""
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('accounts:user-profile-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CompanySwitchTest(APITestCase):
    """Test company switching functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.company1 = Company.objects.create(
            name='Company 1',
            ice='123456789012345',
            if_number='12345678',
            email='company1@example.ma'
        )
        
        self.company2 = Company.objects.create(
            name='Company 2',
            ice='123456789012346',
            if_number='12345679',
            email='company2@example.ma'
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            current_company=self.company1
        )
        
        # Create memberships
        UserCompanyMembership.objects.create(
            user=self.user,
            company=self.company1,
            is_active=True
        )
        
        UserCompanyMembership.objects.create(
            user=self.user,
            company=self.company2,
            is_active=True
        )
    
    def test_switch_company(self):
        """Test switching current company."""
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('accounts:user-profile-switch-company')
        switch_data = {'company_id': self.company2.id}
        
        response = self.client.post(url, switch_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check user's current company was updated
        self.user.refresh_from_db()
        self.assertEqual(self.user.current_company, self.company2)
    
    def test_switch_to_unauthorized_company(self):
        """Test switching to a company user doesn't have access to."""
        company3 = Company.objects.create(
            name='Company 3',
            ice='123456789012347',
            if_number='12345680',
            email='company3@example.ma'
        )
        
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('accounts:user-profile-switch-company')
        switch_data = {'company_id': company3.id}
        
        response = self.client.post(url, switch_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
