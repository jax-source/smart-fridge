import { create } from 'zustand';
import { db } from '../utils/db';
import { Ingredient, Recipe, TabType } from '../types';

interface AppState {
  ingredients: Ingredient[];
  recipes: Recipe[];
  selectedIngredient: Ingredient | null;
  selectedRecipe: Recipe | null;
  activeTab: TabType;
  isLoading: boolean;
  error: string | null;

  setActiveTab: (tab: TabType) => void;
  loadIngredients: () => Promise<void>;
  addIngredient: (data: Omit<Ingredient, 'id' | 'addDate'>) => Promise<void>;
  updateIngredient: (id: string, data: Partial<Ingredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  setSelectedIngredient: (ingredient: Ingredient | null) => void;

  loadRecipes: () => Promise<void>;
  addRecipe: (data: Omit<Recipe, 'id' | 'addDate'>) => Promise<void>;
  updateRecipe: (id: string, data: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  setSelectedRecipe: (recipe: Recipe | null) => void;

  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  ingredients: [],
  recipes: [],
  selectedIngredient: null,
  selectedRecipe: null,
  activeTab: 'home',
  isLoading: false,
  error: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  loadIngredients: async () => {
    set({ isLoading: true, error: null });
    try {
      const ingredients = await db.getAllIngredients();
      set({ ingredients, isLoading: false });
    } catch (error) {
      set({ error: '加载食材失败', isLoading: false });
    }
  },

  addIngredient: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const ingredient: Ingredient = {
        ...data,
        id: crypto.randomUUID(),
        addDate: new Date().toISOString().split('T')[0],
      };
      await db.addIngredient(ingredient);
      set((state) => ({
        ingredients: [...state.ingredients, ingredient],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '添加食材失败', isLoading: false });
    }
  },

  updateIngredient: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const existing = await db.getIngredientById(id);
      if (!existing) throw new Error('食材不存在');
      const updated = { ...existing, ...data };
      await db.updateIngredient(updated);
      set((state) => ({
        ingredients: state.ingredients.map((i) => (i.id === id ? updated : i)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '更新食材失败', isLoading: false });
    }
  },

  deleteIngredient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.deleteIngredient(id);
      set((state) => ({
        ingredients: state.ingredients.filter((i) => i.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '删除食材失败', isLoading: false });
    }
  },

  setSelectedIngredient: (ingredient) => set({ selectedIngredient: ingredient }),

  loadRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const recipes = await db.getAllRecipes();
      set({ recipes, isLoading: false });
    } catch (error) {
      set({ error: '加载菜谱失败', isLoading: false });
    }
  },

  addRecipe: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const recipe: Recipe = {
        ...data,
        id: crypto.randomUUID(),
        addDate: new Date().toISOString().split('T')[0],
      };
      await db.addRecipe(recipe);
      set((state) => ({
        recipes: [...state.recipes, recipe],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '添加菜谱失败', isLoading: false });
    }
  },

  updateRecipe: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const existing = await db.getRecipeById(id);
      if (!existing) throw new Error('菜谱不存在');
      const updated = { ...existing, ...data };
      await db.updateRecipe(updated);
      set((state) => ({
        recipes: state.recipes.map((r) => (r.id === id ? updated : r)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '更新菜谱失败', isLoading: false });
    }
  },

  deleteRecipe: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.deleteRecipe(id);
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '删除菜谱失败', isLoading: false });
    }
  },

  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),

  setError: (error) => set({ error }),
}));
