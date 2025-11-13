export interface Product {
  id: number;
  ten: string;
  moTa: string;
  giaBan: number;
  giaNhap: number;
  khuyenMai: number;
  tag: string;
  huongDan: string;
  thanhPhan: string;
  trangThaiSanPham: string;
  trangThaiHoatDong: boolean;
  gioiTinh: number;
  loaiId: number;
  nhanHieuId: number;
  nhaCungCapId: number;
  imageUrls?: string;
  hinhAnh?: string;
  // Additional fields for display
  loaiTen?: string;
  nhanHieuTen?: string;
  nhaCungCapTen?: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  url: string;
  sanPhamId: number;
}

export interface Category {
  id: number;
  ten: string;
}

export interface Brand {
  id: number;
  ten: string;
}

export interface Supplier {
  id: number;
  ten: string;
}

export interface ProductFormData {
  loais: Category[];
  nhanHieus: Brand[];
  nhaCungCaps: Supplier[];
}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  gender?: string;
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
