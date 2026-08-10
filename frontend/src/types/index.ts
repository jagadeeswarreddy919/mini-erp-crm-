export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  note: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    role: UserRole;
  };
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  followUps?: CustomerFollowUp[];
  challans?: {
    id: string;
    challanNumber: string;
    totalQuantity: number;
    totalAmount: number;
    status: ChallanStatus;
    createdAt: string;
  }[];
  _count?: {
    followUps: number;
    challans: number;
  };
}

export type StockStatus = 'NORMAL' | 'LOW' | 'OUT';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  warehouseLocation: string;
  stockStatus?: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category?: string;
    currentStock: number;
    warehouseLocation?: string;
  };
  quantity: number;
  type: MovementType;
  reason: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    role: UserRole;
  };
  createdAt: string;
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
  product?: {
    id: string;
    currentStock: number;
    minStockAlert: number;
    warehouseLocation: string;
  };
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer: Customer;
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    role: UserRole;
    email?: string;
  };
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: ChallanItem[];
  _count?: {
    items: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

export interface PaginatedData<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
