import api from './api';
import { Invoice, InvoiceFilters, PaginatedResponse, InvoiceStatusUpdate } from '@/types/invoice';

const API_BASE_URL = '/admin';

class AdminInvoiceService {
  /**
   * Lấy danh sách tất cả hóa đơn với phân trang
   */
  async getInvoices(filters: InvoiceFilters = {}): Promise<PaginatedResponse<Invoice>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.userId !== undefined) params.append('userId', filters.userId.toString());

      const response = await api.get(`${API_BASE_URL}/invoices?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải danh sách hóa đơn');
    }
  }

  /**
   * Lấy chi tiết hóa đơn theo ID
   */
  async getInvoiceById(id: number): Promise<Invoice> {
    try {
      const response = await api.get(`${API_BASE_URL}/invoices/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải chi tiết hóa đơn');
    }
  }

  /**
   * Duyệt hóa đơn (chuyển từ PENDING sang CONFIRMED)
   */
  async approveInvoice(id: number): Promise<void> {
    try {
      await api.post(`${API_BASE_URL}/invoices/${id}/approve`);
    } catch (error: any) {
      console.error('Error approving invoice:', error);
      throw new Error(error.response?.data?.message || 'Không thể duyệt hóa đơn');
    }
  }

  /**
   * Hủy hóa đơn
   */
  async cancelInvoice(id: number): Promise<void> {
    try {
      await api.post(`${API_BASE_URL}/invoices/${id}/cancel`);
    } catch (error: any) {
      console.error('Error cancelling invoice:', error);
      throw new Error(error.response?.data?.message || 'Không thể hủy hóa đơn');
    }
  }

  /**
   * Cập nhật trạng thái hóa đơn
   */
  async updateInvoiceStatus(id: number, newStatus: string): Promise<void> {
    try {
      await api.post(`${API_BASE_URL}/invoices/${id}/update-status?newStatus=${newStatus}`);
    } catch (error: any) {
      console.error('Error updating invoice status:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái hóa đơn');
    }
  }
}

export default new AdminInvoiceService();




