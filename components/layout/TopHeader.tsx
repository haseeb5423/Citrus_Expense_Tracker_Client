
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Plus, ArrowLeft, Check, Clock } from 'lucide-react';
import { Notification } from '../../types';
import { formatDate } from '../../utils/formatters';

interface Props {
  activeTab: string;
  onMobileMenuOpen: () => void;
  onAddClick: () => void;
  onBack: () => void;
  notifications: Notification[];
  onMarkRead: () => void;
}

export const TopHeader: React.FC<Props> = React.memo(({
  activeTab,
  onMobileMenuOpen,
  onAddClick,
  onBack,
  notifications,
  onMarkRead
}) => {
  const isDashboard = activeTab === 'dashboard';
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifs = () => {
    if (!showNotifs) {
      onMarkRead();
    }
    setShowNotifs(!showNotifs);
  };

  return (
    <header className="h-20 glass flex items-center justify-between px-8 z-30 shrink-0 relative">
      <div className="flex items-center gap-2 sm:gap-4">
        {!isDashboard ? (
          <button
            onClick={onBack}
            className="p-2 hover:bg-[var(--bg-primary)] rounded-xl text-[var(--action-primary)] transition-all flex items-center gap-2 group"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
          </button>
        ) : (
          <button
            className="lg:hidden p-2 hover:bg-[var(--bg-primary)] rounded-xl"
            onClick={onMobileMenuOpen}
          >
            <Menu size={20} />
          </button>
        )}

        <div className="w-px h-6 bg-[var(--border-default)] mx-1 hidden sm:block" />

        <h2 className="text-lg sm:text-xl font-bold tracking-tight capitalize whitespace-nowrap overflow-hidden text-ellipsis">
          {activeTab.replace('-', ' ')}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative" ref={popoverRef}>
          <button
            onClick={handleToggleNotifs}
            className={`p-2 rounded-xl relative group transition-all ${showNotifs ? 'bg-[var(--action-soft)] text-[var(--action-primary)]' : 'hover:bg-[var(--bg-primary)]'}`}
          >
            <Bell size={20} className={showNotifs ? 'text-[var(--action-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--action-primary)] transition-colors'} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--action-primary)] rounded-full border-2 border-white animate-bounce"></span>
            )}
          </button>

          {/* Notifications Dropdown (Alerts Modal) */}
          {showNotifs && (
            <div className="absolute right-0 mt-4 w-80 max-h-[480px] bg-[var(--bg-primary)] glass rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden flex flex-col z-[100] animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
              <div className="p-6 pb-4 border-b border-[var(--border-default)] flex justify-between items-center bg-white/5">
                <h4 className="text-sm font-bold uppercase tracking-tighter">Activity Stream</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[var(--action-soft)] text-[var(--action-primary)] rounded-lg">
                  {notifications.length} Total
                </span>
              </div>
              <div className="overflow-y-auto no-scrollbar py-2">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center opacity-40">
                    <Check className="mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest">Clear Waters</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`px-6 py-4 hover:bg-[var(--bg-primary)]/40 transition-colors relative group border-b border-transparent last:border-0`}>
                      <div className="flex gap-4 items-start">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                          <Clock size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--text-primary)] leading-none mb-1">{n.title}</p>
                          <p className="text-[10px] text-[var(--text-secondary)] leading-tight truncate">{n.message}</p>
                          <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">{new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {!n.isRead && (
                          <div className="absolute top-1/2 -translate-y-1/2 right-4 w-1.5 h-1.5 bg-[var(--action-primary)] rounded-full shadow-[0_0_8px_var(--action-primary)]"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-4 border-t border-[var(--border-default)] bg-white/5">
                  <button className="w-full py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--action-primary)] transition-colors">
                    View Archive
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onAddClick}
          className="btn-primary px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden md:inline">Add New</span>
        </button>
      </div>
    </header>
  );
});
