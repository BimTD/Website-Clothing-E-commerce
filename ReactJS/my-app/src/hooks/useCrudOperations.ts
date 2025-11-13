import { useState, useEffect, useCallback } from 'react';

// Generic filter interface
interface BaseFilters {
  page?: number;
  size?: number;
  search?: string;
}


// Generic API interface
interface CrudApi<T, F extends BaseFilters = BaseFilters> {
  getAll: (filters: F) => Promise<{
    data: T[];
    totalPages: number;
    totalElements: number;
  }>;
  create: (data: Omit<T, 'id'>, ...args: any[]) => Promise<{ success: boolean; message?: string }>;
  update: (id: number, data: Partial<T>, ...args: any[]) => Promise<{ success: boolean; message?: string }>;
  delete: (id: number) => Promise<{ success: boolean; message?: string }>;
  toggleActive?: (id: number, active: boolean) => Promise<{ success: boolean; message?: string }>;
  getFormData?: () => Promise<any>;
}

interface UseCrudOperationsProps<T, F extends BaseFilters = BaseFilters> {
  api: CrudApi<T, F>;
  entityName: string;
  initialPageSize?: number;
  initialFilters?: Partial<F>;
  enableFormData?: boolean;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

export function useCrudOperations<T extends { id: number }, F extends BaseFilters = BaseFilters>({
  api,
  entityName,
  initialPageSize = 10,
  initialFilters = {},
  enableFormData = false
}: UseCrudOperationsProps<T, F>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  
  // Extended filters for complex entities
  const [filters, setFilters] = useState<Partial<F>>(initialFilters);
  
  // Form data for dropdowns (for entities that need it)
  const [formData, setFormData] = useState<any>(null);

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  // Load form data if enabled
  const loadFormData = useCallback(async () => {
    if (!enableFormData || !api.getFormData) return;
    
    try {
      const data = await api.getFormData();
      setFormData(data);
    } catch (error) {
      console.error('Error loading form data:', error);
      showMessage('error', `Lỗi khi tải dữ liệu form ${entityName}`);
    }
  }, [api, entityName, enableFormData, showMessage]);

  // Fetch data with current filters
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const currentFilters = {
        page: currentPage,
        size: pageSize,
        search: searchTerm,
        ...filters
      } as F;
      
      const response = await api.getAll(currentFilters);
      setData(response.data);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      showMessage('error', `Lỗi khi tải danh sách ${entityName}`);
    } finally {
      setLoading(false);
    }
  }, [api, currentPage, pageSize, searchTerm, filters, entityName, showMessage]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (enableFormData) {
      loadFormData();
    }
  }, [loadFormData, enableFormData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD Operations
  const handleCreate = useCallback(async (formData: Omit<T, 'id'>, ...args: any[]) => {
    try {
      const response = await api.create(formData, ...args);
      if (response.success) {
        showMessage('success', `Thêm ${entityName} thành công!`);
        fetchData();
        return true;
      } else {
        showMessage('error', response.message || `Lỗi khi thêm ${entityName}`);
        return false;
      }
    } catch (error) {
      showMessage('error', `Lỗi khi thêm ${entityName}`);
      return false;
    }
  }, [api, entityName, showMessage, fetchData]);

  const handleUpdate = useCallback(async (id: number, formData: Partial<T>, ...args: any[]) => {
    try {
      const response = await api.update(id, formData, ...args);
      if (response.success) {
        showMessage('success', `Cập nhật ${entityName} thành công!`);
        setEditingItem(null);
        fetchData();
        return true;
      } else {
        showMessage('error', response.message || `Lỗi khi cập nhật ${entityName}`);
        return false;
      }
    } catch (error) {
      showMessage('error', `Lỗi khi cập nhật ${entityName}`);
      return false;
    }
  }, [api, entityName, showMessage, fetchData]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${entityName} này?`)) return;

    try {
      const response = await api.delete(id);
      if (response.success) {
        showMessage('success', `Xóa ${entityName} thành công!`);
        fetchData();
      } else {
        showMessage('error', response.message || `Lỗi khi xóa ${entityName}`);
      }
    } catch (error) {
      showMessage('error', `Lỗi khi xóa ${entityName}`);
    }
  }, [api, entityName, showMessage, fetchData]);

  const handleToggleActive = useCallback(async (id: number, active: boolean) => {
    if (!api.toggleActive) return;
    
    try {
      const response = await api.toggleActive(id, active);
      if (response.success) {
        showMessage('success', `Cập nhật trạng thái ${entityName} thành công!`);
        fetchData();
      } else {
        showMessage('error', response.message || `Lỗi khi cập nhật trạng thái ${entityName}`);
      }
    } catch (error) {
      showMessage('error', `Lỗi khi cập nhật trạng thái ${entityName}`);
    }
  }, [api, entityName, showMessage, fetchData]);

  // Search and Filter handlers
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(0);
  }, []);

  const handleResetSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(0);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setFilters(initialFilters);
    setCurrentPage(0);
  }, [initialFilters]);

  const updateFilter = useCallback((key: keyof F, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(0);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
  }, []);

  // Edit handlers
  const startEdit = useCallback((item: T) => {
    setEditingItem(item);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingItem(null);
  }, []);

  const updateEditingItem = useCallback((updatedItem: T) => {
    setEditingItem(updatedItem);
  }, []);

  return {
    // Data
    data,
    loading,
    message,
    editingItem,
    formData,
    
    // Pagination
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    
    // Search and Filters
    searchTerm,
    filters,
    
    // Handlers
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive,
    handleSearch,
    handleResetSearch,
    handleResetFilters,
    updateFilter,
    handlePageChange,
    handlePageSizeChange,
    startEdit,
    cancelEdit,
    updateEditingItem,
    
    // Utils
    fetchData,
    showMessage
  };
}