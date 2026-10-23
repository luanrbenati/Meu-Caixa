import { useState, useEffect, useCallback, useMemo } from 'react';
import { subscribeToUserTransactions, addTransaction, updateTransaction, deleteTransaction } from '../services/firebase';
import { Transaction, CategoryType, MonthlySummary, formatCurrency, getMonthKey, CATEGORIES } from '../types';
import { Timestamp } from 'firebase/firestore';

export function useTransactions(userId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserTransactions(userId, (firestoreTransactions) => {
      const mapped: Transaction[] = firestoreTransactions.map(t => ({
        id: t.id,
        userId: t.userId,
        type: t.type,
        category: t.category as CategoryType,
        description: t.description,
        amount: t.amount,
        date: t.date.toDate().toISOString(),
        createdAt: t.createdAt.toDate().toISOString(),
        updatedAt: t.updatedAt.toDate().toISOString()
      }));
      setTransactions(mapped);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const add = useCallback(async (
    type: Transaction['type'],
    category: CategoryType,
    description: string,
    amount: number,
    date: Date = new Date()
  ) => {
    if (!userId) throw new Error('Usuário não autenticado');
    setError(null);
    try {
      await addTransaction(userId, {
        type,
        category,
        description,
        amount,
        date: Timestamp.fromDate(date)
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar transação';
      setError(message);
      throw err;
    }
  }, [userId]);

  const update = useCallback(async (
    id: string,
    data: Partial<Pick<Transaction, 'type' | 'category' | 'description' | 'amount' | 'date'>>
  ) => {
    if (!userId) throw new Error('Usuário não autenticado');
    setError(null);
    try {
      const updateData: any = { ...data };
      if (data.date) {
        updateData.date = new Date(data.date);
      }
      await updateTransaction(id, updateData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar transação';
      setError(message);
      throw err;
    }
  }, [userId]);

  const remove = useCallback(async (id: string) => {
    if (!userId) throw new Error('Usuário não autenticado');
    setError(null);
    try {
      await deleteTransaction(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir transação';
      setError(message);
      throw err;
    }
  }, [userId]);

  // Computed values
  const currentMonth = useMemo(() => getMonthKey(), []);

  const monthlyTransactions = useMemo(() =>
    transactions.filter(t => t.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  );

  const summary = useMemo((): MonthlySummary => {
    const monthTransactions = monthlyTransactions;
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory: Record<string, number> = {};
    CATEGORIES.forEach(c => { byCategory[c.id] = 0; });

    monthTransactions.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    return {
      month: currentMonth,
      income,
      expense,
      balance: income - expense,
      byCategory
    };
  }, [monthlyTransactions, currentMonth]);

  const chartData = useMemo(() => {
    const expenseByCategory = Object.entries(summary.byCategory)
      .filter(([cat]) => CATEGORIES.find(c => c.id === cat)?.type === 'expense')
      .filter(([, value]) => value > 0)
      .map(([category, value]) => ({
        category,
        label: CATEGORIES.find(c => c.id === category)?.label || category,
        value,
        color: CATEGORIES.find(c => c.id === category)?.color || '#95a5a6'
      }));

    return {
      labels: expenseByCategory.map(d => d.label),
      datasets: [{
        data: expenseByCategory.map(d => d.value),
        backgroundColor: expenseByCategory.map(d => d.color),
        borderWidth: 0
      }]
    };
  }, [summary.byCategory]);

  const recentTransactions = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
    [transactions]
  );

  return {
    transactions,
    monthlyTransactions,
    recentTransactions,
    summary,
    chartData,
    loading,
    error,
    add,
    update,
    remove,
    formatCurrency
  };
}