# Enhanced Security Configuration for ERP System

import os
import secrets
import hashlib
import hmac
import time
from typing import Dict, Any, Optional, List
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth.models import User
from django.utils import timezone
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import logging
import jwt
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Security configuration constants
SECURITY_CONFIG = {
    'PASSWORD_MIN_LENGTH': 12,
    'PASSWORD_COMPLEXITY_REQUIRED': True,
    'SESSION_TIMEOUT': 3600,  # 1 hour
    'MAX_LOGIN_ATTEMPTS': 5,
    'LOCKOUT_DURATION': 900,  # 15 minutes
    'JWT_EXPIRATION': 3600,   # 1 hour
    'REFRESH_TOKEN_EXPIRATION': 86400 * 7,  # 7 days
    'API_KEY_LENGTH': 64,
    'ENCRYPTION_KEY_ROTATION_DAYS': 90,
    'AUDIT_LOG_RETENTION_DAYS': 2555,  # 7 years
    'FAILED_LOGIN_TRACKING': True,
    'IP_WHITELIST_ENABLED': False,
    'RATE_LIMITING_ENABLED': True,
    'TWO_FACTOR_REQUIRED': False,  # Can be enabled per user
}

# Security headers configuration
SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' ws: wss:; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    ),
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': (
        'geolocation=(), microphone=(), camera=(), '
        'payment=(), usb=(), magnetometer=(), gyroscope=()'
    ),
}

# Sensitive data patterns for detection
SENSITIVE_PATTERNS = [
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
    r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',  # Credit card
    r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
    r'\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b',  # IBAN
    r'\bpwd|password|secret|key|token\b',  # Common secret keywords
]


class EncryptionManager:
    """Advanced encryption manager for sensitive data"""
    
    def __init__(self):
        self.master_key = self._get_or_create_master_key()
        self.fernet = Fernet(self.master_key)
    
    def _get_or_create_master_key(self) -> bytes:
        """Get or create master encryption key"""
        key_file = os.path.join(settings.BASE_DIR, '.encryption_key')
        
        if os.path.exists(key_file):
            with open(key_file, 'rb') as f:
                return f.read()
        else:
            # Generate new key
            key = Fernet.generate_key()
            with open(key_file, 'wb') as f:
                f.write(key)
            os.chmod(key_file, 0o600)  # Read-only for owner
            return key
    
    def encrypt(self, data: str) -> str:
        """Encrypt sensitive data"""
        try:
            encrypted_data = self.fernet.encrypt(data.encode())
            return base64.urlsafe_b64encode(encrypted_data).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        try:
            decoded_data = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted_data = self.fernet.decrypt(decoded_data)
            return decrypted_data.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            raise
    
    def encrypt_dict(self, data: Dict[str, Any], fields_to_encrypt: List[str]) -> Dict[str, Any]:
        """Encrypt specific fields in a dictionary"""
        encrypted_data = data.copy()
        for field in fields_to_encrypt:
            if field in encrypted_data and encrypted_data[field]:
                encrypted_data[field] = self.encrypt(str(encrypted_data[field]))
        return encrypted_data
    
    def decrypt_dict(self, data: Dict[str, Any], fields_to_decrypt: List[str]) -> Dict[str, Any]:
        """Decrypt specific fields in a dictionary"""
        decrypted_data = data.copy()
        for field in fields_to_decrypt:
            if field in decrypted_data and decrypted_data[field]:
                try:
                    decrypted_data[field] = self.decrypt(decrypted_data[field])
                except:
                    # Field might not be encrypted
                    pass
        return decrypted_data


class APIKeyManager:
    """Manage API keys for external integrations"""
    
    @staticmethod
    def generate_api_key() -> str:
        """Generate a secure API key"""
        return secrets.token_urlsafe(SECURITY_CONFIG['API_KEY_LENGTH'])
    
    @staticmethod
    def hash_api_key(api_key: str) -> str:
        """Hash API key for storage"""
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac('sha256', api_key.encode(), salt, 100000)
        return base64.b64encode(salt + key).decode()
    
    @staticmethod
    def verify_api_key(api_key: str, hashed_key: str) -> bool:
        """Verify API key against hash"""
        try:
            decoded = base64.b64decode(hashed_key.encode())
            salt = decoded[:32]
            stored_key = decoded[32:]
            key = hashlib.pbkdf2_hmac('sha256', api_key.encode(), salt, 100000)
            return hmac.compare_digest(stored_key, key)
        except:
            return False


