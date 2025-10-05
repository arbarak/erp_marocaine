# Purchase Analytics & Reporting

## Overview

The Purchase Analytics & Reporting module provides comprehensive insights into purchasing operations, supplier performance, cost optimization, and compliance monitoring. This module enables data-driven decision making for procurement teams and management.

## Features

### 1. Purchase Overview Analytics
- **Total Orders & Value**: Complete overview of purchase volume and spending
- **Average Order Value**: Insights into order sizing patterns
- **Monthly Trends**: Historical trends and seasonal patterns
- **Status Distribution**: Breakdown of orders by status (pending, delivered, cancelled)
- **Top Suppliers**: Performance ranking by value and volume

### 2. Supplier Performance Analysis
- **Delivery Performance**: On-time delivery rates and lead time analysis
- **Quality Metrics**: Supplier ratings and quality scores
- **Order Volume**: Total orders and value per supplier
- **Reliability Metrics**: Cancellation rates and consistency
- **Comparative Analysis**: Side-by-side supplier comparison

### 3. Category Analysis
- **Spend by Category**: Breakdown of purchases by product categories
- **Volume Analysis**: Quantity trends by category
- **Price Trends**: Average unit price evolution
- **Supplier Diversity**: Number of suppliers per category
- **Market Concentration**: Category-wise supplier concentration

### 4. Cost Savings Analysis
- **RFQ Savings**: Potential savings from competitive bidding
- **Price Negotiations**: Savings from price negotiations
- **Volume Discounts**: Benefits from bulk purchasing
- **Supplier Optimization**: Cost reduction through supplier consolidation
- **Historical Savings**: Year-over-year cost reduction tracking

### 5. Purchase Forecasting
- **Demand Prediction**: AI-powered purchase forecasting
- **Seasonal Adjustments**: Seasonal demand pattern recognition
- **Growth Trends**: Historical growth rate analysis
- **Budget Planning**: Future budget requirement estimation
- **Confidence Intervals**: Forecast accuracy indicators

### 6. Compliance Reporting
- **Approval Compliance**: Purchase order approval workflow compliance
- **Documentation Standards**: Completeness of purchase documentation
- **Supplier Compliance**: Supplier information and certification status
- **Audit Trail**: Complete audit trail for all transactions
- **Regulatory Compliance**: Adherence to local regulations (Morocco)

## API Endpoints

### Analytics Endpoints

#### 1. Purchase Overview
```
GET /api/v1/purchasing/analytics/analytics_overview/
```
**Parameters:**
- `start_date` (optional): Start date for analysis (YYYY-MM-DD)
- `end_date` (optional): End date for analysis (YYYY-MM-DD)

