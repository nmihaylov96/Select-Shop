import React, { useState } from 'react';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@/lib/icons';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';

const ProductsSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch featured products
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: [API_ENDPOINTS.FEATURED_PRODUCTS],
  });

  // Calculate pagination
  const totalProducts = products?.length || 0;
  const productsPerPage = DEFAULT_PAGE_SIZE;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  
  // Get current products
  const getCurrentProducts = () => {
    if (!products) return [];
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return products.slice(startIndex, endIndex);
  };
  
  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handleLoadMore = () => {
    // In this implementation, we're using client-side pagination
    // This function would load more products from the API in a real app
    // For now, we just show one more page
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold font-heading">Препоръчани продукти</h2>
          {totalPages > 1 && (
            <div className="flex space-x-2">
              <button 
                className={`p-2 rounded-full ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-dark transition'}`}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                aria-label="Предишна страница"
              >
                <ChevronLeftIcon />
              </button>
              <button 
                className={`p-2 rounded-full ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-dark transition'}`}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                aria-label="Следваща страница"
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </div>
        
        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 my-8">
            Възникна грешка при зареждане на продуктите. Моля, опитайте отново по-късно.
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getCurrentProducts().map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 my-8">
            Няма налични препоръчани продукти в момента.
          </div>
        )}
        
        {/* Load More Button */}
        {products && products.length > 0 && currentPage < totalPages && (
          <div className="text-center mt-10">
            <Button 
              className="bg-primary hover:bg-blue-600 text-white py-2 px-6 rounded-md font-medium transition"
              onClick={handleLoadMore}
            >
              Зареди още продукти
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
