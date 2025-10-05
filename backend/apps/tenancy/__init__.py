# Multi-Tenant Architecture Module

"""
Comprehensive multi-tenancy implementation for the ERP system.

Features:
- Tenant isolation with schema separation
- Tenant-specific configurations
- Data segregation and security
- Tenant management and provisioning
- Subdomain-based tenant routing
- Tenant-aware middleware
- Database connection management
- Tenant-specific customizations

Architecture:
- Schema-per-tenant approach for maximum isolation
- Shared application code with tenant-specific data
- Automatic tenant detection from subdomain/domain
- Tenant-aware ORM queries and data access
- Centralized tenant management
"""

default_app_config = 'apps.tenancy.apps.TenancyConfig'
