import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

interface SimpleFormProps {
  title: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<boolean>;
  loading?: boolean;
  submitText?: string;
  submitIcon?: string;
}

const SimpleForm: React.FC<SimpleFormProps> = ({
  title,
  fields,
  onSubmit,
  loading = false,
  submitText = 'Thêm',
  submitIcon = '+'
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        setFormData({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(field => (
            <div key={field.name} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={field.required}
                >
                  <option value="">Chọn {field.label.toLowerCase()}...</option>
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder || `${field.label}...`}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{submitIcon}</span>
            {isSubmitting ? t('common.loading') : submitText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleForm;


