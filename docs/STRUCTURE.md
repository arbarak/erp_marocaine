# STRUCTURE.md — Advanced Stock & Invoicing for Moroccan Companies (No POS)
# Stack: Django 5 + DRF · PostgreSQL 16 · Redis (Celery) · MinIO (S3) · React 19 + TS + Vite + Tailwind + shadcn/ui · i18next (FR-only) · WeasyPrint (PDF)

erp/
├─ README.md
├─ .editorconfig
├─ .gitattributes
├─ .gitignore
├─ .pre-commit-config.yaml
├─ .env.example                        # copy -> .env (dev)
├─ Makefile                            # common dev commands
├─ docker-compose.yml                  # dev runtime (DB/Redis/MinIO/API/WEB/Mailhog)
├─ ops/
│  ├─ docker/
│  │  ├─ backend.Dockerfile
│  │  ├─ frontend.Dockerfile
│  │  └─ wait-for.sh                  # tiny helper for container deps
│  ├─ k8s/                            # (optional) Helm charts / manifests for prod
│  │  ├─ values.yaml
│  │  └─ templates/
│  ├─ scripts/
│  │  ├─ seed_demo.sh
│  │  └─ backup_pg.sh
│  └─ ci/
│     ├─ backend.yml                  # GitHub Actions: lint/test/build
│     └─ frontend.yml
├─ docs/
│  ├─ STRUCTURE.md                    # (this file)
│  ├─ TASKS.md                        # roadmap (from Tasks.md)
│  ├─ api/
│  │  ├─ openapi.json                 # exported by drf-spectacular
│  │  └─ postman_collection.json
│  └─ runbooks/
│     ├─ backups.md
│     ├─ tenant_isolation.md
│     └─ releasing.md
├─ seeds/
│  ├─ morocco_tax_rates.json          # TVA 20/14/10/7 with validity dates
│  └─ chart_of_accounts_morocco.json  # baseline plan comptable
├─ backend/
│  ├─ manage.py
│  ├─ pyproject.toml                  # poetry/pip-tools optional
│  ├─ requirements.txt                # pin deps (Django, DRF, Celery, etc.)
│  ├─ config/
│  │  ├─ __init__.py
│  │  ├─ asgi.py
│  │  ├─ wsgi.py
│  │  ├─ urls.py
│  │  ├─ settings/
│  │  │  ├─ __init__.py
│  │  │  ├─ base.py                   # security, installed apps, middleware
│  │  │  ├─ dev.py
│  │  │  └─ prod.py
│  │  └─ tenancy.py                   # RLS/django-tenants toggle helpers
│  ├─ common/                         # cross-cutting utilities
│  │  ├─ __init__.py
│  │  ├─ typing.py
│  │  ├─ pagination.py
│  │  ├─ filters.py
│  │  └─ middleware/
│  │     ├─ request_id.py
│  │     └─ company_context.py        # resolves current company from JWT/header
│  ├─ core/
│  │  ├─ accounts/
│  │  │  ├─ __init__.py
│  │  │  ├─ apps.py
│  │  │  ├─ models.py                 # User, Role/Group (extend AbstractUser)
│  │  │  ├─ serializers.py
│  │  │  ├─ views.py                  # login/refresh, me, permissions
│  │  │  ├─ urls.py
│  │  │  └─ tests/
│  │  ├─ companies/
│  │  │  ├─ __init__.py
│  │  │  ├─ apps.py
│  │  │  ├─ models.py                 # Company(ICE, IF, RC, …), Logo file
│  │  │  ├─ admin.py
│  │  │  ├─ serializers.py
│  │  │  ├─ views.py                  # CRUD company, numbering config
│  │  │  ├─ urls.py
│  │  │  └─ tests/
│  │  ├─ sequences/
│  │  │  ├─ __init__.py
│  │  │  ├─ models.py                 # DocumentSequence per company+year
│  │  │  ├─ services.py               # next_number(doc_type, date)
│  │  │  └─ tests/
│  │  ├─ audit/
│  │  │  ├─ __init__.py
│  │  │  ├─ apps.py
│  │  │  ├─ signals.py                # django-simple-history hooks
│  │  │  └─ loggers.py
│  │  └─ settings_app/
│  │     ├─ __init__.py
│  │     ├─ models.py                 # app config per company (rounding, inclusive/exclusive taxes)
│  │     └─ admin.py
│  ├─ libs/
│  │  ├─ __init__.py
│  │  ├─ tax_engine/
│  │  │  ├─ __init__.py
│  │  │  ├─ models.py                 # Tax, TaxRate, TaxRateVersion(withheld_flag)
│  │  │  ├─ calculator.py             # compute line/doc totals (TVA, RAS/TVA)
│  │  │  ├─ rounding.py
│  │  │  └─ tests/
│  │  ├─ costing/
│  │  │  ├─ __init__.py
│  │  │  ├─ fifo.py
│  │  │  ├─ lifo.py
│  │  │  ├─ wac.py
│  │  │  ├─ engine.py                 # facade selecting method
│  │  │  └─ tests/
│  │  ├─ fx_rates/
│  │  │  ├─ __init__.py
│  │  │  ├─ client.py                 # Bank Al-Maghrib pull
│  │  │  ├─ models.py                 # FxRate(date, pair, rate, source)
│  │  │  └─ tasks.py                  # Celery scheduled fetch
│  │  └─ pdf/
│  │     ├─ __init__.py
│  │     ├─ render.py                 # WeasyPrint wrapper
│  │     └─ utils.py
│  ├─ modules/
│  │  ├─ catalog/
│  │  │  ├─ __init__.py
│  │  │  ├─ apps.py
│  │  │  ├─ models.py                 # Product(ITEM/SERVICE), UoM, attributes
│  │  │  ├─ admin.py
│  │  │  ├─ serializers.py
│  │  │  ├─ views.py                  # CRUD, import
│  │  │  ├─ urls.py
│  │  │  ├─ importers/
│  │  │  │  └─ products_xlsx.py
│  │  │  └─ tests/
│  │  ├─ inventory/
│  │  │  ├─ __init__.py
│  │  │  ├─ apps.py
│  │  │  ├─ models.py                 # Warehouse, Location, StockMove, Snapshot
│  │  │  ├─ services.py               # create_move(), transfer(), adjust()
│  │  │  ├─ signals.py                # emit events on move create
│  │  │  ├─ serializers.py
│  │  │  ├─ views.py                  # stock levels, valuation, transfer, adjust
│  │  │  ├─ urls.py
│  │  │  └─ tests/
│  │  ├─ purchasing/
│  │  │  ├─ __init__.py
│  │  │  ├─ models.py                 # Supplier, RFQ, PO, GRN, SupplierBill
│  │  │  ├─ services.py               # flows: rfq->po->grn
│  │  │  ├─ serializers.py
│  │  │  ├─ views.py                  # endpoints
│  │  │  ├─ urls.py
│  │  │  └─ tests/
│  │  ├─ sales/
│  │  │  ├─ __init__.py
│  │  │  ├─ models.py                 # Customer, Quote, SalesOrder, Delivery, Return
│  │  │  ├─ services.py
│  │  │  ├─ serializers.py
│  │  │  ├─ views.py
│  │  │  ├─ urls.py
│  │  │  └─ tests/
│  │  ├─ invoicing/
│  │  │  ├─ __init__.py
│  │  │  ├─ models.py                 # Invoice, InvoiceLine, CreditNote
│  │  │  ├─ services.py               # approve(), pdf(), send_email()
│  │  │  ├─ serializers.py
│  │  │  ├─ views.py                  # list/create/approve/pdf/send/pay
│  │  │  ├─ urls.py
│  │  │  ├─ templates/
│  │  │  │  └─ pdf/
│  │  │  │     ├─ invoice_fr.html    # WeasyPrint HTML (FR now; RTL-ready)
│  │  │  │     └─ credit_note_fr.html
│  │  │  └─ tests/
│  │  ├─ accounting/
│  │  │  ├─ __init__.py
│  │  │  ├─ models.py                 # Journal, Account, LedgerEntry
│  │  │  ├─ posting.py                # rules: AR/AP/Inventory + RAS/TVA splits
│  │  │  ├─ serializers.py
│  │  │  ├─ views.py                  # read-only ledger/journals
│  │  │  ├─ urls.py
│  │  │  └─ tests/
│  │  └─ reporting/
│  │     ├─ __init__.py
│  │     ├─ queries.py                # optimized report SQL/materialized views
│  │     ├─ views.py                  # /reports/tva, /reports/aged-ar, /stock-valuation
│  │     ├─ serializers.py
│  │     ├─ urls.py
│  │     └─ tests/
│  ├─ api/
│  │  ├─ __init__.py
│  │  ├─ urls.py                      # include all module urls under /api/v1
│  │  └─ schema.py                    # drf-spectacular settings
│  └─ tests/
│     ├─ conftest.py                  # pytest fixtures (company, user, products)
│     └─ e2e/
│        └─ sample_flows_test.py
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  ├─ postcss.config.js
│  ├─ tailwind.config.ts
│  ├─ src/
│  │  ├─ main.tsx                     # React root; import i18n
│  │  ├─ App.tsx
│  │  ├─ app/
│  │  │  ├─ routes.tsx                # TanStack Router (or React Router)
│  │  │  ├─ layout/
│  │  │  │  ├─ Shell.tsx              # sidebar/topbar
│  │  │  │  └─ ProtectedRoute.tsx
│  │  │  └─ providers/
│  │  │     ├─ QueryProvider.tsx
│  │  │     └─ ToasterProvider.tsx
│  │  ├─ shared/
│  │  │  ├─ api/
│  │  │  │  ├─ client.ts              # axios base (JWT, interceptors)
│  │  │  │  └─ endpoints.ts           # typed endpoints
│  │  │  ├─ ui/                       # shadcn/ui wrappers
│  │  │  ├─ hooks/
│  │  │  │  └─ useAuth.ts
│  │  │  ├─ lib/
│  │  │  │  ├─ format.ts              # money/date helpers using Intl
│  │  │  │  └─ guard.ts               # role/perm checks
│  │  │  └─ schemas/                  # zod schemas shared with forms
│  │  ├─ i18n/
│  │  │  ├─ index.ts                  # i18next init (FR-only; ICU enabled)
│  │  │  └─ locales/
│  │  │     └─ fr/
│  │  │        ├─ common.json
│  │  │        ├─ invoicing.json
│  │  │        ├─ inventory.json
│  │  │        ├─ purchasing.json
│  │  │        ├─ sales.json
│  │  │        ├─ accounting.json
│  │  │        └─ reports.json
│  │  ├─ features/
│  │  │  ├─ companies/
│  │  │  │  ├─ CompanyForm.tsx
│  │  │  │  └─ NumberingSettings.tsx
│  │  │  ├─ catalog/
│  │  │  │  ├─ ProductList.tsx
│  │  │  │  ├─ ProductForm.tsx
│  │  │  │  └─ ImportProducts.tsx
│  │  │  ├─ inventory/
│  │  │  │  ├─ StockLevels.tsx
│  │  │  │  ├─ TransferForm.tsx
│  │  │  │  └─ AdjustmentForm.tsx
│  │  │  ├─ purchasing/
│  │  │  │  ├─ RfqList.tsx
│  │  │  │  ├─ PoList.tsx
│  │  │  │  ├─ GrnList.tsx
│  │  │  │  └─ SupplierBillDraft.tsx
│  │  │  ├─ sales/
│  │  │  │  ├─ QuoteList.tsx
│  │  │  │  ├─ SoList.tsx
│  │  │  │  ├─ DeliveryList.tsx
│  │  │  │  └─ ReturnList.tsx
│  │  │  ├─ invoicing/
│  │  │  │  ├─ InvoiceList.tsx
│  │  │  │  ├─ InvoiceForm.tsx
│  │  │  │  ├─ ApproveInvoice.tsx
│  │  │  │  └─ CreditNoteForm.tsx
│  │  │  └─ reporting/
│  │  │     ├─ TvaReport.tsx
│  │  │     ├─ AgedArAp.tsx
│  │  │     └─ StockValuation.tsx
│  │  └─ styles/
│  │     └─ globals.css
│  └─ public/
│     └─ logo.svg
└─ tests/                               # top-level integration/load tests (optional)
   └─ load/
      └─ gen_synthetic_data.py

