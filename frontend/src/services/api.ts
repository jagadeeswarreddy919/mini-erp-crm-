import axios from 'axios';
import {
  ApiResponse,
  User,
  Customer,
  Product,
  StockMovement,
  Challan,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// AUTH API
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};

// DASHBOARD API
export const dashboardApi = {
  getSummary: async () => {
    const res = await api.get<ApiResponse<{
      kpi: {
        totalCustomers: number;
        totalProducts: number;
        lowStockProductsCount: number;
        pendingChallansCount: number;
      };
      recentChallans: Challan[];
      lowStockProducts: Product[];
      upcomingFollowUps: Customer[];
    }>>('/dashboard/summary');
    return res.data;
  },
};

// CUSTOMERS API
export const customersApi = {
  list: async (params?: { search?: string; status?: string; customerType?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ customers: Customer[]; pagination: any }>>('/customers', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data;
  },
  create: async (data: Partial<Customer>) => {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Customer>) => {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/customers/${id}`);
    return res.data;
  },
  addFollowUp: async (id: string, note: string, followUpDate?: string) => {
    const res = await api.post<ApiResponse<any>>(`/customers/${id}/follow-ups`, { note, followUpDate });
    return res.data;
  },
};

// PRODUCTS API
export const productsApi = {
  list: async (params?: { search?: string; category?: string; stockStatus?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ products: Product[]; pagination: any }>>('/products', { params });
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get<ApiResponse<string[]>>('/products/categories');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },
  create: async (data: Partial<Product>) => {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Product>) => {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/products/${id}`);
    return res.data;
  },
};

// INVENTORY API
export const inventoryApi = {
  getSummary: async () => {
    const res = await api.get<ApiResponse<{ totalProducts: number; lowStockCount: number; outOfStockCount: number; totalCategories: number }>>('/inventory');
    return res.data;
  },
  listMovements: async (params?: { productId?: string; type?: string; search?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ movements: StockMovement[]; pagination: any }>>('/inventory/movements', { params });
    return res.data;
  },
  adjustStock: async (data: { productId: string; quantity: number; type: 'IN' | 'OUT'; reason: string }) => {
    const res = await api.post<ApiResponse<StockMovement>>('/inventory/adjust', data);
    return res.data;
  },
};

// CHALLANS API
export const challansApi = {
  list: async (params?: { search?: string; status?: string; customerId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ challans: Challan[]; pagination: any }>>('/challans', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Challan>>(`/challans/${id}`);
    return res.data;
  },
  create: async (data: { customerId: string; items: { productId: string; quantity: number; unitPrice?: number }[] }) => {
    const res = await api.post<ApiResponse<Challan>>('/challans', data);
    return res.data;
  },
  update: async (id: string, data: { customerId?: string; items?: { productId: string; quantity: number; unitPrice?: number }[] }) => {
    const res = await api.put<ApiResponse<Challan>>(`/challans/${id}`, data);
    return res.data;
  },
  confirm: async (id: string) => {
    const res = await api.post<ApiResponse<Challan>>(`/challans/${id}/confirm`);
    return res.data;
  },
  cancel: async (id: string) => {
    const res = await api.post<ApiResponse<Challan>>(`/challans/${id}/cancel`);
    return res.data;
  },
};

// TEAM MEMBERS API
export const teamMembersApi = {
  list: async (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ members: User[]; pagination: any }>>('/team-members', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<User>>(`/team-members/${id}`);
    return res.data;
  },
  create: async (data: { name: string; email: string; role: string; password: string; status?: string }) => {
    const res = await api.post<ApiResponse<User>>('/team-members', data);
    return res.data;
  },
  update: async (id: string, data: { name?: string; email?: string; role?: string; status?: string }) => {
    const res = await api.put<ApiResponse<User>>(`/team-members/${id}`, data);
    return res.data;
  },
  toggleStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    const res = await api.patch<ApiResponse<User>>(`/team-members/${id}/status`, { status });
    return res.data;
  },
};
