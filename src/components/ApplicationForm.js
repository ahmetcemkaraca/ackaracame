import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { FileService } from '../firebase/services';
import LoadingSpinner from '../components/LoadingSpinner';

const ApplicationForm = ({ application, onClose }) => {
    const { createApplication, updateApplication } = useProject();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        version: '',
        type: '',
        iconName: '',
        image: '',
        description: '',
        techStack: [],
        link: '',
        linkText: '',
        accountDeletionEnabled: false
    });

    const [newTechName, setNewTechName] = useState('');
    const [newTechColor, setNewTechColor] = useState('bg-blue-500');

    useEffect(() => {
        if (application) {
            setFormData({
                title: application.title || '',
                version: application.version || '',
                type: application.type || '',
                iconName: application.iconName || '',
                image: application.image || '',
                description: application.description || '',
                techStack: application.techStack || [],
                link: application.link || '',
                linkText: application.linkText || '',
                accountDeletionEnabled: Boolean(application.accountDeletionEnabled)
            });
        }
    }, [application]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const url = await FileService.uploadImage(files[0], 'applications');

            setFormData(prev => ({
                ...prev,
                image: url
            }));
        } catch (error) {
            console.error('Görsel yükleme hatası:', error);
            alert('Görsel yüklenirken hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            image: ''
        }));
    };

    const addTechnology = () => {
        if (newTechName.trim()) {
            setFormData(prev => ({
                ...prev,
                techStack: [...prev.techStack, { name: newTechName.trim(), color: newTechColor }]
            }));
            setNewTechName('');
        }
    };

    const removeTechnology = (index) => {
        setFormData(prev => ({
            ...prev,
            techStack: prev.techStack.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (application) {
                await updateApplication(application.id, formData);
            } else {
                await createApplication(formData);
            }
            onClose();
        } catch (error) {
            console.error('Uygulama kaydetme hatası:', error);
            alert('Uygulama kaydedilirken hata oluştu.');
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
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <div className="p-6 border-b border-secondary-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-secondary-800">
                            {application ? 'Uygulama Düzenle' : 'Yeni Uygulama'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-secondary-500 hover:text-secondary-700 transition-colors duration-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Temel Bilgiler */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">Başlık *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">Versiyon *</label>
                            <input type="text" name="version" value={formData.version} onChange={handleInputChange} className="input-field" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">Platform/Tür (örn: iOS / Android, Web App)</label>
                            <input type="text" name="type" value={formData.type} onChange={handleInputChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">İkon Adı (Lucide React, örn: Monitor, Smartphone)</label>
                            <input type="text" name="iconName" value={formData.iconName} onChange={handleInputChange} className="input-field" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Açıklama *</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="input-field" required />
                    </div>

                    {/* Görsel */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Uygulama Görseli</label>
                        <div className="mb-4">
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                            <label htmlFor="image-upload" className="btn-secondary cursor-pointer inline-flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>{uploading ? 'Yükleniyor...' : 'Görsel Yükle'}</span>
                            </label>
                        </div>
                        {formData.image && (
                            <div className="relative group w-1/2">
                                <img src={formData.image} alt="Uygulama görseli" className="w-full h-32 object-cover rounded-lg" />
                                <button type="button" onClick={removeImage} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Link */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">Bağlantı URL *</label>
                            <input type="text" name="link" value={formData.link} onChange={handleInputChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">Bağlantı Metni *</label>
                            <input type="text" name="linkText" value={formData.linkText} onChange={handleInputChange} className="input-field" required />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border border-secondary-200 p-4">
                        <input
                            type="checkbox"
                            checked={formData.accountDeletionEnabled}
                            onChange={(e) => setFormData((prev) => ({ ...prev, accountDeletionEnabled: e.target.checked }))}
                        />
                        <div>
                            <p className="text-sm font-medium text-secondary-800">Hesap silme sayfasinda goster</p>
                            <p className="text-xs text-secondary-500">Bu uygulama hesap silme taleplerinde secilebilir olsun.</p>
                        </div>
                    </label>

                    {/* Teknolojiler */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Teknolojiler</label>

                        <div className="flex space-x-2 mb-3">
                            <input
                                type="text"
                                value={newTechName}
                                onChange={(e) => setNewTechName(e.target.value)}
                                placeholder="Örn: React Native"
                                className="input-field flex-1"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                            />
                            <select
                                value={newTechColor}
                                onChange={(e) => setNewTechColor(e.target.value)}
                                className="input-field w-32"
                            >
                                <option value="bg-blue-500">Mavi</option>
                                <option value="bg-cyan-400">Turkuaz</option>
                                <option value="bg-green-500">Yeşil</option>
                                <option value="bg-yellow-400">Sarı</option>
                                <option value="bg-orange-500">Turuncu</option>
                                <option value="bg-purple-500">Mor</option>
                                <option value="bg-red-500">Kırmızı</option>
                                <option value="bg-white">Beyaz</option>
                            </select>
                            <button type="button" onClick={addTechnology} className="btn-secondary" >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {formData.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.techStack.map((tech, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center space-x-2"
                                    >
                                        <span className={`w-2 h-2 rounded-full ${tech.color}`}></span>
                                        <span>{tech.name}</span>
                                        <button type="button" onClick={() => removeTechnology(index)} className="text-primary-600 hover:text-primary-800">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Butonlar */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-secondary-200">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                            İptal
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <LoadingSpinner size="small" text="" /> : (application ? 'Güncelle' : 'Oluştur')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ApplicationForm;
