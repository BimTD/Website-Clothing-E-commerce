import React from 'react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { sizeAPI } from '@/services/sizeApi';
import { Size, SizeFilters } from '@/types/size';
import { useLanguage } from '@/context/LanguageContext';
import { 
  MessageAlert, 
  PageTitle, 
  SimpleForm, 
  SearchBar, 
  DataTable, 
  Pagination 
} from '@/components/common';

const SizeManagement: React.FC = () => {
  const { t } = useLanguage();
  
  const {
    data: sizes,
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
  } = useCrudOperations<Size, SizeFilters>({
    api: sizeAPI,
    entityName: 'kích cỡ',
    enableFormData: true,
    initialFilters: {
      loaiId: undefined
    }
  });

  const handleEditSubmit = async (item: Size) => {
    await handleUpdate(item.id, { 
      tenSize: item.tenSize, 
      loaiId: item.loaiId 
    });
  };

  const handleEditChange = (updatedItem: Size) => {
    updateEditingItem(updatedItem);
  };

  const handleSearchSubmit = () => {
    handleSearch(searchTerm);
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    const sizeData = { 
      tenSize: data.tenSize, 
      loaiId: parseInt(data.loaiId) 
    };
    return await handleCreate(sizeData);
  };

  const columns = [
    {
      key: 'id' as keyof Size,
      title: '#',
      render: (_: any, __: Size, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'tenSize' as keyof Size,
      title: t('size.name'),
      editable: true
    },
    {
      key: 'loaiTen' as keyof Size,
      title: t('size.category'),
      render: (value: string) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'actions' as keyof Size,
      title: t('common.actions')
    }
  ];

  const formFields = [
    {
      name: 'tenSize',
      label: t('size.name'),
      type: 'text' as const,
      placeholder: t('size.namePlaceholder'),
      required: true
    },
    {
      name: 'loaiId',
      label: t('size.category'),
      type: 'select' as const,
      required: true,
      options: formData?.loais?.map((category: any) => ({
        value: category.id.toString(),
        label: category.ten
      })) || []
    }
  ];

  return (
    <div className="space-y-6">
      <PageTitle title={t('admin.sizes')} />

      {message && (
        <MessageAlert 
          message={message} 
        />
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="md:col-span-2">
            <SearchBar
              placeholder={t('size.searchPlaceholder')}
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
            {t('size.filters.reset')}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <DataTable
          data={sizes}
          columns={columns}
          loading={loading}
          onEdit={startEdit}
          onDelete={handleDelete}
          onEditSubmit={handleEditSubmit}
          onEditChange={handleEditChange}
          editingItem={editingItem}
          emptyMessage={t('size.emptyMessage')}
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
          {t('size.addNew')}
        </h3>
        <SimpleForm
          title={t('size.addNew')}
          fields={formFields}
          onSubmit={handleFormSubmit}
          submitText={t('size.add')}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default SizeManagement;
