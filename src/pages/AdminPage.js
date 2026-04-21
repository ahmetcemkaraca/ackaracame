import React, { useEffect, useState } from 'react';
import {
  Plus, Edit, Trash2, Eye, Settings, BarChart3, FileText, QrCode, FlaskConical,
  Search, Bell, LogOut, Menu, Folder, Smartphone, Save, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { SiteSettingsService } from '../firebase/services';
import ProjectForm from '../components/ProjectForm';
import PaftaForm from '../components/PaftaForm';
import BlogForm from '../components/BlogForm';
import ExperimentForm from '../components/ExperimentForm';
import InspirationForm from '../components/InspirationForm';
import ApplicationForm from '../components/ApplicationForm';
import PortfolioItemForm from '../components/PortfolioItemForm';
import LoadingSpinner from '../components/LoadingSpinner';
import AdminLoginForm from '../components/AdminLoginForm';

const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';

const AdminPage = () => {
  const { user, isAdmin, logout } = useAuth();
  const {
    projects,
    paftas,
    blogPosts,
    experiments,
    inspirations,
    applications,
    portfolioItems,
    loadProjects,
    loadPaftas,
    loadBlogPosts,
    loadExperiments,
    loadInspirations,
    loadApplications,
    loadPortfolioItems,
    deleteProject,
    deletePafta,
    deleteBlogPost,
    deleteExperiment,
    deleteInspiration,
    deleteApplication,
    deletePortfolioItem,
    loading
  } = useProject();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPaftaForm, setShowPaftaForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showExperimentForm, setShowExperimentForm] = useState(false);
  const [showInspirationForm, setShowInspirationForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showPortfolioItemForm, setShowPortfolioItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [siteSettings, setSiteSettings] = useState({
    footerTagline: 'Mimar. Gelistirici. Yaratici.',
    footerSubline: 'Blud 🥀',
    footerCopyrightPrefix: '©',
    footerCopyrightText: 'Ahmet Cem Karaca. All Rights Reserved.',
    footerCopyrightSuffix: 'Copyrighted Twinn 🥀🥀🥀',
    homeHeroSubtitle: '',
    siteWebsiteUrl: 'https://ackaraca.me'
  });

  useEffect(() => {
    if (!isAdmin) return;
    loadProjects();
    loadPaftas();
    loadExperiments();
    loadBlogPosts();
    loadInspirations();
    loadApplications();
    loadPortfolioItems();
  }, [isAdmin, loadProjects, loadPaftas, loadExperiments, loadBlogPosts, loadInspirations, loadApplications, loadPortfolioItems]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!isAdmin) return;
      try {
        const settings = await SiteSettingsService.get();
        if (settings) {
          setSiteSettings((prev) => ({ ...prev, ...settings }));
        }
      } catch (error) {
        console.error('Settings load failed:', error);
      }
    };

    loadSettings();
  }, [isAdmin]);

  if (!user || !isAdmin) {
    return <AdminLoginForm />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'paftas', label: 'Paftalar', icon: QrCode },
    { id: 'applications', label: 'Applications', icon: Smartphone },
    { id: 'portfolioItems', label: 'Portfolio', icon: Folder },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'inspirations', label: 'Inspirations', icon: Eye },
    { id: 'settings', label: 'Configuration', icon: Settings }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEdit = (type, item) => {
    setEditingItem(item);
    if (type === 'project') setShowProjectForm(true);
    if (type === 'pafta') setShowPaftaForm(true);
    if (type === 'blog') setShowBlogForm(true);
    if (type === 'experiment') setShowExperimentForm(true);
    if (type === 'inspiration') setShowInspirationForm(true);
    if (type === 'application') setShowApplicationForm(true);
    if (type === 'portfolioItem') setShowPortfolioItemForm(true);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Bu oge silinsin mi?')) return;
    if (type === 'project') await deleteProject(id);
    if (type === 'pafta') await deletePafta(id);
    if (type === 'blog') await deleteBlogPost(id);
    if (type === 'experiment') await deleteExperiment(id);
    if (type === 'inspiration') await deleteInspiration(id);
    if (type === 'application') await deleteApplication(id);
    if (type === 'portfolioItem') await deletePortfolioItem(id);
  };

  const getManageType = (item, fallbackType) => {
    if (fallbackType !== 'portfolioItem') return fallbackType;
    if (item.originCollection === 'projects') return 'project';
    if (item.originCollection === 'applications') return 'application';
    return 'portfolioItem';
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    if (activeTab === 'projects') setShowProjectForm(true);
    if (activeTab === 'paftas') setShowPaftaForm(true);
    if (activeTab === 'blog') setShowBlogForm(true);
    if (activeTab === 'experiments') setShowExperimentForm(true);
    if (activeTab === 'inspirations') setShowInspirationForm(true);
    if (activeTab === 'applications') setShowApplicationForm(true);
    if (activeTab === 'portfolioItems') setShowPortfolioItemForm(true);
  };

  const setSettingsField = (name, value) => {
    setSiteSettings((prev) => ({ ...prev, [name]: value }));
    setSettingsMessage('');
  };

  const saveSettings = async () => {
    setSettingsLoading(true);
    try {
      await SiteSettingsService.update(siteSettings);
      setSettingsMessage('Ayarlar kaydedildi.');
    } catch (error) {
      console.error('Settings save failed:', error);
      setSettingsMessage('Ayarlar kaydedilemedi.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const stats = [
    { label: 'Projects', value: projects.length, icon: Folder, tone: 'blue' },
    { label: 'Applications', value: applications.length, icon: Smartphone, tone: 'emerald' },
    { label: 'Portfolio', value: portfolioItems.length, icon: Eye, tone: 'violet' },
    { label: 'Blog Posts', value: blogPosts.length, icon: FileText, tone: 'amber' }
  ];

  const sourceBadge = (item) => (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
      item.source === 'hardcoded'
        ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        : 'bg-primary/10 text-primary'
    }`}>
      {item.source === 'hardcoded' ? 'hardcoded' : 'site/admin'}
    </span>
  );

  const renderEditableGrid = (items, type) => (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-[#1a232e] dark:text-slate-300">
        Hardcoded ve admin kaynakli icerikler ayni listede gorunur. Hardcoded ogeler vitrinde kalir ancak burada yalnizca izlenir;
        site uzerinden eklediginiz ogeler duzenlenebilir ve silinebilir.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#1a232e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              {sourceBadge(item)}
              <a href={`/portfolio/${item.id}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-4 h-40 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
              {(item.images?.[0] || item.image) && (
                <img className="w-full h-full object-cover" src={item.images?.[0] || item.image} alt={item.title} />
              )}
            </div>
            <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{item.title || item.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>{item.year || item.version || item.type || 'Guncel'}</span>
              <span>{item.category || item.kind || 'Icerik'}</span>
            </div>
            {item.source === 'admin' ? (
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => handleEdit(getManageType(item, type), item)} className="p-2 text-slate-500 hover:text-primary"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(getManageType(item, type), item.id)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-400">Bu oge kaynak dosyadan geliyor. Panelden yeni bir kopya veya yeni icerik ekleyebilirsiniz.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex antialiased pt-16">
      <aside className={`fixed inset-y-0 left-0 pt-16 w-64 bg-white dark:bg-[#1a232e] border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : 'group-hover:text-primary'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#1a232e] border-b border-slate-200 dark:border-slate-800 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-primary">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">{activeTab} Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64 text-slate-900 dark:text-slate-100 placeholder-slate-500 outline-none" placeholder="Search..." type="text" />
            </div>
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a232e]" />
            </button>
            {activeTab !== 'dashboard' && activeTab !== 'settings' && (
              <button onClick={handleOpenCreate} className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Add New
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-background-light dark:bg-background-dark">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="bg-white dark:bg-[#1a232e] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Icon className="w-5 h-5" /></div>
                          </div>
                          <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                          <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="bg-white dark:bg-[#1a232e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Portfolio Items</h3>
                        <button onClick={() => setActiveTab('portfolioItems')} className="text-sm text-primary font-medium hover:underline">View All</button>
                      </div>
                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {portfolioItems.slice(0, 6).map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                              <p className="mt-1 text-sm text-slate-500">{item.category || item.kind || item.type}</p>
                            </div>
                            {sourceBadge(item)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a232e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Admin Security</h3>
                      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        <li>Admin login denemeleri 3 hatadan sonra 24 saat kilitlenir.</li>
                        <li>Bu kilit sadece yeni login denemelerini etkiler.</li>
                        <li>Mevcut dogrulanmis sessionlar kullanilmaya devam eder.</li>
                        <li>Kontrol Cloud Function + Firestore uzerinden tutulur, localStorage tabanli degildir.</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'projects' && renderEditableGrid(projects, 'project')}
              {activeTab === 'applications' && renderEditableGrid(applications, 'application')}
              {activeTab === 'portfolioItems' && renderEditableGrid(portfolioItems, 'portfolioItem')}

              {(activeTab === 'paftas' || activeTab === 'blog' || activeTab === 'experiments' || activeTab === 'inspirations') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(activeTab === 'paftas' ? paftas : activeTab === 'blog' ? blogPosts : activeTab === 'experiments' ? experiments : inspirations).map((item) => (
                    <div key={item.id} className="bg-white dark:bg-[#1a232e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="w-full h-40 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4 overflow-hidden">
                        {(item.images?.[0] || item.imageUrl || item.image) && (
                          <img className="w-full h-full object-cover" src={item.images?.[0] || item.imageUrl || item.image} alt={item.title} />
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title || item.name}</h3>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => handleEdit(activeTab.slice(0, -1), item)} className="p-2 text-slate-500 hover:text-primary"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(activeTab.slice(0, -1), item.id)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1a232e]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Site Configuration</h3>
                        <p className="mt-2 text-sm text-slate-500">Prod siteden degistirilebilecek metin ve genel davranis ayarlari.</p>
                      </div>
                      <button onClick={saveSettings} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
                        <Save className="w-4 h-4" />
                        {settingsLoading ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Site URL</label>
                        <input className={inputClass} value={siteSettings.siteWebsiteUrl || ''} onChange={(e) => setSettingsField('siteWebsiteUrl', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Footer tagline</label>
                        <input className={inputClass} value={siteSettings.footerTagline || ''} onChange={(e) => setSettingsField('footerTagline', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Footer alt satir</label>
                        <input className={inputClass} value={siteSettings.footerSubline || ''} onChange={(e) => setSettingsField('footerSubline', e.target.value)} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Copyright prefix</label>
                        <input className={inputClass} value={siteSettings.footerCopyrightPrefix || ''} onChange={(e) => setSettingsField('footerCopyrightPrefix', e.target.value)} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Copyright suffix</label>
                        <input className={inputClass} value={siteSettings.footerCopyrightSuffix || ''} onChange={(e) => setSettingsField('footerCopyrightSuffix', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Copyright metni</label>
                        <input className={inputClass} value={siteSettings.footerCopyrightText || ''} onChange={(e) => setSettingsField('footerCopyrightText', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Ana sayfa aciklamasi</label>
                        <textarea className={inputClass} rows={4} value={siteSettings.homeHeroSubtitle || ''} onChange={(e) => setSettingsField('homeHeroSubtitle', e.target.value)} />
                      </div>
                    </div>

                    {settingsMessage && (
                      <p className="mt-4 text-sm text-primary">{settingsMessage}</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1a232e]">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Yonetilebilir ayarlar</h3>
                    <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      <li>Footer tagline, alt satir ve copyright metinleri</li>
                      <li>Ana sayfa tanitim metni</li>
                      <li>Genel site website adresi</li>
                      <li>Admin login brute-force korumasi Cloud Function tarafinda aktif</li>
                      <li>Proje / uygulama website, GitHub repo ve changelog alanlari panelden duzenlenebilir</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showProjectForm && <ProjectForm project={editingItem} onClose={() => { setShowProjectForm(false); setEditingItem(null); }} />}
      {showPaftaForm && <PaftaForm pafta={editingItem} onClose={() => { setShowPaftaForm(false); setEditingItem(null); }} />}
      {showBlogForm && <BlogForm blogPost={editingItem} onClose={() => { setShowBlogForm(false); setEditingItem(null); }} />}
      {showExperimentForm && <ExperimentForm experiment={editingItem} onClose={() => { setShowExperimentForm(false); setEditingItem(null); }} />}
      {showInspirationForm && <InspirationForm inspiration={editingItem} onClose={() => { setShowInspirationForm(false); setEditingItem(null); }} onSuccess={loadInspirations} />}
      {showApplicationForm && <ApplicationForm application={editingItem} onClose={() => { setShowApplicationForm(false); setEditingItem(null); }} />}
      {showPortfolioItemForm && <PortfolioItemForm item={editingItem} onClose={() => { setShowPortfolioItemForm(false); setEditingItem(null); }} />}
    </div>
  );
};

export default AdminPage;
