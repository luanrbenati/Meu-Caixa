import { useState } from 'react';
import { Plus, LogOut, RefreshCw, Sun, Moon, Monitor, Settings } from 'lucide-react';
import { Button, Modal } from './ui';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { SummaryCards } from './SummaryCards';
import { ExpenseChart } from './ExpenseChart';
import { CategoryLegend } from './CategoryLegend';
import { CategoryManager } from './CategoryManager';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction, TransactionType } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function HomeScreen() {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { customCategories, add: addCategory, update: updateCategory, remove: removeCategory, loading: categoriesLoading } = useCategories(user?.uid || null);
  const {
    monthlyTransactions,
    summary,
    chartData,
    loading,
    error,
    add,
    update,
    remove,
    formatCurrency
  } = useTransactions(user?.uid || null);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Type for TransactionForm's editingTransaction (with Date instead of string for date)
  type EditingTransaction = Omit<Transaction, 'date'> & { date: Date } | null;

  const [editingTransaction, setEditingTransaction] = useState<EditingTransaction>(null);
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'all'>('all');

  const handleAddTransaction = async (data: {
    type: TransactionType;
    category: string;
    description: string;
    amount: number;
    date: Date;
  }) => {
    await add(data.type, data.category as any, data.description, data.amount, data.date);
  };

  const handleUpdateTransaction = async (data: {
    type: TransactionType;
    category: string;
    description: string;
    amount: number;
    date: Date;
  }) => {
    if (editingTransaction) {
      // Convert Date to ISO string for Firestore
      await update(editingTransaction.id, {
        ...data,
        date: data.date.toISOString()
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      await remove(id);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    // Convert Transaction (date: string) to format expected by TransactionForm (date: Date)
    setEditingTransaction({
      ...transaction,
      date: new Date(transaction.date)
    });
    if (transaction.type === 'expense') {
      setShowExpenseForm(true);
    } else {
      setShowIncomeForm(true);
    }
  };

  const filteredTransactions = monthlyTransactions.filter(t => {
    if (activeTab === 'all') return true;
    return t.type === activeTab;
  });

  const currentMonthLabel = format(new Date(), 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Meu Caixa</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentMonthLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
                  const currentIndex = themes.indexOf(theme);
                  const nextIndex = (currentIndex + 1) % themes.length;
                  setTheme(themes[nextIndex]);
                }}
                aria-label={`Tema atual: ${theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Escuro' : 'Claro'}`}
                className="relative"
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-5 h-5" />
                ) : theme === 'system' ? (
                  <Monitor className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </Button>
              {/* Settings Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategoryManager(true)}
                aria-label="Configurações"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} aria-label="Sair">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-3 mb-2 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between dark:bg-red-900/20 dark:border-red-800" role="alert">
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Summary Cards */}
        <SummaryCards summary={summary} />

        {/* Chart & Legend */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Despesas por Categoria</h2>
              <ExpenseChart data={chartData} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Detalhamento</h2>
              <CategoryLegend summary={summary} type="expense" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Income Legend */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Receitas</h2>
              <CategoryLegend summary={summary} type="income" />
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Resumo Rápido</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Transações este mês</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{monthlyTransactions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Média por dia</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(monthlyTransactions.length > 0
                      ? monthlyTransactions.reduce((s, t) => s + t.amount, 0) / new Date().getDate()
                      : 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Maior despesa</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {monthlyTransactions
                      .filter(t => t.type === 'expense')
                      .sort((a, b) => b.amount - a.amount)[0]?.amount
                      ? formatCurrency(Math.max(...monthlyTransactions.filter(t => t.type === 'expense').map(t => t.amount)))
                      : formatCurrency(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Transações</h2>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1" role="tablist">
              {(['all', 'income', 'expense'] as const).map(tab => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {tab === 'all' ? 'Todas' : tab === 'income' ? 'Receitas' : 'Despesas'}
                </button>
              ))}
            </div>
          </div>

          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            loading={loading}
            emptyMessage={activeTab === 'all'
              ? 'Nenhuma transação este mês'
              : activeTab === 'income'
                ? 'Nenhuma receita este mês'
                : 'Nenhuma despesa este mês'}
          />
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-auto flex flex-col-reverse md:flex-row gap-3 z-50">
        <Button
          variant="primary"
          size="lg"
          fullWidth={true}
          className="md:w-auto md:flex-1"
          onClick={() => setShowExpenseForm(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Despesa</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth={true}
          className="md:w-auto md:flex-1"
          onClick={() => setShowIncomeForm(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Receita</span>
        </Button>
      </div>

      {/* Transaction Forms */}
      <TransactionForm
        isOpen={showExpenseForm}
        onClose={() => { setShowExpenseForm(false); setEditingTransaction(null); }}
        onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
        defaultType="expense"
        editingTransaction={(editingTransaction?.type === 'expense' ? editingTransaction : null) as EditingTransaction}
        loading={loading}
        customCategories={customCategories}
      />

      <TransactionForm
        isOpen={showIncomeForm}
        onClose={() => { setShowIncomeForm(false); setEditingTransaction(null); }}
        onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
        defaultType="income"
        editingTransaction={(editingTransaction?.type === 'income' ? editingTransaction : null) as EditingTransaction}
        loading={loading}
        customCategories={customCategories}
      />

      {/* Category Manager Modal */}
      <Modal
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        title="Gerenciar Categorias"
        size="lg"
      >
        <CategoryManager
          customCategories={customCategories}
          onAdd={addCategory}
          onUpdate={updateCategory}
          onDelete={removeCategory}
          loading={categoriesLoading}
        />
      </Modal>
    </div>
  );
}