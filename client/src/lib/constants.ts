// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  FEATURED_PRODUCTS: '/api/products/featured',
  CATEGORIES: '/api/categories',
  PRODUCTS_BY_CATEGORY: (id: number) => `/api/products/category/${id}`,
  PRODUCT_DETAIL: (id: number) => `/api/products/${id}`,
  SEARCH: '/api/products/search',
  TESTIMONIALS: '/api/testimonials',
  CART: '/api/cart',
  CART_ITEM: (id: number) => `/api/cart/${id}`,
  ORDERS: '/api/orders',
  ORDER_DETAIL: (id: number) => `/api/orders/${id}`,
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  ADMIN: {
    PRODUCTS: '/api/admin/products',
    PRODUCT: (id: number) => `/api/admin/products/${id}`,
    CATEGORIES: '/api/admin/categories',
  }
};

// Pagination
export const DEFAULT_PAGE_SIZE = 8;

// Price range
export const MIN_PRICE = 0;
export const MAX_PRICE = 2000;

// Sort options
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Препоръчани' },
  { value: 'priceAsc', label: 'Цена (ниска към висока)' },
  { value: 'priceDesc', label: 'Цена (висока към ниска)' },
  { value: 'nameAsc', label: 'Име (А-Я)' },
  { value: 'nameDesc', label: 'Име (Я-А)' },
  { value: 'ratingDesc', label: 'Най-високо оценени' },
];

// Product badge types
export const BADGE_TYPES = {
  NEW: 'Нов',
  SALE: '-15%',
  HOT: 'Хит',
  TOP: 'Топ',
  LAST: 'Последни',
};

// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELED: 'canceled',
};

// Order status labels
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'В очакване',
  [ORDER_STATUSES.PROCESSING]: 'Обработва се',
  [ORDER_STATUSES.SHIPPED]: 'Изпратена',
  [ORDER_STATUSES.DELIVERED]: 'Доставена',
  [ORDER_STATUSES.CANCELED]: 'Отказана',
};

// Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: number) => `/product/${id}`,
  CATEGORY: (id: number) => `/category/${id}`,
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ADMIN: '/admin',
  CHECKOUT: '/checkout',
};

// Local storage keys
export const STORAGE_KEYS = {
  CART: 'sportzone_cart',
  AUTH_TOKEN: 'sportzone_auth_token',
  LANGUAGE: 'sportzone_language',
};

// Error messages
export const ERROR_MESSAGES = {
  GENERAL: 'Възникна грешка. Моля, опитайте отново по-късно.',
  AUTH: {
    INVALID_CREDENTIALS: 'Невалидно потребителско име или парола.',
    REQUIRED_FIELDS: 'Моля, попълнете всички задължителни полета.',
    PASSWORDS_DONT_MATCH: 'Паролите не съвпадат.',
    EMAIL_EXISTS: 'Този имейл адрес вече е регистриран.',
    USERNAME_EXISTS: 'Това потребителско име вече е заето.',
  },
  CART: {
    ADD_FAILED: 'Неуспешно добавяне в количката. Моля, опитайте отново.',
    UPDATE_FAILED: 'Неуспешно обновяване на количката. Моля, опитайте отново.',
    REMOVE_FAILED: 'Неуспешно премахване от количката. Моля, опитайте отново.',
  },
  CHECKOUT: {
    REQUIRED_FIELDS: 'Моля, попълнете всички задължителни полета за доставка.',
    PAYMENT_FAILED: 'Плащането е неуспешно. Моля, опитайте отново.',
  },
};

// Success messages
export const SUCCESS_MESSAGES = {
  CART: {
    ADDED: 'Продуктът е добавен в количката.',
    UPDATED: 'Количката е обновена успешно.',
    REMOVED: 'Продуктът е премахнат от количката.',
    CLEARED: 'Количката е изчистена успешно.',
  },
  AUTH: {
    REGISTERED: 'Регистрацията е успешна. Можете да влезете с вашите данни.',
    LOGGED_IN: 'Успешно влизане.',
    LOGGED_OUT: 'Успешно излизане.',
  },
  CHECKOUT: {
    ORDER_PLACED: 'Поръчката е направена успешно.',
  },
};
