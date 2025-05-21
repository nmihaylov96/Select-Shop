import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  RunningIcon, 
  CartIcon, 
  UserIcon, 
  SearchIcon, 
  MenuIcon,
  ChevronDownIcon
} from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { User } from '@shared/schema';

interface HeaderProps {
  onCartClick: () => void;
  onSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, onSearchClick }) => {
  const [location] = useLocation();
  const { state: authState, logout } = useAuth();
  const { getCartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const cartCount = getCartCount();
  const isAuthenticated = authState.isAuthenticated;
  const user = authState.user;
  const isAdmin = user?.isAdmin;
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };
  
  const closeDropdowns = () => {
    setIsUserDropdownOpen(false);
    setIsDropdownOpen(false);
  };
  
  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={ROUTES.HOME} className="flex items-center">
              <span className="text-primary text-3xl mr-2">
                <RunningIcon />
              </span>
              <span className="text-2xl font-bold font-heading text-dark">SportZone</span>
            </Link>
          </div>
          
          {/* Main Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href={ROUTES.HOME} 
              className={cn(
                "nav-link font-medium text-dark hover:text-primary transition",
                location === ROUTES.HOME && "text-primary"
              )}
            >
              Начало
            </Link>
            <Link 
              href={ROUTES.ABOUT} 
              className={cn(
                "nav-link font-medium text-dark hover:text-primary transition",
                location === ROUTES.ABOUT && "text-primary"
              )}
            >
              За нас
            </Link>
            
            {/* Dropdown for Products */}
            <div className="dropdown relative">
              <button 
                className="nav-link font-medium text-dark hover:text-primary transition flex items-center"
                onClick={toggleDropdown}
              >
                Продукти
                <span className="ml-1 text-xs"><ChevronDownIcon /></span>
              </button>
              <div 
                className={cn(
                  "dropdown-menu absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50",
                  isDropdownOpen ? "block" : "hidden"
                )}
              >
                <Link 
                  href={ROUTES.CATEGORY(1)} 
                  className="block px-4 py-2 text-sm text-dark hover:bg-primary hover:text-white"
                  onClick={closeDropdowns}
                >
                  Футбол
                </Link>
                <Link 
                  href={ROUTES.CATEGORY(2)} 
                  className="block px-4 py-2 text-sm text-dark hover:bg-primary hover:text-white"
                  onClick={closeDropdowns}
                >
                  Баскетбол
                </Link>
                <Link 
                  href={ROUTES.CATEGORY(3)} 
                  className="block px-4 py-2 text-sm text-dark hover:bg-primary hover:text-white"
                  onClick={closeDropdowns}
                >
                  Тенис
                </Link>
                <Link 
                  href={ROUTES.CATEGORY(4)} 
                  className="block px-4 py-2 text-sm text-dark hover:bg-primary hover:text-white"
                  onClick={closeDropdowns}
                >
                  Фитнес
                </Link>
              </div>
            </div>
            
            <Link 
              href={ROUTES.CONTACT} 
              className={cn(
                "nav-link font-medium text-dark hover:text-primary transition",
                location === ROUTES.CONTACT && "text-primary"
              )}
            >
              Контакти
            </Link>
            
            {/* Admin Portal - Only visible to admin users */}
            {isAdmin && (
              <Link 
                href={ROUTES.ADMIN} 
                className={cn(
                  "nav-link font-medium text-dark hover:text-primary transition bg-gray-100 rounded-md px-3 py-1",
                  location === ROUTES.ADMIN && "text-white bg-primary"
                )}
              >
                Админ Портал
              </Link>
            )}
          </nav>
          
          {/* Right Navigation Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button 
              className="text-dark hover:text-primary p-1" 
              onClick={onSearchClick}
              aria-label="Търсене"
            >
              <span className="text-xl"><SearchIcon /></span>
            </button>
            
            {/* Shopping Cart */}
            <div className="relative">
              <button 
                className="text-dark hover:text-primary p-1" 
                onClick={onCartClick}
                aria-label="Количка"
              >
                <span className="text-xl"><CartIcon /></span>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </button>
            </div>
            
            {/* User Account */}
            <div className="dropdown relative">
              <button 
                className="text-dark hover:text-primary p-1" 
                aria-label="Отвори потребителско меню"
                onClick={toggleUserDropdown}
              >
                <span className="text-xl"><UserIcon /></span>
              </button>
              
              <div 
                className={cn(
                  "dropdown-menu absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50",
                  isUserDropdownOpen ? "block" : "hidden"
                )}
              >
                {!isAuthenticated ? (
                  <>
                    <Link 
                      href={ROUTES.LOGIN} 
                      className="block px-4 py-2 text-sm text-dark hover:bg-primary hover:text-white"
                      onClick={closeDropdowns}
                    >
                      Вход
                    </Link>
                    <Link 
                      href={ROUTES.REGISTER} 
                      className="block px-4 py-2 text-sm text-dark hover:bg-primary hover:text-white"
                      onClick={closeDropdowns}
                    >
                      Регистрация
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href={ROUTES.PROFILE} 
                      className="block px-4 py-2 text-sm text-dark hover:bg-primary hover:text-white"
                      onClick={closeDropdowns}
                    >
                      Профил
                    </Link>
                    {isAdmin && (
                      <Link 
                        href={ROUTES.ADMIN} 
                        className="block px-4 py-2 text-sm text-dark hover:bg-primary hover:text-white"
                        onClick={closeDropdowns}
                      >
                        Админ Портал
                      </Link>
                    )}
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-dark hover:bg-primary hover:text-white"
                      onClick={handleLogout}
                    >
                      Изход
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-dark p-1" 
              onClick={toggleMobileMenu}
              aria-label="Отвори главно меню"
            >
              <span className="sr-only">Отвори главно меню</span>
              <span className="text-2xl"><MenuIcon /></span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu (hidden by default) */}
      <div className={cn("md:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <div className="container mx-auto px-4 py-3 space-y-2">
          <Link 
            href={ROUTES.HOME} 
            className="block py-2 font-medium text-dark"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Начало
          </Link>
          <Link 
            href={ROUTES.ABOUT} 
            className="block py-2 font-medium text-dark"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            За нас
          </Link>
          <Link 
            href={ROUTES.PRODUCTS} 
            className="block py-2 font-medium text-dark"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Продукти
          </Link>
          <Link 
            href={ROUTES.CONTACT} 
            className="block py-2 font-medium text-dark"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Контакти
          </Link>
        </div>
        
        <div className="container mx-auto px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* User Info if Logged In */}
            {isAuthenticated && user && (
              <div className="flex items-center">
                <span className="text-xl mr-2"><UserIcon /></span>
                <div>
                  <div className="text-sm font-medium">{user.firstName || 'Потребител'}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
            )}
            
            {/* Cart Info */}
            <div className="flex items-center">
              <span className="mr-2"><CartIcon /></span>
              <div>
                <div className="text-sm font-medium">Количка</div>
                <div className="text-xs text-gray-500">{cartCount}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 space-y-2">
            {isAuthenticated ? (
              <>
                <Link 
                  href={ROUTES.PROFILE} 
                  className="block py-2 text-sm font-medium text-dark"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Профил
                </Link>
                {isAdmin && (
                  <Link 
                    href={ROUTES.ADMIN} 
                    className="block py-2 text-sm font-medium text-dark"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Админ панел
                  </Link>
                )}
                <button 
                  className="block w-full text-left py-2 text-sm font-medium text-dark"
                  onClick={handleLogout}
                >
                  Изход
                </button>
              </>
            ) : (
              <>
                <Link 
                  href={ROUTES.LOGIN} 
                  className="block py-2 text-sm font-medium text-dark"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Вход
                </Link>
                <Link 
                  href={ROUTES.REGISTER} 
                  className="block py-2 text-sm font-medium text-dark"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
