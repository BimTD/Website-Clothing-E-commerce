import api from './api';
import { Size, SizeFormData, SizeFilters, PaginatedResponse } from '@/types/size';

export const sizeAPI = {
  getAll: async (filters: SizeFilters = {}): Promise<{
    data: Size[];
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
    
    const response = await api.get(`/admin/sizes?${params}`);
    const responseData: PaginatedResponse<Size> = response.data;
    
    return {
      data: responseData.content || [],
      totalPages: responseData.totalPages || 0,
      totalElements: responseData.totalElements || 0
    };
  },

  create: async (size: Omit<Size, 'id'>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post('/admin/sizes', size);
      return {
        success: true,
        message: 'Thêm size thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi thêm size'
      };
    }
  },

  update: async (id: number, size: Partial<Size>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put(`/admin/sizes/${id}`, size);
      return {
        success: true,
        message: 'Cập nhật size thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật size'
      };
    }
  },

  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/admin/sizes/${id}`);
      return {
        success: true,
        message: 'Xóa size thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa size'
      };
    }
  },

  getFormData: async (): Promise<SizeFormData> => {
    const response = await api.get('/admin/sizes/form-data');
    return response.data;
  }
};