**Response:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  "overview": {
    "total_orders": 1247,
    "total_value": 2847650.00,
    "average_order_value": 2284.50,
    "on_time_delivery_rate": 87.5
  },
  "status_distribution": [...],
  "monthly_trends": [...],
  "top_suppliers": [...]
}
```

#### 2. Supplier Performance
```
GET /api/v1/purchasing/analytics/supplier_performance/
```
**Parameters:**
- `supplier_id` (optional): Specific supplier ID
- `start_date` (optional): Start date for analysis
- `end_date` (optional): End date for analysis

#### 3. Category Analysis
```
GET /api/v1/purchasing/analytics/category_analysis/
```

#### 4. Cost Savings
```
GET /api/v1/purchasing/analytics/cost_savings/
```

#### 5. Purchase Forecast
```
GET /api/v1/purchasing/analytics/purchase_forecast/
```
**Parameters:**
- `months_ahead` (optional): Number of months to forecast (default: 6)

#### 6. Compliance Report
```
GET /api/v1/purchasing/analytics/compliance_report/
```

## Frontend Components

### 1. PurchaseAnalytics Component
- **Location**: `frontend/src/components/purchasing/PurchaseAnalytics.tsx`
- **Features**: 
  - Interactive charts and graphs
  - Tabbed interface for different analytics views
  - Date range selection
  - Export capabilities
  - Real-time data updates

### 2. PurchaseReports Component
- **Location**: `frontend/src/components/purchasing/PurchaseReports.tsx`
- **Features**:
  - Report template management
  - Custom report generation
  - Multiple export formats (PDF, Excel, CSV)
  - Scheduled reporting
  - Report history and archiving

### 3. PurchaseDashboard Component
- **Location**: `frontend/src/components/purchasing/PurchaseDashboard.tsx`
- **Features**:
  - Executive dashboard with key metrics
  - Quick insights and alerts
  - Recent activity feed
  - Performance indicators
  - Integration with analytics and reports

## Key Metrics & KPIs

### Financial Metrics
- **Total Purchase Value**: Sum of all purchase orders
- **Average Order Value**: Mean value per purchase order
- **Cost Savings**: Total savings from negotiations and RFQs
- **Budget Utilization**: Percentage of budget consumed
- **Payment Terms Optimization**: Cash flow impact analysis

### Operational Metrics
- **Order Cycle Time**: Average time from order to delivery
- **On-Time Delivery Rate**: Percentage of orders delivered on time
- **Order Accuracy**: Percentage of orders delivered correctly
- **Supplier Lead Time**: Average lead time by supplier
- **Emergency Orders**: Percentage of urgent/emergency orders

### Quality Metrics
- **Supplier Rating**: Average quality rating across suppliers
- **Defect Rate**: Percentage of defective items received
- **Return Rate**: Percentage of items returned to suppliers
- **Supplier Certification**: Percentage of certified suppliers
- **Quality Incidents**: Number of quality-related issues

### Compliance Metrics
- **Approval Compliance**: Percentage of properly approved orders
- **Documentation Completeness**: Percentage of complete documentation
- **Supplier Compliance**: Percentage of compliant suppliers
- **Audit Findings**: Number of audit issues identified
- **Regulatory Adherence**: Compliance with local regulations

## Moroccan Compliance Features

### Tax Compliance
- **TVA (VAT) Tracking**: Proper VAT calculation and reporting
- **RAS (Retenue à la Source)**: Withholding tax management
- **Tax Rate Versioning**: Historical tax rate tracking

### Business Registration
- **ICE Validation**: Supplier ICE number verification
- **IF Number Tracking**: Fiscal identifier management
- **RC Verification**: Commercial register validation

### Regulatory Reporting
- **Government Reporting**: Compliance with Moroccan procurement regulations
- **Audit Trail**: Complete transaction history for regulatory audits
- **Documentation Standards**: Adherence to local documentation requirements

## Usage Examples

### 1. Generate Monthly Purchase Report
```typescript
// Generate comprehensive monthly report
const generateMonthlyReport = async () => {
  const response = await fetch('/api/v1/purchasing/analytics/analytics_overview/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: {
      start_date: '2024-10-01',
      end_date: '2024-10-31'
    }
  });
  
  const data = await response.json();
  return data;
};
```

### 2. Analyze Supplier Performance
```typescript
// Get detailed supplier performance metrics
const analyzeSupplierPerformance = async (supplierId: string) => {
  const response = await fetch('/api/v1/purchasing/analytics/supplier_performance/', {
    method: 'GET',
    params: {
      supplier_id: supplierId,
      start_date: '2024-01-01',
      end_date: '2024-12-31'
    }
  });
  
  const performance = await response.json();
  return performance;
};
```

### 3. Forecast Future Purchases
```typescript
// Generate 6-month purchase forecast
const forecastPurchases = async () => {
  const response = await fetch('/api/v1/purchasing/analytics/purchase_forecast/', {
    method: 'GET',
    params: {
      months_ahead: 6
    }
  });
  
  const forecast = await response.json();
  return forecast;
};
```

## Best Practices

### 1. Data Quality
- Ensure all purchase orders have complete information
- Maintain accurate supplier data and ratings
- Regular data validation and cleanup
- Consistent categorization of products and services

### 2. Performance Monitoring
- Set up automated alerts for key metrics
- Regular review of supplier performance
- Monitor compliance metrics continuously
- Track cost savings opportunities

### 3. Reporting Standards
- Standardize report formats and schedules
- Ensure data accuracy before report generation
- Maintain audit trails for all reports
- Regular backup of historical data

### 4. User Training
- Train users on analytics interpretation
- Provide guidance on report generation
- Establish clear escalation procedures
- Regular training updates on new features

## Security & Access Control

### Role-Based Access
- **Purchase Manager**: Full access to all analytics and reports
- **Purchase Officer**: Access to operational metrics and supplier data
- **Finance Manager**: Access to financial metrics and cost analysis
- **Auditor**: Read-only access to compliance reports and audit trails

### Data Protection
- Encrypted data transmission and storage
- Audit logging for all data access
- Regular security assessments
- Compliance with data protection regulations

## Integration Points

### ERP Modules
- **Inventory Management**: Stock level optimization
- **Financial Management**: Budget tracking and cost allocation
- **Supplier Management**: Supplier performance integration
- **Compliance Management**: Regulatory reporting integration

### External Systems
- **Bank Al-Maghrib**: Exchange rate integration
- **Government Portals**: Regulatory compliance reporting
- **Supplier Portals**: Performance data exchange
- **Audit Systems**: Compliance data sharing
