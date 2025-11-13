import api from './api';
import { Import, ImportFormData, ImportFilters, ImportRequest, PaginatedResponse } from '@/types/import';

export const importAPI = {
  getAll: async (filters: ImportFilters = {}): Promise<{
    data: Import[];
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
    
    const response = await api.get(`/admin/imports?${params}`);
    const responseData: PaginatedResponse<Import> = response.data;
    
    return {
      data: responseData.content || [],
      totalPages: responseData.totalPages || 0,
      totalElements: responseData.totalElements || 0
    };
  },

  create: async (importRequest: ImportRequest): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post('/admin/imports', importRequest);
      return {
        success: true,
        message: 'Tạo phiếu nhập hàng thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi tạo phiếu nhập hàng'
      };
    }
  },

  getById: async (id: number): Promise<{ success: boolean; data?: Import; message?: string }> => {
    try {
      const response = await api.get(`/admin/imports/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy chi tiết phiếu nhập hàng'
      };
    }
  },

  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/admin/imports/${id}`);
      return {
        success: true,
        message: 'Xóa phiếu nhập hàng thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa phiếu nhập hàng'
      };
    }
  },

  getFormData: async (): Promise<ImportFormData> => {
    const response = await api.get('/admin/imports/form-data');
    return response.data;
  }
};
