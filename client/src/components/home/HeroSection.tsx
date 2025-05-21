import React from 'react';
import { Link } from 'wouter';
import { ROUTES } from '@/lib/constants';
import { ArrowRightIcon } from '@/lib/icons';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-dark text-white">
      {/* Background image */}
      <div className="absolute inset-0 opacity-40">
        <img 
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
          alt="Модерен спортен магазин" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto px-4 py-24 relative">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
            Вашият онлайн магазин за спортни стоки
          </h1>
          <p className="text-xl mb-8">
            Открийте най-доброто оборудване за вашия любим спорт. Качество, което можете да доверите.
          </p>
          <div>
            <Link href={ROUTES.PRODUCTS}>
              <Button 
                className="inline-flex items-center bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md transition"
              >
                Разгледайте продуктите
                <span className="ml-2">
                  <ArrowRightIcon />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
