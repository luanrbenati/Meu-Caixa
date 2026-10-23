import { useState } from 'react';
import { Button, Input, Modal } from './ui';
import { CustomCategory } from '../types';
import { Plus, Trash2, Edit, ArrowUp, ArrowDown, Palette, Smile } from 'lucide-react';

interface CategoryManagerProps {
  customCategories: CustomCategory[];
  onAdd: (type: 'income' | 'expense', label: string, icon: string, color: string) => Promise<string>;
  onUpdate: (categoryId: string, data: Partial<Pick<CustomCategory, 'label' | 'icon' | 'color'>>) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
  loading?: boolean;
}

const EMOJI_OPTIONS = [
  '🍽️', '🚌', '🏍️', '💡', '🛒', '🎮', '💼', '💰', '🔧', '📈',
  '🍔', '🍕', '🍣', '🍰', '☕', '🍺', '🥤', '🛍️', '🛒', '🏪',
  '⛽', '🚌', '🚇', '🚗', '🏥', '💊', '🏋️', '📚', '🎓', '🎨',
  '🎮', '🎬', '🎵', '🏖️', '✈️', '🏨', '💳', '💸', '💰', '💎',
  '🏠', '💡', '💧', '📱', '💻', '🖨️', '🔧', '🛠️', '🧰', '📦'
];

const COLOR_OPTIONS = [
  { value: '#e67e22', label: 'Laranja' },
  { value: '#3498db', label: 'Azul' },
  { value: '#9b59b6', label: 'Roxo' },
  { value: '#f39c12', label: 'Amarelo' },
  { value: '#27ae60', label: 'Verde' },
  { value: '#e91e63', label: 'Rosa' },
  { value: '#1abc9c', label: 'Turquesa' },
  { value: '#16a085', label: 'Verde Escuro' },
  { value: '#2ecc71', label: 'Verde Claro' },
  { value: '#34495e', label: 'Cinza Escuro' },
  { value: '#e74c3c', label: 'Vermelho' },
  { value: '#8e44ad', label: 'Roxo Escuro' },
];

export function CategoryManager({
  customCategories,
  onAdd,
  onUpdate,
  onDelete,
  loading = false
}: CategoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    label: '',
    icon: '📦',
    color: '#95a5a6'
  });

  const expenseCustom = customCategories.filter(c => c.type === 'expense');
  const incomeCustom = customCategories.filter(c => c.type === 'income');

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) return;

    try {
      if (editingCategory) {
        await onUpdate(editingCategory.id, {
          label: formData.label.trim(),
          icon: formData.icon,
          color: formData.color
        });
      } else {
        await onAdd(formData.type, formData.label.trim(), formData.icon, formData.color);
      }
      closeForm();
    } catch (err) {
      // Error handled by parent
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ type: 'expense', label: '', icon: '📦', color: '#95a5a6' });
  };

  const startEdit = (category: CustomCategory) => {
    setEditingCategory(category);
    setFormData({
      type: category.type,
      label: category.label,
      icon: category.icon,
      color: category.color
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      await onDelete(categoryId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Category Button */}
      <Button
        variant="outline"
        fullWidth
        onClick={() => setShowForm(true)}
        disabled={loading}
        className="gap-2"
      >
        <Plus className="w-5 h-5" />
        Nova Categoria
      </Button>

      {/* Expense Categories */}
      {expenseCustom.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <ArrowDown className="w-4 h-4 text-red-600" />
            Despesas personalizadas
          </h3>
          <div className="space-y-2">
            {expenseCustom.map(cat => (
              <CategoryItem
                key={cat.id}
                category={cat}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Income Categories */}
      {incomeCustom.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <ArrowUp className="w-4 h-4 text-emerald-600" />
            Receitas personalizadas
          </h3>
          <div className="space-y-2">
            {incomeCustom.map(cat => (
              <CategoryItem
                key={cat.id}
                category={cat}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {customCategories.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <Palette className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm">Nenhuma categoria personalizada</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Crie suas próprias categorias para organizar melhor suas finanças
          </p>
        </div>
      )}

      {/* Category Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector */}
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                  formData.type === t
                    ? (t === 'expense' ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400')
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                }`}
              >
                {t === 'expense' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                <span>{t === 'expense' ? 'Despesa' : 'Receita'}</span>
              </button>
            ))}
          </div>

          {/* Label */}
          <Input
            label="Nome da categoria"
            placeholder="Ex: Almoço, Uber, Netflix..."
            value={formData.label}
            onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
            autoFocus
          />

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Ícone
            </label>
            <div className="relative">
              <Smile className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
              <select
                value={formData.icon}
                onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base bg-white dark:border-slate-600 dark:hover:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
              >
                {EMOJI_OPTIONS.map(emoji => (
                  <option key={emoji} value={emoji}>{emoji}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Cor
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`w-10 h-10 rounded-xl border-3 transition-all duration-200 ${
                    formData.color === color.value
                      ? 'border-emerald-500 scale-110 shadow-lg'
                      : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeForm}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={formData.type === 'expense' ? 'danger' : 'primary'}
              className="flex-1"
              loading={loading}
            >
              {editingCategory ? 'Salvar' : 'Criar Categoria'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function CategoryItem({
  category,
  onEdit,
  onDelete
}: {
  category: CustomCategory;
  onEdit: (category: CustomCategory) => void;
  onDelete: (categoryId: string) => void;
}) {

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${category.color}15` }}
      >
        <span className="text-lg">{category.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{category.label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{category.type}</p>
      </div>
      <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
          Personalizada
        </span>
        <button
          onClick={() => onEdit(category)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Editar"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}