"""
Views for accounts app.
"""
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import login, logout
from django.utils.translation import gettext_lazy as _
from .models import User, Role  # UserCompanyMembership
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    ChangePasswordSerializer, RoleSerializer,  # UserCompanyMembershipSerializer,
    # CompanySwitchSerializer, UserCompanyListSerializer
)


class UserRegistrationView(APIView):
    """User registration endpoint."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Register a new user."""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': _('User registered successfully'),
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(TokenObtainPairView):
    """Enhanced login view with user profile."""
    
    def post(self, request, *args, **kwargs):
        """Login user and return tokens with profile."""
        serializer = UserLoginSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Update last login IP
            user.last_login_ip = self.get_client_ip(request)
            user.save(update_fields=['last_login_ip'])
            
            return Response({
                'message': _('Login successful'),
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserLogoutView(APIView):
    """User logout endpoint."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Logout user by blacklisting refresh token."""
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': _('Logout successful')
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': _('Invalid token')
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(ModelViewSet):
    """ViewSet for user profile management."""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only the current user."""
        return User.objects.filter(id=self.request.user.id)
    
    def get_object(self):
        """Return the current user."""
        return self.request.user
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password."""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': _('Password changed successfully')
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Company-related actions will be added after UserCompanyMembership model is created
    # @action(detail=False, methods=['get'])
    # def companies(self, request):
    #     """Get user's companies."""
    #     memberships = UserCompanyMembership.objects.filter(
    #         user=request.user,
    #         is_active=True
    #     ).select_related('company')
    #
    #     serializer = UserCompanyListSerializer(
    #         memberships,
    #         many=True,
    #         context={'request': request}
    #     )
    #
    #     return Response(serializer.data)
    #
    # @action(detail=False, methods=['post'])
    # def switch_company(self, request):
    #     """Switch current company."""
    #     serializer = CompanySwitchSerializer(
    #         data=request.data,
    #         context={'request': request}
    #     )
    #
    #     if serializer.is_valid():
    #         user = serializer.save()
    #         return Response({
    #             'message': _('Company switched successfully'),
    #             'user': UserProfileSerializer(user).data
    #         }, status=status.HTTP_200_OK)
    #
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoleViewSet(ModelViewSet):
    """ViewSet for role management."""
    
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return all roles for now (will be filtered by company later)."""
        return Role.objects.all().prefetch_related('permissions')

    def perform_create(self, serializer):
        """Create role (company will be set later)."""
        serializer.save()


# UserCompanyMembershipViewSet will be added after the model is created
# class UserCompanyMembershipViewSet(ModelViewSet):
#     """ViewSet for managing company memberships."""
#
#     serializer_class = UserCompanyMembershipSerializer
#     permission_classes = [permissions.IsAuthenticated]
#
#     def get_queryset(self):
#         """Return memberships for current company."""
#         if self.request.user.current_company:
#             return UserCompanyMembership.objects.filter(
#                 company=self.request.user.current_company
#             ).select_related('user', 'company').prefetch_related('roles')
#         return UserCompanyMembership.objects.none()
#
#     def perform_create(self, serializer):
#         """Set company when creating membership."""
#         serializer.save(company=self.request.user.current_company)
#
#     @action(detail=True, methods=['post'])
#     def activate(self, request, pk=None):
#         """Activate a membership."""
#         membership = self.get_object()
#         membership.is_active = True
#         membership.save()
#
#         return Response({
#             'message': _('Membership activated successfully')
#         }, status=status.HTTP_200_OK)
#
#     @action(detail=True, methods=['post'])
#     def deactivate(self, request, pk=None):
#         """Deactivate a membership."""
#         membership = self.get_object()
#         membership.is_active = False
#         membership.save()
#
#         return Response({
#             'message': _('Membership deactivated successfully')
#         }, status=status.HTTP_200_OK)
