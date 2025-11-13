import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

interface Product {
  id: number;
  ten: string;
  giaBan: number;
  khuyenMai?: number;
  hinhAnh?: string;
  imageUrls?: string[];
  loai?: {
    id: number;
    ten: string;
  };
  nhanHieu?: {
    id: number;
    ten: string;
  };
  gioiTinh?: number;
  trangThai?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Calculate discounted price
  const originalPrice = product.giaBan || 0;
  const discount = product.khuyenMai || 0;
  const discountedPrice = originalPrice - (originalPrice * discount / 100);

  // Get product image
  const productImage = product.hinhAnh || 
    (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null);

  // Get gender text
  const getGenderText = (gender?: number) => {
    switch (gender) {
      case 0: return t('product.gender.male');
      case 1: return t('product.gender.female');
      case 2: return t('product.gender.unisex');
      default: return '';
    }
  };

  const handleProductClick = () => {
    navigate(`${ROUTES.PRODUCT_DETAIL}/${product.id}`);
  };


  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!product.trangThai) {
      alert(t('product.outOfStock'));
      return;
    }

    // Add to cart with default values (will need to select size/color in product detail)
    addToCart({
      productId: product.id,
      productName: product.ten,
      productImage: productImage || undefined,
      size: 'Default',
      color: 'Default',
      price: discountedPrice,
      quantity: 1,
      stock: 999 // Default stock, will be updated when user selects specific variant
    });

    alert(t('product.addedToCart'));
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group cursor-pointer ${className}`}
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {productImage ? (
          <img
            src={productImage}
            alt={product.ten}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.svg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <img
              src="/placeholder-image.svg"
              alt="No image"
              className="w-16 h-16 opacity-50"
            />
          </div>
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}

        {/* Add to Cart Button */}
        {product.trangThai && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={handleAddToCart}
              className="opacity-0 group-hover:opacity-100 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-all duration-300"
            >
              {t('product.addToCart')}
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.loai && (
          <div className="text-xs text-gray-500 mb-1">
            {product.loai.ten}
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.ten}
        </h3>

        {/* Brand */}
        {product.nhanHieu && (
          <div className="text-xs text-gray-600 mb-2">
            {product.nhanHieu.ten}
          </div>
        )}

        {/* Gender */}
        {product.gioiTinh !== undefined && (
          <div className="text-xs text-gray-500 mb-2">
            {getGenderText(product.gioiTinh)}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          {discount > 0 ? (
            <>
              <span className="text-lg font-bold text-primary">
                {discountedPrice.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-sm text-gray-500 line-through">
                {originalPrice.toLocaleString('vi-VN')}₫
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary">
              {originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        {/* Status */}
        <div className="mt-2">
          {product.trangThai ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {t('product.inStock')}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {t('product.outOfStock')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
