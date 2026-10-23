import { Transaction, formatCurrency, getCategoryById } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = 'Nenhuma transação encontrada'
}: TransactionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Carregando transações">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p className="text-base">{emptyMessage}</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Toque no + para adicionar a primeira</p>
      </div>
    );
  }

  // Group transactions by date
  const grouped = transactions.reduce((acc, t) => {
    const dateKey = format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-4" role="list" aria-label="Lista de transações">
      {Object.entries(grouped).map(([dateKey, dayTransactions]) => {
        const dayTotal = dayTransactions.reduce((sum, t) =>
          sum + (t.type === 'income' ? t.amount : -t.amount), 0
        );

        return (
          <div key={dateKey} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{dateKey}</span>
              <span className={`text-sm font-semibold ${dayTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {dayTotal >= 0 ? '+' : ''}{formatCurrency(dayTotal)}
              </span>
            </div>
            {dayTransactions.map((transaction, index) => {
              const category = getCategoryById(transaction.category);
              const isExpanded = expandedId === transaction.id;
              const isLast = index === dayTransactions.length - 1;

              return (
                <div
                  key={transaction.id}
                  className={`group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:border-slate-200 dark:hover:border-slate-600 ${
                    isLast ? '' : 'mb-1'
                  }`}
                  role="listitem"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : transaction.id)}
                    className="w-full p-4 flex items-center gap-3 text-left"
                    aria-expanded={isExpanded}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${category?.color}15` }}
                    >
                      <span className="text-xl" aria-hidden="true">{category?.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{category?.label}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{transaction.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {format(new Date(transaction.date), 'HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Expanded actions */}
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-out ${
                      isExpanded ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-3 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(transaction); }}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(transaction.id); }}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}