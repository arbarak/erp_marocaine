# Enhanced Invoice APIs Documentation

## Overview

The Enhanced Invoice APIs provide comprehensive functionality for managing invoices, payments, templates, and analytics in the ERP system. These APIs are designed for enterprise-grade invoice management with support for Moroccan business requirements.

## Base URL

```
/api/v1/invoicing/
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Enhanced Invoice Endpoints

### 1. Send Invoice via Email

**Endpoint:** `POST /invoices/{id}/send_email/`

Send an invoice to customers or suppliers via email with optional PDF attachment.

**Request Body:**
```json
{
  "to_emails": ["customer@example.com"],
  "cc_emails": ["manager@example.com"],
  "subject": "Invoice INV-2024-001",
  "message": "Please find attached your invoice.",
  "include_pdf": true,
  "send_copy_to_self": false
}
```

**Response:**
```json
{
  "message": "Invoice sent successfully",
  "recipients": ["customer@example.com", "manager@example.com"],
  "sent_at": "2024-01-15T10:30:00Z"
}
```

### 2. Upload Invoice Attachment

**Endpoint:** `POST /invoices/{id}/upload_attachment/`

Upload file attachments to invoices (supporting documents, contracts, etc.).

**Request:** Multipart form data
- `file`: File to upload (max 10MB)
- `description`: Optional description

**Supported File Types:**
- PDF, Word documents, Excel files
- Images (JPEG, PNG, GIF)

**Response:**
```json
{
  "message": "Attachment uploaded successfully",
  "filename": "contract.pdf",
  "description": "Service contract"
}
```

### 3. Invoice Approval Workflow

**Endpoint:** `POST /invoices/{id}/approve/`

Approve, reject, or request changes for invoices.

**Request Body:**
```json
{
  "action": "APPROVE",  // APPROVE, REJECT, REQUEST_CHANGES
  "comments": "Approved for payment"
}
```

**Response:**
```json
{
  "message": "Invoice approved successfully",
  "action": "APPROVE",
  "comments": "Approved for payment",
  "invoice": { /* invoice data */ }
}
```

### 4. Bulk Invoice Operations

**Endpoint:** `POST /invoices/bulk_actions/`

Perform bulk operations on multiple invoices.

**Request Body:**
```json
{
  "invoice_ids": ["uuid1", "uuid2", "uuid3"],
  "action": "VALIDATE",  // VALIDATE, POST, CANCEL, SEND_EMAIL, EXPORT_PDF
  "parameters": {}
}
```

**Response:**
```json
{
  "action": "VALIDATE",
  "total_processed": 3,
  "successful": 2,
  "failed": 1,
  "results": [
    {
      "invoice_id": "uuid1",
      "success": true,
      "message": "Validated"
    }
  ]
}
```

### 5. Recurring Invoice Schedule

**Endpoint:** `POST /invoices/create_recurring/`

Create recurring invoice schedules for subscription billing.

**Request Body:**
```json
{
  "template_invoice_id": "uuid",
  "frequency": "MONTHLY",  // WEEKLY, MONTHLY, QUARTERLY, YEARLY
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "max_occurrences": 12,
  "auto_send": true
}
```

**Response:**
```json
{
  "message": "Recurring invoice schedule created",
  "template_invoice": "INV-2024-001",
  "frequency": "MONTHLY",
  "next_invoice_dates": ["2024-02-01", "2024-03-01"],
  "total_scheduled": 12
}
```

### 6. Advanced Invoice Search

**Endpoint:** `POST /invoices/advanced_search/`

Search invoices with complex filters and criteria.

**Request Body:**
```json
{
  "date_range_start": "2024-01-01",
  "date_range_end": "2024-01-31",
  "amount_min": 100.00,
  "amount_max": 5000.00,
  "overdue_only": false,
  "days_overdue_min": 30,
  "payment_status": "UNPAID",  // UNPAID, PARTIALLY_PAID, FULLY_PAID
  "tags": ["urgent", "vip"]
}
```

**Response:** Array of matching invoices with pagination support.

### 7. Dashboard Statistics

**Endpoint:** `GET /invoices/dashboard_stats/`

Get comprehensive dashboard statistics for invoices.

**Response:**
```json
{
  "total_invoices": 150,
  "total_value": 75000.00,
  "average_value": 500.00,
  "overdue_count": 12,
  "status_breakdown": [
    {"state": "DRAFT", "count": 5, "total_amount": 2500.00},
    {"state": "POSTED", "count": 100, "total_amount": 50000.00}
  ],
  "monthly_trends": [
    {"month": "2024-01", "count": 25, "total_amount": 12500.00}
  ]
}
```

### 8. Export to CSV

**Endpoint:** `GET /invoices/export_csv/`

Export filtered invoices to CSV format.

**Query Parameters:**
- Standard filtering parameters (type, state, customer, etc.)

**Response:** CSV file download

## Invoice Template Management

### 1. Create Template

**Endpoint:** `POST /templates/create_template/`

Create custom invoice templates for PDF generation.

**Request Body:**
```json
{
  "name": "Corporate Template",
  "description": "Template for corporate clients",
  "template_data": {
    "header": {
      "show_logo": true,
      "title": "FACTURE",
      "title_color": "#2c3e50"
    },
    "footer": {
      "show_page_numbers": true,
      "footer_text": "Merci pour votre confiance"
    },
    "styling": {
      "font_family": "Arial",
      "primary_color": "#2c3e50"
    }
  },
  "is_default": false
}
```

### 2. List Templates

**Endpoint:** `GET /templates/list_templates/`

Get all available invoice templates.

**Response:** Array of template objects.

## Invoice Analytics

### 1. Payment Trends

**Endpoint:** `GET /analytics/payment_trends/?days=90`

Analyze payment trends and customer behavior.

**Response:**
```json
{
  "period_days": 90,
  "total_invoices": 100,
  "paid_invoices": 85,
  "overdue_invoices": 10,
  "average_payment_days": 25.5,
  "payment_rate": 85.0,
  "total_value": 50000.00,
  "outstanding_value": 7500.00
}
```

### 2. Customer Insights

**Endpoint:** `GET /analytics/customer_insights/?customer_id=uuid`

Get detailed customer payment insights and behavior analysis.

**Response:**
```json
{
  "top_customers": [
    {
      "customer__name": "ABC Corp",
      "total_invoices": 25,
      "total_amount": 15000.00,
      "outstanding_amount": 2000.00,
      "avg_amount": 600.00
    }
  ],
  "analysis_date": "2024-01-15"
}
```

## Enhanced PDF Generation

The enhanced PDF generator supports:

- **Custom Templates**: Configurable layouts and styling
- **Multi-language Support**: French and Arabic support
- **Moroccan Compliance**: ICE, IF, RC numbers, VAT formatting
- **Bulk Generation**: Generate multiple PDFs in one operation
- **Payment Receipts**: Generate payment confirmation receipts
- **Customer Statements**: Comprehensive account statements

### PDF Template Configuration

```json
{
  "header": {
    "show_logo": true,
    "show_company_info": true,
    "title": "FACTURE",
    "title_color": "#2c3e50",
    "background_color": "#ffffff"
  },
  "footer": {
    "show_page_numbers": true,
    "show_generation_date": true,
    "footer_text": "Merci pour votre confiance",
    "contact_info": true
  },
  "styling": {
    "font_family": "Arial, sans-serif",
    "font_size": "12px",
    "primary_color": "#2c3e50",
    "secondary_color": "#3498db"
  },
  "content": {
    "show_description": true,
    "show_quantity": true,
    "show_unit_price": true,
    "show_discount": true,
    "show_tax_details": true,
    "show_payment_terms": true
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "details": {
    "field": ["Field-specific error messages"]
  }
}
```

## Rate Limiting

- **Standard endpoints**: 100 requests per minute
- **Bulk operations**: 10 requests per minute
- **Email sending**: 50 emails per hour
- **PDF generation**: 20 PDFs per minute

## Moroccan Compliance Features

- **ICE Validation**: 15-digit ICE number validation
- **IF Number**: 7-8 digit IF number support
- **VAT Rates**: Support for 20%, 14%, 10%, 7% VAT rates
- **Currency**: MAD (Moroccan Dirham) as default
- **Language**: French language support for documents
- **Date Format**: DD/MM/YYYY format
- **Number Format**: French number formatting (1 234,56)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Company Isolation**: Data isolation by company
- **File Upload Security**: File type and size validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Cross-site request forgery protection

## Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequently accessed data
- **Pagination**: Efficient pagination for large datasets
- **Bulk Operations**: Optimized bulk processing
- **Async Processing**: Background processing for heavy operations
