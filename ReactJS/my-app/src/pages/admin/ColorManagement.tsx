import React from 'react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { colorAPI } from '@/services/colorApi';
import { Color, ColorFilters } from '@/types/color';
import { useLanguage } from '@/context/LanguageContext';
import { 
  MessageAlert, 
  PageTitle, 
  SimpleForm, 
  SearchBar, 
  DataTable, 
  Pagination 
} from '@/components/common';

const ColorManagement: React.FC = () => {
  const { t } = useLanguage();
  
  const {
    data: colors,
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
  } = useCrudOperations<Color, ColorFilters>({
    api: colorAPI,
    entityName: 'màu sắc',
    enableFormData: true,
    initialFilters: {
      loaiId: undefined
    }
  });

  const handleEditSubmit = async (item: Color) => {
    await handleUpdate(item.id, { 
      maMau: item.maMau, 
      loaiId: item.loaiId 
    });
  };

  const handleEditChange = (updatedItem: Color) => {
    updateEditingItem(updatedItem);
  };

  const handleSearchSubmit = () => {
    handleSearch(searchTerm);
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    const colorData = { 
      maMau: data.maMau, 
      loaiId: parseInt(data.loaiId) 
    };
    return await handleCreate(colorData);
  };

  const columns = [
    {
      key: 'id' as keyof Color,
      title: '#',
      render: (_: any, __: Color, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'maMau' as keyof Color,
      title: t('color.code'),
      editable: true
    },
    {
      key: 'loaiTen' as keyof Color,
      title: t('color.category'),
      render: (value: string) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'actions' as keyof Color,
      title: t('common.actions')
    }
  ];

  const formFields = [
    {
      name: 'maMau',
      label: t('color.code'),
      type: 'text' as const,
      placeholder: t('color.codePlaceholder'),
      required: true
    },
    {
      name: 'loaiId',
      label: t('color.category'),
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
      <PageTitle title={t('admin.colors')} />

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
              placeholder={t('color.searchPlaceholder')}
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
            {t('color.filters.reset')}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <DataTable
          data={colors}
          columns={columns}
          loading={loading}
          onEdit={startEdit}
          onDelete={handleDelete}
          onEditSubmit={handleEditSubmit}
          onEditChange={handleEditChange}
          editingItem={editingItem}
          emptyMessage={t('color.emptyMessage')}
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
          {t('color.addNew')}
        </h3>
        <SimpleForm
          title={t('color.addNew')}
          fields={formFields}
          onSubmit={handleFormSubmit}
          submitText={t('color.add')}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ColorManagement;
