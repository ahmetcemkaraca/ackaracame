import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Eye, Settings, BarChart3, FileText, QrCode, BookOpen, FlaskConical, Search, Bell, LogOut, Menu, Folder
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import ProjectForm from '../components/ProjectForm';
import PaftaForm from '../components/PaftaForm';
import BlogForm from '../components/BlogForm';
import ExperimentForm from '../components/ExperimentForm';
import InspirationForm from '../components/InspirationForm';
import LoadingSpinner from '../components/LoadingSpinner';
import AdminLoginForm from '../components/AdminLoginForm';

const AdminPage = () => {
  const { user, isAdmin, logout } = useAuth();
  const { 
    projects, paftas, blogPosts, experiments, inspirations,
    loadProjects, loadPaftas, loadBlogPosts, loadExperiments, loadInspirations,
    deleteProject, deletePafta, deleteBlogPost, deleteExperiment, deleteInspiration,
    loading 
  } = useProject();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form states
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPaftaForm, setShowPaftaForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showExperimentForm, setShowExperimentForm] = useState(false);
  const [showInspirationForm, setShowInspirationForm] = useState(false);

  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadProjects();
      loadPaftas();
      loadExperiments();
      loadBlogPosts();
      loadInspirations();
    }
  }, [isAdmin, loadProjects, loadPaftas, loadExperiments, loadBlogPosts, loadInspirations]);

  if (!user || !isAdmin) {
    return <AdminLoginForm />;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'paftas', label: 'Paftalar', icon: QrCode },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'inspirations', label: 'Inspirations', icon: Eye },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  const handleEdit = (type, item) => {
    setEditingItem(item);
    if(type === 'project') setShowProjectForm(true);
    if(type === 'pafta') setShowPaftaForm(true);
    if(type === 'blog') setShowBlogForm(true);
    if(type === 'experiment') setShowExperimentForm(true);
    if(type === 'inspiration') setShowInspirationForm(true);
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
        if(type === 'project') await deleteProject(id);
        if(type === 'pafta') await deletePafta(id);
        if(type === 'blog') await deleteBlogPost(id);
        if(type === 'experiment') await deleteExperiment(id);
        if(type === 'inspiration') await deleteInspiration(id);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex antialiased pt-16">

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 pt-16 w-64 bg-white dark:bg-[#1a232e] border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main</p>
          {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group ${activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <Icon className={`text-xl ${activeTab === item.id ? 'text-primary' : 'group-hover:text-primary'}`} />
                    {item.label}
                </button>
              )
          })}
        </div>

        {/* User Profile/Logout */}
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
                <LogOut className="text-sm w-4 h-4" /> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* Header */}
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
                    <input className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64 text-slate-900 dark:text-slate-100 placeholder-slate-500 outline-none" placeholder="Search..." type="text"/>
                </div>
                <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a232e]"></span>
                </button>
                {activeTab !== 'dashboard' && activeTab !== 'settings' && (
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            if(activeTab === 'projects') setShowProjectForm(true);
                            if(activeTab === 'paftas') setShowPaftaForm(true);
                            if(activeTab === 'blog') setShowBlogForm(true);
                            if(activeTab === 'experiments') setShowExperimentForm(true);
                            if(activeTab === 'inspirations') setShowInspirationForm(true);
                        }}
                        className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                )}
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-background-light dark:bg-background-dark">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {activeTab === 'dashboard' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white dark:bg-[#1a232e] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><Eye className="w-5 h-5" /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-500 text-sm font-medium">Total Views</p>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">24.5k</h3>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a232e] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400"><Folder className="w-5 h-5" /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-500 text-sm font-medium">Projects</p>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</h3>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a232e] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400"><FileText className="w-5 h-5" /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-500 text-sm font-medium">Blog Posts</p>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{blogPosts.length}</h3>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a232e] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400"><QrCode className="w-5 h-5" /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-500 text-sm font-medium">Paftalar</p>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{paftas.length}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Projects Table */}
                            <div className="bg-white dark:bg-[#1a232e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Projects</h3>
                                    <button onClick={() => setActiveTab('projects')} className="text-sm text-primary font-medium hover:underline">View All</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-semibold text-slate-500">
                                            <tr>
                                                <th className="px-6 py-4">Project Name</th>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {projects.slice(0, 5).map(project => (
                                                <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                                <img className="w-full h-full object-cover" src={project.images?.[0] || '/placeholder.jpg'} alt="" />
                                                            </div>
                                                            <span className="font-medium text-slate-900 dark:text-white">{project.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">{project.category}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleEdit('project', project)} className="p-1 text-slate-400 hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'projects' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(project => (
                                <div key={project.id} className="bg-white dark:bg-[#1a232e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <img className="w-full h-40 object-cover rounded-lg mb-4 bg-slate-200 dark:bg-slate-800" src={project.images?.[0]} alt={project.title} />
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{project.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description}</p>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit('project', project)} className="p-2 text-slate-500 hover:text-primary"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete('project', project.id)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Simplified view for other tabs using similar grid structure */}
                    {(activeTab === 'paftas' || activeTab === 'blog' || activeTab === 'experiments' || activeTab === 'inspirations') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(activeTab === 'paftas' ? paftas : activeTab === 'blog' ? blogPosts : activeTab === 'experiments' ? experiments : inspirations).map(item => (
                                <div key={item.id} className="bg-white dark:bg-[#1a232e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="w-full h-40 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4 overflow-hidden">
                                        {(item.images?.[0] || item.imageUrl || item.image) && <img className="w-full h-full object-cover" src={item.images?.[0] || item.imageUrl || item.image} alt={item.title} />}
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
                </>
            )}
        </div>
      </main>

      {/* Modals for Forms */}
      {showProjectForm && <ProjectForm project={editingItem} onClose={() => { setShowProjectForm(false); setEditingItem(null); }} />}
      {showPaftaForm && <PaftaForm pafta={editingItem} onClose={() => { setShowPaftaForm(false); setEditingItem(null); }} />}
      {showBlogForm && <BlogForm blogPost={editingItem} onClose={() => { setShowBlogForm(false); setEditingItem(null); }} />}
      {showExperimentForm && <ExperimentForm experiment={editingItem} onClose={() => { setShowExperimentForm(false); setEditingItem(null); }} />}
      {showInspirationForm && <InspirationForm inspiration={editingItem} onClose={() => { setShowInspirationForm(false); setEditingItem(null); }} onSuccess={loadInspirations} />}
    </div>
  );
};

export default AdminPage;