class SecurityAuditor:
    """Security auditing and monitoring"""
    
    def __init__(self):
        self.encryption_manager = EncryptionManager()
    
    def log_security_event(self, event_type: str, user_id: Optional[int], 
                          ip_address: str, details: Dict[str, Any]):
        """Log security events for audit trail"""
        event_data = {
            'timestamp': timezone.now().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'ip_address': ip_address,
            'details': details,
            'severity': self._determine_severity(event_type),
        }
        
        # Store in cache for immediate access
        cache_key = f"security_event:{int(time.time())}"
        cache.set(cache_key, event_data, timeout=86400)  # 24 hours
        
        # Log to file
        logger.info(f"Security Event: {event_type}", extra=event_data)
        
        # Check for critical events
        if event_data['severity'] == 'critical':
            self._handle_critical_event(event_data)
    
    def _determine_severity(self, event_type: str) -> str:
        """Determine event severity level"""
        critical_events = [
            'multiple_failed_logins',
            'privilege_escalation',
            'data_breach_attempt',
            'unauthorized_api_access',
            'suspicious_activity',
        ]
        
        high_events = [
            'failed_login',
            'password_change',
            'permission_change',
            'api_key_created',
        ]
        
        if event_type in critical_events:
            return 'critical'
        elif event_type in high_events:
            return 'high'
        else:
            return 'medium'
    
    def _handle_critical_event(self, event_data: Dict[str, Any]):
        """Handle critical security events"""
        # Send immediate alerts
        logger.critical(f"CRITICAL SECURITY EVENT: {event_data}")
        
        # Could integrate with external alerting systems
        # self._send_security_alert(event_data)
    
    def check_password_strength(self, password: str) -> Dict[str, Any]:
        """Check password strength and compliance"""
        result = {
            'is_strong': True,
            'score': 0,
            'issues': [],
            'suggestions': [],
        }
        
        # Length check
        if len(password) < SECURITY_CONFIG['PASSWORD_MIN_LENGTH']:
            result['is_strong'] = False
            result['issues'].append(f"Password must be at least {SECURITY_CONFIG['PASSWORD_MIN_LENGTH']} characters")
        else:
            result['score'] += 2
        
        # Complexity checks
        if SECURITY_CONFIG['PASSWORD_COMPLEXITY_REQUIRED']:
            has_upper = any(c.isupper() for c in password)
            has_lower = any(c.islower() for c in password)
            has_digit = any(c.isdigit() for c in password)
            has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password)
            
            if not has_upper:
                result['is_strong'] = False
                result['issues'].append("Password must contain uppercase letters")
            else:
                result['score'] += 1
            
            if not has_lower:
                result['is_strong'] = False
                result['issues'].append("Password must contain lowercase letters")
            else:
                result['score'] += 1
            
            if not has_digit:
                result['is_strong'] = False
                result['issues'].append("Password must contain numbers")
            else:
                result['score'] += 1
            
            if not has_special:
                result['is_strong'] = False
                result['issues'].append("Password must contain special characters")
            else:
                result['score'] += 1
        
        # Common password check
        common_passwords = ['password', '123456', 'admin', 'qwerty']
        if password.lower() in common_passwords:
            result['is_strong'] = False
            result['issues'].append("Password is too common")
        
        # Calculate final score
        result['score'] = min(result['score'], 10)
        
        return result
    
    def detect_sensitive_data(self, text: str) -> List[Dict[str, Any]]:
        """Detect sensitive data patterns in text"""
        import re
        
        detections = []
        for pattern in SENSITIVE_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                detections.append({
                    'pattern': pattern,
                    'match': match.group(),
                    'start': match.start(),
                    'end': match.end(),
                    'type': self._classify_pattern(pattern),
                })
        
        return detections
    
    def _classify_pattern(self, pattern: str) -> str:
        """Classify the type of sensitive data pattern"""
        if 'email' in pattern or '@' in pattern:
            return 'email'
        elif 'card' in pattern or r'\d{4}' in pattern:
            return 'credit_card'
        elif 'ssn' in pattern or r'\d{3}-\d{2}' in pattern:
            return 'ssn'
        elif 'iban' in pattern:
            return 'iban'
        else:
            return 'credential'


