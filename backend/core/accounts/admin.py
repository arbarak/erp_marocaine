"""
Admin configuration for accounts app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Role  # UserCompanyMembership


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for custom User model."""
    
    list_display = [
        'email', 'first_name', 'last_name',
        'is_active', 'is_staff', 'is_verified', 'last_login'
    ]
    list_filter = [
        'is_active', 'is_staff', 'is_superuser', 'is_verified',
        'language', 'created_at'
    ]
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering = ['email']
    readonly_fields = ['created_at', 'updated_at', 'last_login_ip']
    
    fieldsets = (
        (None, {
            'fields': ('username', 'email', 'password')
        }),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name', 'phone')
        }),
        (_('Preferences'), {
            'fields': ('language', 'timezone')
        }),
        (_('Permissions'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser', 'is_verified',
                'groups', 'user_permissions'
            ),
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')
        }),
        (_('Security'), {
            'fields': ('last_login_ip',),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'first_name', 'last_name',
                'password1', 'password2', 'is_active', 'is_staff'
            ),
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset for admin list view."""
        return super().get_queryset(request)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Admin interface for Role model."""
    
    list_display = ['name', 'company', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'company']
    search_fields = ['name', 'description', 'company__name']
    filter_horizontal = ['permissions']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'company', 'is_active')
        }),
        (_('Permissions'), {
            'fields': ('permissions',)
        }),
        (_('Audit'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset for admin list view."""
        return super().get_queryset(request).select_related('company')


# UserCompanyMembership admin will be added after the model is created
# class UserCompanyMembershipInline(admin.TabularInline):
#     """Inline for user company memberships."""
#     model = UserCompanyMembership
#     extra = 0
#     fields = ['company', 'is_active', 'is_admin', 'joined_at']
#     readonly_fields = ['joined_at']


# @admin.register(UserCompanyMembership)
# class UserCompanyMembershipAdmin(admin.ModelAdmin):
#     """Admin interface for UserCompanyMembership model."""
#
#     list_display = [
#         'user', 'company', 'is_active', 'is_admin', 'joined_at'
#     ]
#     list_filter = ['is_active', 'is_admin', 'joined_at']
#     search_fields = [
#         'user__email', 'user__first_name', 'user__last_name',
#         'company__name'
#     ]
#     filter_horizontal = ['roles']
#     readonly_fields = ['joined_at']
#
#     fieldsets = (
#         (_('Membership'), {
#             'fields': ('user', 'company', 'is_active', 'is_admin')
#         }),
#         (_('Roles'), {
#             'fields': ('roles',)
#         }),
#         (_('Audit'), {
#             'fields': ('joined_at',)
#         }),
#     )
#
#     def get_queryset(self, request):
#         """Optimize queryset for admin list view."""
#         return super().get_queryset(request).select_related('user', 'company')
