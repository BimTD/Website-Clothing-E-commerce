export interface Color {
  id: number;
  maMau: string;
  loaiId: number;
  loaiTen?: string;
}

export interface ColorFormData {
  loais: Array<{
    id: number;
    ten: string;
  }>;
}

export interface ColorFilters {
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






