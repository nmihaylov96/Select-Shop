import { Product, Category, Testimonial, CartItem, User, Order, OrderItem } from "@shared/schema";

// Extended types with additional frontend-specific properties

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { product?: Product })[];
}

// State types
export interface CartState {
  items: CartItemWithProduct[];
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Props types
export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export interface CategoryCardProps {
  category: Category;
}

export interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface HeaderProps {
  onCartClick: () => void;
  onSearchClick: () => void;
}

export interface ProductRatingProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

export interface ProductBadgeProps {
  badge: string | null | undefined;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface FilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
}
