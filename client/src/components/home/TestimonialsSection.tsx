import React from 'react';
import { API_ENDPOINTS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { Testimonial } from '@shared/schema';

const TestimonialsSection: React.FC = () => {
  // Fetch testimonials
  const { data: testimonials, isLoading, error } = useQuery<Testimonial[]>({
    queryKey: [API_ENDPOINTS.TESTIMONIALS],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-heading">Какво казват нашите клиенти</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="flex justify-center">
            <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !testimonials) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-heading">Какво казват нашите клиенти</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="text-center text-red-500">
            Възникна грешка при зареждане на отзивите. Моля, опитайте отново по-късно.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 font-heading">Какво казват нашите клиенти</h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {testimonial.image ? (
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </div>
              <p className="text-gray-700">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
