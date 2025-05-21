import React from 'react';

// Sport icons
export const FootballIcon = () => <i className="fas fa-futbol"></i>;
export const BasketballIcon = () => <i className="fas fa-basketball-ball"></i>;
export const TennisIcon = () => <i className="fas fa-table-tennis"></i>;
export const FitnessIcon = () => <i className="fas fa-dumbbell"></i>;

// UI Icons
export const CartIcon = () => <i className="fas fa-shopping-cart"></i>;
export const UserIcon = () => <i className="fas fa-user-circle"></i>;
export const SearchIcon = () => <i className="fas fa-search"></i>;
export const MenuIcon = () => <i className="fas fa-bars"></i>;
export const CloseIcon = () => <i className="fas fa-times"></i>;
export const StarIcon = () => <i className="fas fa-star"></i>;
export const HalfStarIcon = () => <i className="fas fa-star-half-alt"></i>;
export const EmptyStarIcon = () => <i className="far fa-star"></i>;
export const ArrowRightIcon = () => <i className="fas fa-arrow-right"></i>;
export const ChevronDownIcon = () => <i className="fas fa-chevron-down"></i>;
export const ChevronLeftIcon = () => <i className="fas fa-chevron-left"></i>;
export const ChevronRightIcon = () => <i className="fas fa-chevron-right"></i>;
export const TrashIcon = () => <i className="fas fa-trash-alt"></i>;
export const CalendarIcon = () => <i className="fas fa-calendar-alt"></i>;
export const TargetIcon = () => <i className="fas fa-bullseye"></i>;
export const TeamIcon = () => <i className="fas fa-users"></i>;
export const TrophyIcon = () => <i className="fas fa-trophy"></i>;
export const LocationIcon = () => <i className="fas fa-map-marker-alt"></i>;
export const PhoneIcon = () => <i className="fas fa-phone-alt"></i>;
export const EmailIcon = () => <i className="fas fa-envelope"></i>;
export const RunningIcon = () => <i className="fas fa-running"></i>;
export const BoxOpenIcon = () => <i className="fas fa-box-open"></i>;

// Social Media Icons
export const FacebookIcon = () => <i className="fab fa-facebook-f"></i>;
export const InstagramIcon = () => <i className="fab fa-instagram"></i>;
export const TwitterIcon = () => <i className="fab fa-twitter"></i>;
export const YoutubeIcon = () => <i className="fab fa-youtube"></i>;

// Payment Icons
export const VisaIcon = () => <i className="fab fa-cc-visa"></i>;
export const MastercardIcon = () => <i className="fab fa-cc-mastercard"></i>;
export const PayPalIcon = () => <i className="fab fa-cc-paypal"></i>;
export const CashIcon = () => <i className="fas fa-money-bill-wave"></i>;

// Function to get category icon by name
export const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'fa-futbol':
      return <FootballIcon />;
    case 'fa-basketball-ball':
      return <BasketballIcon />;
    case 'fa-table-tennis':
      return <TennisIcon />;
    case 'fa-dumbbell':
      return <FitnessIcon />;
    default:
      return null;
  }
};
