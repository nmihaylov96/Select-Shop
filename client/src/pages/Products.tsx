import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE, MIN_PRICE, MAX_PRICE, SORT_OPTIONS } from '@/lib/constants';
import ProductCard from '@/components/product/ProductCard';
import { Product, Category } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const Products: React.FC = () => {
  // Parse query parameters
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const searchQuery = urlParams.get('search') || '';
  const categoryParam = urlParams.get('category');
  
  // State for filters and sorting
  const [selectedCategory, setSelectedCategory] = useState<number | null>(categoryParam ? parseInt(categoryParam) : null);
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [showInStock, setShowInStock] = useState(false);
  
  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [API_ENDPOINTS.PRODUCTS],
  });
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: [API_ENDPOINTS.CATEGORIES],
  });
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, sortBy, searchQuery, showInStock]);
  
  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      // Filter by search query
      if (searchQuery && 
          !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (selectedCategory !== null && product.categoryId !== selectedCategory) {
        return false;
      }
      
      // Filter by price
      const price = product.discountedPrice || product.price;
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }
      
      // Filter by stock
      if (showInStock && product.stock <= 0) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort products
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
  }, [products, searchQuery, selectedCategory, priceRange, sortBy, showInStock]);
  
  // Pagination
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / DEFAULT_PAGE_SIZE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE
  );
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? null : parseInt(categoryId));
  };
  
  // Handle price range change
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  // Loading state
  const isLoading = productsLoading || categoriesLoading;
  
  return (
    <>
      <Helmet>
        <title>Продукти - SportZone</title>
        <meta 
          name="description" 
          content="Разгледайте нашата колекция от висококачествени спортни стоки - футболна, баскетболна и тенис екипировка, фитнес аксесоари и спортни обувки." 
        />
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">
            {searchQuery 
              ? `Резултати за "${searchQuery}"` 
              : selectedCategory && categories?.find(c => c.id === selectedCategory)?.name
              ? categories.find(c => c.id === selectedCategory)?.name
              : 'Всички продукти'}
          </h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-primary">Начало</a>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">Продукти</span>
              </li>
              {searchQuery && (
                <li className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-primary">Търсене: {searchQuery}</span>
                </li>
              )}
              {selectedCategory && categories?.find(c => c.id === selectedCategory) && (
                <li className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-primary">{categories.find(c => c.id === selectedCategory)?.name}</span>
                </li>
              )}
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row">
          {/* Filters sidebar */}
          <div className="w-full md:w-1/4 pr-0 md:pr-6 mb-8 md:mb-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 font-heading">Филтри</h2>
              
              {/* Categories filter */}
              <div className="mb-6">
                <Label htmlFor="category" className="block mb-2 font-medium">Категория</Label>
                <Select 
                  value={selectedCategory !== null ? selectedCategory.toString() : 'all'} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Избери категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички категории</SelectItem>
                    {categories?.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price range filter */}
              <div className="mb-6">
                <Label className="block mb-2 font-medium">Цена</Label>
                <div className="pt-4 pb-2">
                  <Slider 
                    defaultValue={[MIN_PRICE, MAX_PRICE]} 
                    min={MIN_PRICE} 
                    max={MAX_PRICE} 
                    step={10} 
                    value={[priceRange[0], priceRange[1]]}
                    onValueChange={handlePriceRangeChange}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span>{priceRange[0]} лв.</span>
                  <span>{priceRange[1]} лв.</span>
                </div>
              </div>
              
              {/* Stock filter */}
              <div className="mb-6">
                <div className="flex items-center">
                  <Checkbox 
                    id="inStock" 
                    checked={showInStock} 
                    onCheckedChange={() => setShowInStock(!showInStock)}
                  />
                  <Label htmlFor="inStock" className="ml-2">Само налични</Label>
                </div>
              </div>
              
              {/* Reset filters button */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSelectedCategory(null);
                  setPriceRange([MIN_PRICE, MAX_PRICE]);
                  setShowInStock(false);
                  setSortBy('featured');
                }}
              >
                Изчисти филтрите
              </Button>
            </div>
          </div>
          
          {/* Products grid */}
          <div className="w-full md:w-3/4">
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
                    {SORT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Products */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Няма намерени продукти</h3>
                <p className="text-gray-600 mb-6">Опитайте с други критерии за търсене или филтри.</p>
                <Button 
                  variant="default" 
                  onClick={() => {
                    setSelectedCategory(null);
                    setPriceRange([MIN_PRICE, MAX_PRICE]);
                    setShowInStock(false);
                    setSortBy('featured');
                  }}
                >
                  Изчисти филтрите
                </Button>
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
        </div>
      </div>
    </>
  );
};

export default Products;
