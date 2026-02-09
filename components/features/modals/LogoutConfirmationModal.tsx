
import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName?: string;
}

export const LogoutConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, userName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300">
            <div className="glass max-w-md w-full rounded-[2.5rem] border border-white/10 p-8 space-y-6 animate-in zoom-in-95 duration-300 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)]">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <LogOut className="text-orange-500" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-black tracking-tighter mb-2">Logout confirmation</h3>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                            Are you sure you want to end your session, <span className="text-[var(--text-primary)] font-bold">{userName || 'Member'}</span>?
                        </p>
                        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-xl">
                            <AlertTriangle className="text-red-500" size={14} />
                            <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-widest">
                                Local changes might unsync
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-4 bg-orange-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};
