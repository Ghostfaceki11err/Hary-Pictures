import { Category } from '../types';

export function isAboutMeCategory(category: Category | null | undefined): boolean {
  return category?.slug === 'about-me' || category?.slug === 'aboutme';
}

export function isHeroCategory(category: Category | null | undefined): boolean {
  return category?.slug === 'hero';
}

