import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, ChefHat, CheckCircle, XCircle } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { DIFFICULTIES } from '../../types';
import { db } from '../../utils/db';
import { Recipe } from '../../types';
import { recommendService } from '../../services/recommend';
import { useStore } from '../../stores/useStore';

export const RecipeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { ingredients } = useStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [matchResult, setMatchResult] = useState<any>(null);

  useEffect(() => {
    const loadRecipe = async () => {
      if (id) {
        const data = await db.getRecipeById(id);
        if (data) {
          setRecipe(data);
          const result = recommendService.calculateMatchRate(data, ingredients);
          setMatchResult(result);
        }
      }
    };
    loadRecipe();
  }, [id, ingredients]);

  if (!recipe) {
    return (
      <Layout showNav={false}>
        <div className="p-6 flex items-center justify-center h-64">
          <p className="text-gray-500">加载中...</p>
        </div>
      </Layout>
    );
  }

  const difficulty = DIFFICULTIES.find((d) => d.value === recipe.difficulty);

  return (
    <Layout showNav={false}>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/recipes')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-display font-bold text-primary-500">菜谱详情</h1>
        </div>

        <Card className="p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-accent-100 rounded-2xl flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-secondary-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{recipe.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {recipe.cookingTime}分钟
                </span>
                {difficulty && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${difficulty.color}`}>
                    {difficulty.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-secondary-50 text-secondary-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Card>

        {matchResult && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">食材匹配度</h3>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">匹配率</span>
                <span className="font-semibold text-primary-600">{matchResult.matchRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${matchResult.matchRate}%` }}
                />
              </div>
            </div>

            {matchResult.matchedIngredients.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">已有食材：</p>
                <div className="flex flex-wrap gap-2">
                  {matchResult.matchedIngredients.map((name: string) => (
                    <span
                      key={name}
                      className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-sm"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {matchResult.missingIngredients.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">缺少食材：</p>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missingIngredients.map((name: string) => (
                    <span
                      key={name}
                      className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-lg text-sm"
                    >
                      <XCircle className="w-3 h-3" />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        <Card className="p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">所需食材</h3>
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => {
              const isMatched = matchResult?.matchedIngredients.includes(ingredient.name);
              return (
                <div
                  key={index}
                  className={`flex justify-between items-center p-2 rounded-lg ${
                    isMatched ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <span className={isMatched ? 'text-green-700' : 'text-gray-700'}>
                    {ingredient.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">烹饪步骤</h3>
          <div className="space-y-4">
            {recipe.steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/recipes/${id}/edit`)}
          >
            编辑菜谱
          </Button>
        </div>
      </div>
    </Layout>
  );
};
