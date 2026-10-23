import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../types';

ChartJS.register(CategoryScale, LinearScale, ArcElement, Tooltip, Legend, Title);

interface ExpenseChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
    }>;
  };
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartRef = useRef<ChartJS<'doughnut'> | null>(null);

  const total = data.datasets[0]?.data.reduce((a, b) => a + b, 0) || 0;

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  const hasData = data.datasets[0]?.data.some(v => v > 0);

  if (!hasData) {
    return (
      <div className="aspect-square flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9A9.001 9.001 0 0113 20.945V13H20.488z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M1 12a11 11 0 1122 0 11 11 0 01-22 0z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400">Nenhuma despesa este mês</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Adicione transações para ver o gráfico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square max-w-xs mx-auto">
      <Doughnut
        ref={chartRef}
        data={data}
        options={options}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(total)}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total despesas</span>
      </div>
    </div>
  );
}