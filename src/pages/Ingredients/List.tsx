import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal, ModalFooter } from '../../components/Modal';
import { useStore } from '../../stores/useStore';
import { ingredientService } from '../../services/ingredient';
import { CATEGORIES, IngredientCategory } from '../../types';

export const IngredientsList: React.FC = () => {
  const navigate = useNavigate();
  const { ingredients, loadIngredients, deleteIngredient } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  const filteredIngredients = ingredientService.searchByName(
    ingredientService.filterByCategory(ingredients, selectedCategory),
    searchQuery
  );

  const handleDelete = async () => {
    if (selectedId) {
      await deleteIngredient(selectedId);
      setDeleteModalOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-primary-500">食材库</h1>
          <Button variant="primary" size="sm" onClick={() => navigate('/ingredients/add')}>
            <Plus className="w-4 h-4 mr-1" />
            添加
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索食材..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedCategory === cat.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {filteredIngredients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">还没有食材</p>
            <Button variant="primary" onClick={() => navigate('/ingredients/add')}>
              添加第一个食材
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIngredients.map((ingredient) => {
              const expiryStatus = ingredientService.getExpiryStatus(ingredient.expiryDate);
              const category = CATEGORIES.find((c) => c.value === ingredient.category);

              return (
                <Card key={ingredient.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">
                      {category?.icon || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{ingredient.name}</h3>
                      <p className="text-sm text-gray-500">
                        {ingredient.quantity} {ingredient.unit}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${expiryStatus.color}`}>
                        {expiryStatus.label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/ingredients/${ingredient.id}`)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedId(ingredient.id);
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
          <p className="text-gray-600">确定要删除这个食材吗？此操作无法撤销。</p>
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
