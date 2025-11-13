import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Product, ProductFormData } from '@/types/product';
import { productAPI } from '@/services/productApi';
import api from '@/services/api';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Omit<Product, 'id'>, imageUrls: string) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    ten: '',
    moTa: '',
    giaBan: 0,
    giaNhap: 0,
    khuyenMai: 0,
    tag: '',
    huongDan: '',
    thanhPhan: '',
    trangThaiSanPham: '',
    trangThaiHoatDong: true,
    gioiTinh: 0,
    loaiId: 0,
    nhanHieuId: 0,
    nhaCungCapId: 0
  });
  const [formDataOptions, setFormDataOptions] = useState<ProductFormData>({
    loais: [],
    nhanHieus: [],
    nhaCungCaps: []
  });
  
  // Debug logging
  console.log('FormDataOptions:', formDataOptions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ten: product.ten || '',
        moTa: product.moTa || '',
        giaBan: product.giaBan || 0,
        giaNhap: product.giaNhap || 0,
        khuyenMai: product.khuyenMai || 0,
        tag: product.tag || '',
        huongDan: product.huongDan || '',
        thanhPhan: product.thanhPhan || '',
        trangThaiSanPham: product.trangThaiSanPham || '',
        trangThaiHoatDong: product.trangThaiHoatDong ?? true,
        gioiTinh: product.gioiTinh || 0,
        loaiId: product.loaiId || 0,
        nhanHieuId: product.nhanHieuId || 0,
        nhaCungCapId: product.nhaCungCapId || 0
      });
    }
  }, [product]);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        console.log('Loading form data...');
        const data = await productAPI.getFormData();
        console.log('Form data loaded:', data);
        setFormDataOptions(data);
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    loadFormData();
  }, []);

  const handleInputChange = (field: keyof Omit<Product, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return uploadedImageUrls;

    setUploading(true);
    try {
      const formData = new FormData();
      selectedImages.forEach(file => {
        formData.append('files', file);
      });
      formData.append('folder', 'products');

      const response = await api.post('/images/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Upload images first
      const imageUrls = await uploadImages();
      const allImageUrls = [...uploadedImageUrls, ...imageUrls];
      
      const success = await onSubmit(formData, allImageUrls.join(','));
      if (success) {
        // Reset form if creating new product
        if (!product) {
          setFormData({
            ten: '',
            moTa: '',
            giaBan: 0,
            giaNhap: 0,
            khuyenMai: 0,
            tag: '',
            huongDan: '',
            thanhPhan: '',
            trangThaiSanPham: '',
            trangThaiHoatDong: true,
            gioiTinh: 0,
            loaiId: 0,
            nhanHieuId: 0,
            nhaCungCapId: 0
          });
          setSelectedImages([]);
          setUploadedImageUrls([]);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        {product ? t('product.editTitle') : t('product.addTitle')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ten}
              onChange={(e) => handleInputChange('ten', e.target.value)}
              placeholder={t('product.namePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.category')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.loaiId}
              onChange={(e) => handleInputChange('loaiId', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={0}>Chọn danh mục</option>
              {formDataOptions.loais && formDataOptions.loais.length > 0 ? (
                formDataOptions.loais.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.ten}
                  </option>
                ))
              ) : (
                <option disabled>Đang tải danh mục...</option>
              )}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {t('product.description')}
          </label>
          <textarea
            value={formData.moTa}
            onChange={(e) => handleInputChange('moTa', e.target.value)}
            placeholder={t('product.descriptionPlaceholder')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.price')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.giaBan}
              onChange={(e) => handleInputChange('giaBan', parseFloat(e.target.value) || 0)}
              placeholder={t('product.pricePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.costPrice')}
            </label>
            <input
              type="number"
              value={formData.giaNhap}
              onChange={(e) => handleInputChange('giaNhap', parseFloat(e.target.value) || 0)}
              placeholder={t('product.costPricePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.discount')}
            </label>
            <input
              type="number"
              value={formData.khuyenMai}
              onChange={(e) => handleInputChange('khuyenMai', parseFloat(e.target.value) || 0)}
              placeholder={t('product.discountPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Brand and Supplier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.brand')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.nhanHieuId}
              onChange={(e) => handleInputChange('nhanHieuId', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={0}>Chọn thương hiệu</option>
              {formDataOptions.nhanHieus && formDataOptions.nhanHieus.length > 0 ? (
                formDataOptions.nhanHieus.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.ten}
                  </option>
                ))
              ) : (
                <option disabled>Đang tải thương hiệu...</option>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.supplier')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.nhaCungCapId}
              onChange={(e) => handleInputChange('nhaCungCapId', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={0}>Chọn nhà cung cấp</option>
              {formDataOptions.nhaCungCaps && formDataOptions.nhaCungCaps.length > 0 ? (
                formDataOptions.nhaCungCaps.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.ten}
                  </option>
                ))
              ) : (
                <option disabled>Đang tải nhà cung cấp...</option>
              )}
            </select>
          </div>
        </div>

        {/* Gender and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.gender')}
            </label>
            <select
              value={formData.gioiTinh}
              onChange={(e) => handleInputChange('gioiTinh', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>{t('product.filters.unisex')}</option>
              <option value={1}>{t('product.filters.male')}</option>
              <option value={2}>{t('product.filters.female')}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.status')}
            </label>
            <input
              type="text"
              value={formData.trangThaiSanPham}
              onChange={(e) => handleInputChange('trangThaiSanPham', e.target.value)}
              placeholder={t('product.statusPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.tag')}
            </label>
            <input
              type="text"
              value={formData.tag}
              onChange={(e) => handleInputChange('tag', e.target.value)}
              placeholder={t('product.tagPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.active')}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.trangThaiHoatDong}
                onChange={(e) => handleInputChange('trangThaiHoatDong', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {formData.trangThaiHoatDong ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions and Ingredients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.instruction')}
            </label>
            <textarea
              value={formData.huongDan}
              onChange={(e) => handleInputChange('huongDan', e.target.value)}
              placeholder={t('product.instructionPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('product.ingredients')}
            </label>
            <textarea
              value={formData.thanhPhan}
              onChange={(e) => handleInputChange('thanhPhan', e.target.value)}
              placeholder={t('product.ingredientsPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            {t('product.images.title')}
          </label>
          
          {/* Image Upload Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-gray-400">📷</span>
              </div>
              <div className="text-xs text-gray-500">
                {t('product.images.fileTypes')}
              </div>
            </label>
          </div>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                       onClick={() => {
                         const newFiles = selectedImages.filter((_, i) => i !== index);
                         setSelectedImages(newFiles);
                       }}>
                    ×
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Images Display */}
          {uploadedImageUrls.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">{t('product.images.uploadedImages')}:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                         onClick={() => {
                           const newUrls = uploadedImageUrls.filter((_, i) => i !== index);
                           setUploadedImageUrls(newUrls);
                         }}
                         title={t('product.images.removeImage')}>
                      ×
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading || isSubmitting}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading || isSubmitting || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {uploading ? t('product.images.uploading') : t('common.loading')}
              </>
            ) : (
              <>
                <span>{product ? '✏️' : '+'}</span>
                {product ? t('common.save') : t('common.add')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
