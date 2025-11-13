import React from 'react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { categoryAPI } from '@/services/categoryApi';
import { Category } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';
import { 
  MessageAlert, 
  PageTitle, 
  SimpleForm, 
  SearchBar, 
  DataTable, 
  Pagination 
} from '@/components/common';

const CategoryManagement: React.FC = () => {
  const { t } = useLanguage();
  
  const {
    data: categories,
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
  } = useCrudOperations<Category>({
    api: categoryAPI,
    entityName: 'danh mục'
  });

  const handleEditSubmit = async (item: Category) => {
    await handleUpdate(item.id, { ten: item.ten });
  };

  const handleEditChange = (updatedItem: Category) => {
    updateEditingItem(updatedItem);
  };

  const handleSearchSubmit = () => {
    handleSearch(searchTerm);
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    const categoryData = { ten: data.ten };
    return await handleCreate(categoryData);
  };

  const columns = [
    {
      key: 'id' as keyof Category,
      title: '#',
      render: (_: any, __: Category, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'ten' as keyof Category,
      title: t('category.name'),
      editable: true
    },
    {
      key: 'actions' as keyof Category,
      title: t('common.actions')
    }
  ];

  const formFields = [
    {
      name: 'ten',
      label: t('category.name'),
      type: 'text' as const,
      placeholder: t('category.namePlaceholder'),
      required: true
    }
  ];

  return (
    <div className="space-y-6">
      <PageTitle title={t('category.title')} subtitle={t('category.subtitle')} />
      
      <MessageAlert message={message} />
      
      <SimpleForm
        title={t('category.addTitle')}
        fields={formFields}
        onSubmit={handleFormSubmit}
        loading={loading}
        submitText={t('common.add')}
        submitIcon="+"
      />
      
      <SearchBar
        placeholder={t('category.searchPlaceholder')}
        value={searchTerm}
        onChange={handleSearch}
        onSearch={handleSearchSubmit}
        onReset={handleResetSearch}
      />
      
      <DataTable
        data={categories}
        columns={columns}
        loading={loading}
        onEdit={startEdit}
        onDelete={handleDelete}
        editingItem={editingItem}
        onEditSubmit={handleEditSubmit}
        onEditCancel={cancelEdit}
        onEditChange={handleEditChange}
        emptyMessage={t('category.emptyMessage')}
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

export default CategoryManagement;

