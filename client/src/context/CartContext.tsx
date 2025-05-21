import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage, calculateTotal } from '@/lib/utils';
import { CartItem, Product } from '@shared/schema';
import { CartItemWithProduct, CartState } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import { queryClient } from '@/lib/queryClient';

// Define the context type
type CartContextType = {
  state: CartState;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  removeCartItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  getCartTotal: () => number;
};

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Initial state
const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// Define action types
type CartAction =
  | { type: 'FETCH_CART_REQUEST' }
  | { type: 'FETCH_CART_SUCCESS'; payload: CartItemWithProduct[] }
  | { type: 'FETCH_CART_FAILURE'; payload: string }
  | { type: 'ADD_TO_CART_REQUEST' }
  | { type: 'ADD_TO_CART_SUCCESS'; payload: CartItemWithProduct }
  | { type: 'ADD_TO_CART_FAILURE'; payload: string }
  | { type: 'UPDATE_CART_ITEM_REQUEST' }
  | { type: 'UPDATE_CART_ITEM_SUCCESS'; payload: { id: number; quantity: number } }
  | { type: 'UPDATE_CART_ITEM_FAILURE'; payload: string }
  | { type: 'REMOVE_CART_ITEM_REQUEST' }
  | { type: 'REMOVE_CART_ITEM_SUCCESS'; payload: number }
  | { type: 'REMOVE_CART_ITEM_FAILURE'; payload: string }
  | { type: 'CLEAR_CART_REQUEST' }
  | { type: 'CLEAR_CART_SUCCESS' }
  | { type: 'CLEAR_CART_FAILURE'; payload: string };

// Reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'FETCH_CART_REQUEST':
    case 'ADD_TO_CART_REQUEST':
    case 'UPDATE_CART_ITEM_REQUEST':
    case 'REMOVE_CART_ITEM_REQUEST':
    case 'CLEAR_CART_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_CART_SUCCESS':
      return {
        ...state,
        items: action.payload,
        loading: false,
      };
    case 'ADD_TO_CART_SUCCESS':
      // Check if item already exists
      const existingIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      );
      
      if (existingIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = action.payload;
        
        return {
          ...state,
          items: updatedItems,
          loading: false,
        };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, action.payload],
          loading: false,
        };
      }
    case 'UPDATE_CART_ITEM_SUCCESS':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        loading: false,
      };
    case 'REMOVE_CART_ITEM_SUCCESS':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        loading: false,
      };
    case 'CLEAR_CART_SUCCESS':
      return {
        ...state,
        items: [],
        loading: false,
      };
    case 'FETCH_CART_FAILURE':
    case 'ADD_TO_CART_FAILURE':
    case 'UPDATE_CART_ITEM_FAILURE':
    case 'REMOVE_CART_ITEM_FAILURE':
    case 'CLEAR_CART_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

// CartProvider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { toast } = useToast();

  // Initialize cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const authResponse = await fetch(API_ENDPOINTS.AUTH.ME, { 
          credentials: 'include' 
        });
        
        if (authResponse.ok) {
          // Only fetch cart if user is authenticated
          dispatch({ type: 'FETCH_CART_REQUEST' });
          
          try {
            const cartResponse = await fetch(API_ENDPOINTS.CART, { 
              credentials: 'include' 
            });
            
            if (cartResponse.ok) {
              const cartData = await cartResponse.json();
              dispatch({ type: 'FETCH_CART_SUCCESS', payload: cartData });
            } else {
              dispatch({ type: 'FETCH_CART_FAILURE', payload: 'Failed to fetch cart' });
            }
          } catch (error) {
            dispatch({ type: 'FETCH_CART_FAILURE', payload: getErrorMessage(error) });
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    
    fetchCart();
  }, []);

  // Add to cart
  const addToCart = async (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART_REQUEST' });
    
    try {
      // Check auth first
      const authResponse = await fetch(API_ENDPOINTS.AUTH.ME, { 
        credentials: 'include' 
      });
      
      if (!authResponse.ok) {
        toast({
          title: 'Необходим е вход',
          description: 'Моля, влезте в профила си, за да добавите продукти в количката.',
          variant: 'destructive',
        });
        dispatch({ type: 'ADD_TO_CART_FAILURE', payload: 'Not authenticated' });
        return;
      }
      
      const response = await apiRequest('POST', API_ENDPOINTS.CART, {
        productId: product.id,
        quantity,
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      
      const data = await response.json();
      dispatch({ type: 'ADD_TO_CART_SUCCESS', payload: data });
      
      toast({
        title: 'Добавено в количката',
        description: SUCCESS_MESSAGES.CART.ADDED,
      });
      
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CART] });
    } catch (error) {
      dispatch({ type: 'ADD_TO_CART_FAILURE', payload: getErrorMessage(error) });
      
      toast({
        title: 'Грешка',
        description: ERROR_MESSAGES.CART.ADD_FAILED,
        variant: 'destructive',
      });
    }
  };

  // Update cart item
  const updateCartItem = async (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_ITEM_REQUEST' });
    
    try {
      const response = await apiRequest('PUT', API_ENDPOINTS.CART_ITEM(id), {
        quantity,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }
      
      dispatch({ 
        type: 'UPDATE_CART_ITEM_SUCCESS', 
        payload: { id, quantity } 
      });
      
      toast({
        title: 'Количката е обновена',
        description: SUCCESS_MESSAGES.CART.UPDATED,
      });
      
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CART] });
    } catch (error) {
      dispatch({ type: 'UPDATE_CART_ITEM_FAILURE', payload: getErrorMessage(error) });
      
      toast({
        title: 'Грешка',
        description: ERROR_MESSAGES.CART.UPDATE_FAILED,
        variant: 'destructive',
      });
    }
  };

  // Remove cart item
  const removeCartItem = async (id: number) => {
    dispatch({ type: 'REMOVE_CART_ITEM_REQUEST' });
    
    try {
      const response = await apiRequest('DELETE', API_ENDPOINTS.CART_ITEM(id));
      
      if (!response.ok) {
        throw new Error('Failed to remove cart item');
      }
      
      dispatch({ type: 'REMOVE_CART_ITEM_SUCCESS', payload: id });
      
      toast({
        title: 'Премахнато от количката',
        description: SUCCESS_MESSAGES.CART.REMOVED,
      });
      
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CART] });
    } catch (error) {
      dispatch({ type: 'REMOVE_CART_ITEM_FAILURE', payload: getErrorMessage(error) });
      
      toast({
        title: 'Грешка',
        description: ERROR_MESSAGES.CART.REMOVE_FAILED,
        variant: 'destructive',
      });
    }
  };

  // Clear cart
  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART_REQUEST' });
    
    try {
      const response = await apiRequest('DELETE', API_ENDPOINTS.CART);
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      
      dispatch({ type: 'CLEAR_CART_SUCCESS' });
      
      toast({
        title: 'Количката е изчистена',
        description: SUCCESS_MESSAGES.CART.CLEARED,
      });
      
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CART] });
    } catch (error) {
      dispatch({ type: 'CLEAR_CART_FAILURE', payload: getErrorMessage(error) });
      
      toast({
        title: 'Грешка',
        description: 'Неуспешно изчистване на количката. Моля, опитайте отново.',
        variant: 'destructive',
      });
    }
  };

  // Get cart count
  const getCartCount = (): number => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  // Get cart total
  const getCartTotal = (): number => {
    return calculateTotal(state.items);
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};
