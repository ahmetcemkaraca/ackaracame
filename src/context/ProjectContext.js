import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  ProjectService,
  PaftaService,
  ExperimentService,
  BlogPostService,
  InspirationService,
  ApplicationService,
  PortfolioItemService
} from '../firebase/services';
import {
  projects as staticProjects,
  applications as staticApplications,
  findProjectById,
  findApplicationById
} from '../data/siteContent';
import { getSafeGitHubRepoUrl, getSafeHttpUrl } from '../utils/urlSafety';

const ProjectContext = createContext();

const initialState = {
  projects: [],
  featuredProjects: [],
  paftas: [],
  experiments: [],
  blogPosts: [],
  inspirations: [],
  applications: [],
  portfolioItems: [],
  loading: false,
  error: null,
  currentProject: null,
  currentPafta: null,
  currentApplication: null,
  currentPortfolioItem: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    case 'SET_FEATURED_PROJECTS':
      return { ...state, featuredProjects: action.payload, loading: false };
    case 'SET_PAFTAS':
      return { ...state, paftas: action.payload, loading: false };
    case 'SET_EXPERIMENTS':
      return { ...state, experiments: action.payload, loading: false };
    case 'SET_BLOG_POSTS':
      return { ...state, blogPosts: action.payload, loading: false };
    case 'SET_INSPIRATIONS':
      return { ...state, inspirations: action.payload, loading: false };
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload, loading: false };
    case 'SET_PORTFOLIO_ITEMS':
      return { ...state, portfolioItems: action.payload, loading: false };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload, loading: false };
    case 'SET_CURRENT_PAFTA':
      return { ...state, currentPafta: action.payload, loading: false };
    case 'SET_CURRENT_APPLICATION':
      return { ...state, currentApplication: action.payload, loading: false };
    case 'SET_CURRENT_PORTFOLIO_ITEM':
      return { ...state, currentPortfolioItem: action.payload, loading: false };
    default:
      return state;
  }
};

const sortByOrderAndDate = (items = []) => (
  [...items].sort((a, b) => {
    const left = Number(a.order ?? 999);
    const right = Number(b.order ?? 999);
    if (left !== right) return left - right;
    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
  })
);

const dedupeById = (items = []) => {
  const map = new Map();
  items.forEach((item) => {
    const key = item.id || item.slug || item.title;
    map.set(key, item);
  });
  return Array.from(map.values());
};

