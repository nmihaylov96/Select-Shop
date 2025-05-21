import React from 'react';
import { Link } from 'wouter';
import { ROUTES } from '@/lib/constants';
import { CategoryCardProps } from '@/lib/types';
import { getCategoryIcon } from '@/lib/icons';

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const categoryIcon = getCategoryIcon(category.icon);
  
  return (
    <div className="relative overflow-hidden rounded-lg shadow-md h-64 group">
      <img 
        src={category.image} 
        alt={category.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-70"></div>
      <div className="absolute bottom-0 left-0 p-6 w-full">
        <Link href={ROUTES.CATEGORY(category.id)}>
          <h3 className="text-2xl font-bold text-white font-heading group-hover:underline flex items-center">
            <span className="mr-2">
              {categoryIcon}
            </span>
            {category.name}
          </h3>
        </Link>
      </div>
    </div>
  );
};

export default CategoryCard;
