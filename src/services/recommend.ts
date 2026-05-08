import { Recipe, Ingredient, RecipeIngredient } from '../types';

export interface MatchResult {
  recipe: Recipe;
  matchRate: number;
  matchedIngredients: string[];
  missingIngredients: string[];
}

class RecommendService {
  calculateMatchRate(recipe: Recipe, ingredients: Ingredient[]): MatchResult {
    const ingredientNames = ingredients.map((i) => i.name.toLowerCase());
    const matchedIngredients: string[] = [];
    const missingIngredients: string[] = [];

    for (const recipeIngredient of recipe.ingredients) {
      const isMatched = ingredientNames.some(
        (name) => name.includes(recipeIngredient.name.toLowerCase()) ||
                 recipeIngredient.name.toLowerCase().includes(name)
      );

      if (isMatched) {
        matchedIngredients.push(recipeIngredient.name);
      } else {
        missingIngredients.push(recipeIngredient.name);
      }
    }

    const matchRate = recipe.ingredients.length > 0
      ? Math.round((matchedIngredients.length / recipe.ingredients.length) * 100)
      : 0;

    return {
      recipe,
      matchRate,
      matchedIngredients,
      missingIngredients,
    };
  }

  recommend(ingredients: Ingredient[], recipes: Recipe[], count: number = 1): MatchResult[] {
    if (recipes.length === 0) return [];

    const matchResults = recipes.map((recipe) => this.calculateMatchRate(recipe, ingredients));

    const validRecipes = matchResults.filter((result) => result.matchRate > 0);

    if (validRecipes.length === 0) {
      const randomRecipes = this.getRandomItems(matchResults, Math.min(count, matchResults.length));
      return randomRecipes.map((result) => ({
        ...result,
        matchRate: 0,
      }));
    }

    validRecipes.sort((a, b) => b.matchRate - a.matchRate);

    const topMatches = validRecipes.slice(0, Math.min(count * 2, validRecipes.length));

    return this.getRandomItems(topMatches, count);
  }

  getBestMatches(ingredients: Ingredient[], recipes: Recipe[], limit: number = 5): MatchResult[] {
    if (recipes.length === 0) return [];

    const matchResults = recipes.map((recipe) => this.calculateMatchRate(recipe, ingredients));

    return matchResults
      .filter((result) => result.matchRate > 0)
      .sort((a, b) => b.matchRate - a.matchRate)
      .slice(0, limit);
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}

export const recommendService = new RecommendService();
