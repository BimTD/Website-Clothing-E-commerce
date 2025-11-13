export interface Import {
  id: number;
  soChungTu: string;
  ngayTao: string;
  tongTien: number;
  nguoiLapPhieu: string;
  ghiChu?: string;
  nhaCungCapId: number;
  nhaCungCapTen?: string;
  chiTietPhieuNhaps?: ImportDetail[];
}

export interface ImportDetail {
  id: number;
  productId: number;
  productTen?: string;
  variantId: number;
  variantInfo?: string;
  quantity: number;
  importPrice: number;
  thanhTienNhap?: number;
}

export interface ImportFormData {
  suppliers: Array<{
    id: number;
    ten: string;
  }>;
  variants: Array<{
    id: number;
    variantInfo: string;
    productId: number;
    productTen: string;
  }>;
}

export interface ImportFilters {
  page?: number;
  size?: number;
  search?: string;
  supplierId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface ImportRequest {
  supplierId: number;
  note?: string;
  details: Array<{
    variantId: number;
    quantity: number;
    importPrice: number;
  }>;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
}
