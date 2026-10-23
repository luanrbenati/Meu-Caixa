import { useState, useEffect, useCallback } from 'react';
import { subscribeToUserCategories, addCategory, updateCategory, deleteCategory } from '../services/firebase';
import { CustomCategory } from '../types';

export function useCategories(userId: string | null) {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setCustomCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserCategories(userId, (categories) => {
      const custom = categories
        .filter(c => c.isCustom)
        .map(c => ({
          id: c.id,
          label: c.label,
          icon: c.icon,
          type: c.type,
          color: c.color,
          isCustom: true as const
        }));
      setCustomCategories(custom);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const add = useCallback(async (
    type: 'income' | 'expense',
    label: string,
    icon: string,
    color: string
  ) => {
    if (!userId) throw new Error('Usuário não autenticado');
    setError(null);
    try {
      const categoryId = await addCategory(userId, {
        label,
        icon,
        type,
        color,
        isCustom: true
      });
      // The subscription will update the state automatically
      return categoryId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar categoria';
      setError(message);
      throw err;
    }
  }, [userId]);

  const update = useCallback(async (
    categoryId: string,
    data: Partial<Pick<CustomCategory, 'label' | 'icon' | 'color'>>
  ) => {
    if (!userId) throw new Error('Usuário não autenticado');
    setError(null);
    try {
      await updateCategory(userId, categoryId, data);
      // The subscription will update the state automatically
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar categoria';
      setError(message);
      throw err;
    }
  }, [userId]);

  const remove = useCallback(async (categoryId: string) => {
    if (!userId) throw new Error('Usuário não autenticado');
    setError(null);
    try {
      await deleteCategory(userId, categoryId);
      // The subscription will update the state automatically
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir categoria';
      setError(message);
      throw err;
    }
  }, [userId]);

  return {
    customCategories,
    loading,
    error,
    add,
    update,
    remove
  };
}