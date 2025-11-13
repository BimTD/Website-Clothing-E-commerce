import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { ROUTES } from '@/utils/constants';
import axios from 'axios';

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  discount?: number;
  image?: string;
  description?: string;
  sizes: Array<{
    id: number;
    name: string;
  }>;
  colors: Array<{
    id: number;
    name: string;
  }>;
  variants: Array<{
    id: number;
    sizeId: number;
    colorId: number;
    stock: number;
  }>;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProductDetail(parseInt(id));
    }
  }, [id]);

  const fetchProductDetail = async (productId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/user/products/${productId}`);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching product detail:', err);
      setError('Không thể tải chi tiết sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Find variant based on selected size and color
    const variant = product.variants.find(v => 
      v.sizeId === selectedSize && v.colorId === selectedColor
    );

    if (!variant) {
      alert('Vui lòng chọn size và màu sắc');
      return;
    }

    if (variant.stock < quantity) {
      alert('Số lượng trong kho không đủ');
      return;
    }

    // Find selected size and color names
    const selectedSizeName = product.sizes.find(s => s.id === selectedSize)?.name || 'Unknown';
    const selectedColorName = product.colors.find(c => c.id === selectedColor)?.name || 'Unknown';

    // Add to cart
    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      size: selectedSizeName,
      color: selectedColorName,
      price: discountedPrice,
      quantity,
      stock: variant.stock
    });

    alert('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // TODO: Implement buy now logic
    console.log('Buy now:', {
      productId: product.id,
      quantity,
      sizeId: selectedSize,
      colorId: selectedColor
    });

    navigate(ROUTES.CHECKOUT);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || 'Không tìm thấy sản phẩm'}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            {t('common.goBack')}
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  const availableVariants = product.variants.filter(v => v.stock > 0);
  const selectedVariant = product.variants.find(v => 
    v.sizeId === selectedSize && v.colorId === selectedColor
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate(ROUTES.HOME)}
                className="text-gray-700 hover:text-primary"
              >
                {t('common.home')}
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <button
                  onClick={() => navigate(ROUTES.SHOP)}
                  className="ml-1 text-gray-700 hover:text-primary md:ml-2"
                >
                  {t('common.shop')}
                </button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2 truncate">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <img
                    src="/placeholder-image.svg"
                    alt="No image"
                    className="w-32 h-32 opacity-50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                {product.discount ? (
                  <>
                    <span className="text-3xl font-bold text-primary">
                      {discountedPrice.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      -{product.discount}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {product.price.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('product.description')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('product.selectSize')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        selectedSize === size.id
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('product.selectColor')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        selectedColor === color.id
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('product.quantity')}
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    disabled={selectedVariant ? quantity >= selectedVariant.stock : false}
                  >
                    +
                  </button>
                </div>
                {selectedVariant && (
                  <span className="text-sm text-gray-500">
                    {t('product.stockAvailable', { count: selectedVariant.stock.toString() })}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            {selectedVariant && (
              <div className="flex items-center gap-2">
                {selectedVariant.stock > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t('product.inStock')}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {t('product.outOfStock')}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor || !selectedVariant || selectedVariant.stock === 0}
                className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('product.addToCart')}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!selectedSize || !selectedColor || !selectedVariant || selectedVariant.stock === 0}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('product.buyNow')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
