import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  ProjectService,
  PaftaService,
  ContactService,
  ExperimentService, // Assuming this service will be created
  BlogPostService,    // Assuming this service will be created
  InspirationService
} from '../firebase/services';

const ProjectContext = createContext();

const initialState = {
  projects: [],
  featuredProjects: [],
  paftas: [],
  experiments: [], // Add experiments to state
  blogPosts: [],   // Add blogPosts to state
  loading: false,
  error: null,
  currentProject: null,
  currentPafta: null
};

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    
    case 'SET_PAFTAS':
      return { ...state, paftas: action.payload, loading: false };
    
    case 'SET_FEATURED_PROJECTS':
      return { ...state, featuredProjects: action.payload, loading: false };
    
    case 'SET_EXPERIMENTS':
      return { ...state, experiments: action.payload, loading: false };
    
    case 'SET_BLOG_POSTS':
      return { ...state, blogPosts: action.payload, loading: false };
    
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload, loading: false };
    
    case 'SET_CURRENT_PAFTA':
      return { ...state, currentPafta: action.payload };
    
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        )
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload)
      };
    
    case 'ADD_PAFTA':
      return { ...state, paftas: [...state.paftas, action.payload] };
    
    case 'UPDATE_PAFTA':
      return {
        ...state,
        paftas: state.paftas.map(pafta =>
          pafta.id === action.payload.id ? action.payload : pafta
        )
      };
    
    case 'DELETE_PAFTA':
      return {
        ...state,
        paftas: state.paftas.filter(pafta => pafta.id !== action.payload)
      };
    
    case 'ADD_EXPERIMENT':
      return { ...state, experiments: [...state.experiments, action.payload] };
    
    case 'UPDATE_EXPERIMENT':
      return {
        ...state,
        experiments: state.experiments.map(exp =>
          exp.id === action.payload.id ? action.payload : exp
        )
      };
    
    case 'DELETE_EXPERIMENT':
      return {
        ...state,
        experiments: state.experiments.filter(exp => exp.id !== action.payload)
      };
    
    case 'ADD_BLOG_POST':
      return { ...state, blogPosts: [...state.blogPosts, action.payload] };
    
    case 'UPDATE_BLOG_POST':
      return {
        ...state,
        blogPosts: state.blogPosts.map(post =>
          post.id === action.payload.id ? action.payload : post
        )
      };
    
    case 'DELETE_BLOG_POST':
      return {
        ...state,
        blogPosts: state.blogPosts.filter(post => post.id !== action.payload)
      };
    
    default:
      return state;
  }
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Projeleri yükle
  const loadProjects = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const projects = await ProjectService.getAll();
      dispatch({ type: 'SET_PROJECTS', payload: projects });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Öne çıkan projeleri yükle
  const loadFeaturedProjects = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const projects = await ProjectService.getFeatured();
      dispatch({ type: 'SET_FEATURED_PROJECTS', payload: projects });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Kategoriye göre projeleri yükle
  const loadProjectsByCategory = useCallback(async (category) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const projects = await ProjectService.getByCategory(category);
      dispatch({ type: 'SET_PROJECTS', payload: projects });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Tek proje yükle
  const loadProject = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const project = await ProjectService.getById(id);
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Paftaları yükle
  const loadPaftas = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const paftas = await PaftaService.getAll();
      dispatch({ type: 'SET_PAFTAS', payload: paftas });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Projeleri yükle (Tümü)
  const loadAllProjects = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const projects = await ProjectService.getAll();
      dispatch({ type: 'SET_PROJECTS', payload: projects });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Paftaları yükle (Tümü)
  const loadAllPaftas = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const paftas = await PaftaService.getAll();
      dispatch({ type: 'SET_PAFTAS', payload: paftas });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // QR kod ile pafta yükle
  const loadPaftaByQR = useCallback(async (qrCode) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const pafta = await PaftaService.getByQRCode(qrCode);
      dispatch({ type: 'SET_CURRENT_PAFTA', payload: pafta });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Load Experiments
  const loadExperiments = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const experiments = await ExperimentService.getAll();
      dispatch({ type: 'SET_EXPERIMENTS', payload: experiments });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Load Blog Posts
  const loadBlogPosts = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const blogPosts = await BlogPostService.getAll();
      dispatch({ type: 'SET_BLOG_POSTS', payload: blogPosts });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Load Inspirations
  const loadInspirations = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const inspirations = await InspirationService.getAll();
      dispatch({ type: 'SET_INSPIRATIONS', payload: inspirations });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Proje oluştur
  const createProject = useCallback(async (projectData) => {
    try {
      const id = await ProjectService.create(projectData);
      const newProject = { id, ...projectData };
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
      return id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Proje güncelle
  const updateProject = useCallback(async (id, projectData) => {
    try {
      await ProjectService.update(id, projectData);
      const updatedProject = { id, ...projectData };
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Proje sil
  const deleteProject = useCallback(async (id) => {
    try {
      await ProjectService.delete(id);
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Pafta oluştur
  const createPafta = useCallback(async (paftaData) => {
    try {
      const id = await PaftaService.create(paftaData);
      const newPafta = { id, ...paftaData };
      dispatch({ type: 'ADD_PAFTA', payload: newPafta });
      return id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Pafta güncelle
  const updatePafta = useCallback(async (id, paftaData) => {
    try {
      await PaftaService.update(id, paftaData);
      const updatedPafta = { id, ...paftaData };
      dispatch({ type: 'UPDATE_PAFTA', payload: updatedPafta });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Pafta sil
  const deletePafta = useCallback(async (id) => {
    try {
      await PaftaService.delete(id);
      dispatch({ type: 'DELETE_PAFTA', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Deney oluştur
  const createExperiment = useCallback(async (experimentData) => {
    try {
      const id = await ExperimentService.create(experimentData);
      const newExperiment = { id, ...experimentData };
      dispatch({ type: 'ADD_EXPERIMENT', payload: newExperiment });
      return id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Deney güncelle
  const updateExperiment = useCallback(async (id, experimentData) => {
    try {
      await ExperimentService.update(id, experimentData);
      const updatedExperiment = { id, ...experimentData };
      dispatch({ type: 'UPDATE_EXPERIMENT', payload: updatedExperiment });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Deney sil
  const deleteExperiment = useCallback(async (id) => {
    try {
      await ExperimentService.delete(id);
      dispatch({ type: 'DELETE_EXPERIMENT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Blog gönderisi oluştur
  const createBlogPost = useCallback(async (blogPostData) => {
    try {
      const id = await BlogPostService.create(blogPostData);
      const newBlogPost = { id, ...blogPostData };
      dispatch({ type: 'ADD_BLOG_POST', payload: newBlogPost });
      return id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Blog gönderisi güncelle
  const updateBlogPost = useCallback(async (id, blogPostData) => {
    try {
      await BlogPostService.update(id, blogPostData);
      const updatedBlogPost = { id, ...blogPostData };
      dispatch({ type: 'UPDATE_BLOG_POST', payload: updatedBlogPost });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Blog gönderisi sil
  const deleteBlogPost = useCallback(async (id) => {
    try {
      await BlogPostService.delete(id);
      dispatch({ type: 'DELETE_BLOG_POST', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Hata temizle
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value = {
    ...state,
    loadProjects,
    loadFeaturedProjects,
    loadProjectsByCategory,
    loadProject,
    loadPaftas,
    loadPaftaByQR,
    loadAllProjects,
    loadAllPaftas,
    loadExperiments,
    loadBlogPosts,
    loadInspirations,
    createProject,
    updateProject,
    deleteProject,
    createPafta,
    updatePafta,
    deletePafta,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    clearError
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
