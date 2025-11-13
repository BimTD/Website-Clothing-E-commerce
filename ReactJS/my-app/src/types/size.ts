export interface Size {
  id: number;
  tenSize: string;
  loaiId: number;
  loaiTen?: string;
}

export interface SizeFormData {
  loais: Array<{
    id: number;
    ten: string;
  }>;
}

export interface SizeFilters {
  page?: number;
  size?: number;
  search?: string;
  loaiId?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
}






