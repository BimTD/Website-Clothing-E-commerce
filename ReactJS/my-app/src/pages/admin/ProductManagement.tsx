import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Product, ProductFilters } from '@/types/product';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { productAPI } from '@/services/productApi';
import { 
  MessageAlert, 
  PageTitle, 
  SearchBar, 
  DataTable, 
  Pagination 
} from '@/components/common';
import ProductForm from '@/components/admin/ProductForm';

const ProductManagement: React.FC = () => {
  const { t } = useLanguage();
  
  // Use custom hook for product operations
  const {
    data: products,
    formData,
    loading,
    message,
    editingItem: editingProduct,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    searchTerm,
    filters,
    updateFilter,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive,
    handleSearch,
    handleResetSearch,
    handleResetFilters,
    handlePageChange,
    handlePageSizeChange,
    startEdit,
    cancelEdit
  } = useCrudOperations<Product, ProductFilters>({
    api: productAPI,
    entityName: 'sản phẩm',
    enableFormData: true,
    initialFilters: {
      categoryId: undefined,
      gender: undefined
    }
  });
  
  // Local state for form visibility
  const [showForm, setShowForm] = React.useState(false);

  // Form handlers
  const handleEdit = (product: Product) => {
    startEdit(product);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    cancelEdit();
  };

  const handleFormSubmit = async (product: Omit<Product, 'id'>, imageUrls: string): Promise<boolean> => {
    const success = editingProduct 
      ? await handleUpdate(editingProduct.id, product, imageUrls)
      : await handleCreate(product, imageUrls);
    
    if (success) {
      setShowForm(false);
      cancelEdit();
    }
    
    return success;
  };

  const columns = [
    {
      key: 'id' as keyof Product,
      title: '#',
      render: (_: any, __: Product, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'hinhAnh' as keyof Product,
      title: t('product.image'),
      render: (value: string, product: Product) => {
        // Get first image from imageUrls or use hinhAnh
        const imageUrl = product.imageUrls ? product.imageUrls.split(',')[0] : product.hinhAnh;
        return (
          <div className="w-16 h-16 flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.ten}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.svg';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'ten' as keyof Product,
      title: t('product.name'),
      render: (value: string, product: Product) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{value}</div>
          <div className="text-sm text-gray-500 truncate">{product.moTa}</div>
        </div>
      )
    },
    {
      key: 'giaBan' as keyof Product,
      title: t('product.price'),
      render: (value: number) => (
        <span className="font-medium text-green-600">
          {new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }).format(value)}
        </span>
      )
    },
    {
      key: 'loaiId' as keyof Product,
      title: t('product.category'),
      render: (value: number) => {
        const category = formData?.loais?.find((cat: any) => cat.id === value);
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {category?.ten || 'N/A'}
          </span>
        );
      }
    },
    {
      key: 'nhanHieuId' as keyof Product,
      title: t('product.brand'),
      render: (value: number) => {
        const brand = formData?.nhanHieus?.find((b: any) => b.id === value);
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            {brand?.ten || 'N/A'}
          </span>
        );
      }
    },
    {
      key: 'gioiTinh' as keyof Product,
      title: t('product.gender'),
      render: (value: number) => {
        const genderMap = {
          0: t('product.filters.unisex'),
          1: t('product.filters.male'),
          2: t('product.filters.female')
        };
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
            {genderMap[value as keyof typeof genderMap] || 'N/A'}
          </span>
        );
      }
    },
    {
      key: 'trangThaiHoatDong' as keyof Product,
      title: t('product.status'),
      render: (value: boolean, product: Product) => (
        <button
          onClick={() => handleToggleActive(product.id, !value)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            value 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {value ? t('product.active') : t('product.inactive')}
        </button>
      )
    },
    {
      key: 'actions' as keyof Product,
      title: t('common.actions')
    }
  ];

  return (
    <div className="space-y-6">
      <PageTitle title={t('product.title')} subtitle={t('product.subtitle')} />
      
      <MessageAlert message={message} />
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('product.category')}
            </label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => updateFilter('categoryId', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('product.filters.allCategories')}</option>
              {formData?.loais && formData.loais.length > 0 ? (
                formData.loais.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.ten}
                  </option>
                ))
              ) : (
                <option disabled>Đang tải danh mục...</option>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('product.gender')}
            </label>
            <select
              value={filters.gender || ''}
              onChange={(e) => updateFilter('gender', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('product.filters.all')}</option>
              <option value="0">{t('product.filters.unisex')}</option>
              <option value="1">{t('product.filters.male')}</option>
              <option value="2">{t('product.filters.female')}</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <SearchBar
              placeholder={t('product.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearch}
              onSearch={() => {}} // handleSearch is already called in onChange
              onReset={handleResetSearch}
            />
          </div>
        </div>
        
        {/* Reset Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('product.filters.reset')}
          </button>
        </div>
      </div>

      {/* Add Product Button */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          {t('product.addTitle')}
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProductForm
              product={editingProduct || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('product.emptyMessage')}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default ProductManagement;