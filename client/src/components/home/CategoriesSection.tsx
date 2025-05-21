import React from 'react';
import { API_ENDPOINTS } from '@/lib/constants';
import CategoryCard from '@/components/product/CategoryCard';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@shared/schema';

const CategoriesSection: React.FC = () => {
  // Fetch categories
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: [API_ENDPOINTS.CATEGORIES],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center font-heading">Категории</h2>
          <div className="flex justify-center">
            <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !categories) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center font-heading">Категории</h2>
          <div className="text-center text-red-500">
            Възникна грешка при зареждане на категориите. Моля, опитайте отново по-късно.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center font-heading">Категории</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
