import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Invoice, InvoiceStatus } from '@/types/invoice';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: number) => void;
  onCancel?: (id: number) => void;
  onUpdateStatus?: (id: number, newStatus: string) => void;
  loading?: boolean;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onApprove,
  onCancel,
  onUpdateStatus,
  loading = false
}) => {
  const { t } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  if (!isOpen || !invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPING':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('invoice.status.pending');
      case 'CONFIRMED':
        return t('invoice.status.confirmed');
      case 'SHIPPING':
        return t('invoice.status.shipping');
      case 'DELIVERED':
        return t('invoice.status.delivered');
      case 'CANCELLED':
        return t('invoice.status.cancelled');
      default:
        return status;
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'CASH':
        return t('invoice.paymentType.cash');
      case 'BANK_TRANSFER':
        return t('invoice.paymentType.bankTransfer');
      case 'CREDIT_CARD':
        return t('invoice.paymentType.creditCard');
      default:
        return type;
    }
  };

  const canApprove = invoice.trangThai === 'PENDING';
  const canCancel = invoice.trangThai === 'PENDING' || invoice.trangThai === 'CONFIRMED';
  const canUpdateStatus = invoice.trangThai !== 'CANCELLED' && invoice.trangThai !== 'DELIVERED';

  const handleStatusUpdate = () => {
    if (selectedStatus && onUpdateStatus) {
      onUpdateStatus(invoice.id, selectedStatus);
      setShowStatusUpdate(false);
      setSelectedStatus('');
    }
  };

  const getAvailableStatuses = () => {
    const currentStatus = invoice.trangThai;
    const allStatuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    
    // Filter out current status and invalid transitions
    return allStatuses.filter(status => {
      if (status === currentStatus) return false;
      
      // Business logic for valid status transitions
      switch (currentStatus) {
        case 'PENDING':
          return ['CONFIRMED', 'CANCELLED'].includes(status);
        case 'CONFIRMED':
          return ['SHIPPING', 'CANCELLED'].includes(status);
        case 'SHIPPING':
          return ['DELIVERED', 'CANCELLED'].includes(status);
        case 'DELIVERED':
          return false; // Cannot change from delivered
        case 'CANCELLED':
          return false; // Cannot change from cancelled
        default:
          return true;
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('invoice.detail.title')} #{invoice.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('invoice.detail.invoiceInfo')}
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">{t('invoice.id')}:</span>
                  <span className="ml-2 text-gray-900">#{invoice.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('invoice.createDate')}:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(invoice.ngayTao).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('invoice.status')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.trangThai)}`}>
                    {getStatusText(invoice.trangThai)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('invoice.paymentType')}:</span>
                  <span className="ml-2 text-gray-900">{getPaymentTypeText(invoice.loaiThanhToan)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('invoice.totalAmount')}:</span>
                  <span className="ml-2 text-lg font-bold text-green-600">
                    {invoice.tongTien.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('invoice.detail.customerInfo')}
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">{t('invoice.customer')}:</span>
                  <span className="ml-2 text-gray-900">{invoice.userTen || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('invoice.email')}:</span>
                  <span className="ml-2 text-gray-900">{invoice.userEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('invoice.recipient')}:</span>
                  <span className="ml-2 text-gray-900">{invoice.tenNguoiNhan || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('invoice.phone')}:</span>
                  <span className="ml-2 text-gray-900">{invoice.soDienThoaiGiaoHang || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('invoice.deliveryAddress')}:</span>
                  <span className="ml-2 text-gray-900">{invoice.diaChiGiaoHang || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('invoice.detail.orderItems')}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invoice.item.product')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invoice.item.quantity')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invoice.item.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invoice.item.total')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.chiTietHoaDons?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.sanPhamTen || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.variantInfo || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.soLuong}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.giaBan?.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.thanhTien.toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Note */}
          {invoice.ghiChu && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('invoice.note')}
              </h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {invoice.ghiChu}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50">
          {/* Status Update Section */}
          {canUpdateStatus && onUpdateStatus && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-blue-900">
                  {t('invoice.updateStatus')}
                </h4>
                <button
                  onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showStatusUpdate ? t('common.hide') : t('invoice.changeStatus')}
                </button>
              </div>
              
              {showStatusUpdate && (
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('invoice.selectNewStatus')}</option>
                    {getAvailableStatuses().map(status => (
                      <option key={status} value={status}>
                        {getStatusText(status)}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? t('common.loading') : t('invoice.update')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('common.close')}
            </button>
            
            {canApprove && onApprove && (
              <button
                onClick={() => onApprove(invoice.id)}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? t('common.loading') : t('invoice.approve')}
              </button>
            )}
            
            {canCancel && onCancel && (
              <button
                onClick={() => onCancel(invoice.id)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? t('common.loading') : t('invoice.cancel')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
