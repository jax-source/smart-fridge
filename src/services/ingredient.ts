import { Ingredient, IngredientCategory } from '../types';

export interface ExpiryStatus {
  status: 'fresh' | 'expiring' | 'expired';
  daysRemaining: number;
  label: string;
  color: string;
}

class IngredientService {
  getExpiryStatus(expiryDate: string): ExpiryStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'expired',
        daysRemaining: diffDays,
        label: `已过期 ${Math.abs(diffDays)} 天`,
        color: 'text-red-600 bg-red-50',
      };
    } else if (diffDays <= 3) {
      return {
        status: 'expiring',
        daysRemaining: diffDays,
        label: diffDays === 0 ? '今天过期' : `还有 ${diffDays} 天过期`,
        color: 'text-yellow-600 bg-yellow-50',
      };
    } else {
      return {
        status: 'fresh',
        daysRemaining: diffDays,
        label: `还有 ${diffDays} 天`,
        color: 'text-green-600 bg-green-50',
      };
    }
  }

  filterByCategory(ingredients: Ingredient[], category: IngredientCategory | null): Ingredient[] {
    if (!category) return ingredients;
    return ingredients.filter((i) => i.category === category);
  }

  filterByExpiry(ingredients: Ingredient[]): {
    expired: Ingredient[];
    expiringSoon: Ingredient[];
    fresh: Ingredient[];
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    return {
      expired: ingredients.filter((i) => new Date(i.expiryDate) < today),
      expiringSoon: ingredients.filter((i) => {
        const expiry = new Date(i.expiryDate);
        return expiry >= today && expiry <= threeDaysLater;
      }),
      fresh: ingredients.filter((i) => new Date(i.expiryDate) > threeDaysLater),
    };
  }

  searchByName(ingredients: Ingredient[], query: string): Ingredient[] {
    if (!query.trim()) return ingredients;
    const lowerQuery = query.toLowerCase();
    return ingredients.filter((i) =>
      i.name.toLowerCase().includes(lowerQuery)
    );
  }
}

export const ingredientService = new IngredientService();
