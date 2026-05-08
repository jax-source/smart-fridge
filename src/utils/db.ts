import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Ingredient, Recipe } from '../types';

interface SmartFridgeDB extends DBSchema {
  ingredients: {
    key: string;
    value: Ingredient;
    indexes: {
      'by-category': string;
      'by-expiry': string;
    };
  };
  recipes: {
    key: string;
    value: Recipe;
    indexes: {
      'by-name': string;
      'by-difficulty': string;
    };
  };
}

class Database {
  private dbPromise: Promise<IDBPDatabase<SmartFridgeDB>>;

  constructor() {
    this.dbPromise = openDB<SmartFridgeDB>('smart-fridge-db', 1, {
      upgrade(db) {
        const ingredientStore = db.createObjectStore('ingredients', { keyPath: 'id' });
        ingredientStore.createIndex('by-category', 'category');
        ingredientStore.createIndex('by-expiry', 'expiryDate');

        const recipeStore = db.createObjectStore('recipes', { keyPath: 'id' });
        recipeStore.createIndex('by-name', 'name');
        recipeStore.createIndex('by-difficulty', 'difficulty');
      },
    });
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    const db = await this.dbPromise;
    return db.getAll('ingredients');
  }

  async addIngredient(ingredient: Ingredient): Promise<void> {
    const db = await this.dbPromise;
    await db.put('ingredients', ingredient);
  }

  async updateIngredient(ingredient: Ingredient): Promise<void> {
    const db = await this.dbPromise;
    await db.put('ingredients', ingredient);
  }

  async deleteIngredient(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('ingredients', id);
  }

  async getAllRecipes(): Promise<Recipe[]> {
    const db = await this.dbPromise;
    return db.getAll('recipes');
  }

  async addRecipe(recipe: Recipe): Promise<void> {
    const db = await this.dbPromise;
    await db.put('recipes', recipe);
  }

  async updateRecipe(recipe: Recipe): Promise<void> {
    const db = await this.dbPromise;
    await db.put('recipes', recipe);
  }

  async deleteRecipe(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('recipes', id);
  }

  async getRecipeById(id: string): Promise<Recipe | undefined> {
    const db = await this.dbPromise;
    return db.get('recipes', id);
  }

  async getIngredientById(id: string): Promise<Ingredient | undefined> {
    const db = await this.dbPromise;
    return db.get('ingredients', id);
  }
}

export const db = new Database();
