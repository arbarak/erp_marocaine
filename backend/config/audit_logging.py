# Comprehensive Audit Logging System

import json
import time
import hashlib
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from django.contrib.auth.models import User
from django.db import models
from django.core.serializers.json import DjangoJSONEncoder
from django.utils import timezone as django_timezone
from django.conf import settings
import logging
from enum import Enum

logger = logging.getLogger(__name__)


class AuditEventType(Enum):
    """Audit event types for categorization"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    PERMISSION_CHANGE = "permission_change"
    SECURITY_EVENT = "security_event"
    API_ACCESS = "api_access"
    DATA_EXPORT = "data_export"
    DATA_IMPORT = "data_import"
    SYSTEM_CONFIG = "system_config"
    AI_ML_OPERATION = "ai_ml_operation"
    FINANCIAL_TRANSACTION = "financial_transaction"
    COMPLIANCE_EVENT = "compliance_event"


class AuditSeverity(Enum):
    """Audit event severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AuditLog(models.Model):
    """Comprehensive audit log model"""
    
    # Event identification
    event_id = models.UUIDField(unique=True, db_index=True)
    event_type = models.CharField(max_length=50, choices=[(e.value, e.value) for e in AuditEventType])
    severity = models.CharField(max_length=20, choices=[(s.value, s.value) for s in AuditSeverity], default=AuditSeverity.MEDIUM.value)
    
    # Timestamp information
    timestamp = models.DateTimeField(default=django_timezone.now, db_index=True)
    
    # User and session information
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    # Request information
    request_method = models.CharField(max_length=10, blank=True, null=True)
    request_path = models.TextField(blank=True, null=True)
    request_params = models.JSONField(default=dict, blank=True)
    
    # Object information
    object_type = models.CharField(max_length=100, blank=True, null=True)
    object_id = models.CharField(max_length=255, blank=True, null=True)
    object_repr = models.TextField(blank=True, null=True)
    
    # Change information
    changes = models.JSONField(default=dict, blank=True)
    old_values = models.JSONField(default=dict, blank=True)
    new_values = models.JSONField(default=dict, blank=True)
    
    # Additional context
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Compliance and security
    compliance_tags = models.JSONField(default=list, blank=True)
    risk_level = models.CharField(max_length=20, default='low')
    
    # Data integrity
    checksum = models.CharField(max_length=64, blank=True, null=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp', 'event_type']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['object_type', 'object_id']),
            models.Index(fields=['severity', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
        ]
    
    def save(self, *args, **kwargs):
        """Generate checksum for data integrity"""
        if not self.checksum:
            self.checksum = self.generate_checksum()
        super().save(*args, **kwargs)
    
    def generate_checksum(self) -> str:
        """Generate SHA-256 checksum for audit record integrity"""
        data = {
            'event_id': str(self.event_id),
            'event_type': self.event_type,
            'timestamp': self.timestamp.isoformat() if self.timestamp else '',
            'user_id': self.user.id if self.user else None,
            'object_type': self.object_type,
            'object_id': self.object_id,
            'changes': self.changes,
        }
        
        json_data = json.dumps(data, sort_keys=True, cls=DjangoJSONEncoder)
        return hashlib.sha256(json_data.encode()).hexdigest()
    
    def verify_integrity(self) -> bool:
        """Verify audit record integrity"""
        return self.checksum == self.generate_checksum()


class AuditLogger:
    """Main audit logging service"""
    
    def __init__(self):
        self.sensitive_fields = {
            'password', 'secret', 'key', 'token', 'api_key',
            'credit_card', 'ssn', 'bank_account', 'pin'
        }
    
    def log_event(self, event_type: AuditEventType, user: Optional[User] = None,
                  request=None, object_instance=None, changes: Dict[str, Any] = None,
                  description: str = None, metadata: Dict[str, Any] = None,
                  severity: AuditSeverity = AuditSeverity.MEDIUM,
                  compliance_tags: List[str] = None) -> AuditLog:
        """Log an audit event"""
        
        import uuid
        
        # Generate unique event ID
        event_id = uuid.uuid4()
        
        # Extract request information
        request_info = self._extract_request_info(request) if request else {}
        
        # Extract object information
        object_info = self._extract_object_info(object_instance) if object_instance else {}
        
        # Process changes and sanitize sensitive data
        processed_changes = self._process_changes(changes or {})
        
        # Create audit log entry
        audit_log = AuditLog(
            event_id=event_id,
            event_type=event_type.value,
            severity=severity.value,
            user=user,
            description=description,
            metadata=metadata or {},
            compliance_tags=compliance_tags or [],
            **request_info,
            **object_info,
            **processed_changes
        )
        
        # Determine risk level
        audit_log.risk_level = self._calculate_risk_level(event_type, severity, changes)
        
        try:
            audit_log.save()
            logger.info(f"Audit event logged: {event_type.value} - {event_id}")
            return audit_log
        except Exception as e:
            logger.error(f"Failed to save audit log: {str(e)}")
            # Fallback to file logging
            self._fallback_log(audit_log)
            raise
    
    def _extract_request_info(self, request) -> Dict[str, Any]:
        """Extract relevant information from Django request"""
        return {
            'session_id': request.session.session_key if hasattr(request, 'session') else None,
            'ip_address': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'request_method': request.method,
            'request_path': request.path,
            'request_params': self._sanitize_request_params(request),
        }
    
    def _get_client_ip(self, request) -> str:
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    def _sanitize_request_params(self, request) -> Dict[str, Any]:
        """Sanitize request parameters to remove sensitive data"""
        params = {}
        
        # GET parameters
        if hasattr(request, 'GET'):
            params['GET'] = self._sanitize_dict(dict(request.GET))
        
        # POST parameters (be careful with sensitive data)
        if hasattr(request, 'POST'):
            params['POST'] = self._sanitize_dict(dict(request.POST))
        
        return params
    
    def _sanitize_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Remove or mask sensitive data from dictionary"""
        sanitized = {}
        for key, value in data.items():
            if any(sensitive in key.lower() for sensitive in self.sensitive_fields):
                sanitized[key] = '[REDACTED]'
            else:
                sanitized[key] = value
        return sanitized
    
    def _extract_object_info(self, obj) -> Dict[str, Any]:
        """Extract information about the object being audited"""
        return {
            'object_type': obj.__class__.__name__,
            'object_id': str(getattr(obj, 'id', getattr(obj, 'pk', ''))),
            'object_repr': str(obj)[:500],  # Limit length
        }
    
    def _process_changes(self, changes: Dict[str, Any]) -> Dict[str, Any]:
        """Process and sanitize change data"""
        if not changes:
            return {'changes': {}, 'old_values': {}, 'new_values': {}}
        
        processed_changes = {}
        old_values = {}
        new_values = {}
        
        for field, change_data in changes.items():
            if isinstance(change_data, dict) and 'old' in change_data and 'new' in change_data:
                old_val = change_data['old']
                new_val = change_data['new']
                
                # Sanitize sensitive fields
                if any(sensitive in field.lower() for sensitive in self.sensitive_fields):
                    old_val = '[REDACTED]' if old_val else None
                    new_val = '[REDACTED]' if new_val else None
                
                processed_changes[field] = {'old': old_val, 'new': new_val}
                old_values[field] = old_val
                new_values[field] = new_val
            else:
                processed_changes[field] = change_data
        
        return {
            'changes': processed_changes,
            'old_values': old_values,
            'new_values': new_values
        }
    
    def _calculate_risk_level(self, event_type: AuditEventType, severity: AuditSeverity, changes: Dict[str, Any]) -> str:
        """Calculate risk level based on event characteristics"""
        risk_score = 0
        
        # Base score from event type
        high_risk_events = [
            AuditEventType.DELETE,
            AuditEventType.PERMISSION_CHANGE,
            AuditEventType.SECURITY_EVENT,
            AuditEventType.FINANCIAL_TRANSACTION,
        ]
        
        if event_type in high_risk_events:
            risk_score += 3
        elif event_type in [AuditEventType.UPDATE, AuditEventType.SYSTEM_CONFIG]:
            risk_score += 2
        else:
            risk_score += 1
        
        # Severity modifier
        if severity == AuditSeverity.CRITICAL:
            risk_score += 4
        elif severity == AuditSeverity.HIGH:
            risk_score += 3
        elif severity == AuditSeverity.MEDIUM:
            risk_score += 2
        else:
            risk_score += 1
        
        # Changes modifier
        if changes and len(changes) > 5:
            risk_score += 1
        
        # Determine final risk level
        if risk_score >= 7:
            return 'critical'
        elif risk_score >= 5:
            return 'high'
        elif risk_score >= 3:
            return 'medium'
        else:
            return 'low'
    
    def _fallback_log(self, audit_log: AuditLog):
        """Fallback logging to file when database fails"""
        fallback_data = {
            'event_id': str(audit_log.event_id),
            'event_type': audit_log.event_type,
            'timestamp': audit_log.timestamp.isoformat() if audit_log.timestamp else '',
            'user_id': audit_log.user.id if audit_log.user else None,
            'description': audit_log.description,
            'severity': audit_log.severity,
        }
        
        logger.critical(f"AUDIT_FALLBACK: {json.dumps(fallback_data)}")


class AuditQueryManager:
    """Manager for querying audit logs"""
    
    @staticmethod
    def get_user_activity(user: User, days: int = 30) -> List[AuditLog]:
        """Get user activity for specified number of days"""
        from datetime import timedelta
        
        start_date = django_timezone.now() - timedelta(days=days)
        return AuditLog.objects.filter(
            user=user,
            timestamp__gte=start_date
        ).order_by('-timestamp')
    
    @staticmethod
    def get_object_history(object_type: str, object_id: str) -> List[AuditLog]:
        """Get complete history for a specific object"""
        return AuditLog.objects.filter(
            object_type=object_type,
            object_id=object_id
        ).order_by('-timestamp')
    
    @staticmethod
    def get_security_events(days: int = 7) -> List[AuditLog]:
        """Get security-related events"""
        from datetime import timedelta
        
        start_date = django_timezone.now() - timedelta(days=days)
        return AuditLog.objects.filter(
            event_type__in=[
                AuditEventType.SECURITY_EVENT.value,
                AuditEventType.LOGIN.value,
                AuditEventType.PERMISSION_CHANGE.value,
            ],
            timestamp__gte=start_date
        ).order_by('-timestamp')
    
    @staticmethod
    def get_high_risk_events(days: int = 7) -> List[AuditLog]:
        """Get high-risk events"""
        from datetime import timedelta
        
        start_date = django_timezone.now() - timedelta(days=days)
        return AuditLog.objects.filter(
            risk_level__in=['high', 'critical'],
            timestamp__gte=start_date
        ).order_by('-timestamp')
    
    @staticmethod
    def get_compliance_report(compliance_tag: str, start_date: datetime, end_date: datetime) -> List[AuditLog]:
        """Get compliance report for specific tag and date range"""
        return AuditLog.objects.filter(
            compliance_tags__contains=[compliance_tag],
            timestamp__gte=start_date,
            timestamp__lte=end_date
        ).order_by('-timestamp')


# Audit decorators for automatic logging
def audit_model_changes(event_type: AuditEventType = AuditEventType.UPDATE, 
                       severity: AuditSeverity = AuditSeverity.MEDIUM):
    """Decorator to automatically audit model changes"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Get the instance being modified
            instance = args[0] if args else None
            
            # Capture old values if it's an update
            old_values = {}
            if instance and hasattr(instance, 'pk') and instance.pk:
                try:
                    old_instance = instance.__class__.objects.get(pk=instance.pk)
                    old_values = {field.name: getattr(old_instance, field.name) 
                                for field in instance._meta.fields}
                except:
                    pass
            
            # Execute the function
            result = func(*args, **kwargs)
            
            # Capture new values
            new_values = {}
            if instance:
                new_values = {field.name: getattr(instance, field.name) 
                            for field in instance._meta.fields}
            
            # Calculate changes
            changes = {}
            for field, new_val in new_values.items():
                old_val = old_values.get(field)
                if old_val != new_val:
                    changes[field] = {'old': old_val, 'new': new_val}
            
            # Log the audit event
            if changes:
                auditor = AuditLogger()
                auditor.log_event(
                    event_type=event_type,
                    object_instance=instance,
                    changes=changes,
                    severity=severity,
                    description=f"{event_type.value.title()} {instance.__class__.__name__}"
                )
            
            return result
        return wrapper
    return decorator


# Global audit logger instance
audit_logger = AuditLogger()

# Export commonly used functions
__all__ = [
    'AuditEventType',
    'AuditSeverity',
    'AuditLog',
    'AuditLogger',
    'AuditQueryManager',
    'audit_model_changes',
    'audit_logger',
]
