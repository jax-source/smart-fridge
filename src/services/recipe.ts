import { Recipe, Difficulty } from '../types';

class RecipeService {
  searchByName(recipes: Recipe[], query: string): Recipe[] {
    if (!query.trim()) return recipes;
    const lowerQuery = query.toLowerCase();
    return recipes.filter((r) =>
      r.name.toLowerCase().includes(lowerQuery)
    );
  }

  filterByDifficulty(recipes: Recipe[], difficulty: Difficulty | null): Recipe[] {
    if (!difficulty) return recipes;
    return recipes.filter((r) => r.difficulty === difficulty);
  }

  filterByTags(recipes: Recipe[], tags: string[]): Recipe[] {
    if (tags.length === 0) return recipes;
    return recipes.filter((r) =>
      tags.some((tag) => r.tags.includes(tag))
    );
  }

  sortByCookingTime(recipes: Recipe[], ascending: boolean = true): Recipe[] {
    return [...recipes].sort((a, b) =>
      ascending ? a.cookingTime - b.cookingTime : b.cookingTime - a.cookingTime
    );
  }

  sortByDate(recipes: Recipe[], ascending: boolean = false): Recipe[] {
    return [...recipes].sort((a, b) => {
      const dateA = new Date(a.addDate).getTime();
      const dateB = new Date(b.addDate).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  getQuickRecipes(recipes: Recipe[], maxTime: number = 30): Recipe[] {
    return recipes.filter((r) => r.cookingTime <= maxTime);
  }
}

export const recipeService = new RecipeService();
