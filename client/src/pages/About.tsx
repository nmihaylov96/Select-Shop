import React from 'react';
import { Helmet } from 'react-helmet';
import AboutSection from '@/components/home/AboutSection';

const About: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>За нас - SportZone</title>
        <meta 
          name="description" 
          content="Научете повече за SportZone - водещият онлайн магазин за спортни стоки в България. Нашата история, мисия и екип." 
        />
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">За нас</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-primary">Начало</a>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">За нас</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 font-heading">Нашата История</h2>
            <p className="text-gray-700 mb-6">
              SportZone е основан през 2010 година от група ентусиазирани спортисти, които искаха да създадат онлайн пространство, където качествените спортни стоки са достъпни за всеки българин. От малък онлайн магазин, днес ние сме се превърнали в един от водещите доставчици на спортна екипировка в страната.
            </p>
            <p className="text-gray-700 mb-6">
              През годините изградихме силни партньорства с водещи световни брандове като Nike, Adidas, Puma, Under Armour, Wilson, Spalding и много други. Това ни позволява да предлагаме на нашите клиенти оригинални продукти с гарантирано качество на конкурентни цени.
            </p>
            
            <div className="my-10">
              <img 
                src="https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600" 
                alt="Екипът на SportZone" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            
            <h2 className="text-3xl font-bold mb-6 font-heading">Нашата Мисия</h2>
            <p className="text-gray-700 mb-6">
              Мисията на SportZone е да вдъхновява и подкрепя активния начин на живот, като предоставя висококачествени спортни продукти на достъпни цени. Вярваме, че спортът има силата да променя животи и да изгражда по-здрави общности.
            </p>
            <p className="text-gray-700 mb-6">
              Стремим се да предлагаме не само продукти, но и експертни съвети и персонализирано обслужване, което да помогне на нашите клиенти да намерят идеалната екипировка за техните спортни нужди и цели.
            </p>
            
            <h2 className="text-3xl font-bold mb-6 font-heading">Нашите Ценности</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-3 font-heading">Качество</h3>
                <p className="text-gray-700">Предлагаме само продукти, в чието качество сме уверени и които бихме използвали сами.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-3 font-heading">Честност</h3>
                <p className="text-gray-700">Вярваме в прозрачните бизнес практики и изграждане на доверие с нашите клиенти.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-3 font-heading">Иновации</h3>
                <p className="text-gray-700">Постоянно търсим нови начини да подобрим нашите продукти и услуги.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-3 font-heading">Страст към спорта</h3>
                <p className="text-gray-700">Всички в нашия екип споделят любовта към спорта и активния начин на живот.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AboutSection />
    </>
  );
};

export default About;
