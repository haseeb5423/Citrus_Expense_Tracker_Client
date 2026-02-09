import React, { useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';
import { Transaction } from '../../../types';

interface Props {
  transactions: Transaction[];
  view: 'weekly' | 'monthly';
  onViewChange: (view: 'weekly' | 'monthly') => void;
}

export const MainChart: React.FC<Props> = ({ transactions, view, onViewChange }) => {
  const data = useMemo(() => {
    const days = view === 'weekly' ? 7 : 30;
    const dayLabels = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - ((days - 1) - i));
      return d.toISOString().split('T')[0];
    });

    return dayLabels.map(date => {
      const dayTransactions = transactions.filter(t => t.date.startsWith(date));
      return {
        name: days <= 7
          ? new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
          : new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: dayTransactions.filter(t => t.type === 'expense' && t.category !== 'Transfer').reduce((s, t) => s + t.amount, 0),
        income: dayTransactions.filter(t => t.type === 'income' && t.category !== 'Transfer').reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions, view]);
  return (
    <div className="lg:col-span-2 glass glass-glow p-8 rounded-[3rem] relative overflow-hidden group min-h-[500px] flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--action-primary)] opacity-[0.03] blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--action-primary)] to-[#fbbf24] flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Financial Pulse</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">Growth Dynamics</span>
              <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-1.5 bg-[var(--bg-primary)]/40 backdrop-blur-xl rounded-2xl border border-[var(--border-default)] shadow-inner">
          <button
            onClick={() => onViewChange('weekly')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${view === 'weekly'
              ? 'bg-white dark:bg-white/10 text-[var(--action-primary)] shadow-md border border-[var(--border-default)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
          >
            Weekly
          </button>
          <button
            onClick={() => onViewChange('monthly')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${view === 'monthly'
              ? 'bg-white dark:bg-white/10 text-[var(--action-primary)] shadow-md border border-[var(--border-default)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] w-full relative z-10 mt-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="var(--border-default)" opacity={0.3} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)', letterSpacing: '0.1em' }}
              dy={15}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ stroke: 'var(--border-default)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{
                borderRadius: '24px',
                border: '1px solid var(--border-default)',
                boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                padding: '20px',
                color: 'var(--text-primary)'
              }}
              itemStyle={{ fontWeight: 900, fontSize: '13px', textTransform: 'uppercase' }}
              labelStyle={{ fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.2em' }}
            />
            {/* Fix: Removed invalid 'shadow' property from activeDot which caused TS errors */}
            <Area
              type="monotone"
              dataKey="value"
              name="Outflow"
              stroke="#f97316"
              strokeWidth={4}
              fill="url(#colorExpense)"
              animationDuration={500}
              strokeLinecap="round"
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#f97316' }}
            />
            {/* Fix: Removed invalid 'shadow' property from activeDot which caused TS errors */}
            <Area
              type="monotone"
              dataKey="income"
              name="Inflow"
              stroke="#10b981"
              strokeWidth={4}
              fill="url(#colorIncome)"
              animationDuration={500}
              strokeLinecap="round"
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#10b981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 flex flex-wrap gap-6 relative z-10 border-t border-[var(--border-default)] pt-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Income</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[var(--action-primary)] shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">System Outflow</span>
        </div>

        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-[var(--action-soft)] rounded-xl border border-[var(--action-primary)]/10">
          <TrendingUp size={12} className="text-[var(--action-primary)]" />
          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--action-primary)]">Real-time Telemetry Active</span>
        </div>
      </div>
    </div>
  );
};
