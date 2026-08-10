# ApexERP — Mini ERP + CRM Operations Portal

> **Live App**: [mini-erp-crm-black.vercel.app](https://mini-erp-crm-black.vercel.app)  
> **API Base**: [mini-erp-crm-ekog.onrender.com/api](https://mini-erp-crm-ekog.onrender.com/api)  
> **GitHub**: [github.com/jagadeeswarreddy919/mini-erp-crm-](https://github.com/jagadeeswarreddy919/mini-erp-crm-)

A production-quality **Wholesale & Distribution ERP + CRM Operations Portal** built with Node.js, Express, TypeScript, Supabase (PostgreSQL + Prisma ORM), REST APIs, JWT authentication, Zod validation, and React.

---

## 📋 Table of Contents

- [Live Deployment](#-live-deployment)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Demo Credentials](#-demo-credentials)
- [API Reference](#-api-reference)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Deployment Guide](#-deployment-guide)

---

## 🌐 Live Deployment

| Service | URL | Platform |
|---|---|---|
| **Frontend** | https://mini-erp-crm-black.vercel.app | Vercel |
| **Backend API** | https://mini-erp-crm-ekog.onrender.com | Render (Free) |
| **Database** | Supabase PostgreSQL (Singapore) | Supabase |

> ⚠️ **Note**: The Render free tier spins down after 15 min of inactivity. The first request may take 30–50s (cold start). Subsequent requests are fast.

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| TypeScript | Type safety |
| Prisma ORM | Database abstraction & migrations |
| Supabase (PostgreSQL) | Production database |
| JSON Web Tokens (`jsonwebtoken`) | Stateless authentication |
| bcryptjs | Password hashing |
| Zod | Request validation schemas |
| CORS | Cross-origin resource sharing |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| TanStack Query v5 | Server state management & caching |
| Axios | HTTP client |
| Lucide React | Icon library |
| Custom CSS Design System | Restrained ERP aesthetic |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Vercel CDN (Global Edge Network)               │
│         React + TypeScript SPA (Vite Build)                 │
│          https://mini-erp-crm-black.vercel.app              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS REST API (Axios + JWT Bearer)
┌────────────────────────▼────────────────────────────────────┐
│              Render Web Service (Free Tier)                 │
│         Node.js + Express + TypeScript Backend              │
│       JWT Auth · Role-Based Access · Zod Validation         │
│         https://mini-erp-crm-ekog.onrender.com              │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma ORM (Session Pooler, IPv4)
┌────────────────────────▼────────────────────────────────────┐
│              Supabase (ap-southeast-1)                      │
│          PostgreSQL — 7 Tables, Atomic Transactions         │
│     aws-0-ap-southeast-1.pooler.supabase.com:5432           │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Features

### 1. Role-Based Authentication (JWT + RBAC)
- **Admin**: Full unrestricted access across all modules
- **Sales**: Customers CRM, follow-ups, create/edit draft challans
- **Warehouse**: Product catalog, stock adjustments, inventory log
- **Accounts**: Sales challan review & confirmations

### 2. Customer CRM Module
- Customer directory with search, pagination, and filtering
- Filter by status (`ACTIVE`, `LEAD`, `INACTIVE`) and type (`WHOLESALE`, `DISTRIBUTOR`, `RETAIL`)
- Interactive **CRM Follow-Up Notes Timeline** per customer
- GSTIN tracking, contact info, business details

### 3. Product & Inventory Catalog
- Product list with SKU tracking, unit price, stock count, warehouse location
- Real-time stock status badges: `In Stock`, `Low Stock`, `Out of Stock`
- **Stock Movement Log** — full audit trail of all IN/OUT movements with user & reason

### 4. Sales Challan Workflow (Core Business Logic)
- Interactive **Challan Builder** with customer selection and product lookup
- Live available stock badge per product during challan creation
- Automated line total & grand total calculation
- **Historical snapshots** (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) for invoice integrity
- **Atomic Stock Deduction Transaction** on confirmation:
  - Verifies stock for ALL items before deducting anything
  - Rolls back entire transaction if any item has insufficient stock
  - Records `StockMovement OUT` for every line item
- **Challan Cancellation**: Restores stock and records `StockMovement IN` atomically

### 5. Operational Dashboard
- KPI cards: Total Customers, Total Products, Low Stock Count, Pending Challans
- Recent Challans table, Low Stock Alert grid, Upcoming Follow-ups list

### 6. Team Members Management (Admin only)
- Create, edit, activate/deactivate team members
- Role assignment with last-admin protection guard

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@example.com` | `admin123` | Unrestricted |
| **Sales** | `sales@example.com` | `sales123` | Customers, Challans |
| **Warehouse** | `warehouse@example.com` | `warehouse123` | Products, Inventory |
| **Accounts** | `accounts@example.com` | `accounts123` | Challan Review |

---

## 📚 API Reference

### Base URL
```
Production: https://mini-erp-crm-ekog.onrender.com/api
Local:      http://localhost:5000/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### Auth Endpoints

#### `POST /auth/login`
Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "name": "Eleanor Vance (Admin)",
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  }
}
```

#### `GET /auth/me`
Get current authenticated user profile.  
**Auth required** ✅

---

### Dashboard

#### `GET /dashboard/summary`
Returns KPI metrics and recent activity.  
**Auth required** ✅

**Response:**
```json
{
  "success": true,
  "data": {
    "kpi": {
      "totalCustomers": 4,
      "totalProducts": 5,
      "lowStockProductsCount": 3,
      "pendingChallansCount": 1
    },
    "recentChallans": [...],
    "lowStockProducts": [...],
    "upcomingFollowUps": [...]
  }
}
```

---

### Customers

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/customers` | List & search customers | All |
| `POST` | `/customers` | Create customer | Admin, Sales |
| `GET` | `/customers/:id` | Get customer details + follow-ups + challans | All |
| `PUT` | `/customers/:id` | Update customer | Admin, Sales |
| `DELETE` | `/customers/:id` | Delete customer | Admin only |
| `POST` | `/customers/:id/follow-ups` | Add CRM follow-up note | Admin, Sales |

**Query Params for `GET /customers`:**
```
search        string   Search by name, business, mobile, email, GST
status        string   LEAD | ACTIVE | INACTIVE
customerType  string   RETAIL | WHOLESALE | DISTRIBUTOR
page          number   Page number (default: 1)
limit         number   Results per page (default: 10)
```

---

### Products

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/products` | List products catalog | All |
| `GET` | `/products/categories` | Get all unique categories | All |
| `GET` | `/products/:id` | Get product details + stock movements | All |
| `POST` | `/products` | Create product | Admin, Warehouse |
| `PUT` | `/products/:id` | Update product | Admin, Warehouse |
| `DELETE` | `/products/:id` | Delete product | Admin only |

---

### Inventory

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/inventory` | Stock summary (totals, counts) | All |
| `GET` | `/inventory/movements` | Paginated stock movement audit log | All |
| `POST` | `/inventory/adjust` | Manual stock IN/OUT adjustment | Admin, Warehouse |

**`POST /inventory/adjust` Body:**
```json
{
  "productId": "uuid",
  "quantity": 50,
  "type": "IN",
  "reason": "Monthly restock from supplier"
}
```

---

### Sales Challans

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/challans` | List challans with filters | All |
| `POST` | `/challans` | Create new DRAFT challan | Admin, Sales |
| `GET` | `/challans/:id` | Get challan details with snapshot items | All |
| `PUT` | `/challans/:id` | Edit DRAFT challan only | Admin, Sales |
| `POST` | `/challans/:id/confirm` | **Confirm & atomically deduct stock** | Admin, Accounts |
| `POST` | `/challans/:id/cancel` | Cancel (restores stock if confirmed) | Admin, Accounts |

**`POST /challans` Body:**
```json
{
  "customerId": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 10 },
    { "productId": "uuid", "quantity": 5, "unitPrice": 99.99 }
  ]
}
```

---

### Team Members (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/team-members` | List team members |
| `GET` | `/team-members/:id` | Get member details |
| `POST` | `/team-members` | Create new member |
| `PUT` | `/team-members/:id` | Update member |
| `PATCH` | `/team-members/:id/status` | Toggle ACTIVE/INACTIVE |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js v18+
- npm v9+
- A Supabase project (or use the included `dev.db` SQLite fallback)

### 1. Clone & Install
```bash
git clone https://github.com/jagadeeswarreddy919/mini-erp-crm-.git
cd mini-erp-crm-

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Backend Environment
```bash
cd backend
cp .env.example .env
```
Edit `.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
JWT_SECRET="your_secret_key_here"
FRONTEND_URL="http://localhost:5173"
```

### 3. Initialize Database
```bash
cd backend
npx prisma db push      # Create tables in Supabase
npm run prisma:seed     # Seed demo data
```

### 4. Start Servers
```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Express server port (default: `5000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string (Session Pooler for Supabase) |
| `DIRECT_URL` | Yes | Direct DB URL for Prisma migrations (same as DATABASE_URL on Supabase Session Pooler) |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `FRONTEND_URL` | Yes | Allowed CORS origin (Vercel URL in production) |
| `NODE_ENV` | Recommended | `development` or `production` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Production only | Full backend API URL e.g. `https://your-backend.onrender.com/api`. Leave blank for local dev (uses Vite proxy). |

---

## 🗃️ Database Schema

```
User ──────────────────────────────────────────────────────────┐
│ id, name, email, passwordHash, role, status                  │
│ ROLES: ADMIN | SALES | WAREHOUSE | ACCOUNTS                  │
└──── createdFollowUps → CustomerFollowUp                      │
└──── createdMovements → StockMovement                         │
└──── createdChallans  → Challan ──────────────────────────────┘

Customer ──────────────────────────────────────────────────────┐
│ id, name, mobile, email, businessName, gstNumber             │
│ customerType (RETAIL|WHOLESALE|DISTRIBUTOR)                  │
│ status (LEAD|ACTIVE|INACTIVE), followUpDate, notes           │
└──── followUps → CustomerFollowUp                             │
└──── challans  → Challan ─────────────────────────────────────┘

Product ───────────────────────────────────────────────────────┐
│ id, name, sku (unique), category, unitPrice                  │
│ currentStock, minStockAlert, warehouseLocation               │
└──── stockMovements → StockMovement                           │
└──── challanItems   → ChallanItem ────────────────────────────┘

Challan ───────────────────────────────────────────────────────┐
│ id, challanNumber (unique), customerId, createdById          │
│ totalQuantity, totalAmount                                   │
│ status (DRAFT|CONFIRMED|CANCELLED)                           │
│ confirmedAt?, cancelledAt?                                   │
└──── items → ChallanItem                                      │
     │ productId, productNameSnapshot, skuSnapshot             │
     │ unitPriceSnapshot, quantity, lineTotal                  │

StockMovement                                                  │
│ id, productId, quantity, type (IN|OUT), reason               │
│ createdById                                                  │

CustomerFollowUp                                               │
│ id, customerId, note, createdById                            │
```

---

## 🚀 Deployment Guide

### Recommended Stack (All Free)
| Layer | Platform |
|---|---|
| Database | Supabase (PostgreSQL, 500MB free) |
| Backend | Render (750 hrs/month free) |
| Frontend | Vercel (Unlimited static, CDN) |

### Backend (Render)
1. New → Web Service → Connect GitHub repo
2. **Root Directory**: `backend`
3. **Build Command**: `npm install --include=dev && npx prisma generate && npm run build`
4. **Start Command**: `npm run start`
5. Set environment variables (see above)

### Frontend (Vercel)
1. New Project → Import GitHub repo
2. **Root Directory**: `frontend`
3. **Framework Preset**: Vite (auto-detected)
4. **Environment Variable**: `VITE_API_URL=https://your-render-url.onrender.com/api`

### Supabase Connection (IPv4 Note)
If your hosting provider or local machine uses IPv4 only, use the **Session Pooler** URL:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```
The direct connection (`db.[ref].supabase.co:5432`) requires IPv6 and may not resolve on IPv4 networks.

---

## 📌 Business Rules & Assumptions

1. **Product Snapshots**: Challans capture `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` at creation time, preserving invoice accuracy even if catalog prices change later.

2. **Atomic Stock Deduction**: Stock is only deducted during challan confirmation via a `prisma.$transaction()`. If any single item has insufficient stock, the entire operation is rolled back — no partial deductions ever occur.

3. **Stock Restoration on Cancellation**: Cancelling a `CONFIRMED` challan atomically restores all stock and logs `StockMovement IN` records for each line item.

4. **Admin Protection**: Cannot deactivate or change the role of the last remaining active admin user.

5. **Challan Numbering**: Auto-generated as `CH-{YEAR}-{SEQUENTIAL_NUM}` (e.g. `CH-2026-0003`).
