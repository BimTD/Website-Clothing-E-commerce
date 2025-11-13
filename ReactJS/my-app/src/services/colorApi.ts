import api from './api';
import { Color, ColorFormData, ColorFilters, PaginatedResponse } from '@/types/color';

export const colorAPI = {
  getAll: async (filters: ColorFilters = {}): Promise<{
    data: Color[];
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
    
    const response = await api.get(`/admin/colors?${params}`);
    const responseData: PaginatedResponse<Color> = response.data;
    
    return {
      data: responseData.content || [],
      totalPages: responseData.totalPages || 0,
      totalElements: responseData.totalElements || 0
    };
  },

  create: async (color: Omit<Color, 'id'>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post('/admin/colors', color);
      return {
        success: true,
        message: 'Thêm màu sắc thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi thêm màu sắc'
      };
    }
  },

  update: async (id: number, color: Partial<Color>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put(`/admin/colors/${id}`, color);
      return {
        success: true,
        message: 'Cập nhật màu sắc thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật màu sắc'
      };
    }
  },

  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/admin/colors/${id}`);
      return {
        success: true,
        message: 'Xóa màu sắc thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa màu sắc'
      };
    }
  },

  getFormData: async (): Promise<ColorFormData> => {
    const response = await api.get('/admin/colors/form-data');
    return response.data;
  }
};
