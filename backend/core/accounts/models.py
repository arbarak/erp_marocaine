"""
User and authentication models for the ERP system.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    """
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
    phone = models.CharField(_('phone number'), max_length=20, blank=True)
    
    # Company relationship handled through UserCompanyMembership
    # current_company can be determined from the active membership
    
    # Profile fields
    language = models.CharField(
        _('language'),
        max_length=10,
        default='fr',
        choices=[
            ('fr', _('French')),
            ('ar', _('Arabic')),
            ('en', _('English')),
        ]
    )
    timezone = models.CharField(
        _('timezone'),
        max_length=50,
        default='Africa/Casablanca'
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    last_login_ip = models.GenericIPAddressField(_('last login IP'), null=True, blank=True)
    
    # Account status
    is_verified = models.BooleanField(_('is verified'), default=False)
    is_active = models.BooleanField(_('is active'), default=True)

    # History tracking
    history = HistoricalRecords()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        db_table = 'auth_user'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_companies(self):
        """Get all companies this user has access to."""
        return self.company_memberships.filter(is_active=True).select_related('company')


class Role(models.Model):
    """
    Role model for role-based access control.
    """
    name = models.CharField(_('name'), max_length=100, unique=True)
    description = models.TextField(_('description'), blank=True)
    permissions = models.ManyToManyField(
        'auth.Permission',
        blank=True,
        related_name='roles',
        verbose_name=_('permissions')
    )
    
    # Company-specific role
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='roles',
        verbose_name=_('company')
    )
    
    # Audit fields
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    is_active = models.BooleanField(_('is active'), default=True)
    
    class Meta:
        verbose_name = _('Role')
        verbose_name_plural = _('Roles')
        unique_together = ['name', 'company']
    
    def __str__(self):
        if self.company:
            return f"{self.name} ({self.company.name})"
        return self.name


class UserCompanyMembership(models.Model):
    """
    Through model for User-Company many-to-many relationship with roles.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='company_memberships',
        verbose_name=_('user')
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='user_memberships',
        verbose_name=_('company')
    )
    roles = models.ManyToManyField(
        Role,
        blank=True,
        related_name='user_memberships',
        verbose_name=_('roles')
    )

    # Membership details
    joined_at = models.DateTimeField(_('joined at'), auto_now_add=True)
    is_active = models.BooleanField(_('is active'), default=True)
    is_admin = models.BooleanField(_('is admin'), default=False)

    class Meta:
        verbose_name = _('User Company Membership')
        verbose_name_plural = _('User Company Memberships')
        unique_together = ['user', 'company']

    def __str__(self):
        return f"{self.user.full_name} @ {self.company.name}"
