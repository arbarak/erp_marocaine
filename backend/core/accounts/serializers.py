"""
Serializers for accounts app.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
from .models import User, Role  # UserCompanyMembership


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'phone', 'language', 'timezone', 'password', 'password_confirm'
        ]
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': _('Passwords do not match')}
            )
        return attrs
    
    def create(self, validated_data):
        """Create new user."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate login credentials."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    _('Invalid email or password')
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    _('User account is disabled')
                )
            
            attrs['user'] = user
            return attrs
        
        raise serializers.ValidationError(
            _('Email and password are required')
        )


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""

    # Company information will be added after UserCompanyMembership model is created
    # current_company_name = serializers.CharField(
    #     source='current_company.name',
    #     read_only=True
    # )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'language', 'timezone', 'is_verified', 'last_login',
            'created_at'
        ]
        read_only_fields = [
            'id', 'username', 'email', 'is_verified', 'last_login',
            'created_at'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_current_password(self, value):
        """Validate current password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_('Current password is incorrect'))
        return value
    
    def validate(self, attrs):
        """Validate new password confirmation."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {'new_password_confirm': _('Passwords do not match')}
            )
        return attrs
    
    def save(self):
        """Change user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for roles."""
    
    permissions_count = serializers.IntegerField(
        source='permissions.count',
        read_only=True
    )
    
    class Meta:
        model = Role
        fields = [
            'id', 'name', 'description', 'company', 'permissions',
            'permissions_count', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# UserCompanyMembership serializers will be added after the model is created
# class UserCompanyMembershipSerializer(serializers.ModelSerializer):
#     """Serializer for user company memberships."""
#
#     user_email = serializers.CharField(source='user.email', read_only=True)
#     user_name = serializers.CharField(source='user.get_full_name', read_only=True)
#     company_name = serializers.CharField(source='company.name', read_only=True)
#     roles_names = serializers.StringRelatedField(source='roles', many=True, read_only=True)
#
#     class Meta:
#         model = UserCompanyMembership
#         fields = [
#             'id', 'user', 'user_email', 'user_name', 'company',
#             'company_name', 'roles', 'roles_names', 'is_active',
#             'is_admin', 'joined_at'
#         ]
#         read_only_fields = ['id', 'joined_at']


# class CompanySwitchSerializer(serializers.Serializer):
#     """Serializer for switching current company."""
#
#     company_id = serializers.IntegerField()
#
#     def validate_company_id(self, value):
#         """Validate that user has access to the company."""
#         user = self.context['request'].user
#
#         try:
#             membership = UserCompanyMembership.objects.get(
#                 user=user,
#                 company_id=value,
#                 is_active=True
#             )
#             self.context['company'] = membership.company
#             return value
#         except UserCompanyMembership.DoesNotExist:
#             raise serializers.ValidationError(
#                 _('You do not have access to this company')
#             )
#
#     def save(self):
#         """Switch user's current company."""
#         user = self.context['request'].user
#         company = self.context['company']
#
#         user.current_company = company
#         user.save(update_fields=['current_company'])
#
#         return user


# class UserCompanyListSerializer(serializers.ModelSerializer):
#     """Serializer for listing user's companies."""
#
#     company_id = serializers.IntegerField(source='company.id')
#     company_name = serializers.CharField(source='company.name')
#     company_ice = serializers.CharField(source='company.ice')
#     is_current = serializers.SerializerMethodField()
#
#     class Meta:
#         model = UserCompanyMembership
#         fields = [
#             'company_id', 'company_name', 'company_ice',
#             'is_active', 'is_admin', 'is_current', 'joined_at'
#         ]
#
#     def get_is_current(self, obj):
#         """Check if this is the user's current company."""
#         user = self.context['request'].user
#         return user.current_company_id == obj.company_id if user.current_company else False
