import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
import { SearchIcon, CloseIcon, BoxOpenIcon } from '@/lib/icons';
import { debounce, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@shared/schema';
import { SearchOverlayProps } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  // Set up debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Query results
  const { data: searchResults, isLoading, isError } = useQuery<Product[]>({
    queryKey: [debouncedQuery ? `${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(debouncedQuery)}` : null],
    enabled: debouncedQuery.length > 2,
  });

  // Prevent scrolling when open
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
  const handleOutsideClick = () => {
    onClose();
  };

  // Prevent click propagation to parent
  const handleInsideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length > 2) {
      onClose();
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle product click
  const handleProductClick = (productId: number) => {
    onClose();
    setLocation(ROUTES.PRODUCT_DETAIL(productId));
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 ${isOpen ? 'block' : 'hidden'}`}
      onClick={handleOutsideClick}
    >
      <div 
        className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden transform transition-all"
        onClick={handleInsideClick}
      >
        <div className="p-4">
          <form className="relative" onSubmit={handleSubmit}>
            <Input 
              type="text" 
              className="w-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Търсете продукти..." 
              value={searchQuery}
              onChange={handleInputChange}
              autoFocus
            />
            <button 
              type="submit" 
              className="absolute right-3 top-3 text-gray-500 hover:text-primary"
              aria-label="Търсене"
            >
              <SearchIcon />
            </button>
          </form>
          
          <div className="mt-4 max-h-96 overflow-y-auto">
            {/* Empty search state */}
            {!debouncedQuery && (
              <div className="text-center py-8 text-gray-500">
                <SearchIcon />
                <p className="mt-2">Въведете какво търсите</p>
              </div>
            )}
            
            {/* Loading state */}
            {isLoading && debouncedQuery && (
              <div className="text-center py-8">
                <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-3 text-gray-500">Търсене...</p>
              </div>
            )}
            
            {/* Results */}
            {searchResults && searchResults.length > 0 && (
              <div>
                {searchResults.map(product => (
                  <div 
                    key={product.id} 
                    className="flex items-center py-3 border-b hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="w-16 h-16 flex-shrink-0 mr-4">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold">{product.name}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-primary font-bold">
                          {formatPrice(product.discountedPrice || product.price)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.categoryId === 1 ? 'Футбол' : 
                           product.categoryId === 2 ? 'Баскетбол' : 
                           product.categoryId === 3 ? 'Тенис' : 'Фитнес'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* No results state */}
            {searchResults && searchResults.length === 0 && debouncedQuery && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <BoxOpenIcon />
                <p className="mt-2">Не са намерени продукти, отговарящи на търсенето</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Затвори
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
