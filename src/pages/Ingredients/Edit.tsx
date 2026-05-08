import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input, Select, TextArea } from '../../components/Input';
import { Modal, ModalFooter } from '../../components/Modal';
import { useStore } from '../../stores/useStore';
import { CATEGORIES, UNITS, Ingredient, IngredientCategory } from '../../types';
import { db } from '../../utils/db';

export const EditIngredient: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateIngredient, deleteIngredient } = useStore();
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    category: IngredientCategory;
    quantity: number;
    unit: string;
    expiryDate: string;
    notes: string;
  }>({
    name: '',
    category: 'vegetable',
    quantity: 1,
    unit: '克',
    expiryDate: '',
    notes: '',
  });

  useEffect(() => {
    const loadIngredient = async () => {
      if (id) {
        const data = await db.getIngredientById(id);
        if (data) {
          setIngredient(data);
          setFormData({
            name: data.name,
            category: data.category,
            quantity: data.quantity,
            unit: data.unit,
            expiryDate: data.expiryDate,
            notes: data.notes || '',
          });
        }
      }
    };
    loadIngredient();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    await updateIngredient(id, {
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      expiryDate: formData.expiryDate,
      notes: formData.notes,
    });
    setLoading(false);
    navigate('/ingredients');
  };

  const handleDelete = async () => {
    if (id) {
      await deleteIngredient(id);
      navigate('/ingredients');
    }
  };

  if (!ingredient) {
    return (
      <Layout showNav={false}>
        <div className="p-6 flex items-center justify-center h-64">
          <p className="text-gray-500">加载中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNav={false}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/ingredients')}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-display font-bold text-primary-500">编辑食材</h1>
          </div>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="p-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-6 h-6 text-red-500" />
          </button>
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
              label="保质期"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />

            <TextArea
              label="备注"
              placeholder="例如：买于超市打折时"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Card>

          <div className="space-y-3">
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              保存修改
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
