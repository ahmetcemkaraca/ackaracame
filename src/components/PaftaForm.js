import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus, Trash2, QrCode } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { FileService } from '../firebase/services';
import LoadingSpinner from '../components/LoadingSpinner';
import QRCodeGenerator from './QRCodeGenerator';

const PaftaForm = ({ pafta, onClose }) => {
  const { createPafta, updatePafta } = useProject();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    aiData: {
      tools: [],
      prompts: [],
      models: [],
      parameters: {},
      results: [],
      processingTime: 0,
      accuracy: 0,
      notes: ''
    },
    semester: '',
    year: new Date().getFullYear().toString(),
    status: 'active',
    qrCodeData: '',
    blocks: []
  });

  const [newTool, setNewTool] = useState({ name: '', purpose: '' });
  const [newPrompt, setNewPrompt] = useState('');
  const [newModel, setNewModel] = useState({ name: '', version: '', description: '' });
  const [newParameter, setNewParameter] = useState({ key: '', value: '' });
  const [newResult, setNewResult] = useState({ title: '', description: '', metrics: {} });

  useEffect(() => {
    if (pafta) {
      setFormData({
        title: pafta.title || '',
        description: pafta.description || '',
        images: pafta.images || [],
        aiData: pafta.aiData || {
          tools: [],
          prompts: [],
          models: [],
          parameters: {},
          results: [],
          processingTime: 0,
          accuracy: 0,
          notes: ''
        },
        semester: pafta.semester || '',
        year: pafta.year || new Date().getFullYear().toString(),
        status: pafta.status || 'active',
        qrCodeData: pafta.qrCodeData || ''
      });
    } else {
      // Yeni pafta için benzersiz QR kod verisi oluştur
      const qrData = `pafta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setFormData(prev => ({ ...prev, qrCodeData: qrData }));
    }
  }, [pafta]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAIDataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      aiData: {
        ...prev.aiData,
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        FileService.uploadImage(file, 'paftas')
      );
      const urls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('Görsel yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTool = () => {
    if (newTool.name.trim() && newTool.purpose.trim()) {
      handleAIDataChange('tools', [...formData.aiData.tools, { ...newTool }]);
      setNewTool({ name: '', purpose: '' });
    }
  };

  const removeTool = (index) => {
    const tools = formData.aiData.tools.filter((_, i) => i !== index);
    handleAIDataChange('tools', tools);
  };

  const addPrompt = () => {
    if (newPrompt.trim()) {
      handleAIDataChange('prompts', [...formData.aiData.prompts, newPrompt.trim()]);
      setNewPrompt('');
    }
  };

  const removePrompt = (index) => {
    const prompts = formData.aiData.prompts.filter((_, i) => i !== index);
    handleAIDataChange('prompts', prompts);
  };

  const addModel = () => {
    if (newModel.name.trim()) {
      handleAIDataChange('models', [...formData.aiData.models, { ...newModel }]);
      setNewModel({ name: '', version: '', description: '' });
    }
  };

  const removeModel = (index) => {
    const models = formData.aiData.models.filter((_, i) => i !== index);
    handleAIDataChange('models', models);
  };

  const addParameter = () => {
    if (newParameter.key.trim() && newParameter.value.trim()) {
      const parameters = { ...formData.aiData.parameters };
      parameters[newParameter.key] = newParameter.value;
      handleAIDataChange('parameters', parameters);
      setNewParameter({ key: '', value: '' });
    }
  };

  const removeParameter = (key) => {
    const parameters = { ...formData.aiData.parameters };
    delete parameters[key];
    handleAIDataChange('parameters', parameters);
  };

  const addResult = () => {
    if (newResult.title.trim()) {
      handleAIDataChange('results', [...formData.aiData.results, { ...newResult }]);
      setNewResult({ title: '', description: '', metrics: {} });
    }
  };

  const removeResult = (index) => {
    const results = formData.aiData.results.filter((_, i) => i !== index);
    handleAIDataChange('results', results);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (pafta) {
        await updatePafta(pafta.id, formData);
      } else {
        await createPafta(formData);
      }
      onClose();
    } catch (error) {
      console.error('Pafta kaydetme hatası:', error);
      alert('Pafta kaydedilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {pafta ? 'Pafta Düzenle' : 'Yeni Pafta'}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQR(!showQR)}
                className="btn-secondary flex items-center space-x-2"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Kod</span>
              </button>
              <button
                onClick={onClose}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {showQR && (
            <div className="mb-6">
              <QRCodeGenerator 
                data={`${window.location.origin}/pafta/${formData.qrCodeData}`}
                title={formData.title || 'pafta'}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pafta Başlığı *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Açıklama *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                required
              />
            </div>

            {/* Görseller */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pafta Görselleri
              </label>
              
              <div className="mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="pafta-image-upload"
                />
                <label
                  htmlFor="pafta-image-upload"
                  className="btn-secondary cursor-pointer inline-flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Yükleniyor...' : 'Görsel Yükle'}</span>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Pafta görseli ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Araçları */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-secondary-800">
                AI Araçları
              </h3>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTool.name}
                    onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Araç adı"
                    className="input-field flex-1"
                  />
                  <input
                    type="text"
                    value={newTool.purpose}
                    onChange={(e) => setNewTool(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="Kullanım amacı"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={addTool}
                    className="btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {formData.aiData.tools.map((tool, index) => (
                  <div key={index} className="p-3 bg-secondary-50 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-medium">{tool.name}</span>
                      <span className="text-secondary-600 ml-2">- {tool.purpose}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTool(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Parametreleri */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-secondary-800">
                AI Parametreleri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    İşlem Süresi (dakika)
                  </label>
                  <input
                    type="number"
                    value={formData.aiData.processingTime}
                    onChange={(e) => handleAIDataChange('processingTime', parseInt(e.target.value) || 0)}
                    className="input-field"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Doğruluk Oranı (%)
                  </label>
                  <input
                    type="number"
                    value={formData.aiData.accuracy}
                    onChange={(e) => handleAIDataChange('accuracy', parseInt(e.target.value) || 0)}
                    className="input-field"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  AI Notları
                </label>
                <textarea
                  value={formData.aiData.notes}
                  onChange={(e) => handleAIDataChange('notes', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="AI kullanımı hakkında ek notlar..."
                />
              </div>
            </div>

            {/* Dönem Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Dönem
                </label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="2023-2024 Güz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Yıl
                </label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-secondary-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  pafta ? 'Güncelle' : 'Oluştur'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaftaForm;
