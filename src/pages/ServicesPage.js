import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, Send } from 'lucide-react';
import { ContactService } from '../firebase/services'; // Assuming you'll use the same service

const ServicesPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', projectType: 'Residential', description: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSubmitted(false);

        try {
            await ContactService.sendMessage({ 
                ...formData, 
                subject: `Özel Proje Teklifi: ${formData.projectType}`,
                createdAt: new Date() 
            });
            setSubmitted(true);
            setFormData({ name: '', email: '', projectType: 'Residential', description: '' });
        } catch (err) {
            console.error('Teklif gönderme hatası:', err);
            setError('Teklif gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 py-10">
            <div className="flex flex-col max-w-5xl mx-auto gap-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full">
                    <div className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-lg items-center justify-center p-8 text-center" style={{ backgroundImage: `linear-gradient(rgba(16, 22, 34, 0.7) 0%, rgba(16, 22, 34, 0.9) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAFF0nGMNoRcZbtY9uXInUoBQYBEigXyvmy6BeFuMAarjoKLl-8aAxLKOg-juWYeoVSQlEKCbVItFxZLuZhmLwaNSJOoQESWCnWyBFETujr0ovbN9uapnafwhsbZVWaabajP8f4_fdgIP-K7vR6WfGbQ4wIP1pYK0D8tCCZxFbCDCFQXf_7Fxs1uDHM37TAveI-Bg2qh5CjpG6d3eJd-Z0RSqmr2C2T3etuHELEnEQe833Yktfkv5cnPFvgqy3-tyhs_JcrSnX0qiTH")` }}>
                        <div className="flex flex-col gap-4 max-w-3xl">
                            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] sm:text-5xl">Vizyonunuzu Tasarımla Hayata Geçiriyoruz</h1>
                            <p className="text-gray-300 text-base font-normal leading-normal sm:text-lg">Konseptten tamamlanmaya kadar çeşitli müşteri ihtiyaçlarını karşılamak için 2D çizim, 3D modelleme, yüksek kaliteli render ve kapsamlı sunum tasarımı konularında uzmanlık.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <h2 className="text-gray-900 dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em] text-center">Hizmet Paketleri</h2>
                    {/* Service packages table can be implemented here based on the design */}
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-4 text-center md:text-left">
                            <h2 className="text-gray-900 dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em]">Özel Bir Projeniz mi Var?</h2>
                            <p className="text-gray-600 dark:text-gray-300">Projeniz yukarıdaki paketlere uymuyorsa, memnuniyetle özel bir teklif sunabilirim. Lütfen formu mümkün olduğunca ayrıntılı bir şekilde doldurun, vizyonunuzu görüşmek üzere size geri döneceğim.</p>
                        </div>
                        <div className="w-full bg-gray-50 dark:bg-white/5 p-8 rounded-lg border border-gray-200 dark:border-white/10">
                            {submitted ? (
                                <div className="text-center flex flex-col items-center justify-center h-full">
                                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                    <h2 className="text-2xl font-bold mb-2">Teklif İsteğiniz Gönderildi!</h2>
                                    <p className="text-muted-light dark:text-muted-dark">En kısa sürede size dönüş yapacağım.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    {/* Form fields */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="name">Ad Soyad *</label>
                                        <input className="input-field" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="email">E-posta *</label>
                                        <input className="input-field" id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="project-type">Proje Tipi</label>
                                        <select className="input-field" id="project-type" name="project-type" value={formData.projectType} onChange={handleInputChange}>
                                            <option>Konut</option>
                                            <option>Ticari</option>
                                            <option>Akademik</option>
                                            <option>Diğer</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="description">Proje Açıklaması *</label>
                                        <textarea className="input-field" id="description" name="description" value={formData.description} onChange={handleInputChange} rows="4" required></textarea>
                                    </div>
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <button type="submit" className="btn-primary w-full mt-2 flex items-center justify-center gap-2" disabled={loading}>
                                        {loading ? <><Loader className="animate-spin" size={20} /><span>Gönderiliyor...</span></> : <><Send size={16} /><span>Teklif Al</span></>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ServicesPage;
