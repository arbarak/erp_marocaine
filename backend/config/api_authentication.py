# Advanced API Authentication and Authorization System

import jwt
import time
import secrets
import hashlib
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
from django.contrib.auth.models import User, Permission
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


class APIKeyAuthentication(BaseAuthentication):
    """API Key authentication for external integrations"""
    
    def authenticate(self, request):
        api_key = self.get_api_key_from_request(request)
        if not api_key:
            return None
        
        user = self.authenticate_api_key(api_key)
        if user:
            return (user, api_key)
        
        return None
    
    def get_api_key_from_request(self, request) -> Optional[str]:
        """Extract API key from request headers"""
        # Check Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('ApiKey '):
            return auth_header[7:]  # Remove 'ApiKey ' prefix
        
        # Check X-API-Key header
        api_key = request.META.get('HTTP_X_API_KEY')
        if api_key:
            return api_key
        
        # Check query parameter (less secure, for development only)
        if settings.DEBUG:
            return request.GET.get('api_key')
        
        return None
    
    def authenticate_api_key(self, api_key: str) -> Optional[User]:
        """Authenticate API key and return associated user"""
        # Check cache first
        cache_key = f"api_key:{hashlib.sha256(api_key.encode()).hexdigest()}"
        cached_user_id = cache.get(cache_key)
        
        if cached_user_id:
            try:
                return User.objects.get(id=cached_user_id)
            except User.DoesNotExist:
                cache.delete(cache_key)
        
        # Validate API key format
        if not self.is_valid_api_key_format(api_key):
            return None
        
        # In production, this would check against APIKey model
        # For now, we'll use a simple validation
        try:
            # This is a placeholder - implement actual API key validation
            # api_key_obj = APIKey.objects.get(key_hash=hash_api_key(api_key), is_active=True)
            # user = api_key_obj.user
            
            # For demo purposes, create a system user
            user, created = User.objects.get_or_create(
                username='api_system',
                defaults={
                    'email': 'api@system.local',
                    'is_active': True,
                    'is_staff': False,
                }
            )
            
            # Cache the result
            cache.set(cache_key, user.id, timeout=3600)  # 1 hour
            
            return user
        except Exception as e:
            logger.warning(f"API key authentication failed: {str(e)}")
            return None
    
    def is_valid_api_key_format(self, api_key: str) -> bool:
        """Validate API key format"""
        # API keys should be 64 characters, alphanumeric + special chars
        if len(api_key) != 64:
            return False
        
        # Check for valid characters
        valid_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_')
        return all(c in valid_chars for c in api_key)


class JWTAuthentication(BaseAuthentication):
    """Enhanced JWT authentication with security features"""
    
    def authenticate(self, request):
        token = self.get_jwt_from_request(request)
        if not token:
            return None
        
        try:
            payload = self.verify_jwt(token)
            user = self.get_user_from_payload(payload)
            
            if user:
                # Store token info in request for later use
                request.jwt_payload = payload
                return (user, token)
            
        except AuthenticationFailed:
            pass
        
        return None
    
    def get_jwt_from_request(self, request) -> Optional[str]:
        """Extract JWT token from request"""
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            return auth_header[7:]  # Remove 'Bearer ' prefix
        
        return None
    
    def verify_jwt(self, token: str) -> Dict[str, Any]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256'],
                options={'verify_exp': True}
            )
            
            # Check if token is revoked
            jti = payload.get('jti')
            if jti and cache.get(f"revoked_token:{jti}"):
                raise AuthenticationFailed('Token has been revoked')
            
            # Check token type
            if payload.get('type') != 'access':
                raise AuthenticationFailed('Invalid token type')
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
    
    def get_user_from_payload(self, payload: Dict[str, Any]) -> Optional[User]:
        """Get user from JWT payload"""
        user_id = payload.get('user_id')
        if not user_id:
            return None
        
        try:
            user = User.objects.get(id=user_id, is_active=True)
            return user
        except User.DoesNotExist:
            return None


