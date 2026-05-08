import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, ChefHat, CheckCircle, XCircle, RefreshCw, Package, BookOpen } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useStore } from '../../stores/useStore';
import { recommendService, MatchResult } from '../../services/recommend';
import { DIFFICULTIES } from '../../types';

export const Recommend: React.FC = () => {
  const navigate = useNavigate();
  const { ingredients, recipes, loadIngredients, loadRecipes } = useStore();
  const [recommendations, setRecommendations] = useState<MatchResult[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadIngredients();
    loadRecipes();
  }, []);

  const handleRoll = () => {
    if (recipes.length === 0) return;

    setIsRolling(true);
    setShowResults(false);

    setTimeout(() => {
      const results = recommendService.recommend(ingredients, recipes, 3);
      setRecommendations(results);
      setShowResults(true);
      setIsRolling(false);
    }, 800);
  };

  useEffect(() => {
    if (ingredients.length > 0 && recipes.length > 0 && recommendations.length === 0) {
      handleRoll();
    }
  }, [ingredients, recipes]);

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-primary-500 mb-2">随机推荐</h1>
          <p className="text-gray-500">根据现有食材，为您推荐美味菜谱</p>
        </div>

        <Card className="p-6 mb-6 text-center bg-gradient-to-br from-primary-50 via-cream-50 to-secondary-50">
          <div className="mb-6">
            <div
              className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-secondary-400 to-accent-500 rounded-3xl flex items-center justify-center shadow-lg transition-transform duration-300 ${
                isRolling ? 'animate-flip' : ''
              }`}
            >
              {isRolling ? (
                <RefreshCw className="w-12 h-12 text-white animate-spin" />
              ) : (
                <Shuffle className="w-12 h-12 text-white" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isRolling ? '正在为您选择...' : '点击按钮开始推荐'}
            </h2>
            <p className="text-gray-500 text-sm">
              系统会根据您冰箱里的食材，随机推荐 3 道菜谱
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleRoll}
            loading={isRolling}
            disabled={recipes.length === 0}
            className="w-full"
          >
            <Shuffle className="w-5 h-5 mr-2" />
            换一批推荐
          </Button>
        </Card>

        {ingredients.length === 0 && (
          <Card className="p-6 mb-6">
            <div className="text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">冰箱里还没有食材</h3>
              <p className="text-sm text-gray-500 mb-4">
                添加一些食材后，我们就能为您推荐合适的菜谱了
              </p>
              <Button variant="primary" onClick={() => navigate('/ingredients/add')}>
                添加食材
              </Button>
            </div>
          </Card>
        )}

        {recipes.length === 0 && ingredients.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">还没有菜谱</h3>
              <p className="text-sm text-gray-500 mb-4">
                添加一些菜谱后，我们就能为您推荐了
              </p>
              <Button variant="secondary" onClick={() => navigate('/recipes/add')}>
                添加菜谱
              </Button>
            </div>
          </Card>
        )}

        {showResults && recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">为您推荐</h3>
            {recommendations.map((result, index) => {
              const difficulty = DIFFICULTIES.find((d) => d.value === result.recipe.difficulty);
              return (
                <Card
                  key={result.recipe.id}
                  className={`p-4 transition-all duration-500 ${
                    showResults ? 'animate-fade-in' : 'opacity-0'
                  }`}
                  hoverable
                  onClick={() => navigate(`/recipes/${result.recipe.id}`)}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ChefHat className="w-8 h-8 text-secondary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{result.recipe.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{result.recipe.cookingTime}分钟</span>
                        {difficulty && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${difficulty.color}`}>
                            {difficulty.label}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">匹配度</span>
                          <span className={`font-semibold ${
                            result.matchRate >= 80 ? 'text-green-600' :
                            result.matchRate >= 50 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {result.matchRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              result.matchRate >= 80 ? 'bg-green-500' :
                              result.matchRate >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.max(result.matchRate, 20)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {result.matchedIngredients.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {result.matchedIngredients.slice(0, 3).map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                          >
                            <CheckCircle className="w-3 h-3" />
                            {name}
                          </span>
                        ))}
                        {result.missingIngredients.length > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">
                            <XCircle className="w-3 h-3" />
                            缺{result.missingIngredients.length}种
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {showResults && recommendations.length === 0 && (
          <Card className="p-6">
            <div className="text-center">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">暂无推荐</h3>
              <p className="text-sm text-gray-500">
                看起来没有合适的菜谱匹配您的食材
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};
