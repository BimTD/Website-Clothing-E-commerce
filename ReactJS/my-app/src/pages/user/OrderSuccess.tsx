import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { ROUTES } from '@/utils/constants';
import orderService, { Order } from '@/services/orderService';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      const response = await orderService.getOrderDetail(parseInt(orderId!));
      if (response.success && response.order) {
        setOrder(response.order);
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('orderSuccess.title')}
            </h1>
            <p className="text-gray-600">
              {t('orderSuccess.subtitle')}
            </p>
          </div>

          {/* Order Info */}
          {order && (
            <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('orderSuccess.orderInfo')}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderSuccess.orderId')}:</span>
                  <span className="font-medium">#{order.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderSuccess.orderDate')}:</span>
                  <span className="font-medium">
                    {new Date(order.ngayTao).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderSuccess.status')}:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.trangThai === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.trangThai === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    order.trangThai === 'SHIPPING' ? 'bg-purple-100 text-purple-800' :
                    order.trangThai === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.trangThai}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderSuccess.total')}:</span>
                  <span className="font-bold text-orange-500">
                    {order.tongTien.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          {order && order.chiTietHoaDons && order.chiTietHoaDons.length > 0 && (
            <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('orderSuccess.orderItems')}
              </h3>
              
              <div className="space-y-4">
                {order.chiTietHoaDons.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
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
                            className="w-8 h-8 opacity-50"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.sanPhamBienThe.sanPham.ten}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.sanPhamBienThe.kichThuoc.ten} • {item.sanPhamBienThe.mauSac.ten} • x{item.soLuong}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {item.thanhTien.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate(ROUTES.SHOP)}
              className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              {t('orderSuccess.continueShopping')}
            </button>
            
            <button
              onClick={() => navigate(ROUTES.ORDERS)}
              className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              {t('orderSuccess.viewOrders')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;