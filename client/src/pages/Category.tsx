import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import ProductCard from '@/components/product/ProductCard';
import { Product, Category } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CategoryPage: React.FC = () => {
  const [match, params] = useRoute<{ id: string }>('/category/:id');
  const categoryId = parseInt(params?.id || '0');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  
  // Fetch category details
  const { data: categories } = useQuery<Category[]>({
    queryKey: [API_ENDPOINTS.CATEGORIES],
  });
  
  const category = categories?.find(c => c.id === categoryId);
  
  // Fetch products by category
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: [API_ENDPOINTS.PRODUCTS_BY_CATEGORY(categoryId)],
    enabled: !!categoryId,
  });
  
  // Sort products
  const sortedProducts = React.useMemo(() => {
    if (!products) return [];
    
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'priceAsc':
          return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        case 'priceDesc':
          return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'ratingDesc':
          return b.rating - a.rating;
        default: // 'featured'
          return b.featured === a.featured ? 0 : b.featured ? 1 : -1;
      }
    });
  }, [products, sortBy]);
  
  // Pagination
  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / DEFAULT_PAGE_SIZE);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE
  );
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };
  
  if (!category && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Категорията не беше намерена</h2>
          <p className="text-gray-600 mb-6">Извиняваме се, но категорията, която търсите, не съществува или е временно недостъпна.</p>
          <Button href="/">Към началната страница</Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{category?.name || 'Категория'} - SportZone</title>
        <meta 
          name="description" 
          content={`Разгледайте нашата колекция от ${category?.name?.toLowerCase() || 'спортни стоки'} на достъпни цени и с безплатна доставка.`} 
        />
      </Helmet>
      
      <div className="py-10 bg-dark text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">
            {category?.name || 'Зареждане...'}
          </h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-300 hover:text-white">Начало</a>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <a href="/products" className="text-gray-300 hover:text-white">Продукти</a>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-white">{category?.name || 'Зареждане...'}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Sort and count info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <p className="text-gray-600 mb-4 sm:mb-0">
            Показване на {currentProducts.length} от {totalProducts} продукта
          </p>
          
          <div className="w-full sm:w-auto">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Сортирай по" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Препоръчани</SelectItem>
                <SelectItem value="priceAsc">Цена (ниска към висока)</SelectItem>
                <SelectItem value="priceDesc">Цена (висока към ниска)</SelectItem>
                <SelectItem value="nameAsc">Име (А-Я)</SelectItem>
                <SelectItem value="nameDesc">Име (Я-А)</SelectItem>
                <SelectItem value="ratingDesc">Най-високо оценени</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Products */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Възникна грешка при зареждане на продуктите.</p>
            <Button onClick={() => window.location.reload()}>Опитайте отново</Button>
          </div>
        ) : currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Няма намерени продукти</h3>
            <p className="text-gray-600">В тази категория все още няма продукти или те са временно изчерпани.</p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <div className="flex space-x-1">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
              >
                «
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ‹
              </Button>
              
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                // Show current page, first page, last page, and pages around current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <span key={page} className="flex items-center px-3">...</span>;
                }
                return null;
              })}
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                ›
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
              >
                »
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;
