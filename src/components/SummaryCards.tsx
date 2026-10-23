import { MonthlySummary, formatCurrency } from '../types';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface SummaryCardsProps {
  summary: MonthlySummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Receitas',
      value: summary.income,
      icon: ArrowUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-100 dark:border-emerald-800',
      trend: '+'
    },
    {
      label: 'Despesas',
      value: summary.expense,
      icon: ArrowDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-100 dark:border-red-800',
      trend: '-'
    },
    {
      label: 'Saldo',
      value: summary.balance,
      icon: Minus,
      color: summary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      bg: summary.balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20',
      border: summary.balance >= 0 ? 'border-emerald-100 dark:border-emerald-800' : 'border-red-100 dark:border-red-800',
      trend: summary.balance >= 0 ? '+' : ''
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3" role="region" aria-label="Resumo financeiro do mês">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`${card.bg} ${card.border} border rounded-2xl p-4 transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{card.label}</span>
            <card.icon className={`w-5 h-5 ${card.color}`} aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {card.trend}{formatCurrency(Math.abs(card.value))}
          </div>
        </article>
      ))}
    </div>
  );
}