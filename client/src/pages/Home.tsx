import React from 'react';
import { Helmet } from 'react-helmet';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import ProductsSection from '@/components/home/ProductsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import AboutSection from '@/components/home/AboutSection';

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>SportZone - Вашият онлайн магазин за спортни стоки</title>
        <meta 
          name="description" 
          content="SportZone предлага висококачествени спортни стоки - футболна, баскетболна и тенис екипировка, фитнес аксесоари и спортни обувки на достъпни цени." 
        />
        <meta property="og:title" content="SportZone - Онлайн магазин за спортни стоки" />
        <meta property="og:description" content="Открийте най-доброто оборудване за вашия любим спорт. Качество, което можете да доверите." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <HeroSection />
      <CategoriesSection />
      <ProductsSection />
      <TestimonialsSection />
      <AboutSection />
    </>
  );
};

export default Home;
