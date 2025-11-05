import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  // Upload, // Not used currently
  Settings,
  BarChart3,
  // Users, // Not used currently
  FileText,
  QrCode,
  BookOpen,
  FlaskConical
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
  const { user, isAdmin } = useAuth();
  const { 
    projects, 
    paftas,
    blogPosts,
    experiments,
    inspirations,
    loadProjects, 
    loadPaftas,
    loadBlogPosts,
    loadExperiments,
    loadInspirations,
    deleteProject, 
    deletePafta,
    deleteBlogPost,
    deleteExperiment,
    deleteInspiration,
    loading 
  } = useProject();
  
  const [activeTab, setActiveTab] = useState('projects');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPaftaForm, setShowPaftaForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showExperimentForm, setShowExperimentForm] = useState(false);
  const [showInspirationForm, setShowInspirationForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingPafta, setEditingPafta] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editingExperiment, setEditingExperiment] = useState(null);
  const [editingInspiration, setEditingInspiration] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadProjects();
      loadPaftas();
      loadExperiments();
      loadBlogPosts();
      loadInspirations();
    }
  }, [isAdmin, loadProjects, loadPaftas, loadExperiments, loadBlogPosts, loadInspirations]);

  // Show login form if not authenticated or not admin
  if (!user || !isAdmin) {
    return <AdminLoginForm />;
  }

  const tabs = [
    { id: 'projects', label: 'Projeler', icon: FileText },
    { id: 'paftas', label: 'Paftalar', icon: QrCode },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'experiments', label: 'Deneyler', icon: FlaskConical },
    { id: 'inspirations', label: 'İlhamlar', icon: Eye },
    { id: 'analytics', label: 'Analitik', icon: BarChart3 },
    { id: 'settings', label: 'Ayarlar', icon: Settings }
  ];

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleEditPafta = (pafta) => {
    setEditingPafta(pafta);
    setShowPaftaForm(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error('Proje silinirken hata:', error);
      }
    }
  };

  const handleDeletePafta = async (paftaId) => {
    if (window.confirm('Bu paftayı silmek istediğinizden emin misiniz?')) {
      try {
        await deletePafta(paftaId);
      } catch (error) {
        console.error('Pafta silinirken hata:', error);
      }
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setShowBlogForm(true);
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Bu blog gönderisini silmek istediğinizden emin misiniz?')) {
      try {
        await deleteBlogPost(blogId);
      } catch (error) {
        console.error('Blog gönderisi silinirken hata:', error);
      }
    }
  };

  const handleEditExperiment = (experiment) => {
    setEditingExperiment(experiment);
    setShowExperimentForm(true);
  };

  const handleDeleteExperiment = async (experimentId) => {
    if (window.confirm('Bu deneyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteExperiment(experimentId);
      } catch (error) {
        console.error('Deney silinirken hata:', error);
      }
    }
  };

  const handleEditInspiration = (inspiration) => {
    setEditingInspiration(inspiration);
    setShowInspirationForm(true);
  };

  const handleDeleteInspiration = async (inspirationId) => {
    if (window.confirm('Bu ilhamı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteInspiration(inspirationId);
      } catch (error) {
        console.error('İlham silinirken hata:', error);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-secondary-800">
                Proje Yönetimi
              </h2>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setShowProjectForm(true);
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Proje</span>
              </button>
            </div>

            {loading ? (
              <LoadingSpinner text="Projeler yükleniyor..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-4">
                      {project.images && project.images.length > 0 ? (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <span className="text-secondary-400">Görsel Yok</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-secondary-800">
                      {project.title}
                    </h3>
                    
                    <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.category === 'mimari' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {project.category === 'mimari' ? 'Mimari' : 'Yazılım'}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/project/${project.id}`, '_blank')}
                          className="p-2 text-secondary-500 hover:text-primary-600 transition-colors duration-200"
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-2 text-secondary-500 hover:text-primary-600 transition-colors duration-200"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 text-secondary-500 hover:text-red-600 transition-colors duration-200"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'paftas':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-secondary-800">
                Pafta Yönetimi
              </h2>
              <button
                onClick={() => {
                  setEditingPafta(null);
                  setShowPaftaForm(true);
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Pafta</span>
              </button>
            </div>

            {loading ? (
              <LoadingSpinner text="Paftalar yükleniyor..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paftas.map((pafta) => (
                  <motion.div
                    key={pafta.id}
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-4">
                      {pafta.images && pafta.images.length > 0 ? (
                        <img
                          src={pafta.images[0]}
                          alt={pafta.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-secondary-400" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-secondary-800">
                      {pafta.title}
                    </h3>
                    
                    <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                      {pafta.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {pafta.semester}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/pafta/${pafta.qrCodeData}`, '_blank')}
                          className="p-2 text-secondary-500 hover:text-primary-600 transition-colors duration-200"
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditPafta(pafta)}
                          className="p-2 text-secondary-500 hover:text-primary-600 transition-colors duration-200"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeletePafta(pafta.id)}
                          className="p-2 text-secondary-500 hover:text-red-600 transition-colors duration-200"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'blog':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-secondary-800 dark:text-white">
                Blog Yönetimi
              </h2>
              <button
                onClick={() => {
                  setEditingBlog(null);
                  setShowBlogForm(true);
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Blog Gönderisi</span>
              </button>
            </div>

            {loading ? (
              <LoadingSpinner text="Blog gönderileri yükleniyor..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((blog) => (
                  <motion.div
                    key={blog.id}
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-4">
                      {blog.imageUrl ? (
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <span className="text-secondary-400">Görsel Yok</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-secondary-800 dark:text-white">
                      {blog.title}
                    </h3>
                    
                    <p className="text-secondary-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                      {blog.summary || blog.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {blog.category || 'Genel'}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/blog/${blog.id}`, '_blank')}
                          className="p-2 text-secondary-500 hover:text-primary-600 transition-colors duration-200"
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="p-2 text-secondary-500 hover:text-primary-600 transition-colors duration-200"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="p-2 text-secondary-500 hover:text-red-600 transition-colors duration-200"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'experiments':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-secondary-800 dark:text-white">
                Deney Yönetimi
              </h2>
              <button
                onClick={() => {
                  setEditingExperiment(null);
                  setShowExperimentForm(true);
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Deney</span>
              </button>
            </div>

            {loading ? (
              <LoadingSpinner text="Deneyler yükleniyor..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiments.map((experiment) => (
                  <motion.div
                    key={experiment.id}
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-4">
                      {experiment.imageUrl ? (
                        <img
                          src={experiment.imageUrl}
                          alt={experiment.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <FlaskConical className="w-8 h-8 text-secondary-400" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-secondary-800 dark:text-white">
                      {experiment.title}
                    </h3>
                    
                    <p className="text-secondary-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                      {experiment.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        experiment.type === 'featured' ? 'bg-green-100 text-green-800' :
                        experiment.type === 'digital' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {experiment.type === 'featured' ? 'Öne Çıkan' :
                         experiment.type === 'digital' ? 'Dijital' : 'Başarısız'}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditExperiment(experiment)}
                          className="p-2 text-secondary-500 hover:text-primary-600 transition-colors duration-200"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteExperiment(experiment.id)}
                          className="p-2 text-secondary-500 hover:text-red-600 transition-colors duration-200"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'inspirations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-secondary-800 dark:text-white">
                İlham Yönetimi
              </h2>
              <button
                onClick={() => {
                  setEditingInspiration(null);
                  setShowInspirationForm(true);
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni İlham</span>
              </button>
            </div>

            {loading ? (
              <LoadingSpinner text="İlhamlar yükleniyor..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inspirations.map((inspiration) => (
                  <motion.div
                    key={inspiration.id}
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-4">
                      {inspiration.imageUrl ? (
                        <img
                          src={inspiration.imageUrl}
                          alt={inspiration.title || inspiration.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <Eye className="w-8 h-8 text-secondary-400" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-secondary-800 dark:text-white">
                      {inspiration.title || inspiration.name}
                    </h3>
                    
                    <p className="text-secondary-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                      {inspiration.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {inspiration.category}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditInspiration(inspiration)}
                          className="p-2 text-secondary-500 hover:text-primary-600 transition-colors duration-200"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteInspiration(inspiration.id)}
                          className="p-2 text-secondary-500 hover:text-red-600 transition-colors duration-200"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary-800">
              Analitik
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-secondary-800 mb-2">
                  {projects.length}
                </div>
                <div className="text-secondary-600">Toplam Proje</div>
              </div>
              
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-secondary-800 mb-2">
                  {paftas.length}
                </div>
                <div className="text-secondary-600">Toplam Pafta</div>
              </div>
              
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-secondary-800 mb-2">
                  {projects.filter(p => p.featured).length}
                </div>
                <div className="text-secondary-600">Öne Çıkan Proje</div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary-800">
              Site Ayarları
            </h2>
            
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4 text-secondary-800">
                Genel Ayarlar
              </h3>
              <p className="text-secondary-600">
                Site ayarları yakında eklenecek.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 gradient-text">
              Admin Panel
            </h1>
            <p className="text-secondary-600">
              Hoş geldiniz, {user.email}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-secondary-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </motion.div>
      </div>

      {/* Forms */}
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {showPaftaForm && (
        <PaftaForm
          pafta={editingPafta}
          onClose={() => {
            setShowPaftaForm(false);
            setEditingPafta(null);
          }}
        />
      )}

      {showBlogForm && (
        <BlogForm
          blogPost={editingBlog}
          onClose={() => {
            setShowBlogForm(false);
            setEditingBlog(null);
            loadBlogPosts();
          }}
        />
      )}

      {showExperimentForm && (
        <ExperimentForm
          experiment={editingExperiment}
          onClose={() => {
            setShowExperimentForm(false);
            setEditingExperiment(null);
            loadExperiments();
          }}
        />
      )}

      {showInspirationForm && (
        <InspirationForm
          inspiration={editingInspiration}
          onClose={() => {
            setShowInspirationForm(false);
            setEditingInspiration(null);
          }}
          onSuccess={() => {
            loadInspirations();
          }}
        />
      )}
    </div>
  );
};

export default AdminPage;
