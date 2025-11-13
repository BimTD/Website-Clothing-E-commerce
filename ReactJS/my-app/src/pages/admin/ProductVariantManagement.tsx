import React from 'react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { productVariantAPI } from '@/services/productVariantApi';
import { ProductVariant, ProductVariantFilters } from '@/types/productVariant';
import { useLanguage } from '@/context/LanguageContext';
import { 
  MessageAlert, 
  PageTitle, 
  SimpleForm, 
  SearchBar, 
  DataTable, 
  Pagination 
} from '@/components/common';

const ProductVariantManagement: React.FC = () => {
  const { t } = useLanguage();
  
  const {
    data: variants,
    formData,
    loading,
    message,
    editingItem,
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
    handleSearch,
    handleResetSearch,
    handleResetFilters,
    handlePageChange,
    handlePageSizeChange,
    startEdit,
    cancelEdit,
    updateEditingItem
  } = useCrudOperations<ProductVariant, ProductVariantFilters>({
    api: productVariantAPI,
    entityName: 'biến thể sản phẩm',
    enableFormData: true,
    initialFilters: {
      sanPhamId: undefined,
      mauSacId: undefined,
      sizeId: undefined
    }
  });

  const handleEditSubmit = async (item: ProductVariant) => {
    await handleUpdate(item.id, { 
      soLuongTon: item.soLuongTon,
      sanPhamId: item.sanPhamId,
      mauSacId: item.mauSacId,
      sizeId: item.sizeId
    });
  };

  const handleEditChange = (updatedItem: ProductVariant) => {
    updateEditingItem(updatedItem);
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    const variantData = { 
      soLuongTon: parseInt(data.soLuongTon),
      sanPhamId: parseInt(data.sanPhamId),
      mauSacId: parseInt(data.mauSacId),
      sizeId: parseInt(data.sizeId)
    };
    return await handleCreate(variantData);
  };

  const columns = [
    {
      key: 'id' as keyof ProductVariant,
      title: '#',
      render: (_: any, __: ProductVariant, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'sanPhamTen' as keyof ProductVariant,
      title: t('variant.product'),
      render: (value: string) => (
        <span className="font-medium text-gray-900">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'mauSacTen' as keyof ProductVariant,
      title: t('variant.color'),
      render: (value: string) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'sizeTen' as keyof ProductVariant,
      title: t('variant.size'),
      render: (value: string) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'soLuongTon' as keyof ProductVariant,
      title: t('variant.stock'),
      render: (value: number) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value > 10 ? 'bg-green-100 text-green-800' : 
          value > 0 ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {value || 0}
        </span>
      ),
      editable: true
    },
    {
      key: 'actions' as keyof ProductVariant,
      title: t('common.actions')
    }
  ];

  const formFields = [
    {
      name: 'sanPhamId',
      label: t('variant.product'),
      type: 'select' as const,
      required: true,
      options: formData?.sanPhams?.map((product: any) => ({
        value: product.id.toString(),
        label: product.ten
      })) || []
    },
    {
      name: 'mauSacId',
      label: t('variant.color'),
      type: 'select' as const,
      required: true,
      options: formData?.mauSacs?.map((color: any) => ({
        value: color.id.toString(),
        label: color.ten
      })) || []
    },
    {
      name: 'sizeId',
      label: t('variant.size'),
      type: 'select' as const,
      required: true,
      options: formData?.sizes?.map((size: any) => ({
        value: size.id.toString(),
        label: size.ten
      })) || []
    },
    {
      name: 'soLuongTon',
      label: t('variant.stock'),
      type: 'number' as const,
      placeholder: t('variant.stockPlaceholder'),
      required: true
    }
  ];

  return (
    <div className="space-y-6">
      <PageTitle title={t('admin.variants')} />

      {message && (
        <MessageAlert 
          message={message} 
        />
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> 
          <div className="md:col-span-2">
              <SearchBar
              placeholder={t('variant.searchPlaceholder')}
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
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('variant.filters.reset')}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <DataTable
          data={variants}
          columns={columns}
          loading={loading}
          onEdit={startEdit}
          onDelete={handleDelete}
          onEditSubmit={handleEditSubmit}
          onEditChange={handleEditChange}
          editingItem={editingItem}
          emptyMessage={t('variant.emptyMessage')}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Add Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('variant.addNew')}
        </h3>
        <SimpleForm
          title={t('variant.addNew')}
          fields={formFields}
          onSubmit={handleFormSubmit}
          submitText={t('variant.add')}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ProductVariantManagement;