class LoginSecurityManager:
    """Manage login security and failed attempts"""
    
    def __init__(self):
        self.auditor = SecurityAuditor()
    
    def check_login_attempts(self, username: str, ip_address: str) -> Dict[str, Any]:
        """Check if login attempts exceed limits"""
        user_key = f"login_attempts:user:{username}"
        ip_key = f"login_attempts:ip:{ip_address}"
        
        user_attempts = cache.get(user_key, 0)
        ip_attempts = cache.get(ip_key, 0)
        
        max_attempts = SECURITY_CONFIG['MAX_LOGIN_ATTEMPTS']
        
        result = {
            'allowed': True,
            'user_attempts': user_attempts,
            'ip_attempts': ip_attempts,
            'max_attempts': max_attempts,
            'lockout_duration': SECURITY_CONFIG['LOCKOUT_DURATION'],
        }
        
        if user_attempts >= max_attempts or ip_attempts >= max_attempts:
            result['allowed'] = False
            
            # Log security event
            self.auditor.log_security_event(
                'multiple_failed_logins',
                None,
                ip_address,
                {
                    'username': username,
                    'user_attempts': user_attempts,
                    'ip_attempts': ip_attempts,
                }
            )
        
        return result
    
    def record_failed_login(self, username: str, ip_address: str):
        """Record a failed login attempt"""
        user_key = f"login_attempts:user:{username}"
        ip_key = f"login_attempts:ip:{ip_address}"
        
        lockout_duration = SECURITY_CONFIG['LOCKOUT_DURATION']
        
        # Increment counters
        cache.set(user_key, cache.get(user_key, 0) + 1, timeout=lockout_duration)
        cache.set(ip_key, cache.get(ip_key, 0) + 1, timeout=lockout_duration)
        
        # Log security event
        self.auditor.log_security_event(
            'failed_login',
            None,
            ip_address,
            {'username': username}
        )
    
    def record_successful_login(self, user_id: int, ip_address: str):
        """Record a successful login and clear failed attempts"""
        user = User.objects.get(id=user_id)
        
        # Clear failed attempts
        user_key = f"login_attempts:user:{user.username}"
        ip_key = f"login_attempts:ip:{ip_address}"
        cache.delete(user_key)
        cache.delete(ip_key)
        
        # Log security event
        self.auditor.log_security_event(
            'successful_login',
            user_id,
            ip_address,
            {'username': user.username}
        )


class JWTSecurityManager:
    """Enhanced JWT token management with security features"""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = 'HS256'
    
    def create_access_token(self, user_id: int, permissions: List[str] = None) -> str:
        """Create JWT access token with security claims"""
        now = datetime.utcnow()
        payload = {
            'user_id': user_id,
            'iat': now,
            'exp': now + timedelta(seconds=SECURITY_CONFIG['JWT_EXPIRATION']),
            'type': 'access',
            'permissions': permissions or [],
            'jti': secrets.token_urlsafe(16),  # JWT ID for revocation
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: int) -> str:
        """Create JWT refresh token"""
        now = datetime.utcnow()
        payload = {
            'user_id': user_id,
            'iat': now,
            'exp': now + timedelta(seconds=SECURITY_CONFIG['REFRESH_TOKEN_EXPIRATION']),
            'type': 'refresh',
            'jti': secrets.token_urlsafe(16),
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Check if token is revoked
            jti = payload.get('jti')
            if jti and cache.get(f"revoked_token:{jti}"):
                return None
            
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid JWT token")
            return None
    
    def revoke_token(self, token: str):
        """Revoke a JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm], options={"verify_exp": False})
            jti = payload.get('jti')
            if jti:
                # Store revoked token ID until expiration
                exp = payload.get('exp', 0)
                ttl = max(0, exp - int(time.time()))
                cache.set(f"revoked_token:{jti}", True, timeout=ttl)
        except:
            pass  # Token might be invalid, but that's okay for revocation


# Global instances
encryption_manager = EncryptionManager()
security_auditor = SecurityAuditor()
login_security_manager = LoginSecurityManager()
jwt_security_manager = JWTSecurityManager()

# Export commonly used functions
__all__ = [
    'EncryptionManager',
    'APIKeyManager',
    'SecurityAuditor',
    'LoginSecurityManager',
    'JWTSecurityManager',
    'encryption_manager',
    'security_auditor',
    'login_security_manager',
    'jwt_security_manager',
    'SECURITY_CONFIG',
    'SECURITY_HEADERS',
]
