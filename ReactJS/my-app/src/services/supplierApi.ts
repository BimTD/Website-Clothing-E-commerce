import api from './api';
import { Supplier, PaginatedResponse } from '@/types/supplier';

export const supplierAPI = {
  getAll: async (filters: { page?: number; size?: number; search?: string } = {}): Promise<{
    data: Supplier[];
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
    
    const response = await api.get(`/admin/suppliers?${params}`);
    const responseData: PaginatedResponse<Supplier> = response.data;
    
    return {
      data: responseData.content || [],
      totalPages: responseData.totalPages || 0,
      totalElements: responseData.totalElements || 0
    };
  },

  create: async (supplier: Omit<Supplier, 'id'>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post('/admin/suppliers', supplier);
      return {
        success: true,
        message: 'Thêm nhà cung cấp thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi thêm nhà cung cấp'
      };
    }
  },

  update: async (id: number, supplier: Partial<Supplier>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put(`/admin/suppliers/${id}`, supplier);
      return {
        success: true,
        message: 'Cập nhật nhà cung cấp thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật nhà cung cấp'
      };
    }
  },

  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/admin/suppliers/${id}`);
      return {
        success: true,
        message: 'Xóa nhà cung cấp thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa nhà cung cấp'
      };
    }
  },
};

