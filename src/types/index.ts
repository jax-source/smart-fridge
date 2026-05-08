export type IngredientCategory =
  | 'vegetable'
  | 'meat'
  | 'seafood'
  | 'egg'
  | 'tofu'
  | 'dairy'
  | 'condiment'
  | 'grain'
  | 'fruit'
  | 'other';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  expiryDate: string;
  addDate: string;
  notes?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  cookingTime: number;
  difficulty: Difficulty;
  tags: string[];
  addDate: string;
}

export type TabType = 'home' | 'ingredients' | 'recipes' | 'recommend';

export interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
}

export const CATEGORIES: { value: IngredientCategory; label: string; icon: string }[] = [
  { value: 'vegetable', label: '蔬菜', icon: '🥬' },
  { value: 'meat', label: '肉类', icon: '🥩' },
  { value: 'seafood', label: '海鲜', icon: '🦐' },
  { value: 'egg', label: '蛋类', icon: '🥚' },
  { value: 'tofu', label: '豆制品', icon: '🧈' },
  { value: 'dairy', label: '奶制品', icon: '🧀' },
  { value: 'condiment', label: '调料', icon: '🧂' },
  { value: 'grain', label: '粮食', icon: '🌾' },
  { value: 'fruit', label: '水果', icon: '🍎' },
  { value: 'other', label: '其他', icon: '📦' },
];

export const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: '简单', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: '中等', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: '困难', color: 'bg-red-100 text-red-800' },
];

export const UNITS: string[] = ['克', '千克', '个', '颗', '把', '块', '片', '根', '升', '毫升', '杯', '勺', '适量'];

export const COOKING_TAGS: string[] = [
  '早餐', '午餐', '晚餐', '快手菜', '下饭菜', '素菜', '荤菜', '汤', '凉菜', '主食', '甜点', '饮品'
];
