
import React, { useState } from 'react';
import { X, CheckCircle2, Wallet, ArrowRightLeft, FileText, Calendar } from 'lucide-react';
import { Account } from '../../../types';
import { DatePicker } from '../../ui/DatePicker';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    accounts: Account[];
    onSubmit: (data: { sourceAccountId: string; targetAccountId: string; amount: number; description: string; date: string }) => void;
    currencySymbol: string;
}

export const TransferModal: React.FC<Props> = ({ isOpen, onClose, accounts, onSubmit, currencySymbol }) => {
    const [date, setDate] = useState(new Date().toISOString());
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const sourceAccountId = formData.get('sourceAccountId') as string;
        const targetAccountId = formData.get('targetAccountId') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const description = formData.get('description') as string;
        const date = formData.get('date') as string;

        if (sourceAccountId === targetAccountId) {
            setError('Source and target accounts cannot be the same.');
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        const sourceAccount = accounts.find(a => (a.id || a._id) === sourceAccountId);
        if (sourceAccount && sourceAccount.balance < amount) {
            setError('Insufficient funds in source account.');
            return;
        }

        onSubmit({
            sourceAccountId,
            targetAccountId,
            amount,
            description,
            date: date ? new Date(date).toISOString() : new Date().toISOString()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[var(--bg-primary)] w-full max-w-lg rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[95vh] flex flex-col border border-white/10 glass-glow">

                <div className="px-10 pt-10 pb-6 flex justify-between items-center shrink-0 bg-gradient-to-b from-white/5 to-transparent">
                    <div>
                        <h3 className="text-2xl font-bold uppercase tracking-tighter leading-none mb-1">
                            Transfer Funds
                        </h3>
                        <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.3em]">
                            Move money between vaults
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-[var(--bg-primary)] hover:bg-red-50 hover:text-red-500 rounded-xl transition-all border border-[var(--border-default)] shadow-sm"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-10 pb-10 overflow-y-auto no-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="relative group">
                                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-0.5">{currencySymbol}</span>
                                    <div className="w-1.5 h-1.5 bg-[var(--action-primary)] rounded-full animate-pulse"></div>
                                </div>
                                <input
                                    name="amount" type="number" step="0.01" min="0.01" required autoFocus
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[2rem] pl-20 pr-8 py-4 text-2xl font-bold font-poppins tracking-tighter focus:border-[var(--action-primary)] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-[var(--text-muted)]/20 text-[var(--text-primary)] shadow-inner"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-3">
                                        <Wallet size={11} /> From (Source)
                                    </label>
                                    <select
                                        name="sourceAccountId"
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-5 py-3.5 outline-none font-bold text-xs cursor-pointer hover:border-[var(--action-primary)] transition-colors appearance-none shadow-sm"
                                    >
                                        {accounts.map(acc => <option key={acc._id || acc.id} value={acc._id || acc.id}>{acc.name} ({currencySymbol}{acc.balance})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-3">
                                        <ArrowRightLeft size={11} /> To (Target)
                                    </label>
                                    <select
                                        name="targetAccountId"
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-5 py-3.5 outline-none font-bold text-xs cursor-pointer hover:border-[var(--action-primary)] transition-colors appearance-none shadow-sm"
                                    >
                                        {/* Show all accounts, validation will handle same-account check */}
                                        {accounts.map(acc => <option key={acc._id || acc.id} value={acc._id || acc.id}>{acc.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-3">
                                    <FileText size={11} /> Note
                                </label>
                                <input
                                    name="description" placeholder="Transfer description..."
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-6 py-4 outline-none font-bold text-xs focus:border-[var(--action-primary)] transition-all shadow-sm"
                                />
                            </div>

                            <DatePicker
                                label="Select Date"
                                name="date"
                                value={date}
                                onChange={setDate}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full group bg-gradient-to-r from-[var(--action-primary)] to-[#fbbf24] text-white py-5 rounded-2xl font-bold uppercase tracking-[0.15em] shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                        >
                            Transfer Funds
                            <CheckCircle2 size={18} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
