import { MonthlySummary, CATEGORIES, formatCurrency } from '../types';

interface CategoryLegendProps {
  summary: MonthlySummary;
  type?: 'expense' | 'income';
}

export function CategoryLegend({ summary, type = 'expense' }: CategoryLegendProps) {
  const categories = CATEGORIES.filter(c => c.type === type);
  const total = Object.values(summary.byCategory).reduce((a, b) => a + b, 0);

  const items = categories
    .map(cat => ({
      ...cat,
      value: summary.byCategory[cat.id] || 0
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400">
        <p className="text-sm">Nenhuma {type === 'expense' ? 'despesa' : 'receita'} registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="list" aria-label={`${type === 'expense' ? 'Despesas' : 'Receitas'} por categoria`}>
      {items.map((item) => {
        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
        return (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            role="listitem"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{item.label}</p>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-80"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0 w-28">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(item.value)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{percentage}%</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}