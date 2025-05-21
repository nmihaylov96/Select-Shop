import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { AuthState } from '@/lib/types';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';

// Define the context type
type AuthContextType = {
  state: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

// Registration data type
export type RegisterData = {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Action types
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT_REQUEST' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_FAILURE'; payload: string }
  | { type: 'CHECK_AUTH_REQUEST' }
  | { type: 'CHECK_AUTH_SUCCESS'; payload: User }
  | { type: 'CHECK_AUTH_FAILURE' };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start with loading true to check auth status
  error: null,
};

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
    case 'LOGOUT_REQUEST':
    case 'CHECK_AUTH_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'CHECK_AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
    case 'LOGOUT_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CHECK_AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();
  
  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Check if the user is authenticated
  const checkAuth = async () => {
    dispatch({ type: 'CHECK_AUTH_REQUEST' });
    
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      
      const user = await response.json();
      dispatch({ type: 'CHECK_AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'CHECK_AUTH_FAILURE' });
    }
  };
  
  // Login
  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_REQUEST' });
    
    try {
      const response = await apiRequest('POST', API_ENDPOINTS.AUTH.LOGIN, {
        username,
        password,
      });
      
      const data = await response.json();
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      
      toast({
        title: 'Успешен вход',
        description: SUCCESS_MESSAGES.AUTH.LOGGED_IN,
      });
      
      return true;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: getErrorMessage(error) });
      
      toast({
        title: 'Грешка при вход',
        description: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        variant: 'destructive',
      });
      
      return false;
    }
  };
  
  // Register
  const register = async (userData: RegisterData): Promise<boolean> => {
    dispatch({ type: 'REGISTER_REQUEST' });
    
    try {
      const response = await apiRequest('POST', API_ENDPOINTS.AUTH.REGISTER, userData);
      
      const data = await response.json();
      dispatch({ type: 'REGISTER_SUCCESS', payload: data });
      
      toast({
        title: 'Успешна регистрация',
        description: SUCCESS_MESSAGES.AUTH.REGISTERED,
      });
      
      return true;
    } catch (error) {
      dispatch({ type: 'REGISTER_FAILURE', payload: getErrorMessage(error) });
      
      toast({
        title: 'Грешка при регистрация',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
      
      return false;
    }
  };
  
  // Logout
  const logout = async (): Promise<void> => {
    dispatch({ type: 'LOGOUT_REQUEST' });
    
    try {
      await apiRequest('POST', API_ENDPOINTS.AUTH.LOGOUT);
      
      dispatch({ type: 'LOGOUT_SUCCESS' });
      
      toast({
        title: 'Успешно излизане',
        description: SUCCESS_MESSAGES.AUTH.LOGGED_OUT,
      });
    } catch (error) {
      dispatch({ type: 'LOGOUT_FAILURE', payload: getErrorMessage(error) });
      
      toast({
        title: 'Грешка при излизане',
        description: 'Неуспешно излизане. Моля, опитайте отново.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
