import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { ROUTES } from '@/utils/constants';
import orderService, { CheckoutData, CartItemData } from '@/services/orderService';

interface CartItem {
  id: string;
  productId: number;
  productName: string;
  productImage?: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
}

interface PaymentInfo {
  method: 'cod' | 'banking' | 'momo';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  // Thu thập thông tin từ form
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'cod'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate shipping info
    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = t('checkout.errors.fullNameRequired');
    }
    if (!shippingInfo.email.trim()) {
      newErrors.email = t('checkout.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = t('checkout.errors.emailInvalid');
    }
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = t('checkout.errors.phoneRequired');
    }
    if (!shippingInfo.address.trim()) {
      newErrors.address = t('checkout.errors.addressRequired');
    }
    if (!shippingInfo.city.trim()) {
      newErrors.city = t('checkout.errors.cityRequired');
    }
    if (!shippingInfo.district.trim()) {
      newErrors.district = t('checkout.errors.districtRequired');
    }
    if (!shippingInfo.ward.trim()) {
      newErrors.ward = t('checkout.errors.wardRequired');
    }

    // Validate payment info
    if (paymentInfo.method === 'banking') {
      if (!paymentInfo.cardNumber?.trim()) {
        newErrors.cardNumber = t('checkout.errors.cardNumberRequired');
      }
      if (!paymentInfo.expiryDate?.trim()) {
        newErrors.expiryDate = t('checkout.errors.expiryDateRequired');
      }
      if (!paymentInfo.cvv?.trim()) {
        newErrors.cvv = t('checkout.errors.cvvRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateSubtotal = () => {
    return getTotalPrice();
  };

  const calculateShipping = () => {
    return calculateSubtotal() >= 500000 ? 0 : 30000;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert(t('checkout.errors.emptyCart'));
      return;
    }

    setLoading(true);
    
    try {
      // Chuẩn bị dữ liệu checkout
      const items: CartItemData[] = cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        size: item.size,
        color: item.color,
        price: item.price,
        quantity: item.quantity
      }));

      const checkoutData: CheckoutData = {
        ghiChu: shippingInfo.note || '',
        loaiThanhToan: paymentInfo.method === 'cod' ? 'CASH' : paymentInfo.method.toUpperCase(),
        diaChiGiaoHang: `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`,
        soDienThoai: shippingInfo.phone,
        tenNguoiNhan: shippingInfo.fullName,
        phiGiaoHang: calculateShipping(),
        tongTien: calculateTotal(),
        items: items
      };

      console.log('Submitting order:', checkoutData);

      // Gọi API tạo đơn hàng
      const response = await orderService.createOrder(checkoutData);
      
      if (response.success) {
        // Clear cart
        clearCart();
        
        // Redirect to success page với order ID
        navigate(`${ROUTES.ORDER_SUCCESS}?orderId=${response.orderId}`);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Error submitting order:', error);
      alert(error.message || t('checkout.errors.submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('checkout.emptyCart')}
          </h2>
          <button
            onClick={() => navigate(ROUTES.SHOP)}
            className="btn-primary"
          >
            {t('checkout.continueShopping')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('checkout.title')}
            </h1>
            <p className="text-gray-600">
              {t('checkout.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('checkout.shippingInfo')}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.fullName')} *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleShippingChange('fullName', e.target.value)}
                      className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
                      placeholder={t('checkout.fullNamePlaceholder')}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.email')} *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                      placeholder={t('checkout.emailPlaceholder')}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.phone')} *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder={t('checkout.phonePlaceholder')}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.address')} *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      className={`form-input ${errors.address ? 'border-red-500' : ''}`}
                      placeholder={t('checkout.addressPlaceholder')}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('checkout.city')} *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => handleShippingChange('city', e.target.value)}
                        className={`form-input ${errors.city ? 'border-red-500' : ''}`}
                        placeholder={t('checkout.cityPlaceholder')}
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('checkout.district')} *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.district}
                        onChange={(e) => handleShippingChange('district', e.target.value)}
                        className={`form-input ${errors.district ? 'border-red-500' : ''}`}
                        placeholder={t('checkout.districtPlaceholder')}
                      />
                      {errors.district && (
                        <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('checkout.ward')} *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.ward}
                        onChange={(e) => handleShippingChange('ward', e.target.value)}
                        className={`form-input ${errors.ward ? 'border-red-500' : ''}`}
                        placeholder={t('checkout.wardPlaceholder')}
                      />
                      {errors.ward && (
                        <p className="mt-1 text-sm text-red-600">{errors.ward}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.note')}
                    </label>
                    <textarea
                      value={shippingInfo.note}
                      onChange={(e) => handleShippingChange('note', e.target.value)}
                      className="form-input"
                      rows={3}
                      placeholder={t('checkout.notePlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information & Order Summary */}
              <div className="space-y-6">
                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-soft p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {t('checkout.paymentMethod')}
                  </h2>

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentInfo.method === 'cod'}
                        onChange={(e) => handlePaymentChange('method', e.target.value)}
                        className="form-radio"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {t('checkout.cod')}
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="banking"
                        checked={paymentInfo.method === 'banking'}
                        onChange={(e) => handlePaymentChange('method', e.target.value)}
                        className="form-radio"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {t('checkout.banking')}
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="momo"
                        checked={paymentInfo.method === 'momo'}
                        onChange={(e) => handlePaymentChange('method', e.target.value)}
                        className="form-radio"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {t('checkout.momo')}
                      </span>
                    </label>
                  </div>

                  {/* Banking Details */}
                  {paymentInfo.method === 'banking' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('checkout.cardNumber')} *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cardNumber || ''}
                          onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                          className={`form-input ${errors.cardNumber ? 'border-red-500' : ''}`}
                          placeholder="1234 5678 9012 3456"
                        />
                        {errors.cardNumber && (
                          <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('checkout.expiryDate')} *
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.expiryDate || ''}
                            onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                            className={`form-input ${errors.expiryDate ? 'border-red-500' : ''}`}
                            placeholder="MM/YY"
                          />
                          {errors.expiryDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('checkout.cvv')} *
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.cvv || ''}
                            onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                            className={`form-input ${errors.cvv ? 'border-red-500' : ''}`}
                            placeholder="123"
                          />
                          {errors.cvv && (
                            <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-soft p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {t('checkout.orderSummary')}
                  </h2>

                  <div className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <img
                                  src="/placeholder-image.svg"
                                  alt="No image"
                                  className="w-6 h-6 opacity-50"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.size} • {item.color} • x{item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('checkout.subtotal')}</span>
                        <span className="font-medium">
                          {calculateSubtotal().toLocaleString('vi-VN')}₫
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('checkout.shipping')}</span>
                        <span className="font-medium">
                          {calculateShipping() === 0 ? (
                            <span className="text-green-600">{t('checkout.freeShipping')}</span>
                          ) : (
                            `${calculateShipping().toLocaleString('vi-VN')}₫`
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between text-lg font-semibold">
                        <span>{t('checkout.total')}</span>
                        <span className="text-primary">
                          {calculateTotal().toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t('checkout.processing')}
                      </div>
                    ) : (
                      t('checkout.placeOrder')
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
