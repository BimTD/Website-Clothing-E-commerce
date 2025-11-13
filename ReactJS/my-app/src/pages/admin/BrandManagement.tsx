import React from 'react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { brandAPI } from '@/services/brandApi';
import { Brand } from '@/types/brand';
import { useLanguage } from '@/context/LanguageContext';
import { 
  MessageAlert, 
  PageTitle, 
  SimpleForm, 
  SearchBar, 
  DataTable, 
  Pagination 
} from '@/components/common';

const BrandManagement: React.FC = () => {
  const { t } = useLanguage();
  
  const {
    data: brands,
    loading,
    message,
    editingItem,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    searchTerm,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSearch,
    handleResetSearch,
    handlePageChange,
    handlePageSizeChange,
    startEdit,
    cancelEdit,
    updateEditingItem
  } = useCrudOperations<Brand>({
    api: brandAPI,
    entityName: 'thương hiệu'
  });

  const handleEditSubmit = async (item: Brand) => {
    await handleUpdate(item.id!, { ten: item.ten });
  };

  const handleEditChange = (updatedItem: Brand) => {
    updateEditingItem(updatedItem);
  };

  const handleSearchSubmit = () => {
    handleSearch(searchTerm);
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    const brandData = { ten: data.ten };
    return await handleCreate(brandData);
  };

  const columns = [
    {
      key: 'id' as keyof Brand,
      title: '#',
      render: (_: any, __: Brand, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'ten' as keyof Brand,
      title: t('brand.name'),
      editable: true
    },
    {
      key: 'actions' as keyof Brand,
      title: t('common.actions')
    }
  ];

  const formFields = [
    {
      name: 'ten',
      label: t('brand.name'),
      type: 'text' as const,
      placeholder: t('brand.namePlaceholder'),
      required: true
    }
  ];

  return (
    <div className="space-y-6">
      <PageTitle title={t('brand.title')} subtitle={t('brand.subtitle')} />
      
      <MessageAlert message={message} />
      
      <SimpleForm
        title={t('brand.addTitle')}
        fields={formFields}
        onSubmit={handleFormSubmit}
        loading={loading}
        submitText={t('common.add')}
        submitIcon="+"
      />
      
      <SearchBar
        placeholder={t('brand.searchPlaceholder')}
        value={searchTerm}
        onChange={handleSearch}
        onSearch={handleSearchSubmit}
        onReset={handleResetSearch}
      />
      
      <DataTable
        data={brands}
        columns={columns}
        loading={loading}
        onEdit={startEdit}
        onDelete={handleDelete}
        editingItem={editingItem}
        onEditSubmit={handleEditSubmit}
        onEditCancel={cancelEdit}
        onEditChange={handleEditChange}
        emptyMessage={t('brand.emptyMessage')}
      />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default BrandManagement;
