import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input, Select, TextArea } from '../../components/Input';
import { useStore } from '../../stores/useStore';
import { DIFFICULTIES, COOKING_TAGS, RecipeIngredient } from '../../types';

export const AddRecipe: React.FC = () => {
  const navigate = useNavigate();
  const { addRecipe } = useStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    cookingTime: 30,
    difficulty: 'easy' as const,
    tags: [] as string[],
  });

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: '', quantity: 1, unit: '克' }
  ]);
  const [steps, setSteps] = useState<string[]>(['']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validIngredients = ingredients.filter((i) => i.name.trim() !== '');
    const validSteps = steps.filter((s) => s.trim() !== '');

    if (!formData.name.trim()) {
      alert('请输入菜谱名称');
      return;
    }

    if (validIngredients.length === 0) {
      alert('请至少添加一种食材');
      return;
    }

    setLoading(true);
    await addRecipe({
      name: formData.name,
      ingredients: validIngredients,
      steps: validSteps,
      cookingTime: formData.cookingTime,
      difficulty: formData.difficulty,
      tags: formData.tags,
    });
    setLoading(false);
    navigate('/recipes');
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 1, unit: '克' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

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
          <h1 className="text-2xl font-display font-bold text-primary-500">添加菜谱</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 space-y-4">
            <Input
              label="菜谱名称"
              placeholder="例如：西红柿炒鸡蛋"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="烹饪时长（分钟）"
                type="number"
                min="1"
                value={formData.cookingTime}
                onChange={(e) => setFormData({ ...formData, cookingTime: Number(e.target.value) })}
                required
              />
              <Select
                label="难度"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                options={DIFFICULTIES.map((d) => ({ value: d.value, label: d.label }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
              <div className="flex flex-wrap gap-2">
                {COOKING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      formData.tags.includes(tag)
                        ? 'bg-secondary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">所需食材</h3>
              <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>
                <Plus className="w-4 h-4 mr-1" />
                添加
              </Button>
            </div>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input
                  placeholder="食材名称"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="量"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                  className="w-20"
                />
                <Select
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  options={[
                    { value: '克', label: '克' },
                    { value: '千克', label: '千克' },
                    { value: '个', label: '个' },
                    { value: '颗', label: '颗' },
                    { value: '把', label: '把' },
                    { value: '块', label: '块' },
                    { value: '片', label: '片' },
                    { value: '根', label: '根' },
                    { value: '升', label: '升' },
                    { value: '毫升', label: '毫升' },
                    { value: '杯', label: '杯' },
                    { value: '勺', label: '勺' },
                    { value: '适量', label: '适量' },
                  ]}
                  className="w-24"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">烹饪步骤</h3>
              <Button type="button" variant="ghost" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4 mr-1" />
                添加
              </Button>
            </div>
            {steps.map((step, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <TextArea
                  placeholder={`步骤 ${index + 1}`}
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </Card>

          <div className="space-y-3">
            <Button type="submit" variant="secondary" size="lg" fullWidth loading={loading}>
              保存菜谱
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => navigate('/recipes')}
            >
              取消
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
