import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SiteFormat } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSiteCode(city: string, format: SiteFormat, existingCount: number): string {
  const cityCode = city.substring(0, 3).toUpperCase();
  const number = String(existingCount + 1).padStart(3, '0');
  return `${cityCode}-${format}-${number}`;
}

export function generateInvoiceNumber(prefix: string = 'INV', count: number): string {
  const year = new Date().getFullYear();
  const num = String(count + 1).padStart(4, '0');
  return `${prefix}-${year}-${num}`;
}

export function calculateGST(amount: number, sameState: boolean): {
  cgst: number;
  sgst: number;
  igst: number;
} {
  if (sameState) {
    const cgst = Math.round(amount * 0.09 * 100) / 100;
    const sgst = Math.round(amount * 0.09 * 100) / 100;
    return { cgst, sgst, igst: 0 };
  } else {
    const igst = Math.round(amount * 0.18 * 100) / 100;
    return { cgst: 0, sgst: 0, igst };
  }
}

export function getDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

export function getMonthName(month: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[month];
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
