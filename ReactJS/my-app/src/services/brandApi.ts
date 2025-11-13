import api from './api';
import { Brand, PaginatedResponse } from '@/types/brand';
import { AxiosResponse } from 'axios';

export const brandAPI = {
  // Interface cho useCrudOperations
  getAll: async (filters: { page?: number; size?: number; search?: string } = {}): Promise<{
    data: Brand[];
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
    
    const response = await api.get(`/admin/brands?${params}`);
    const responseData = response.data;
    
    return {
      data: responseData.content || [],
      totalPages: responseData.totalPages || 0,
      totalElements: responseData.totalElements || 0
    };
  },

  create: async (brand: Omit<Brand, 'id'>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post('/admin/brands', brand);
      return {
        success: true,
        message: 'Thêm thương hiệu thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi thêm thương hiệu'
      };
    }
  },

  update: async (id: number, brand: Partial<Brand>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put(`/admin/brands/${id}`, brand);
      return {
        success: true,
        message: 'Cập nhật thương hiệu thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật thương hiệu'
      };
    }
  },

  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/admin/brands/${id}`);
      return {
        success: true,
        message: 'Xóa thương hiệu thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa thương hiệu'
      };
    }
  },

  // Legacy methods (giữ lại để tương thích)
  getBrands: async (page: number = 0, size: number = 10, search?: string): Promise<PaginatedResponse<Brand>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    const response = await api.get(`/admin/brands?${params}`);
    return response.data;
  },

  getBrandById: async (id: number): Promise<Brand> => {
    const response = await api.get(`/admin/brands/${id}`);
    return response.data;
  },

  createBrand: async (brand: { ten: string }): Promise<{ success: boolean; message?: string; brand?: Brand }> => {
    const response = await api.post('/admin/brands', brand);
    return response.data;
  },

  updateBrand: async (id: number, brand: { ten: string }): Promise<{ success: boolean; message?: string; brand?: Brand }> => {
    const response = await api.put(`/admin/brands/${id}`, brand);
    return response.data;
  },

  deleteBrand: async (id: number): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/admin/brands/${id}`);
    return response.data;
  },
};
