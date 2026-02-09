
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Transaction, Account } from '../../../types';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import {
  Search, Filter, ArrowUpRight, ArrowDownLeft,
  Download, Calendar, Tag, Wallet, ChevronDown, ChevronLeft, ChevronRight, Trash2, Edit2, X, AlertTriangle
} from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onDeleteAll?: () => void;
  currencySymbol: string;
}

const ITEMS_PER_PAGE = 20;

export const HistoryView: React.FC<Props> = ({
  transactions,
  accounts,
  onEdit,
  onDelete,
  onBulkDelete,
  onDeleteAll,
  currencySymbol
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'bulk' | 'all'>('single');
  const [deleteTargetId, setDeleteTargetId] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input to prevent lag while typing
  const debouncedSearch = useDebounce(searchTerm, 300);

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, [transactions]);

  const allFilteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          t.category.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
      });
  }, [transactions, debouncedSearch, filterType, selectedCategory, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(allFilteredTransactions.length / ITEMS_PER_PAGE));

  const filteredTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allFilteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [allFilteredTransactions, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterType, selectedCategory, sortOrder]);

  const totalIn = useMemo(() => allFilteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [allFilteredTransactions]);
  const totalOut = useMemo(() => allFilteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [allFilteredTransactions]);

  const handleDownloadCSV = useCallback(() => {
    if (allFilteredTransactions.length === 0) return;
    const headers = ['Date', 'Description', 'Category', 'Account', 'Type', `Amount (${currencySymbol})`].join(",");
    const rows = allFilteredTransactions.map(t => {
      const account = accounts.find(a => a.id === t.accountId);
      return [
        new Date(t.date).toLocaleDateString(),
        `"${t.description.replace(/"/g, '""')}"`,
        t.category,
        account?.name || 'Unknown',
        t.type.toUpperCase(),
        t.amount
      ].join(",");
    });
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `nexus_finance_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [allFilteredTransactions, accounts, currencySymbol]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === allFilteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allFilteredTransactions.map(t => t.id)));
    }
  }, [selectedIds.size, allFilteredTransactions]);

  const toggleSelectTransaction = useCallback((id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }, [selectedIds]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteTargetId(id);
    setDeleteMode('single');
    setShowDeleteModal(true);
  }, []);

  const handleBulkDeleteClick = useCallback(() => {
    setDeleteMode('bulk');
    setShowDeleteModal(true);
  }, []);

  const handleDeleteAllClick = useCallback(() => {
    setDeleteMode('all');
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = () => {
    if (deleteMode === 'single' && onDelete) {
      onDelete(deleteTargetId);
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(deleteTargetId);
        return newSet;
      });
    } else if (deleteMode === 'bulk' && onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    } else if (deleteMode === 'all' && onDeleteAll) {
      onDeleteAll();
      setSelectedIds(new Set());
    }
    setShowDeleteModal(false);
    setDeleteTargetId('');
  };

  const getDeleteMessage = () => {
    if (deleteMode === 'single') {
      const transaction = transactions.find(t => t.id === deleteTargetId);
      return `Delete transaction "${transaction?.description || 'Unknown'}"?`;
    } else if (deleteMode === 'bulk') {
      return `Delete ${selectedIds.size} selected transaction${selectedIds.size > 1 ? 's' : ''}?`;
    } else {
      return `Delete all ${transactions.length} transactions?`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter mb-2">Transaction History</h2>
          <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-[0.2em]">Detailed ledger of all movements</p>
        </div>

        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex flex-col justify-center border border-white/10">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total In</span>
            <span className="text-lg font-bold text-emerald-500 tabular-nums">+{formatCurrency(totalIn, currencySymbol).replace(currencySymbol + ' ', '')}</span>
          </div>
          <div className="glass px-6 py-3 rounded-2xl flex flex-col justify-center border border-white/10">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Out</span>
            <span className="text-lg font-bold text-red-500 tabular-nums">-{formatCurrency(totalOut, currencySymbol).replace(currencySymbol + ' ', '')}</span>
          </div>
        </div>
      </div>

      <div className="glass p-4 rounded-[2rem] border border-white/10 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Search descriptions or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl pl-12 pr-6 py-3.5 text-xs font-bold outline-none focus:border-[var(--action-primary)] transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="flex-1 md:w-40 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-[var(--action-primary)] transition-all"
          >
            <option value="all">All Flows</option>
            <option value="income">Money In</option>
            <option value="expense">Money Out</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 md:w-48 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-[var(--action-primary)] transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="flex-1 md:w-40 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-[var(--action-primary)] transition-all"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <button
            onClick={handleDownloadCSV}
            title="Download CSV Report"
            className="p-3.5 bg-[var(--action-soft)] text-[var(--action-primary)] rounded-xl hover:bg-[var(--action-primary)] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={allFilteredTransactions.length === 0}
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="glass p-4 rounded-2xl border border-orange-500/30 bg-orange-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Trash2 className="text-orange-500" size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">{selectedIds.size} transaction{selectedIds.size > 1 ? 's' : ''} selected</p>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Ready for deletion</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[var(--bg-secondary)] transition-all"
            >
              Clear Selection
            </button>
            <button
              onClick={handleBulkDeleteClick}
              className="px-4 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/30 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-500 hover:text-white transition-all"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="glass rounded-[3rem] overflow-hidden border border-white/10">
        {allFilteredTransactions.length > 0 && (
          <div className="p-6 border-b border-[var(--border-default)] flex justify-end">
            <button
              onClick={handleDeleteAllClick}
              className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete All Transactions
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-[var(--border-default)]">
                <th className="px-8 py-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                  <input
                    type="checkbox"
                    checked={allFilteredTransactions.length > 0 && selectedIds.size === allFilteredTransactions.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-2 border-[var(--border-default)] bg-[var(--bg-primary)] checked:bg-[var(--action-primary)] checked:border-[var(--action-primary)] cursor-pointer transition-all"
                  />
                </th>
                <th className="px-8 py-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] hidden md:table-cell">Category</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] hidden md:table-cell">Account</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] hidden md:table-cell">Date</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] text-right">Amount</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {filteredTransactions.map((t) => {
                const account = accounts.find(a => a.id === t.accountId);
                const isSelected = selectedIds.has(t.id);
                return (
                  <tr key={t.id} className={`hover:bg-[var(--bg-primary)]/40 transition-colors group ${isSelected ? 'bg-[var(--action-soft)]' : ''}`}>
                    <td className="px-8 py-6">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectTransaction(t.id)}
                        className="w-4 h-4 rounded border-2 border-[var(--border-default)] bg-[var(--bg-primary)] checked:bg-[var(--action-primary)] checked:border-[var(--action-primary)] cursor-pointer transition-all"
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                          {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">{t.description}</p>
                          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-tighter">
                            {t.balanceAt !== undefined ? `After: ${formatCurrency(t.balanceAt, currencySymbol)}` : 'Verified Stream'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-primary)] rounded-full border border-[var(--border-default)] text-[9px] font-bold text-[var(--text-secondary)] uppercase">
                        <Tag size={10} /> {t.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--action-primary)]"></div>
                        <span className="text-xs font-bold text-[var(--text-secondary)]">{account?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <Calendar size={14} />
                        <span className="text-xs font-semibold">{formatDate(t.date)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`text-sm font-bold tabular-nums ${t.type === 'income' ? 'text-emerald-500' : 'text-[var(--text-primary)]'
                        }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currencySymbol).replace(currencySymbol + ' ', '')}
                        <span className="text-[10px] ml-1 opacity-50 font-bold">{currencySymbol}</span>
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(t)}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--action-primary)] hover:bg-[var(--action-soft)] rounded-lg transition-all"
                          title="Edit Entry"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(t.id)}
                          className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {allFilteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Search size={48} className="mb-4" />
                      <p className="text-sm font-bold uppercase tracking-widest">No matching history found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {allFilteredTransactions.length > 0 && (
          <div className="p-8 border-t border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/5">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest order-2 sm:order-1">
              Showing <span className="text-[var(--text-primary)]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-[var(--text-primary)]">{Math.min(currentPage * ITEMS_PER_PAGE, allFilteredTransactions.length)}</span> of <span className="text-[var(--text-primary)]">{allFilteredTransactions.length}</span> results
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-[var(--text-muted)] hover:text-[var(--action-primary)] hover:border-[var(--action-primary)] disabled:opacity-30 disabled:hover:text-[var(--text-muted)] disabled:hover:border-[var(--border-default)] transition-all active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all active:scale-95 ${currentPage === pageNum
                        ? 'bg-[var(--action-primary)] text-white shadow-lg shadow-[var(--action-primary)]/25'
                        : 'bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--action-primary)] hover:text-[var(--action-primary)]'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-[var(--text-muted)] hover:text-[var(--action-primary)] hover:border-[var(--action-primary)] disabled:opacity-30 disabled:hover:text-[var(--text-muted)] disabled:hover:border-[var(--border-default)] transition-all active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass max-w-md w-full rounded-3xl border border-white/10 p-8 space-y-6 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Confirm Deletion</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {getDeleteMessage()}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2 font-semibold uppercase tracking-wider">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTargetId('');
                }}
                className="flex-1 px-6 py-3 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-[var(--bg-secondary)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
