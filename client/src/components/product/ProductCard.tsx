import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { formatPrice, getBadgeText, getBadgeColorClass, cn } from '@/lib/utils';
import { ProductCardProps } from '@/lib/types';
import { CartIcon, StarIcon, HalfStarIcon, EmptyStarIcon } from '@/lib/icons';
import { useCart } from '@/context/CartContext';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const badgeText = getBadgeText(product);
  const badgeColorClass = getBadgeColorClass(badgeText);
  
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
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  return (
    <Link href={ROUTES.PRODUCT_DETAIL(product.id)}>
      <div className="product-card bg-white rounded-lg overflow-hidden shadow-md">
        <div className="relative h-48">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{product.name}</h3>
            
            {badgeText && (
              <span className={cn("inline-block px-2 py-1 text-white text-xs font-bold rounded-md", badgeColorClass)}>
                {badgeText}
              </span>
            )}
          </div>
          
          <div className="flex items-center mb-2 text-yellow-400">
            {renderRating(product.rating)}
            <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            {product.discountedPrice ? (
              <div>
                <span className="text-xl font-bold text-primary">{formatPrice(product.discountedPrice)}</span>
                <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
            )}
            
            <button 
              onClick={handleAddToCart}
              className="bg-primary hover:bg-blue-600 text-white p-2 rounded-full"
              aria-label="Добави в количката"
            >
              <CartIcon />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
