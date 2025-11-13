import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { ROUTES } from '@/utils/constants';
import orderService, { Order } from '@/services/orderService';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders();
      if (response.success && response.orders) {
        setOrders(response.orders);
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm(t('orders.confirmCancel'))) {
      return;
    }

    try {
      const response = await orderService.cancelOrder(orderId);
      if (response.success) {
        alert(t('orders.cancelSuccess'));
        loadOrders(); // Reload orders
      } else {
        alert(response.message);
      }
    } catch (error: any) {
      alert(error.message);
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
        return t('orders.status.pending');
      case 'CONFIRMED':
        return t('orders.status.confirmed');
      case 'SHIPPING':
        return t('orders.status.shipping');
      case 'DELIVERED':
        return t('orders.status.delivered');
      case 'CANCELLED':
        return t('orders.status.cancelled');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('orders.error')}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadOrders}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t('orders.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('orders.empty')}
          </h2>
          <button
            onClick={() => navigate(ROUTES.SHOP)}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t('orders.startShopping')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('orders.title')}
            </h1>
            <p className="text-gray-600">
              {t('orders.subtitle')}
            </p>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-soft p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('orders.order')} #{order.id}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.trangThai)}`}>
                        {getStatusText(order.trangThai)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {t('orders.orderDate')}: {new Date(order.ngayTao).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('orders.total')}: {order.tongTien.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0">
                    <button
                      onClick={() => navigate(`${ROUTES.ORDER_DETAIL}/${order.id}`)}
                      className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      {t('orders.viewDetail')}
                    </button>
                    
                    {order.trangThai === 'PENDING' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        {t('orders.cancel')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Items Preview */}
                {order.chiTietHoaDons && order.chiTietHoaDons.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {t('orders.items')} ({order.chiTietHoaDons.length})
                    </h4>
                    <div className="space-y-2">
                      {order.chiTietHoaDons.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                            {item.sanPhamBienThe.sanPham.hinhAnh ? (
                              <img
                                src={item.sanPhamBienThe.sanPham.hinhAnh}
                                alt={item.sanPhamBienThe.sanPham.ten}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <img
                                  src="/placeholder-image.svg"
                                  alt="No image"
                                  className="w-5 h-5 opacity-50"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.sanPhamBienThe.sanPham.ten}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.sanPhamBienThe.kichThuoc.ten} • {item.sanPhamBienThe.mauSac.ten} • x{item.soLuong}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.thanhTien.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      ))}
                      {order.chiTietHoaDons.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{order.chiTietHoaDons.length - 3} {t('orders.moreItems')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;




