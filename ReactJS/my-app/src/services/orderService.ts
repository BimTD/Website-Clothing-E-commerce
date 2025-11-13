import api from './api';

const API_BASE_URL = '/user';

export interface CheckoutData {
  ghiChu?: string;
  loaiThanhToan: string;
  diaChiGiaoHang: string;
  soDienThoai: string;
  tenNguoiNhan: string;
  phiGiaoHang: number;
  tongTien: number;
  items: CartItemData[];
}

export interface CartItemData {
  productId: number;
  productName: string;
  productImage?: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id: number;
  soLuong: number;
  thanhTien: number;
  sanPhamBienThe: {
    id: number;
    soLuongTon: number;
    giaBan: number;
    sanPham: {
      id: number;
      ten: string;
      hinhAnh?: string;
    };
    kichThuoc: {
      id: number;
      ten: string;
    };
    mauSac: {
      id: number;
      ten: string;
    };
  };
}

export interface Order {
  id: number;
  ngayTao: string;
  ghiChu?: string;
  trangThai: string;
  loaiThanhToan: string;
  daLayTien: string;
  diaChiGiaoHang: string;
  tenNguoiNhan: string;
  soDienThoaiGiaoHang: string;
  tongTien: number;
  chiTietHoaDons: OrderItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  orderId?: number;
  order?: Order;
  orders?: Order[];
}

class OrderService {
  /**
   * Tạo đơn hàng mới
   */
  async createOrder(checkoutData: CheckoutData): Promise<ApiResponse<Order>> {
    try {
      const response = await api.post(`${API_BASE_URL}/orders`, checkoutData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  }

  /**
   * Lấy danh sách đơn hàng của user
   */
  async getUserOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await api.get(`${API_BASE_URL}/orders`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đơn hàng');
    }
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  async getOrderDetail(orderId: number): Promise<ApiResponse<Order>> {
    try {
      const response = await api.get(`${API_BASE_URL}/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order detail:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy chi tiết đơn hàng');
    }
  }

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderId: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.post(`${API_BASE_URL}/orders/${orderId}/cancel`);
      return response.data;
    } catch (error: any) {
      console.error('Error canceling order:', error);
      throw new Error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  }
}

export default new OrderService();
