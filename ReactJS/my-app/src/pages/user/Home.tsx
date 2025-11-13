import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import ProductCard from '@/components/user/ProductCard';
import axios from 'axios';

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

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = (): void => {
    logout();
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load featured products
      const featuredResponse = await axios.get('http://localhost:8080/api/user/products/featured?size=8');
      setFeaturedProducts(featuredResponse.data.content || []);
      
      // Load new products
      const newResponse = await axios.get('http://localhost:8080/api/user/products/new?size=8');
      setNewProducts(newResponse.data.content || []);
      
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllProducts = () => {
    navigate(ROUTES.SHOP);
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

  return (
    <div className="bg-white min-h-screen">
      {/* Featured Products */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.featuredProducts')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('home.featuredProductsDescription')}
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('home.noProducts')}
              </h3>
              <p className="text-gray-600">
                {t('home.noProductsDescription')}
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleViewAllProducts}
              className="btn-primary"
            >
              {t('home.viewAllProducts')}
            </button>
          </div>
        </div>
      </div>

      {/* New Products */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.newProducts')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('home.newProductsDescription')}
            </p>
          </div>

          {newProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {newProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('home.noNewProducts')}
              </h3>
              <p className="text-gray-600">
                {t('home.noNewProductsDescription')}
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleViewAllProducts}
              className="btn-primary"
            >
              {t('home.viewAllProducts')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;