import api from './api';
import { ProductVariant, ProductVariantFormData, ProductVariantFilters, PaginatedResponse } from '@/types/productVariant';

export const productVariantAPI = {
  getAll: async (filters: ProductVariantFilters = {}): Promise<{
    data: ProductVariant[];
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
    
    const response = await api.get(`/admin/variants?${params}`);
    const responseData: PaginatedResponse<ProductVariant> = response.data;
    
    return {
      data: responseData.content || [],
      totalPages: responseData.totalPages || 0,
      totalElements: responseData.totalElements || 0
    };
  },

  create: async (variant: Omit<ProductVariant, 'id'>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post('/admin/variants', variant);
      return {
        success: true,
        message: 'Thêm biến thể sản phẩm thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi thêm biến thể sản phẩm'
      };
    }
  },

  update: async (id: number, variant: Partial<ProductVariant>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put(`/admin/variants/${id}`, variant);
      return {
        success: true,
        message: 'Cập nhật biến thể sản phẩm thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật biến thể sản phẩm'
      };
    }
  },

  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/admin/variants/${id}`);
      return {
        success: true,
        message: 'Xóa biến thể sản phẩm thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa biến thể sản phẩm'
      };
    }
  },

  getFormData: async (): Promise<ProductVariantFormData> => {
    const response = await api.get('/admin/variants/form-data');
    return response.data;
  }
};
