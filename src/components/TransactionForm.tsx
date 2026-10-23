import { useState, useEffect } from 'react';
import { Button, Input, Select, Modal } from './ui';
import { CategoryType, TransactionType, getExpenseCategories, getIncomeCategories, CustomCategory } from '../types';
import { Calendar, DollarSign, Tag, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    category: CategoryType | string;
    description: string;
    amount: number;
    date: Date;
  }) => Promise<void>;
  defaultType?: TransactionType;
  editingTransaction?: {
    id: string;
    type: TransactionType;
    category: CategoryType | string;
    description: string;
    amount: number;
    date: Date;
  } | null;
  loading?: boolean;
  customCategories?: CustomCategory[];
}

export function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  defaultType = 'expense',
  editingTransaction,
  loading = false,
  customCategories = []
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [category, setCategory] = useState<CategoryType | string>('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => editingTransaction ? new Date(editingTransaction.date) : new Date());
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or type changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setCategory(editingTransaction.category);
        setDescription(editingTransaction.description);
        setAmount(String(editingTransaction.amount));
        setDate(new Date(editingTransaction.date));
      } else {
        setType(defaultType);
        setCategory('');
        setDescription('');
        setAmount('');
        setDate(new Date());
      }
      setErrors({});
    }
  }, [isOpen, editingTransaction, defaultType]);

  // Reset category when type changes
  useEffect(() => {
    setCategory('');
  }, [type]);

  const categories = type === 'expense'
    ? getExpenseCategories(customCategories)
    : getIncomeCategories(customCategories);

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.label,
    icon: cat.icon,
    color: cat.color
  }));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!category) newErrors.category = 'Selecione uma categoria';
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valor deve ser maior que zero';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        type,
        category: category as CategoryType,
        description: description.trim(),
        amount: parseFloat(amount),
        date
      });
      onClose();
    } catch (err) {
      // Error handled by parent
    }
  };

  const formatCurrencyInput = (value: string) => {
    // Allow only numbers, comma, and dot
    const cleaned = value.replace(/[^\d.,]/g, '');
    // Replace comma with dot for parsing
    const normalized = cleaned.replace(',', '.');
    // Prevent multiple dots
    const parts = normalized.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return normalized;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setAmount(formatted);
  };

  const isEditing = !!editingTransaction;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Transação' : type === 'expense' ? 'Nova Despesa' : 'Nova Receita'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div className="flex gap-2">
          {(['expense', 'income'] as TransactionType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                type === t
                  ? (t === 'expense' ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400')
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
              }`}
            >
              {t === 'expense' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              <span>{t === 'expense' ? 'Despesa' : 'Receita'}</span>
            </button>
          ))}
        </div>

        {/* Category */}
        <Select
          label="Categoria"
          placeholder="Selecione..."
          options={categoryOptions}
          value={category}
          onChange={e => setCategory(e.target.value as CategoryType)}
          error={errors.category}
        />

        {/* Description */}
        <Input
          label="Descrição"
          placeholder="Ex: Almoço no trabalho, Salário janeiro..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          error={errors.description}
          icon={<Tag className="w-4 h-4" />}
          autoFocus
        />

        {/* Amount */}
        <Input
          label="Valor (R$)"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={amount}
          onChange={handleAmountChange}
          error={errors.amount}
          icon={<DollarSign className="w-4 h-4" />}
        />

        {/* Date */}
        <div className="relative">
          <label htmlFor="transaction-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Data
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
            <input
              id="transaction-date"
              type="date"
              value={format(date, 'yyyy-MM-dd')}
              onChange={e => setDate(new Date(e.target.value + 'T00:00:00'))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base bg-white dark:border-slate-600 dark:hover:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={type === 'expense' ? 'danger' : 'primary'}
            className="flex-1"
            loading={loading}
          >
            {isEditing ? 'Salvar' : type === 'expense' ? 'Adicionar Despesa' : 'Adicionar Receita'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}