import React from 'react';
import { Link } from 'wouter';
import { ROUTES } from '@/lib/constants';
import { 
  RunningIcon, 
  FacebookIcon, 
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  LocationIcon,
  PhoneIcon,
  EmailIcon,
  VisaIcon,
  MastercardIcon,
  PayPalIcon,
  CashIcon
} from '@/lib/icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white pt-16 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">SportZone</h3>
            <p className="text-gray-400 mb-4">Вашият надежден партньор за качествени спортни стоки от 2010 година.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Twitter">
                <TwitterIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Youtube">
                <YoutubeIcon />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">Категории</h3>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.CATEGORY(1)} className="text-gray-400 hover:text-white transition">
                  Футбол
                </Link>
              </li>
              <li>
                <Link href={ROUTES.CATEGORY(2)} className="text-gray-400 hover:text-white transition">
                  Баскетбол
                </Link>
              </li>
              <li>
                <Link href={ROUTES.CATEGORY(3)} className="text-gray-400 hover:text-white transition">
                  Тенис
                </Link>
              </li>
              <li>
                <Link href={ROUTES.CATEGORY(4)} className="text-gray-400 hover:text-white transition">
                  Фитнес
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-gray-400 hover:text-white transition">
                  Обувки
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-gray-400 hover:text-white transition">
                  Екипировка
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">Информация</h3>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.ABOUT} className="text-gray-400 hover:text-white transition">
                  За нас
                </Link>
              </li>
              <li>
                <Link href={ROUTES.CONTACT} className="text-gray-400 hover:text-white transition">
                  Контакти
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Доставка
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Връщане на стоки
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Условия за ползване
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Политика за поверителност
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">Контакти</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="mt-1 mr-3 text-primary"><LocationIcon /></span>
                <span className="text-gray-400">
                  ул. Спортна 123<br />София 1000, България
                </span>
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-primary"><PhoneIcon /></span>
                <span className="text-gray-400">+359 2 123 4567</span>
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-primary"><EmailIcon /></span>
                <span className="text-gray-400">info@sportzone.bg</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} SportZone. Всички права запазени.</p>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm mr-2">Начини на плащане:</span>
              <span className="text-2xl text-gray-400"><VisaIcon /></span>
              <span className="text-2xl text-gray-400"><MastercardIcon /></span>
              <span className="text-2xl text-gray-400"><PayPalIcon /></span>
              <span className="text-2xl text-gray-400"><CashIcon /></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
