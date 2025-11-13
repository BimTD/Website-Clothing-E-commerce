export interface ProductVariant {
  id: number;
  soLuongTon: number;
  sanPhamId: number;
  sanPhamTen?: string;
  mauSacId: number;
  mauSacTen?: string;
  sizeId: number;
  sizeTen?: string;
}

export interface ProductVariantFormData {
  sanPhams: Array<{
    id: number;
    ten: string;
  }>;
  mauSacs: Array<{
    id: number;
    ten: string;
  }>;
  sizes: Array<{
    id: number;
    ten: string;
  }>;
}

export interface ProductVariantFilters {
  page?: number;
  size?: number;
  search?: string;
  sanPhamId?: number;
  mauSacId?: number;
  sizeId?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
}
