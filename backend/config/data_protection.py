# Data Protection and Privacy Compliance System

import os
import hashlib
import secrets
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth.models import User
from django.db import models
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import json
import logging
from enum import Enum

logger = logging.getLogger(__name__)


class DataClassification(Enum):
    """Data classification levels"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


class ProcessingPurpose(Enum):
    """Data processing purposes for GDPR compliance"""
    BUSINESS_OPERATION = "business_operation"
    LEGAL_COMPLIANCE = "legal_compliance"
    CUSTOMER_SERVICE = "customer_service"
    MARKETING = "marketing"
    ANALYTICS = "analytics"
    SECURITY = "security"


class DataRetentionPolicy:
    """Data retention policies for different data types"""
    
    POLICIES = {
        'user_data': {
            'retention_period': 2555,  # 7 years in days
            'classification': DataClassification.CONFIDENTIAL,
            'auto_delete': False,
            'archive_after': 1095,  # 3 years
        },
        'financial_data': {
            'retention_period': 3650,  # 10 years
            'classification': DataClassification.RESTRICTED,
            'auto_delete': False,
            'archive_after': 2555,  # 7 years
        },
        'audit_logs': {
            'retention_period': 2555,  # 7 years
            'classification': DataClassification.RESTRICTED,
            'auto_delete': False,
            'archive_after': 1095,  # 3 years
        },
        'session_data': {
            'retention_period': 30,  # 30 days
            'classification': DataClassification.INTERNAL,
            'auto_delete': True,
            'archive_after': None,
        },
        'temporary_files': {
            'retention_period': 7,  # 7 days
            'classification': DataClassification.INTERNAL,
            'auto_delete': True,
            'archive_after': None,
        },
        'ai_ml_data': {
            'retention_period': 1095,  # 3 years
            'classification': DataClassification.CONFIDENTIAL,
            'auto_delete': False,
            'archive_after': 365,  # 1 year
        },
    }
    
    @classmethod
    def get_policy(cls, data_type: str) -> Dict[str, Any]:
        """Get retention policy for data type"""
        return cls.POLICIES.get(data_type, cls.POLICIES['user_data'])
    
    @classmethod
    def is_expired(cls, data_type: str, created_date: datetime) -> bool:
        """Check if data has exceeded retention period"""
        policy = cls.get_policy(data_type)
        retention_days = policy['retention_period']
        expiry_date = created_date + timedelta(days=retention_days)
        return datetime.now() > expiry_date
    
    @classmethod
    def should_archive(cls, data_type: str, created_date: datetime) -> bool:
        """Check if data should be archived"""
        policy = cls.get_policy(data_type)
        archive_days = policy.get('archive_after')
        if not archive_days:
            return False
        
        archive_date = created_date + timedelta(days=archive_days)
        return datetime.now() > archive_date


class FieldEncryption:
    """Field-level encryption for sensitive data"""
    
    def __init__(self):
        self.key = self._get_encryption_key()
        self.fernet = Fernet(self.key)
    
    def _get_encryption_key(self) -> bytes:
        """Get or generate encryption key"""
        key_file = os.path.join(settings.BASE_DIR, '.field_encryption_key')
        
        if os.path.exists(key_file):
            with open(key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, 'wb') as f:
                f.write(key)
            os.chmod(key_file, 0o600)
            return key
    
    def encrypt_field(self, value: str) -> str:
        """Encrypt a field value"""
        if not value:
            return value
        
        try:
            encrypted = self.fernet.encrypt(value.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            logger.error(f"Field encryption failed: {str(e)}")
            raise
    
    def decrypt_field(self, encrypted_value: str) -> str:
        """Decrypt a field value"""
        if not encrypted_value:
            return encrypted_value
        
        try:
            decoded = base64.urlsafe_b64decode(encrypted_value.encode())
            decrypted = self.fernet.decrypt(decoded)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Field decryption failed: {str(e)}")
            raise


class EncryptedField(models.TextField):
    """Custom Django field that automatically encrypts/decrypts data"""
    
    def __init__(self, *args, **kwargs):
        self.encryption = FieldEncryption()
        super().__init__(*args, **kwargs)
    
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return self.encryption.decrypt_field(value)
    
    def to_python(self, value):
        if isinstance(value, str):
            return value
        if value is None:
            return value
        return self.encryption.decrypt_field(value)
    
    def get_prep_value(self, value):
        if value is None:
            return value
        return self.encryption.encrypt_field(value)


class DataAnonymizer:
    """Data anonymization utilities for privacy protection"""
    
    @staticmethod
    def anonymize_email(email: str) -> str:
        """Anonymize email address"""
        if not email or '@' not in email:
            return email
        
        local, domain = email.split('@', 1)
        if len(local) <= 2:
            anonymized_local = '*' * len(local)
        else:
            anonymized_local = local[0] + '*' * (len(local) - 2) + local[-1]
        
        return f"{anonymized_local}@{domain}"
    
    @staticmethod
    def anonymize_phone(phone: str) -> str:
        """Anonymize phone number"""
        if not phone:
            return phone
        
        # Keep first 3 and last 2 digits
        if len(phone) <= 5:
            return '*' * len(phone)
        
        return phone[:3] + '*' * (len(phone) - 5) + phone[-2:]
    
    @staticmethod
    def anonymize_name(name: str) -> str:
        """Anonymize personal name"""
        if not name:
            return name
        
        parts = name.split()
        anonymized_parts = []
        
        for part in parts:
            if len(part) <= 1:
                anonymized_parts.append('*')
            else:
                anonymized_parts.append(part[0] + '*' * (len(part) - 1))
        
        return ' '.join(anonymized_parts)
    
    @staticmethod
    def anonymize_address(address: str) -> str:
        """Anonymize address"""
        if not address:
            return address
        
        # Keep only city/region information, anonymize street details
        lines = address.split('\n')
        anonymized_lines = []
        
        for i, line in enumerate(lines):
            if i == 0:  # First line (street address)
                anonymized_lines.append('[STREET ADDRESS REDACTED]')
            else:  # Keep city, state, postal code
                anonymized_lines.append(line)
        
        return '\n'.join(anonymized_lines)
    
    @staticmethod
    def anonymize_financial_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Anonymize financial data"""
        anonymized = data.copy()
        
        sensitive_fields = [
            'account_number', 'iban', 'credit_card', 'bank_account',
            'routing_number', 'swift_code'
        ]
        
        for field in sensitive_fields:
            if field in anonymized and anonymized[field]:
                value = str(anonymized[field])
                if len(value) > 4:
                    anonymized[field] = '*' * (len(value) - 4) + value[-4:]
                else:
                    anonymized[field] = '*' * len(value)
        
        return anonymized


