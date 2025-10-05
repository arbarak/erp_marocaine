"""
Serializers for companies app.
"""
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Company, CompanySettings


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model."""
    
    settings = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'legal_name', 'ice', 'if_number', 'rc',
            'vat_number', 'email', 'phone', 'fax', 'website',
            'address_line1', 'address_line2', 'city', 'postal_code',
            'state_province', 'country', 'currency', 'locale',
            'fiscal_year_start_month', 'tax_rounding_method',
            'inclusive_taxes', 'logo', 'is_active', 'created_at',
            'updated_at', 'settings'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_settings(self, obj):
        """Get company settings if they exist."""
        try:
            return CompanySettingsSerializer(obj.settings).data
        except CompanySettings.DoesNotExist:
            return None
    
    def validate_ice(self, value):
        """Validate ICE format (15 digits)."""
        if value and not value.isdigit():
            raise serializers.ValidationError(
                _('ICE must contain only digits')
            )
        if value and len(value) != 15:
            raise serializers.ValidationError(
                _('ICE must be exactly 15 digits')
            )
        return value
    
    def validate_if_number(self, value):
        """Validate IF format (7-8 digits)."""
        if value and not value.isdigit():
            raise serializers.ValidationError(
                _('IF number must contain only digits')
            )
        if value and not (7 <= len(value) <= 8):
            raise serializers.ValidationError(
                _('IF number must be 7 or 8 digits')
            )
        return value


class CompanyCreateSerializer(CompanySerializer):
    """Serializer for creating a new company."""
    
    # Company settings fields
    invoice_prefix = serializers.CharField(max_length=10, required=False)
    quote_prefix = serializers.CharField(max_length=10, required=False)
    po_prefix = serializers.CharField(max_length=10, required=False)
    so_prefix = serializers.CharField(max_length=10, required=False)
    default_payment_terms = serializers.IntegerField(required=False)
    default_quote_validity = serializers.IntegerField(required=False)
    default_costing_method = serializers.ChoiceField(
        choices=CompanySettings.COSTING_METHODS,
        required=False
    )
    email_signature = serializers.CharField(required=False, allow_blank=True)
    
    class Meta(CompanySerializer.Meta):
        fields = CompanySerializer.Meta.fields + [
            'invoice_prefix', 'quote_prefix', 'po_prefix', 'so_prefix',
            'default_payment_terms', 'default_quote_validity',
            'default_costing_method', 'email_signature'
        ]
    
    def create(self, validated_data):
        """Create company with settings."""
        # Extract settings data
        settings_data = {}
        settings_fields = [
            'invoice_prefix', 'quote_prefix', 'po_prefix', 'so_prefix',
            'default_payment_terms', 'default_quote_validity',
            'default_costing_method', 'email_signature'
        ]
        
        for field in settings_fields:
            if field in validated_data:
                settings_data[field] = validated_data.pop(field)
        
        # Create company
        company = Company.objects.create(**validated_data)
        
        # Create settings if any provided
        if settings_data:
            CompanySettings.objects.create(company=company, **settings_data)
        
        return company


class CompanySettingsSerializer(serializers.ModelSerializer):
    """Serializer for CompanySettings model."""
    
    class Meta:
        model = CompanySettings
        fields = [
            'id', 'company', 'invoice_prefix', 'quote_prefix',
            'po_prefix', 'so_prefix', 'default_payment_terms',
            'default_quote_validity', 'default_costing_method',
            'email_signature', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']


class CompanyListSerializer(serializers.ModelSerializer):
    """Simplified serializer for company list view."""
    
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'ice', 'city', 'currency',
            'is_active', 'user_role'
        ]
    
    def get_user_role(self, obj):
        """Get user's role in this company."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                from core.accounts.models import UserCompanyMembership
                membership = UserCompanyMembership.objects.get(
                    user=request.user,
                    company=obj,
                    is_active=True
                )
                return {
                    'is_admin': membership.is_admin,
                    'roles': [role.name for role in membership.roles.all()]
                }
            except UserCompanyMembership.DoesNotExist:
                pass
        return None


class CompanyStatsSerializer(serializers.Serializer):
    """Serializer for company statistics."""
    
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_documents = serializers.IntegerField()
    current_fiscal_year = serializers.IntegerField()
    
    # Financial stats (placeholder for future implementation)
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2, default=0)
    outstanding_invoices = serializers.DecimalField(max_digits=15, decimal_places=2, default=0)


class CompanyFiscalYearSerializer(serializers.Serializer):
    """Serializer for fiscal year operations."""
    
    fiscal_year = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    is_current = serializers.BooleanField()
    is_closed = serializers.BooleanField(default=False)


class CompanyValidationSerializer(serializers.Serializer):
    """Serializer for validating company data."""
    
    ice = serializers.CharField(max_length=15, required=False)
    if_number = serializers.CharField(max_length=8, required=False)
    rc = serializers.CharField(max_length=50, required=False)
    
    def validate_ice(self, value):
        """Validate ICE uniqueness."""
        if value:
            if Company.objects.filter(ice=value).exists():
                raise serializers.ValidationError(
                    _('A company with this ICE already exists')
                )
        return value
    
    def validate_if_number(self, value):
        """Validate IF number uniqueness."""
        if value:
            if Company.objects.filter(if_number=value).exists():
                raise serializers.ValidationError(
                    _('A company with this IF number already exists')
                )
        return value
