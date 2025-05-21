import React from 'react';
import { CalendarIcon, TargetIcon, TeamIcon, TrophyIcon } from '@/lib/icons';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-3 font-heading">За нас</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Нашата история и мисия</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 font-heading">Кои сме ние?</h3>
              <p className="text-gray-700 mb-4">SportZone е водещ онлайн магазин за спортни стоки в България.</p>
            </div>
            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white">
                    <CalendarIcon />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 font-heading">Основаване</h4>
                  <p className="text-gray-700">Компанията е основана през 2010 година от група ентусиазирани спортисти.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white">
                    <TargetIcon />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 font-heading">Мисия</h4>
                  <p className="text-gray-700">Нашата мисия е да предоставяме висококачествени спортни продукти на достъпни цени и да вдъхновяваме активен начин на живот.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white">
                    <TeamIcon />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 font-heading">Екип</h4>
                  <p className="text-gray-700">Нашият екип се състои от професионалисти с дългогодишен опит в спорта и търговията.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
              alt="Нашият магазин" 
              className="rounded-lg shadow-lg w-full h-auto object-cover"
            />
            
            <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-lg shadow-lg max-w-xs hidden md:block">
              <div className="flex items-center space-x-4">
                <div className="bg-primary rounded-full p-3 text-white">
                  <TrophyIcon />
                </div>
                <div>
                  <h4 className="font-bold">Над 100,000</h4>
                  <p className="text-sm text-gray-600">доволни клиенти за 13 години</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
