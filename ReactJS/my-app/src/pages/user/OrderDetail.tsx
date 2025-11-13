import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import orderService from '@/services/orderService';
import { Order } from '@/types/order';
import { PageTitle, MessageAlert } from '@/components/common';
import { ROUTES } from '@/utils/constants';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (id) {
      loadOrderDetail(parseInt(id));
    }
  }, [id]);

  const loadOrderDetail = async (orderId: number) => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderDetail(orderId);
      setOrder(orderData);
    } catch (error: any) {
      console.error('Error loading order detail:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || t('order.detail.loadError') 
      });
    } finally {
      setLoading(false);
    }
  };

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
        return t('order.status.pending');
      case 'CONFIRMED':
        return t('order.status.confirmed');
      case 'SHIPPING':
        return t('order.status.shipping');
      case 'DELIVERED':
        return t('order.status.delivered');
      case 'CANCELLED':
        return t('order.status.cancelled');
      default:
        return status;
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'CASH':
        return t('order.paymentType.cash');
      case 'BANK_TRANSFER':
        return t('order.paymentType.bankTransfer');
      case 'CREDIT_CARD':
        return t('order.paymentType.creditCard');
      default:
        return type;
    }
  };

  const canCancel = order?.trangThai === 'PENDING';

  const handleCancelOrder = async () => {
    if (!order || !window.confirm(t('order.cancelConfirm'))) {
      return;
    }

    try {
      await orderService.cancelOrder(order.id);
      setMessage({ 
        type: 'success', 
        text: t('order.cancelSuccess') 
      });
      // Reload order data
      loadOrderDetail(order.id);
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || t('order.cancelError') 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('order.detail.notFound')}
            </h1>
            <button
              onClick={() => navigate(ROUTES.ORDERS)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('order.backToOrders')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <PageTitle title={`${t('order.detail.title')} #${order.id}`} />
        
        {message && (
          <MessageAlert 
            message={message} 
          />
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Order Status Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('order.status')}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.trangThai)}`}>
                  {getStatusText(order.trangThai)}
                </span>
              </div>
              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('order.cancel')}
                </button>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('order.detail.orderInfo')}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">{t('order.id')}:</span>
                  <span className="ml-2 text-gray-900">#{order.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('order.createDate')}:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(order.ngayTao).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('order.paymentType')}:</span>
                  <span className="ml-2 text-gray-900">{getPaymentTypeText(order.loaiThanhToan)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('order.totalAmount')}:</span>
                  <span className="ml-2 text-lg font-bold text-green-600">
                    {order.tongTien?.toLocaleString('vi-VN') || '0'} ₫
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('order.detail.deliveryInfo')}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">{t('order.recipient')}:</span>
                  <span className="ml-2 text-gray-900">{order.tenNguoiNhan}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('order.phone')}:</span>
                  <span className="ml-2 text-gray-900">{order.soDienThoaiGiaoHang}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('order.deliveryAddress')}:</span>
                  <span className="ml-2 text-gray-900">{order.diaChiGiaoHang}</span>
                </div>
                {order.ghiChu && (
                  <div>
                    <span className="font-medium text-gray-700">{t('order.note')}:</span>
                    <span className="ml-2 text-gray-900">{order.ghiChu}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('order.detail.orderItems')}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('order.item.product')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('order.item.quantity')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('order.item.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('order.item.total')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.chiTietHoaDons?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.sanPhamBienThe?.sanPham?.hinhAnh && (
                            <img
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                              src={item.sanPhamBienThe.sanPham.hinhAnh}
                              alt={item.sanPhamBienThe.sanPham.ten}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.sanPhamBienThe?.sanPham?.ten || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.sanPhamBienThe?.kichThuoc?.ten && item.sanPhamBienThe?.mauSac?.ten && 
                                `${item.sanPhamBienThe.kichThuoc.ten} - ${item.sanPhamBienThe.mauSac.ten}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.soLuong}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.sanPhamBienThe?.giaBan?.toLocaleString('vi-VN') || '0'} ₫
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.thanhTien?.toLocaleString('vi-VN') || '0'} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate(ROUTES.ORDERS)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('order.backToOrders')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
