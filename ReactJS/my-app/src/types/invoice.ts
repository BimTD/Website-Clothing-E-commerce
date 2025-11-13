export interface Invoice {
  id: number;
  ngayTao: string;
  ghiChu?: string;
  trangThai: string;
  loaiThanhToan: string;
  daLayTien?: string;
  diaChiGiaoHang?: string;
  tenNguoiNhan?: string;
  soDienThoaiGiaoHang?: string;
  tongTien: number;
  userId: number;
  userTen?: string;
  userEmail?: string;
  chiTietHoaDons?: InvoiceDetail[];
}

export interface InvoiceDetail {
  id: number;
  soLuong: number;
  thanhTien: number;
  hoaDonId: number;
  sanPhamBienTheId: number;
  sanPhamTen?: string;
  variantInfo?: string;
  giaBan?: number;
}

export interface InvoiceFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: number;
}

export interface InvoiceStatusUpdate {
  newStatus: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
}

export type InvoiceStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'SHIPPING' 
  | 'DELIVERED' 
  | 'CANCELLED';

export type PaymentType = 
  | 'CASH' 
  | 'BANK_TRANSFER' 
  | 'CREDIT_CARD';
