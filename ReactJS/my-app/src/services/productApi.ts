import api from './api';
import { Product, ProductFormData, ProductFilters, PaginatedResponse } from '@/types/product';

export const productAPI = {
  getAll: async (filters: ProductFilters = {}): Promise<{
    data: Product[];
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
    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId.toString());
    }
    if (filters.gender) {
      params.append('gender', filters.gender);
    }
    
    const response = await api.get(`/admin/products?${params}`);
    const responseData: PaginatedResponse<Product> = response.data;
    
    return {
      data: responseData.content || [],
      totalPages: responseData.totalPages || 0,
      totalElements: responseData.totalElements || 0
    };
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  getFormData: async (): Promise<ProductFormData> => {
    const response = await api.get('/admin/products/form-data');
    return response.data;
  },

  create: async (product: Omit<Product, 'id'>, imageUrls: string = ''): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(`/admin/products?imageUrls=${encodeURIComponent(imageUrls)}`, product);
      return {
        success: true,
        message: 'Thêm sản phẩm thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'Lỗi khi thêm sản phẩm'
      };
    }
  },

  update: async (id: number, product: Partial<Product>, imageUrls: string = ''): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put(`/admin/products/${id}?imageUrls=${encodeURIComponent(imageUrls)}`, product);
      return {
        success: true,
        message: 'Cập nhật sản phẩm thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm'
      };
    }
  },

  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return {
        success: true,
        message: 'Xóa sản phẩm thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'Lỗi khi xóa sản phẩm'
      };
    }
  },

  toggleActive: async (id: number, active: boolean): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put(`/admin/products/${id}/toggle-active`, { active });
      return {
        success: true,
        message: 'Cập nhật trạng thái sản phẩm thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'Lỗi khi cập nhật trạng thái sản phẩm'
      };
    }
  },
};
