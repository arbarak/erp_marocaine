import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { ToastProvider } from '@/components/Toast'
import { Dashboard } from '@/pages/Dashboard'
import { Catalog } from '@/pages/Catalog'
import { Invoicing } from '@/pages/Invoicing'
import { Inventory } from '@/pages/Inventory'
import { Sales } from '@/pages/Sales'
import { Purchasing } from '@/pages/Purchasing'
import { Accounting } from '@/pages/Accounting'
import { Companies } from '@/pages/Companies'
import { Users } from '@/pages/Users'
import { Settings } from '@/pages/Settings'
import { Reports } from '@/pages/Reports'
import { Costing } from '@/pages/Costing'
import { TaxEngine } from '@/pages/TaxEngine'
import { Analytics } from '@/pages/Analytics'
import { Profile } from '@/pages/Profile'

// Creation Pages
import { CreateProduct } from '@/pages/CreateProduct'
import { CreateCustomer } from '@/pages/CreateCustomer'
import { CreateSalesOrder } from '@/pages/CreateSalesOrder'
import { CreateQuotation } from '@/pages/CreateQuotation'
import { CreateSupplier } from '@/pages/CreateSupplier'
import { CreatePurchaseOrder } from '@/pages/CreatePurchaseOrder'
import { CreateInvoice } from '@/pages/CreateInvoice'
import { CreateWarehouse } from '@/pages/CreateWarehouse'
import { CreateAccount } from '@/pages/CreateAccount'
import { CreateStockMovement } from './pages/CreateStockMovement'
import { CreateJournalEntry } from './pages/CreateJournalEntry'
import { CreateCompany } from './pages/CreateCompany'
import { CreateUser } from './pages/CreateUser'
import { EditProduct } from './pages/EditProduct'
import { ProductDetail } from './pages/ProductDetail'
import { EditCustomer } from './pages/EditCustomer'
import { CustomerDetail } from './pages/CustomerDetail'
import { EditSupplier } from './pages/EditSupplier'
import { SupplierDetail } from './pages/SupplierDetail'
import { EditSalesOrder } from './pages/EditSalesOrder'
import { SalesOrderDetail } from './pages/SalesOrderDetail'
import { EditPurchaseOrder } from './pages/EditPurchaseOrder'
import { PurchaseOrderDetail } from './pages/PurchaseOrderDetail'
import { EditInvoice } from './pages/EditInvoice'
import { InvoiceDetail } from './pages/InvoiceDetail'
import { EditQuotation } from './pages/EditQuotation'
import { QuotationDetail } from './pages/QuotationDetail'
import { EditWarehouse } from './pages/EditWarehouse'
import { WarehouseDetail } from './pages/WarehouseDetail'
import { EditAccount } from './pages/EditAccount'
import { AccountDetail } from './pages/AccountDetail'
import { EditStockMovement } from './pages/EditStockMovement'
import { StockMovementDetail } from './pages/StockMovementDetail'
import { EditJournalEntry } from './pages/EditJournalEntry'
import { JournalEntryDetail } from './pages/JournalEntryDetail'
import { LandingPage } from '@/components/LandingPage'

function App() {
  return (
    <ToastProvider>
      <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Main Module Routes */}
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/invoicing" element={<Invoicing />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchasing" element={<Purchasing />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/costing" element={<Costing />} />
            <Route path="/tax-engine" element={<TaxEngine />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />

            {/* Creation Routes */}
            <Route path="/catalog/create" element={<CreateProduct />} />
            <Route path="/sales/customers/create" element={<CreateCustomer />} />
            <Route path="/sales/orders/create" element={<CreateSalesOrder />} />
            <Route path="/sales/quotations/create" element={<CreateQuotation />} />
            <Route path="/purchasing/suppliers/create" element={<CreateSupplier />} />
            <Route path="/purchasing/orders/create" element={<CreatePurchaseOrder />} />
            <Route path="/invoicing/create" element={<CreateInvoice />} />
            <Route path="/inventory/warehouses/create" element={<CreateWarehouse />} />
            <Route path="/accounting/accounts/create" element={<CreateAccount />} />
              <Route path="/inventory/movements/create" element={<CreateStockMovement />} />
              <Route path="/accounting/journal/create" element={<CreateJournalEntry />} />
              <Route path="/companies/create" element={<CreateCompany />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/catalog/edit/:id" element={<EditProduct />} />
              <Route path="/catalog/detail/:id" element={<ProductDetail />} />
              <Route path="/sales/customers/edit/:id" element={<EditCustomer />} />
              <Route path="/sales/customers/detail/:id" element={<CustomerDetail />} />
              <Route path="/purchases/suppliers/edit/:id" element={<EditSupplier />} />
              <Route path="/purchases/suppliers/detail/:id" element={<SupplierDetail />} />
              <Route path="/sales/orders/edit/:id" element={<EditSalesOrder />} />
              <Route path="/sales/orders/detail/:id" element={<SalesOrderDetail />} />
              <Route path="/purchases/orders/edit/:id" element={<EditPurchaseOrder />} />
              <Route path="/purchases/orders/detail/:id" element={<PurchaseOrderDetail />} />
              <Route path="/invoicing/edit/:id" element={<EditInvoice />} />
              <Route path="/invoicing/detail/:id" element={<InvoiceDetail />} />
              <Route path="/sales/quotations/edit/:id" element={<EditQuotation />} />
              <Route path="/sales/quotations/detail/:id" element={<QuotationDetail />} />
              <Route path="/inventory/warehouses/edit/:id" element={<EditWarehouse />} />
              <Route path="/inventory/warehouses/detail/:id" element={<WarehouseDetail />} />
              <Route path="/accounting/accounts/edit/:id" element={<EditAccount />} />
              <Route path="/accounting/accounts/detail/:id" element={<AccountDetail />} />
              <Route path="/inventory/movements/edit/:id" element={<EditStockMovement />} />
              <Route path="/inventory/movements/detail/:id" element={<StockMovementDetail />} />
              <Route path="/accounting/journal/edit/:id" element={<EditJournalEntry />} />
              <Route path="/accounting/journal/detail/:id" element={<JournalEntryDetail />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
    </ToastProvider>
  )
}

export default App
