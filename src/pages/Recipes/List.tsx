import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit, Clock, ChefHat } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal, ModalFooter } from '../../components/Modal';
import { useStore } from '../../stores/useStore';
import { recipeService } from '../../services/recipe';
import { DIFFICULTIES, Difficulty } from '../../types';

export const RecipesList: React.FC = () => {
  const navigate = useNavigate();
  const { recipes, loadRecipes, deleteRecipe } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const filteredRecipes = recipeService.filterByDifficulty(
    recipeService.searchByName(recipes, searchQuery),
    selectedDifficulty
  );

  const handleDelete = async () => {
    if (selectedId) {
      await deleteRecipe(selectedId);
      setDeleteModalOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-primary-500">菜谱库</h1>
          <Button variant="secondary" size="sm" onClick={() => navigate('/recipes/add')}>
            <Plus className="w-4 h-4 mr-1" />
            添加
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索菜谱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedDifficulty(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedDifficulty === null
                ? 'bg-secondary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.value}
              onClick={() => setSelectedDifficulty(diff.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedDifficulty === diff.value
                  ? 'bg-secondary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">还没有菜谱</p>
            <Button variant="secondary" onClick={() => navigate('/recipes/add')}>
              添加第一个菜谱
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecipes.map((recipe) => {
              const difficulty = DIFFICULTIES.find((d) => d.value === recipe.difficulty);

              return (
                <Card key={recipe.id} className="p-4" hoverable onClick={() => navigate(`/recipes/${recipe.id}`)}>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary-100 to-accent-100 rounded-xl flex items-center justify-center">
                      <ChefHat className="w-8 h-8 text-secondary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{recipe.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.cookingTime}分钟
                        </span>
                        {difficulty && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${difficulty.color}`}>
                            {difficulty.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {recipe.ingredients.map((i) => i.name).join('、')}
                      </p>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedId(recipe.id);
                          setDeleteModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="确认删除"
        size="sm"
      >
        <div className="px-6 py-4">
          <p className="text-gray-600">确定要删除这个菜谱吗？此操作无法撤销。</p>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
            取消
          </Button>
          <Button variant="accent" onClick={handleDelete}>
            删除
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
};
