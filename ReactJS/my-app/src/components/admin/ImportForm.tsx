import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ImportFormData, ImportRequest } from '@/types/import';
import { importAPI } from '@/services/importApi';

interface ImportFormProps {
  onSubmit: (importRequest: ImportRequest) => Promise<boolean>;
  loading?: boolean;
}

interface ImportDetail {
  variantId: number;
  quantity: number;
  importPrice: number;
}

const ImportForm: React.FC<ImportFormProps> = ({ onSubmit, loading = false }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ImportFormData | null>(null);
  const [loadingFormData, setLoadingFormData] = useState(true);
  
  // Form state
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [details, setDetails] = useState<ImportDetail[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load form data
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoadingFormData(true);
        const data = await importAPI.getFormData();
        setFormData(data);
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoadingFormData(false);
      }
    };

    loadFormData();
  }, []);

  // Add new detail row
  const addDetail = () => {
    setDetails([...details, { variantId: 0, quantity: 1, importPrice: 0 }]);
  };

  // Remove detail row
  const removeDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // Update detail
  const updateDetail = (index: number, field: keyof ImportDetail, value: number) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setDetails(newDetails);
  };

  // Calculate total amount
  const calculateTotal = () => {
    return details.reduce((total, detail) => {
      return total + (detail.quantity * detail.importPrice);
    }, 0);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierId || details.length === 0) {
      alert(t('import.validation.requiredFields'));
      return;
    }

    // Validate details
    const hasInvalidDetails = details.some(detail => 
      detail.variantId === 0 || detail.quantity <= 0 || detail.importPrice <= 0
    );
    
    if (hasInvalidDetails) {
      alert(t('import.validation.invalidDetails'));
      return;
    }

    try {
      setIsSubmitting(true);
      const importRequest: ImportRequest = {
        supplierId: Number(supplierId),
        note: note.trim() || undefined,
        details: details.map(detail => ({
          variantId: detail.variantId,
          quantity: detail.quantity,
          importPrice: detail.importPrice
        }))
      };

      const success = await onSubmit(importRequest);
      if (success) {
        // Reset form
        setSupplierId('');
        setNote('');
        setDetails([]);
      }
    } catch (error) {
      console.error('Error submitting import form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingFormData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Supplier Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('import.supplier')} <span className="text-red-500">*</span>
        </label>
        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : '')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">{t('import.selectSupplier')}</option>
          {formData?.suppliers?.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.ten}
            </option>
          ))}
        </select>
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('import.note')}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder={t('import.notePlaceholder')}
        />
      </div>

      {/* Import Details */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t('import.details')}
          </h3>
          <button
            type="button"
            onClick={addDetail}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('import.addDetail')}
          </button>
        </div>

        {details.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            {t('import.noDetails')}
          </div>
        ) : (
          <div className="space-y-4">
            {details.map((detail, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                {/* Variant Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('import.variant')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={detail.variantId}
                    onChange={(e) => updateDetail(index, 'variantId', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>{t('import.selectVariant')}</option>
                    {formData?.variants?.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.variantInfo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('import.quantity')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={detail.quantity}
                    onChange={(e) => updateDetail(index, 'quantity', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Import Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('import.importPrice')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={detail.importPrice}
                    onChange={(e) => updateDetail(index, 'importPrice', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeDetail(index)}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total Amount */}
      {details.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">
              {t('import.totalAmount')}:
            </span>
            <span className="text-xl font-bold text-blue-600">
              {calculateTotal().toLocaleString('vi-VN')} ₫
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {
            setSupplierId('');
            setNote('');
            setDetails([]);
          }}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t('common.reset')}
        </button>
        <button
          type="submit"
          disabled={loading || isSubmitting || !supplierId || details.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading || isSubmitting ? t('common.loading') : t('import.create')}
        </button>
      </div>
    </form>
  );
};

export default ImportForm;
