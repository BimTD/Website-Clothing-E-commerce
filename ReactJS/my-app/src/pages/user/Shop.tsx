import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
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

interface Category {
  id: number;
  ten: string;
}

interface Brand {
  id: number;
  ten: string;
}

const Shop: React.FC = () => {
  const { t } = useLanguage();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(12);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  const [selectedGender, setSelectedGender] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
  }, [currentPage, searchTerm, selectedCategory, selectedBrand, selectedGender, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        search: searchTerm,
        ...(selectedCategory && { categoryId: selectedCategory.toString() }),
        ...(selectedBrand && { brandId: selectedBrand.toString() }),
        ...(selectedGender !== undefined && { gender: selectedGender.toString() }),
        sortBy,
        sortOrder: 'desc'
      });

      const response = await axios.get(`http://localhost:8080/api/user/products?${params}`);
      setProducts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/categories');
      setCategories(response.data.content || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/brands');
      setBrands(response.data.content || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const handleCategoryChange = (categoryId: number | undefined) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0);
  };

  const handleBrandChange = (brandId: number | undefined) => {
    setSelectedBrand(brandId);
    setCurrentPage(0);
  };

  const handleGenderChange = (gender: number | undefined) => {
    setSelectedGender(gender);
    setCurrentPage(0);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(undefined);
    setSelectedBrand(undefined);
    setSelectedGender(undefined);
    setSortBy('newest');
    setCurrentPage(0);
  };

  const getGenderText = (gender?: number) => {
    switch (gender) {
      case 0: return t('product.gender.male');
      case 1: return t('product.gender.female');
      case 2: return t('product.gender.unisex');
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('shop.title')}
          </h1>
          <p className="text-gray-600">
            {t('shop.subtitle', { count: totalElements.toString() })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-soft p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t('shop.filters')}
              </h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shop.search')}
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="form-input"
                  placeholder={t('shop.searchPlaceholder')}
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shop.category')}
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => handleCategoryChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="form-input"
                >
                  <option value="">{t('shop.allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.ten}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shop.brand')}
                </label>
                <select
                  value={selectedBrand || ''}
                  onChange={(e) => handleBrandChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="form-input"
                >
                  <option value="">{t('shop.allBrands')}</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.ten}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shop.gender')}
                </label>
                <select
                  value={selectedGender !== undefined ? selectedGender : ''}
                  onChange={(e) => handleGenderChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="form-input"
                >
                  <option value="">{t('shop.allGenders')}</option>
                  <option value="0">{t('product.gender.male')}</option>
                  <option value="1">{t('product.gender.female')}</option>
                  <option value="2">{t('product.gender.unisex')}</option>
                </select>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shop.sortBy')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="form-input"
                >
                  <option value="newest">{t('shop.sort.newest')}</option>
                  <option value="oldest">{t('shop.sort.oldest')}</option>
                  <option value="price_low">{t('shop.sort.priceLow')}</option>
                  <option value="price_high">{t('shop.sort.priceHigh')}</option>
                  <option value="name">{t('shop.sort.name')}</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {t('shop.clearFilters')}
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('common.loading')}</p>
                </div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.previous')}
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                            currentPage === page
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page + 1}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.next')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {t('shop.noProducts')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('shop.noProductsDescription')}
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  {t('shop.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;