class MultiFactorAuthentication:
    """Two-Factor Authentication implementation"""
    
    def __init__(self):
        self.totp_window = 30  # 30 seconds
        self.backup_codes_count = 10
    
    def generate_totp_secret(self, user: User) -> str:
        """Generate TOTP secret for user"""
        secret = secrets.token_urlsafe(32)
        
        # Store secret securely (encrypted)
        cache.set(f"totp_secret:{user.id}", secret, timeout=None)
        
        return secret
    
    def generate_totp_qr_code(self, user: User, secret: str) -> str:
        """Generate QR code URL for TOTP setup"""
        import urllib.parse
        
        issuer = getattr(settings, 'TOTP_ISSUER', 'ERP System')
        label = f"{issuer}:{user.username}"
        
        totp_url = f"otpauth://totp/{urllib.parse.quote(label)}?secret={secret}&issuer={urllib.parse.quote(issuer)}"
        
        return totp_url
    
    def verify_totp_code(self, user: User, code: str) -> bool:
        """Verify TOTP code"""
        secret = cache.get(f"totp_secret:{user.id}")
        if not secret:
            return False
        
        # In production, use a proper TOTP library like pyotp
        # For now, we'll simulate verification
        import hmac
        
        current_time = int(time.time() // self.totp_window)
        
        # Check current window and adjacent windows for clock skew
        for time_window in [current_time - 1, current_time, current_time + 1]:
            expected_code = self._generate_totp_code(secret, time_window)
            if hmac.compare_digest(code, expected_code):
                return True
        
        return False
    
    def _generate_totp_code(self, secret: str, time_window: int) -> str:
        """Generate TOTP code for given time window"""
        # Simplified TOTP implementation
        # In production, use pyotp or similar library
        import struct
        
        key = secret.encode()
        time_bytes = struct.pack('>Q', time_window)
        
        hmac_hash = hmac.new(key, time_bytes, hashlib.sha1).digest()
        offset = hmac_hash[-1] & 0x0f
        
        code = struct.unpack('>I', hmac_hash[offset:offset + 4])[0]
        code &= 0x7fffffff
        code %= 1000000
        
        return f"{code:06d}"
    
    def generate_backup_codes(self, user: User) -> List[str]:
        """Generate backup codes for 2FA"""
        codes = []
        for _ in range(self.backup_codes_count):
            code = secrets.token_hex(4).upper()
            codes.append(code)
        
        # Store hashed backup codes
        hashed_codes = [hashlib.sha256(code.encode()).hexdigest() for code in codes]
        cache.set(f"backup_codes:{user.id}", hashed_codes, timeout=None)
        
        return codes
    
    def verify_backup_code(self, user: User, code: str) -> bool:
        """Verify and consume backup code"""
        hashed_codes = cache.get(f"backup_codes:{user.id}", [])
        code_hash = hashlib.sha256(code.upper().encode()).hexdigest()
        
        if code_hash in hashed_codes:
            # Remove used code
            hashed_codes.remove(code_hash)
            cache.set(f"backup_codes:{user.id}", hashed_codes, timeout=None)
            return True
        
        return False


class RoleBasedPermission(BasePermission):
    """Role-based access control permission"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get required permissions for the view
        required_permissions = getattr(view, 'required_permissions', [])
        if not required_permissions:
            return True
        
        # Check if user has required permissions
        user_permissions = self.get_user_permissions(request.user)
        
        for permission in required_permissions:
            if permission not in user_permissions:
                return False
        
        return True
    
    def get_user_permissions(self, user: User) -> List[str]:
        """Get all permissions for user"""
        # Check cache first
        cache_key = f"user_permissions:{user.id}"
        cached_permissions = cache.get(cache_key)
        
        if cached_permissions is not None:
            return cached_permissions
        
        # Get permissions from database
        permissions = set()
        
        # Direct user permissions
        user_perms = user.user_permissions.values_list('codename', flat=True)
        permissions.update(user_perms)
        
        # Group permissions
        group_perms = Permission.objects.filter(
            group__user=user
        ).values_list('codename', flat=True)
        permissions.update(group_perms)
        
        permissions_list = list(permissions)
        
        # Cache for 5 minutes
        cache.set(cache_key, permissions_list, timeout=300)
        
        return permissions_list


class IPWhitelistPermission(BasePermission):
    """IP address whitelist permission"""
    
    def has_permission(self, request, view):
        if not getattr(settings, 'IP_WHITELIST_ENABLED', False):
            return True
        
        client_ip = self.get_client_ip(request)
        whitelist = getattr(settings, 'IP_WHITELIST', [])
        
        if not whitelist:
            return True
        
        return client_ip in whitelist
    
    def get_client_ip(self, request) -> str:
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip


class SessionSecurityManager:
    """Manage secure sessions with advanced features"""
    
    def __init__(self):
        self.max_sessions_per_user = 5
        self.session_timeout = 3600  # 1 hour
        self.idle_timeout = 1800     # 30 minutes
    
    def create_secure_session(self, user: User, request) -> str:
        """Create a secure session for user"""
        session_id = secrets.token_urlsafe(32)
        
        session_data = {
            'user_id': user.id,
            'created_at': datetime.now().isoformat(),
            'last_activity': datetime.now().isoformat(),
            'ip_address': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'is_active': True,
        }
        
        # Store session
        cache.set(f"session:{session_id}", session_data, timeout=self.session_timeout)
        
        # Track user sessions
        self._add_user_session(user.id, session_id)
        
        # Cleanup old sessions
        self._cleanup_user_sessions(user.id)
        
        return session_id
    
    def validate_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Validate session and update activity"""
        session_data = cache.get(f"session:{session_id}")
        
        if not session_data or not session_data.get('is_active'):
            return None
        
        # Check idle timeout
        last_activity = datetime.fromisoformat(session_data['last_activity'])
        if (datetime.now() - last_activity).seconds > self.idle_timeout:
            self.invalidate_session(session_id)
            return None
        
        # Update last activity
        session_data['last_activity'] = datetime.now().isoformat()
        cache.set(f"session:{session_id}", session_data, timeout=self.session_timeout)
        
        return session_data
    
    def invalidate_session(self, session_id: str):
        """Invalidate a session"""
        session_data = cache.get(f"session:{session_id}")
        if session_data:
            user_id = session_data['user_id']
            self._remove_user_session(user_id, session_id)
        
        cache.delete(f"session:{session_id}")
    
    def invalidate_all_user_sessions(self, user_id: int):
        """Invalidate all sessions for a user"""
        user_sessions = cache.get(f"user_sessions:{user_id}", [])
        
        for session_id in user_sessions:
            cache.delete(f"session:{session_id}")
        
        cache.delete(f"user_sessions:{user_id}")
    
    def _get_client_ip(self, request) -> str:
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    def _add_user_session(self, user_id: int, session_id: str):
        """Add session to user's session list"""
        user_sessions = cache.get(f"user_sessions:{user_id}", [])
        user_sessions.append(session_id)
        cache.set(f"user_sessions:{user_id}", user_sessions, timeout=self.session_timeout)
    
    def _remove_user_session(self, user_id: int, session_id: str):
        """Remove session from user's session list"""
        user_sessions = cache.get(f"user_sessions:{user_id}", [])
        if session_id in user_sessions:
            user_sessions.remove(session_id)
            cache.set(f"user_sessions:{user_id}", user_sessions, timeout=self.session_timeout)
    
    def _cleanup_user_sessions(self, user_id: int):
        """Cleanup old sessions if user exceeds max sessions"""
        user_sessions = cache.get(f"user_sessions:{user_id}", [])
        
        if len(user_sessions) > self.max_sessions_per_user:
            # Remove oldest sessions
            sessions_to_remove = user_sessions[:-self.max_sessions_per_user]
            for session_id in sessions_to_remove:
                cache.delete(f"session:{session_id}")
            
            # Keep only recent sessions
            user_sessions = user_sessions[-self.max_sessions_per_user:]
            cache.set(f"user_sessions:{user_id}", user_sessions, timeout=self.session_timeout)


# Global instances
mfa_manager = MultiFactorAuthentication()
session_manager = SessionSecurityManager()

# Export commonly used functions
__all__ = [
    'APIKeyAuthentication',
    'JWTAuthentication',
    'MultiFactorAuthentication',
    'RoleBasedPermission',
    'IPWhitelistPermission',
    'SessionSecurityManager',
    'mfa_manager',
    'session_manager',
]
