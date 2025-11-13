import api from './api';
import { Category } from '@/types/category';

export interface CategoryResponse {
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  category?: T;
}

export const categoryAPI = {
  // Interface cho useCrudOperations
  getAll: async (filters: { page?: number; size?: number; search?: string } = {}): Promise<{
    data: Category[];
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
    
    const response = await api.get(`/admin/categories?${params}`);
    const responseData = response.data;
    
    return {
      data: responseData.categories || responseData.content || [],
      totalPages: responseData.totalPages || 0,
      totalElements: responseData.totalElements || 0
    };
  },

  create: async (category: Omit<Category, 'id'>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post('/admin/categories', category);
      return {
        success: true,
        message: 'Thêm danh mục thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi thêm danh mục'
      };
    }
  },

  update: async (id: number, category: Partial<Category>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put(`/admin/categories/${id}`, category);
      return {
        success: true,
        message: 'Cập nhật danh mục thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi cập nhật danh mục'
      };
    }
  },

  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      return {
        success: true,
        message: 'Xóa danh mục thành công!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa danh mục'
      };
    }
  },

  // Legacy methods (giữ lại để tương thích)
  getCategories: async (page: number = 0, size: number = 10, search?: string): Promise<CategoryResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    const response = await api.get(`/admin/categories?${params}`);
    return response.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await api.get(`/admin/categories/${id}`);
    return response.data;
  },

  createCategory: async (category: { ten: string }): Promise<ApiResponse<Category>> => {
    const response = await api.post('/admin/categories', category);
    return response.data;
  },

  updateCategory: async (id: number, category: { ten: string }): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/admin/categories/${id}`, category);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },
};


