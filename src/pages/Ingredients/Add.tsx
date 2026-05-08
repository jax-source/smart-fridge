import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input, Select, TextArea } from '../../components/Input';
import { useStore } from '../../stores/useStore';
import { CATEGORIES, UNITS } from '../../types';

export const AddIngredient: React.FC = () => {
  const navigate = useNavigate();
  const { addIngredient } = useStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetable' as const,
    quantity: 1,
    unit: '克',
    expiryDate: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const expiry = formData.expiryDate || getDefaultExpiry();

    await addIngredient({
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      expiryDate: expiry,
      notes: formData.notes,
    });

    setLoading(false);
    navigate('/ingredients');
  };

  const getDefaultExpiry = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  return (
    <Layout showNav={false}>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/ingredients')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-display font-bold text-primary-500">添加食材</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 space-y-4">
            <Input
              label="食材名称"
              placeholder="例如：西红柿"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Select
              label="食材分类"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="数量"
                type="number"
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
              />
              <Select
                label="单位"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                options={UNITS.map((u) => ({ value: u, label: u }))}
              />
            </div>

            <Input
              label="保质期（选填）"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />

            <TextArea
              label="备注（选填）"
              placeholder="例如：买于超市打折时"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Card>

          <div className="space-y-3">
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              保存食材
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => navigate('/ingredients')}
            >
              取消
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
