import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { formatPrice, getBadgeText, getBadgeColorClass, cn } from '@/lib/utils';
import { Product, Category } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CartIcon, StarIcon, HalfStarIcon, EmptyStarIcon } from '@/lib/icons';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/product/ProductCard';
import ProductReviews from '@/components/product/ProductReviews';

const ProductDetail: React.FC = () => {
  const [match, params] = useRoute<{ id: string }>('/product/:id');
  const productId = parseInt(params?.id || '0');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Fetch product details
  const { data: product, isLoading: productLoading, error: productError } = useQuery<Product>({
    queryKey: [API_ENDPOINTS.PRODUCT_DETAIL(productId)],
    enabled: !!productId,
  });

  // Fetch categories for breadcrumb
  const { data: categories } = useQuery<Category[]>({
    queryKey: [API_ENDPOINTS.CATEGORIES],
  });

  // Fetch related products
  const { data: relatedProducts, isLoading: relatedLoading } = useQuery<Product[]>({
    queryKey: [product ? API_ENDPOINTS.PRODUCTS_BY_CATEGORY(product.categoryId) : null],
    enabled: !!product,
  });

  // Fetch reviews to get actual count
  const { data: reviews } = useQuery<any[]>({
    queryKey: ['/api/reviews', productId],
    enabled: !!productId,
  });

  const actualReviewCount = reviews ? reviews.length : 0;

  // Helper to render the stars based on rating
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={`star-${i}`} />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<HalfStarIcon key="half-star" />);
    }
    
    // Add empty stars to reach 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<EmptyStarIcon key={`empty-${i}`} />);
    }
    
    return stars;
  };

  // Handle quantity change
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  // Get category name
  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || '';
  };

  // Loading state
  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Продуктът не беше намерен</h2>
          <p className="text-gray-600 mb-6">Извиняваме се, но продуктът, който търсите, не съществува или е временно недостъпен.</p>
          <Link href={ROUTES.PRODUCTS}>
            <Button>Разгледайте всички продукти</Button>
          </Link>
        </div>
      </div>
    );
  }

  const badgeText = getBadgeText(product);
  const badgeColorClass = getBadgeColorClass(badgeText);

  return (
    <>
      <Helmet>
        <title>{product.name} - SportZone</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} - SportZone`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href={ROUTES.HOME} className="text-gray-600 hover:text-primary">
                  Начало
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href={ROUTES.PRODUCTS} className="text-gray-600 hover:text-primary">
                  Продукти
                </Link>
              </li>
              {product.categoryId && (
                <li className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link 
                    href={ROUTES.CATEGORY(product.categoryId)} 
                    className="text-gray-600 hover:text-primary"
                  >
                    {getCategoryName(product.categoryId)}
                  </Link>
                </li>
              )}
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">{product.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-auto object-cover"
              />
            </div>
            {badgeText && (
              <span className={cn(
                "absolute top-4 left-4 inline-block px-3 py-1 text-white text-sm font-bold rounded-md",
                badgeColorClass
              )}>
                {badgeText}
              </span>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2 font-heading">{product.name}</h1>
            
            <div className="flex items-center mb-4 text-yellow-400">
              {renderRating(product.rating)}
              <span className="text-sm text-gray-500 ml-2">({product.reviewCount} отзива)</span>
            </div>
            
            <div className="mb-6">
              {product.discountedPrice ? (
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-primary mr-3">
                    {formatPrice(product.discountedPrice)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                {product.description}
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <span className="mr-3 font-medium">Наличност:</span>
                {product.stock > 0 ? (
                  <span className="text-green-600">В наличност</span>
                ) : (
                  <span className="text-red-600">Изчерпан</span>
                )}
              </div>
              
              <div className="flex items-center mt-2">
                <span className="mr-3 font-medium">Категория:</span>
                <Link 
                  href={ROUTES.CATEGORY(product.categoryId)} 
                  className="text-primary hover:underline"
                >
                  {getCategoryName(product.categoryId)}
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8">
              <div className="flex items-center mb-4 sm:mb-0 sm:mr-4">
                <span className="mr-3 font-medium">Количество:</span>
                <div className="flex items-center">
                  <button 
                    className="w-10 h-10 bg-gray-200 rounded-l-md flex items-center justify-center"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <Input 
                    type="number" 
                    min="1" 
                    max={product.stock} 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    className="w-16 h-10 text-center rounded-none border-x-0"
                  />
                  <button 
                    className="w-10 h-10 bg-gray-200 rounded-r-md flex items-center justify-center"
                    onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <Button 
                className="w-full sm:w-auto flex items-center justify-center bg-primary hover:bg-blue-600"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <CartIcon className="mr-2" />
                Добави в количката
              </Button>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Описание</TabsTrigger>
              <TabsTrigger value="specifications">Спецификации</TabsTrigger>
              <TabsTrigger value="reviews">Отзиви ({actualReviewCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-6 bg-white rounded-b-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Описание на продукта</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {product.description}
              </p>
            </TabsContent>
            <TabsContent value="specifications" className="p-6 bg-white rounded-b-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Спецификации</h3>
              <table className="w-full text-left">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Категория</td>
                    <td className="py-2">{getCategoryName(product.categoryId)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Марка</td>
                    <td className="py-2">SportZone</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Рейтинг</td>
                    <td className="py-2 flex items-center text-yellow-400">
                      {renderRating(product.rating)}
                      <span className="text-gray-500 ml-2">({product.rating})</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Наличност</td>
                    <td className="py-2">{product.stock} бр.</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>
            <TabsContent value="reviews" className="p-6 bg-white rounded-b-lg shadow-md">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 font-heading">Подобни продукти</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter(p => p.id !== productId)
                .slice(0, 4)
                .map(relatedProduct => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
