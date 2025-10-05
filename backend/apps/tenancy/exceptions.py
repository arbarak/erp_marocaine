# Tenant-Related Exceptions

class TenantError(Exception):
    """Base exception for tenant-related errors"""
    pass


class TenantNotFoundError(TenantError):
    """Raised when tenant cannot be found"""
    pass


class TenantInactiveError(TenantError):
    """Raised when tenant is inactive"""
    pass


class TenantLimitExceededError(TenantError):
    """Raised when tenant exceeds plan limits"""
    pass


class TenantFeatureNotAvailableError(TenantError):
    """Raised when requested feature is not available for tenant"""
    pass


class TenantSchemaError(TenantError):
    """Raised when there's an issue with tenant schema"""
    pass


class TenantPermissionError(TenantError):
    """Raised when user doesn't have permission for tenant operation"""
    pass