class ConsentManager:
    """Manage user consent for data processing"""
    
    def __init__(self):
        self.cache_timeout = 3600  # 1 hour
    
    def record_consent(self, user_id: int, purpose: ProcessingPurpose, 
                      granted: bool, ip_address: str = None) -> Dict[str, Any]:
        """Record user consent for data processing"""
        consent_record = {
            'user_id': user_id,
            'purpose': purpose.value,
            'granted': granted,
            'timestamp': datetime.now().isoformat(),
            'ip_address': ip_address,
            'version': '1.0',  # Consent version for tracking changes
        }
        
        # Store in cache for quick access
        cache_key = f"consent:{user_id}:{purpose.value}"
        cache.set(cache_key, consent_record, timeout=self.cache_timeout)
        
        # Store in database (would need a ConsentRecord model)
        # ConsentRecord.objects.create(**consent_record)
        
        logger.info(f"Consent recorded: User {user_id}, Purpose {purpose.value}, Granted {granted}")
        return consent_record
    
    def check_consent(self, user_id: int, purpose: ProcessingPurpose) -> bool:
        """Check if user has granted consent for specific purpose"""
        cache_key = f"consent:{user_id}:{purpose.value}"
        consent_record = cache.get(cache_key)
        
        if consent_record:
            return consent_record.get('granted', False)
        
        # Fallback to database lookup
        # try:
        #     record = ConsentRecord.objects.filter(
        #         user_id=user_id,
        #         purpose=purpose.value
        #     ).latest('timestamp')
        #     return record.granted
        # except ConsentRecord.DoesNotExist:
        #     return False
        
        return False
    
    def withdraw_consent(self, user_id: int, purpose: ProcessingPurpose) -> bool:
        """Withdraw user consent for specific purpose"""
        return self.record_consent(user_id, purpose, False)
    
    def get_user_consents(self, user_id: int) -> Dict[str, Any]:
        """Get all consents for a user"""
        consents = {}
        
        for purpose in ProcessingPurpose:
            consents[purpose.value] = self.check_consent(user_id, purpose)
        
        return consents


