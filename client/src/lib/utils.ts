import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Product, CartItem } from "@shared/schema";
import { CartItemWithProduct } from "./types";

/**
 * Combines class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price with currency
 */
export function formatPrice(price: number, currency = "лв.") {
  return `${price.toFixed(2)} ${currency}`;
}

/**
 * Calculates total price of cart items
 */
export function calculateTotal(items: CartItemWithProduct[]): number {
  return items.reduce((total, item) => {
    const price = item.product.discountedPrice || item.product.price;
    return total + (price * item.quantity);
  }, 0);
}

/**
 * Gets the discounted percentage
 */
export function getDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (!discountedPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Gets product badge text based on product properties
 */
export function getBadgeText(product: Product): string | null {
  if (!product.badge) return null;
  return product.badge;
}

/**
 * Gets badge color class based on badge text
 */
export function getBadgeColorClass(badgeText: string | null): string {
  if (!badgeText) return '';
  
  if (badgeText.includes('-')) return 'bg-success'; // discount
  if (badgeText === 'Нов' || badgeText === 'New') return 'bg-secondary';
  if (badgeText === 'Хит' || badgeText === 'Топ' || badgeText === 'Hot' || badgeText === 'Top') return 'bg-warning';
  if (badgeText === 'Последни' || badgeText === 'Last items') return 'bg-error';
  
  return 'bg-primary';
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Generates a random order number
 */
export function generateOrderNumber(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Gets error message from error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