const normalizeExternalLinks = (item) => {
  const link = typeof item.link === 'string' ? item.link.trim() : '';
  const websiteUrl = getSafeHttpUrl(item.websiteUrl) || (link && !getSafeGitHubRepoUrl(link) ? getSafeHttpUrl(link) : '');
  const githubUrl = getSafeGitHubRepoUrl(item.githubUrl) || getSafeGitHubRepoUrl(link);

  return {
    websiteUrl,
    githubUrl
  };
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const withErrorHandling = useCallback(async (work) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await work();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const buildProjects = useCallback(async () => {
    let adminProjects = [];
    try {
      adminProjects = await ProjectService.getAll();
    } catch (error) {
      console.warn('Projects could not be fully loaded from Firestore:', error);
    }

    return sortByOrderAndDate(dedupeById([
      ...staticProjects.map((item) => ({ ...item, source: 'hardcoded', kind: 'project', originCollection: 'projects' })),
      ...adminProjects.map((item) => ({
        ...item,
        source: 'admin',
        kind: 'project',
        originCollection: 'projects',
        ...normalizeExternalLinks(item)
      }))
    ]));
  }, []);

  const buildApplications = useCallback(async () => {
    let legacyApplications = [];
    let portfolioApplications = [];

    try {
      const [rawApps, rawPortfolio] = await Promise.all([
        ApplicationService.getAll(),
        PortfolioItemService.getAll()
      ]);
      legacyApplications = rawApps.map((item) => ({
        ...item,
        source: 'admin',
        kind: 'application',
        originCollection: 'applications',
        ...normalizeExternalLinks(item)
      }));
      portfolioApplications = rawPortfolio
        .filter((item) => (item.kind || 'project') === 'application')
        .map((item) => ({ ...item, source: 'admin', kind: 'application', originCollection: 'portfolioItems' }));
    } catch (error) {
      console.warn('Applications could not be fully loaded from Firestore:', error);
    }

    return sortByOrderAndDate(dedupeById([
      ...staticApplications.map((item) => ({
        ...item,
        source: 'hardcoded',
        kind: 'application',
        originCollection: 'applications',
        ...normalizeExternalLinks(item)
      })),
      ...legacyApplications,
      ...portfolioApplications
    ]));
  }, []);

  const buildPortfolioItems = useCallback(async () => {
    const [projects, applications] = await Promise.all([buildProjects(), buildApplications()]);
    let portfolioItems = [];

    try {
      portfolioItems = await PortfolioItemService.getAll();
    } catch (error) {
      console.warn('Portfolio items could not be fully loaded from Firestore:', error);
    }

    return sortByOrderAndDate(dedupeById([
      ...projects.map((item) => ({ ...item, kind: 'project' })),
      ...applications.map((item) => ({ ...item, kind: 'application' })),
      ...portfolioItems.map((item) => ({ ...item, source: 'admin', kind: item.kind || 'project', originCollection: 'portfolioItems' }))
    ]));
  }, [buildApplications, buildProjects]);

  const loadProjects = useCallback(() => withErrorHandling(async () => {
    const projects = await buildProjects();
    dispatch({ type: 'SET_PROJECTS', payload: projects });
  }), [buildProjects, withErrorHandling]);

  const loadFeaturedProjects = useCallback(() => withErrorHandling(async () => {
    const projects = await buildProjects();
    dispatch({ type: 'SET_FEATURED_PROJECTS', payload: projects.filter((project) => project.featured) });
  }), [buildProjects, withErrorHandling]);

  const loadProjectsByCategory = useCallback((category) => withErrorHandling(async () => {
    const projects = await buildProjects();
    dispatch({ type: 'SET_PROJECTS', payload: projects.filter((project) => project.category === category) });
  }), [buildProjects, withErrorHandling]);

  const loadProject = useCallback((id) => withErrorHandling(async () => {
    const staticProject = findProjectById(id);
    if (staticProject) {
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: { ...staticProject, source: 'hardcoded', kind: 'project', originCollection: 'projects' } });
      return;
    }
    const project = await ProjectService.getById(id);
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project ? { ...project, source: 'admin', kind: 'project', originCollection: 'projects' } : null });
  }), [withErrorHandling]);

  const loadPaftas = useCallback(() => withErrorHandling(async () => {
    dispatch({ type: 'SET_PAFTAS', payload: await PaftaService.getAll() });
  }), [withErrorHandling]);

  const loadAllProjects = loadProjects;
  const loadAllPaftas = loadPaftas;

  const loadPaftaByQR = useCallback((qrCode) => withErrorHandling(async () => {
    dispatch({ type: 'SET_CURRENT_PAFTA', payload: await PaftaService.getByQRCode(qrCode) });
  }), [withErrorHandling]);

  const loadApplication = useCallback((id) => withErrorHandling(async () => {
    const staticApplication = findApplicationById(id);
    if (staticApplication) {
      dispatch({ type: 'SET_CURRENT_APPLICATION', payload: { ...staticApplication, source: 'hardcoded', kind: 'application', originCollection: 'applications' } });
      return;
    }
    const application = await ApplicationService.getById(id) || await PortfolioItemService.getById(id);
    dispatch({
      type: 'SET_CURRENT_APPLICATION',
      payload: application ? {
        ...application,
        source: 'admin',
        kind: 'application',
        originCollection: application.kind === 'application' ? 'portfolioItems' : 'applications'
      } : null
    });
  }), [withErrorHandling]);

  const loadPortfolioItem = useCallback((id) => withErrorHandling(async () => {
    const hardcodedItem = findProjectById(id) || findApplicationById(id);
    if (hardcodedItem) {
      dispatch({
        type: 'SET_CURRENT_PORTFOLIO_ITEM',
        payload: {
          ...hardcodedItem,
          source: 'hardcoded',
          kind: findProjectById(id) ? 'project' : 'application',
          originCollection: findProjectById(id) ? 'projects' : 'applications'
        }
      });
      return;
    }

    const [project, application, portfolioItem] = await Promise.all([
      ProjectService.getById(id),
      ApplicationService.getById(id),
      PortfolioItemService.getById(id)
    ]);

    const item = portfolioItem || project || application || null;
    dispatch({
      type: 'SET_CURRENT_PORTFOLIO_ITEM',
      payload: item ? {
        ...item,
        source: 'admin',
        kind: item.kind || (application ? 'application' : 'project'),
        originCollection: portfolioItem ? 'portfolioItems' : (application ? 'applications' : 'projects'),
        ...normalizeExternalLinks(item)
      } : null
    });
  }), [withErrorHandling]);

  const loadExperiments = useCallback(() => withErrorHandling(async () => {
    dispatch({ type: 'SET_EXPERIMENTS', payload: await ExperimentService.getAll() });
  }), [withErrorHandling]);

  const loadBlogPosts = useCallback(() => withErrorHandling(async () => {
    dispatch({ type: 'SET_BLOG_POSTS', payload: await BlogPostService.getAll() });
  }), [withErrorHandling]);

  const loadInspirations = useCallback(() => withErrorHandling(async () => {
    dispatch({ type: 'SET_INSPIRATIONS', payload: await InspirationService.getAll() });
  }), [withErrorHandling]);

  const loadApplications = useCallback(() => withErrorHandling(async () => {
    dispatch({ type: 'SET_APPLICATIONS', payload: await buildApplications() });
  }), [buildApplications, withErrorHandling]);

  const loadPortfolioItems = useCallback(() => withErrorHandling(async () => {
    dispatch({ type: 'SET_PORTFOLIO_ITEMS', payload: await buildPortfolioItems() });
  }), [buildPortfolioItems, withErrorHandling]);

  const createProject = useCallback(async (projectData) => {
    const id = await ProjectService.create(projectData);
    await loadProjects();
    return id;
  }, [loadProjects]);

  const updateProject = useCallback(async (id, projectData) => {
    await ProjectService.update(id, projectData);
    await loadProjects();
  }, [loadProjects]);

  const deleteProject = useCallback(async (id) => {
    await ProjectService.delete(id);
    await loadProjects();
  }, [loadProjects]);

  const createPafta = useCallback(async (paftaData) => {
    const id = await PaftaService.create(paftaData);
    await loadPaftas();
    return id;
  }, [loadPaftas]);

  const updatePafta = useCallback(async (id, paftaData) => {
    await PaftaService.update(id, paftaData);
    await loadPaftas();
  }, [loadPaftas]);

  const deletePafta = useCallback(async (id) => {
    await PaftaService.delete(id);
    await loadPaftas();
  }, [loadPaftas]);

  const createExperiment = useCallback(async (experimentData) => {
    const id = await ExperimentService.create(experimentData);
    await loadExperiments();
    return id;
  }, [loadExperiments]);

  const updateExperiment = useCallback(async (id, experimentData) => {
    await ExperimentService.update(id, experimentData);
    await loadExperiments();
  }, [loadExperiments]);

  const deleteExperiment = useCallback(async (id) => {
    await ExperimentService.delete(id);
    await loadExperiments();
  }, [loadExperiments]);

  const createBlogPost = useCallback(async (blogPostData) => {
    const id = await BlogPostService.create(blogPostData);
    await loadBlogPosts();
    return id;
  }, [loadBlogPosts]);

  const updateBlogPost = useCallback(async (id, blogPostData) => {
    await BlogPostService.update(id, blogPostData);
    await loadBlogPosts();
  }, [loadBlogPosts]);

  const deleteBlogPost = useCallback(async (id) => {
    await BlogPostService.delete(id);
    await loadBlogPosts();
  }, [loadBlogPosts]);

  const createInspiration = useCallback(async (data) => {
    const id = await InspirationService.create(data);
    await loadInspirations();
    return id;
  }, [loadInspirations]);

  const updateInspiration = useCallback(async (id, data) => {
    await InspirationService.update(id, data);
    await loadInspirations();
  }, [loadInspirations]);

  const deleteInspiration = useCallback(async (id) => {
    await InspirationService.delete(id);
    await loadInspirations();
  }, [loadInspirations]);

  const createApplication = useCallback(async (data) => {
    const id = await ApplicationService.create(data);
    await loadApplications();
    return id;
  }, [loadApplications]);

  const updateApplication = useCallback(async (id, data) => {
    await ApplicationService.update(id, data);
    await loadApplications();
  }, [loadApplications]);

  const deleteApplication = useCallback(async (id) => {
    await ApplicationService.delete(id);
    await loadApplications();
  }, [loadApplications]);

  const createPortfolioItem = useCallback(async (data) => {
    const id = await PortfolioItemService.create(data);
    await loadPortfolioItems();
    return id;
  }, [loadPortfolioItems]);

  const updatePortfolioItem = useCallback(async (id, data) => {
    await PortfolioItemService.update(id, data);
    await loadPortfolioItems();
  }, [loadPortfolioItems]);

  const deletePortfolioItem = useCallback(async (id) => {
    await PortfolioItemService.delete(id);
    await loadPortfolioItems();
  }, [loadPortfolioItems]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        ...state,
        loadProjects,
        loadFeaturedProjects,
        loadProjectsByCategory,
        loadProject,
        loadPaftas,
        loadPaftaByQR,
        loadApplication,
        loadPortfolioItem,
        loadAllProjects,
        loadAllPaftas,
        loadExperiments,
        loadBlogPosts,
        loadInspirations,
        loadApplications,
        loadPortfolioItems,
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
        createInspiration,
        updateInspiration,
        deleteInspiration,
        createApplication,
        updateApplication,
        deleteApplication,
        createPortfolioItem,
        updatePortfolioItem,
        deletePortfolioItem,
        clearError
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
