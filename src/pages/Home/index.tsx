import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, BookOpen, Plus, AlertTriangle, TrendingUp } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useStore } from '../../stores/useStore';
import { ingredientService } from '../../services/ingredient';
import { recommendService } from '../../services/recommend';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { ingredients, recipes, loadIngredients, loadRecipes } = useStore();

  useEffect(() => {
    loadIngredients();
    loadRecipes();
  }, []);

  const { expired, expiringSoon } = ingredientService.filterByExpiry(ingredients);
  const todayRecommend = recommendService.recommend(ingredients, recipes, 1);

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-500 mb-2">
            智能冰箱
          </h1>
          <p className="text-gray-500">管理食材，智能推荐菜谱</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4" hoverable onClick={() => navigate('/ingredients')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{ingredients.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900">我的食材</h3>
            <p className="text-sm text-gray-500">点击管理</p>
          </Card>

          <Card className="p-4" hoverable onClick={() => navigate('/recipes')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-secondary-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{recipes.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900">我的菜谱</h3>
            <p className="text-sm text-gray-500">点击查看</p>
          </Card>
        </div>

        {expired.length > 0 && (
          <Card className="p-4 mb-6 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  有 {expired.length} 种食材已过期
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {expired.map(i => i.name).join('、')}，请及时处理
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/ingredients')}
                >
                  查看详情
                </Button>
              </div>
            </div>
          </Card>
        )}

        {expiringSoon.length > 0 && (
          <Card className="p-4 mb-6 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  有 {expiringSoon.length} 种食材即将过期
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {expiringSoon.map(i => i.name).join('、')}，请尽快使用
                </p>
              </div>
            </div>
          </Card>
        )}

        {todayRecommend.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              今日推荐
            </h3>
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {todayRecommend[0].recipe.name}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>⏱️ {todayRecommend[0].recipe.cookingTime}分钟</span>
                <span>📊 匹配度 {todayRecommend[0].matchRate}%</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/recipes/${todayRecommend[0].recipe.id}`)}
              >
                查看详情
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/ingredients/add')}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加食材
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/recipes/add')}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加菜谱
          </Button>
        </div>
      </div>
    </Layout>
  );
};
