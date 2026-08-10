# ApexERP — Mini ERP + CRM Operations Portal

A production-quality **Wholesale & Distribution ERP + CRM Operations Portal** built with Node.js, Express, TypeScript, PostgreSQL (Prisma ORM), REST APIs, JWT authentication, Zod validation, and React.

Designed specifically as a **real internal business operations application** with a clean, structured, restrained neutral ERP aesthetic.

---

## 🏗️ System Architecture

```text
  ┌────────────────────────────────────────────────────────┐
  │                 React + TypeScript UI                  │
  │     (Restrained Neutral ERP Layout, TanStack Query)     │
  └───────────────────────────┬────────────────────────────┘
                              │ REST APIs (Axios / JWT)
  ┌───────────────────────────▼────────────────────────────┐
  │                 Node.js + Express Server               │
  │ (JWT Auth, Role-Based Access Control, Zod Validation)  │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │               Prisma ORM Data Abstraction              │
  │     (Atomic Transactions for Critical Stock Logic)     │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │           PostgreSQL / SQLite Database Engine          │
  └────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Features & Operations

1. **Role-Based Authentication (RBAC)**:
   - **Admin**: Full access across all modules, CRUD, stock movements, and user management.
   - **Sales**: Customer CRM, follow-up timelines, and sales challan creation/management.
   - **Warehouse**: Product catalog maintenance, reorder alerts, and stock movements log.
   - **Accounts**: Sales challan review, confirmations, and financial totals.

2. **Customer CRM Module**:
   - Customer directory with search, pagination, and filtering by status (`ACTIVE`, `LEAD`, `INACTIVE`) and customer type (`WHOLESALE`, `DISTRIBUTOR`, `RETAIL`).
   - Detailed customer view with GSTIN, contact info, and an interactive **CRM Follow-Up Notes Timeline**.

3. **Product & Inventory Catalog**:
   - Product list with SKU tracking, unit price, stock count, and warehouse location bin.
   - Subtle status indicators (`In Stock`, `Low Stock`, `Out of Stock`).
   - Complete **Stock Movement Log** tracking incoming restocks (`IN`) and outgoing issues (`OUT`) with logged user, reason, and timestamp.

4. **Sales Challan Workflow & Critical Stock Business Logic**:
   - Interactive Challan Builder: Customer selection, product lookup with live available stock badge, and automated line total / grand total calculation.
   - Historical line item snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) preserving accuracy if product prices or names change in future.
   - **Atomic Stock Deduction Transaction**:
     - Confirming a challan executes a database transaction (`prisma.$transaction`).
     - Verifies stock for all items; if requested quantity > current stock, rolls back and returns a clean `409 Conflict` error detailing missing stock.
     - Automatically deducts stock and records `StockMovement` (type `OUT`) upon confirmation.
   - **Challan Cancellation**: Restores product stock and records `StockMovement` (type `IN`) if a confirmed challan is cancelled.

5. **Operational Dashboard**:
   - KPI metrics cards: Total Customers, Total Products, Low Stock Count, Pending Draft Challans.
   - Tables for Recent Challans, Low Stock Alert Items, and Upcoming Customer Follow-ups.

---

## 🔑 Demo Test Credentials

The database seed populates 4 demo accounts for instant testing:

| Role | Email | Password | Allowed Operations |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` | Unrestricted Access |
| **Sales** | `sales@example.com` | `sales123` | Customers CRM, Follow-ups, Create/Edit Draft Challans |
| **Warehouse** | `warehouse@example.com` | `warehouse123` | Products Catalog, Stock Adjustments, Inventory Log |
| **Accounts** | `accounts@example.com` | `accounts123` | Sales Challans Review & Confirmations |

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript, PostgreSQL (via Prisma ORM), JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Request Validation (`zod`), CORS.
- **Frontend**: React 18, TypeScript, Vite, React Router v6, Axios, Lucide Icons, Custom Restrained ERP CSS Design System.
- **Database**: PostgreSQL (Prisma ORM) / SQLite zero-setup dev fallback mode (`file:./dev.db`).

---

## 🚀 Quick Local Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Backend Setup
```bash
cd backend
npm install

# Push database schema & populate seed data
npx prisma db push
npm run prisma:seed

# Start backend dev server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Start Vite frontend dev server (runs on http://localhost:5173)
npm run dev
```

---

## 📚 API Endpoints Overview

### Authentication
- `POST /api/auth/login` — Authenticate & receive JWT token
- `GET /api/auth/me` — Fetch current user profile

### Dashboard
- `GET /api/dashboard/summary` — Fetch operational metrics and recent activity

### Customers CRM
- `GET /api/customers` — List & search customers (supports `status`, `customerType`, `search`, `page`, `limit`)
- `POST /api/customers` — Create customer
- `GET /api/customers/:id` — Get customer details & history
- `PUT /api/customers/:id` — Update customer
- `DELETE /api/customers/:id` — Delete customer (Admin only)
- `POST /api/customers/:id/follow-ups` — Add CRM follow-up note

### Products & Inventory
- `GET /api/products` — List products catalog
- `POST /api/products` — Add new product item
- `PUT /api/products/:id` — Update product details
- `DELETE /api/products/:id` — Delete product item
- `GET /api/inventory` — Stock summary
- `GET /api/inventory/movements` — Audit log of stock IN/OUT movements
- `POST /api/inventory/adjust` — Manual stock adjustment

### Sales Challans
- `GET /api/challans` — List sales challans
- `POST /api/challans` — Create new sales challan (Status: DRAFT)
- `GET /api/challans/:id` — View challan details with snapshot items
- `PUT /api/challans/:id` — Edit DRAFT challan
- `POST /api/challans/:id/confirm` — **Confirm challan & execute atomic stock deduction**
- `POST /api/challans/:id/cancel` — Cancel challan (restores stock if previously confirmed)

---

## 📦 Deployment Instructions

### Frontend (Vercel / Netlify)
1. Set build directory to `frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable: `VITE_API_BASE_URL=https://your-backend.render.com/api`

### Backend (Render / Railway / Fly.io)
1. Root directory: `backend`
2. Build command: `npm install && npx prisma db push`
3. Start command: `npm run start`
4. Set Environment Variables:
   - `DATABASE_URL` (PostgreSQL connection string from Supabase/Neon/Render PostgreSQL)
   - `JWT_SECRET`
   - `PORT=5000`

---

## 📌 Assumptions & Business Rules
1. **Product Snapshots**: Historical challans display product name, SKU, and unit price as recorded at the moment of challan creation/edit, ensuring invoice integrity even if catalog pricing changes later.
2. **Negative Stock Prevention**: Stock deduction occurs exclusively during challan confirmation within a strict Prisma transaction. If stock is inadequate for any single item, no partial deduction occurs.