class DataPortabilityManager:
    """Manage data portability requests (GDPR Article 20)"""
    
    def __init__(self):
        self.anonymizer = DataAnonymizer()
    
    def export_user_data(self, user_id: int, include_anonymized: bool = False) -> Dict[str, Any]:
        """Export all user data in portable format"""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise ValueError(f"User {user_id} not found")
        
        export_data = {
            'export_info': {
                'user_id': user_id,
                'export_date': datetime.now().isoformat(),
                'format_version': '1.0',
                'includes_anonymized': include_anonymized,
            },
            'personal_data': self._export_personal_data(user),
            'business_data': self._export_business_data(user),
            'system_data': self._export_system_data(user),
        }
        
        if include_anonymized:
            export_data['anonymized_data'] = self._export_anonymized_data(user)
        
        return export_data
    
    def _export_personal_data(self, user: User) -> Dict[str, Any]:
        """Export personal data"""
        return {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'is_active': user.is_active,
        }
    
    def _export_business_data(self, user: User) -> Dict[str, Any]:
        """Export business-related data"""
        # This would include data from business modules
        return {
            'companies': [],  # User's companies
            'transactions': [],  # User's transactions
            'documents': [],  # User's documents
        }
    
    def _export_system_data(self, user: User) -> Dict[str, Any]:
        """Export system-related data"""
        return {
            'permissions': list(user.user_permissions.values_list('codename', flat=True)),
            'groups': list(user.groups.values_list('name', flat=True)),
            'sessions': [],  # Recent sessions
            'audit_logs': [],  # User's audit logs
        }
    
    def _export_anonymized_data(self, user: User) -> Dict[str, Any]:
        """Export anonymized data for research purposes"""
        personal_data = self._export_personal_data(user)
        
        return {
            'username': self.anonymizer.anonymize_name(personal_data['username']),
            'email': self.anonymizer.anonymize_email(personal_data['email']),
            'first_name': self.anonymizer.anonymize_name(personal_data['first_name']),
            'last_name': self.anonymizer.anonymize_name(personal_data['last_name']),
            'date_joined': personal_data['date_joined'],
            'is_active': personal_data['is_active'],
        }


class DataDeletionManager:
    """Manage data deletion requests (GDPR Article 17)"""
    
    def __init__(self):
        self.anonymizer = DataAnonymizer()
    
    def delete_user_data(self, user_id: int, deletion_type: str = 'soft') -> Dict[str, Any]:
        """Delete or anonymize user data"""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise ValueError(f"User {user_id} not found")
        
        deletion_report = {
            'user_id': user_id,
            'deletion_date': datetime.now().isoformat(),
            'deletion_type': deletion_type,
            'deleted_records': {},
            'anonymized_records': {},
            'retained_records': {},
        }
        
        if deletion_type == 'hard':
            deletion_report = self._hard_delete_user_data(user, deletion_report)
        else:
            deletion_report = self._soft_delete_user_data(user, deletion_report)
        
        logger.info(f"User data deletion completed: {user_id}, type: {deletion_type}")
        return deletion_report
    
    def _hard_delete_user_data(self, user: User, report: Dict[str, Any]) -> Dict[str, Any]:
        """Permanently delete user data"""
        # Delete user account
        user.delete()
        report['deleted_records']['user_account'] = 1
        
        # Delete related data (would need to implement for each model)
        # This should cascade through foreign keys
        
        return report
    
    def _soft_delete_user_data(self, user: User, report: Dict[str, Any]) -> Dict[str, Any]:
        """Anonymize user data instead of deleting"""
        # Anonymize personal information
        user.username = f"deleted_user_{user.id}"
        user.email = f"deleted_{user.id}@example.com"
        user.first_name = "Deleted"
        user.last_name = "User"
        user.is_active = False
        user.save()
        
        report['anonymized_records']['user_account'] = 1
        
        # Anonymize related data while preserving business records
        # This maintains data integrity for business operations
        
        return report


# Global instances
field_encryption = FieldEncryption()
data_anonymizer = DataAnonymizer()
consent_manager = ConsentManager()
data_portability_manager = DataPortabilityManager()
data_deletion_manager = DataDeletionManager()

# Export commonly used functions
__all__ = [
    'DataClassification',
    'ProcessingPurpose',
    'DataRetentionPolicy',
    'FieldEncryption',
    'EncryptedField',
    'DataAnonymizer',
    'ConsentManager',
    'DataPortabilityManager',
    'DataDeletionManager',
    'field_encryption',
    'data_anonymizer',
    'consent_manager',
    'data_portability_manager',
    'data_deletion_manager',
]
