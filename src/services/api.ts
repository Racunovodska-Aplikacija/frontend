import axios from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse, User, Company, CompanyFormData, Product, ProductFormData, Partner, PartnerFormData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/users/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
};

// Company API
export const companyAPI = {
  getAll: async (): Promise<Company[]> => {
    const response = await api.get<Company[]>('/companies');
    return response.data;
  },

  getById: async (id: string): Promise<Company> => {
    const response = await api.get<Company>(`/companies/${id}`);
    return response.data;
  },

  create: async (data: CompanyFormData): Promise<Company> => {
    const response = await api.post<Company>('/companies', data);
    return response.data;
  },

  update: async (id: string, data: CompanyFormData): Promise<Company> => {
    const response = await api.put<Company>(`/companies/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },
};

// Product API
export const productAPI = {
  getAllByCompany: async (companyId: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/companies/${companyId}/products`);
    return response.data;
  },

  getById: async (companyId: string, productId: string): Promise<Product> => {
    const response = await api.get<Product>(`/companies/${companyId}/products/${productId}`);
    return response.data;
  },

  create: async (companyId: string, data: ProductFormData): Promise<Product> => {
    const response = await api.post<Product>(`/companies/${companyId}/products`, data);
    return response.data;
  },

  update: async (companyId: string, productId: string, data: ProductFormData): Promise<Product> => {
    const response = await api.put<Product>(`/companies/${companyId}/products/${productId}`, data);
    return response.data;
  },

  delete: async (companyId: string, productId: string): Promise<void> => {
    await api.delete(`/companies/${companyId}/products/${productId}`);
  },
};

// Partner API
export const partnerAPI = {
  getAll: async (): Promise<Partner[]> => {
    const response = await api.get<Partner[]>('/partners');
    return response.data;
  },

  getById: async (id: string): Promise<Partner> => {
    const response = await api.get<Partner>(`/partners/${id}`);
    return response.data;
  },

  create: async (data: PartnerFormData): Promise<Partner> => {
    const response = await api.post<Partner>('/partners', data);
    return response.data;
  },

  update: async (id: string, data: PartnerFormData): Promise<Partner> => {
    const response = await api.put<Partner>(`/partners/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/partners/${id}`);
  },
};

// Invoice API
export const invoiceAPI = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/invoices');
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  create: async (data: {
    companyId: string;
    partnerId: string;
    invoiceNumber: string;
    issueDate: string;
    serviceDate: string;
    dueDate: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    notes?: string;
  }): Promise<any> => {
    // Transform frontend data to backend format
    const backendData = {
      company_id: data.companyId,
      partner_id: data.partnerId,
      invoice_number: data.invoiceNumber,
      issue_date: new Date(data.issueDate).toISOString(),
      service_date: new Date(data.serviceDate).toISOString(),
      due_date: new Date(data.dueDate).toISOString(),
      notes: data.notes,
      lines: data.items.map(item => ({
        product_id: item.productId,
        amount: item.quantity,
      })),
    };
    const response = await api.post('/invoices', backendData);
    return response.data;
  },

  update: async (id: string, data: {
    companyId?: string;
    partnerId?: string;
    issueDate?: string;
    serviceDate?: string;
    dueDate?: string;
    notes?: string;
    status?: 'ISSUED' | 'PAID' | 'CANCELLED';
    items?: Array<{
      productId: string;
      quantity: number;
    }>;
  }): Promise<any> => {
    // Transform frontend data to backend format
    const backendData: any = {};
    if (data.companyId) backendData.company_id = data.companyId;
    if (data.partnerId) backendData.partner_id = data.partnerId;
    if (data.issueDate) backendData.issue_date = new Date(data.issueDate).toISOString();
    if (data.serviceDate) backendData.service_date = new Date(data.serviceDate).toISOString();
    if (data.dueDate) backendData.due_date = new Date(data.dueDate).toISOString();
    if (data.notes !== undefined) backendData.notes = data.notes;
    if (data.status) backendData.status = data.status;
    if (data.items) {
      backendData.lines = data.items.map(item => ({
        product_id: item.productId,
        amount: item.quantity,
      }));
    }
    const response = await api.put(`/invoices/${id}`, backendData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },
};;

export default api;
