import api from './api';
import { Invoice, InvoiceFilters, InvoiceStatusUpdate, PaginatedResponse } from '@/types/invoice';

export const invoiceAPI = {
  getAll: async (filters: InvoiceFilters = {}): Promise<{
    data: Invoice[];
    totalPages: number;
    totalElements: number;
  }> => {
    const params = new URLSearchParams({
      page: (filters.page || 0).toString(),
      size: (filters.size || 10).toString(),
    });
    
    if (filters.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }
    
    if (filters.status && filters.status.trim()) {
      params.append('status', filters.status.trim());
    }
    
    const response = await api.get(`/admin/invoices?${params}`);
    const responseData: PaginatedResponse<Invoice> = response.data;
    
    return {
      data: responseData.content || [],
      totalPages: responseData.totalPages || 0,
      totalElements: responseData.totalElements || 0
    };
  },

  getById: async (id: number): Promise<{ success: boolean; data?: Invoice; message?: string }> => {
    try {
      const response = await api.get(`/admin/invoices/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy chi tiết hóa đơn'
      };
    }
  },

  approve: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(`/admin/invoices/${id}/approve`);
      return {
        success: true,
        message: 'Duyệt hóa đơn thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi duyệt hóa đơn'
      };
    }
  },

  cancel: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(`/admin/invoices/${id}/cancel`);
      return {
        success: true,
        message: 'Hủy hóa đơn thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi hủy hóa đơn'
      };
    }
  },

  updateStatus: async (id: number, newStatus: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(`/admin/invoices/${id}/update-status`, null, {
        params: { newStatus }
      });
      return {
        success: true,
        message: 'Cập nhật trạng thái hóa đơn thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật trạng thái hóa đơn'
      };
    }
  }
};
