export type TransactionType = 'income' | 'expense';

export type CategoryType =
  | 'alimentacao'
  | 'transporte'
  | 'parcela_moto'
  | 'conta_luz'
  | 'supermercado'
  | 'lazer'
  | 'salario'
  | 'renda_extra'
  | 'bico'
  | 'comissao'
  | 'outros';

export interface Category {
  id: CategoryType | string; // Support custom category IDs
  label: string;
  icon: string;
  type: TransactionType;
  color: string;
  isCustom?: boolean;
}

export interface CustomCategory {
  id: string;
  label: string;
  icon: string;
  type: TransactionType;
  color: string;
  isCustom: true;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: CategoryType | string; // Support custom category IDs
  description: string;
  amount: number;
  date: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  balance: number;
  byCategory: Record<string, number>; // Support custom categories
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  settings: {
    currency: 'BRL';
    monthStartDay: number; // 1-28
    categories: (CategoryType | string)[];
  };
}

export const CATEGORIES: Category[] = [
  // Despesas
  { id: 'alimentacao', label: 'Alimentação', icon: '🍽️', type: 'expense', color: '#e67e22' },
  { id: 'transporte', label: 'Transporte', icon: '🚌', type: 'expense', color: '#3498db' },
  { id: 'parcela_moto', label: 'Parcela da Moto', icon: '🏍️', type: 'expense', color: '#9b59b6' },
  { id: 'conta_luz', label: 'Conta de Luz', icon: '💡', type: 'expense', color: '#f39c12' },
  { id: 'supermercado', label: 'Supermercado', icon: '🛒', type: 'expense', color: '#27ae60' },
  { id: 'lazer', label: 'Lazer', icon: '🎮', type: 'expense', color: '#e91e63' },
  // Receitas
  { id: 'salario', label: 'Salário', icon: '💼', type: 'income', color: '#2ecc71' },
  { id: 'renda_extra', label: 'Renda Extra', icon: '💰', type: 'income', color: '#1abc9c' },
  { id: 'bico', label: 'Bico', icon: '🔧', type: 'income', color: '#16a085' },
  { id: 'comissao', label: 'Comissão', icon: '📈', type: 'income', color: '#27ae60' },
  { id: 'outros', label: 'Outros', icon: '📦', type: 'expense', color: '#95a5a6' }
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter(c => c.type === 'expense');
export const INCOME_CATEGORIES = CATEGORIES.filter(c => c.type === 'income');

export function getCategoryById(id: CategoryType | string): Category | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function getAllCategories(customCategories: CustomCategory[] = []): Category[] {
  return [...CATEGORIES, ...customCategories];
}

export function getExpenseCategories(customCategories: CustomCategory[] = []): Category[] {
  return getAllCategories(customCategories).filter(c => c.type === 'expense');
}

export function getIncomeCategories(customCategories: CustomCategory[] = []): Category[] {
  return getAllCategories(customCategories).filter(c => c.type === 'income');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

export function getMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}