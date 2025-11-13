import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { ROUTES } from '@/utils/constants';

interface CartItem {
  id: string;
  productId: number;
  productName: string;
  productImage?: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  stock: number;
}

const ShoppingCart: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    // Free shipping for orders over 500,000 VND
    return calculateSubtotal() >= 500000 ? 0 : 30000;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }
    navigate(ROUTES.CHECKOUT);
  };

  const handleContinueShopping = () => {
    navigate(ROUTES.SHOP);
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('cart.title')}
          </h1>
          <p className="text-gray-600">
            {t('cart.subtitle', { count: cartItems.length.toString() })}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t('cart.empty')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('cart.emptyDescription')}
            </p>  
            <button
              onClick={handleContinueShopping}
              className="btn-primary"
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-soft overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {t('cart.items')} ({cartItems.length})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      {t('cart.clearAll')}
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-image.svg';
                              }}
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

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.productName}
                          </h3>
                          <div className="mt-1 text-sm text-gray-500">
                            <span>{t('cart.size')}: {item.size}</span>
                            <span className="mx-2">•</span>
                            <span>{t('cart.color')}: {item.color}</span>
                          </div>
                          <div className="mt-2 text-lg font-semibold text-primary">
                            {item.price.toLocaleString('vi-VN')}₫
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        {/* Total Price */}
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-soft p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('cart.orderSummary')}
                </h2>

                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.subtotal')}</span>
                    <span className="font-medium">
                      {calculateSubtotal().toLocaleString('vi-VN')}₫
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.shipping')}</span>
                    <span className="font-medium">
                      {calculateShipping() === 0 ? (
                        <span className="text-green-600">{t('cart.freeShipping')}</span>
                      ) : (
                        `${calculateShipping().toLocaleString('vi-VN')}₫`
                      )}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t('cart.total')}</span>
                      <span className="text-primary">
                        {calculateTotal().toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  {t('cart.checkout')}
                </button>

                {/* Free Shipping Notice */}
                {calculateSubtotal() < 500000 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {t('cart.freeShippingNotice', { 
                        remaining: (500000 - calculateSubtotal()).toLocaleString('vi-VN')
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Continue Shopping Button - Bottom */}
            <div className="mt-8 text-center">
              <button
                onClick={handleContinueShopping}
                className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
