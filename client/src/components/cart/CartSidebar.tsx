import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { ROUTES } from '@/lib/constants';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { CloseIcon, TrashIcon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { CartSidebarProps } from '@/lib/types';

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { state, getCartTotal, removeCartItem, updateCartItem } = useCart();
  const { items, loading } = state;
  const total = getCartTotal();

  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // Handle click outside to close
  const handleOutsideClick = (e: React.MouseEvent) => {
    onClose();
  };

  // Prevent click propagation to parent
  const handleInsideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isOpen ? 'block' : 'hidden'}`}
      onClick={handleOutsideClick}
    >
      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-lg transform transition-transform duration-300"
        onClick={handleInsideClick}
      >
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="p-4 border-b flex justify-between items-center bg-primary text-white">
            <h3 className="text-xl font-bold font-heading">
              Вашата количка <span>({items.length})</span>
            </h3>
            <button 
              className="text-white hover:text-gray-200" 
              onClick={onClose}
              aria-label="Затвори количката"
            >
              <CloseIcon />
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Вашата количка е празна</p>
                <Button onClick={onClose} className="bg-primary hover:bg-blue-600">
                  Разгледайте продуктите
                </Button>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex items-center py-4 border-b">
                  <div className="w-20 h-20 flex-shrink-0 mr-4">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold">{item.product.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center">
                        <button 
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                          onClick={() => item.quantity > 1 && updateCartItem(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button 
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-gray-600">
                        {formatPrice(item.product.discountedPrice || item.product.price)}
                      </span>
                      <button 
                        className="text-red-500 hover:text-red-700" 
                        onClick={() => removeCartItem(item.id)}
                        aria-label="Премахни от количката"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Cart Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between mb-4">
              <span className="font-bold">Общо:</span>
              <span className="font-bold text-xl text-primary">{formatPrice(total)}</span>
            </div>
            <div className="space-y-2">
              <Link href={ROUTES.CHECKOUT} className="block w-full">
                <Button 
                  className="w-full bg-primary hover:bg-blue-600 text-white"
                  disabled={items.length === 0}
                >
                  Завърши поръчката
                </Button>
              </Link>
              <Button 
                className="w-full bg-gray-200 hover:bg-gray-300 text-dark" 
                onClick={onClose}
              >
                Продължи пазаруването
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
