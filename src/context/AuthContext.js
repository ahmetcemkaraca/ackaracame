import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true,
  error: null,
  isAdmin: false
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAdmin: action.payload?.email === 'admin@ackaraca.me',
        loading: false 
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        isAdmin: false, 
        loading: false 
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Giriş yap
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      dispatch({ type: 'SET_USER', payload: userCredential.user });
      
      return userCredential.user;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Çıkış yap
  const logout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Hata temizle
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Auth state değişikliklerini dinle
  useEffect(() => {
    if (auth && typeof auth.onAuthStateChanged === 'function') {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            dispatch({ type: 'SET_USER', payload: user });
        } else {
            dispatch({ type: 'LOGOUT' });
        }
        });

        return () => unsubscribe();
    } else {
        console.warn('Firebase Auth not initialized correctly, skipping onAuthStateChanged');
        dispatch({ type: 'LOGOUT' }); // Set default state
        return () => {};
    }
  }, []);

  const value = {
    ...state,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
