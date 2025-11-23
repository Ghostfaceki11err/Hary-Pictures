export interface Category {
  id: string;
  name_am: string;
  slug: string;
}

export interface Picture {
  id: string;
  title: string;
  image_url: string;
  categories: Category;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

export interface StorageUsage {
  used: number; // in bytes
  total: number; // in bytes (1GB = 1024^3 bytes)
  loading: boolean;
  error: string | null;
}

export type AdminSection = 'overview' | 'media' | 'categories' | 'gallery';

export type SortMode = 'newest' | 'oldest' | 'title';

