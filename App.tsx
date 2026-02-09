
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { AccountCard } from './components/features/accounts/AccountCard';
import { KpiCards } from './components/features/dashboard/KpiCards';
// import { MainChart } from './components/features/dashboard/MainChart';
import { RecentHistory } from './components/features/dashboard/RecentHistory';
import { TransactionModal } from './components/features/modals/TransactionModal';
import { AddVaultModal } from './components/features/modals/AddVaultModal';
import { TransferModal } from './components/features/modals/TransferModal';
import { LogoutConfirmationModal } from './components/features/modals/LogoutConfirmationModal';
import { useFinance } from './hooks/useFinance';
import { AuthProvider, useAuth } from './context/AuthContext';
import { formatCurrency } from './utils/formatters';
import { Transaction, Account } from './types';
import { Calendar, ChevronRight as ChevronRightIcon } from 'lucide-react';

// Lazy load heavy components for code splitting
const VaultsView = lazy(() => import('./components/features/accounts/VaultsView').then(module => ({ default: module.VaultsView })));
const HistoryView = lazy(() => import('./components/features/transactions/HistoryView').then(module => ({ default: module.HistoryView })));
const AnalyticsView = lazy(() => import('./components/features/analytics/AnalyticsView').then(module => ({ default: module.AnalyticsView })));
const SettingsView = lazy(() => import('./components/features/settings/SettingsView').then(module => ({ default: module.SettingsView })));
const MainChart = lazy(() => import('./components/features/dashboard/MainChart').then(module => ({ default: module.MainChart })));
const AuthView = lazy(() => import('./components/features/auth/AuthView').then(module => ({ default: module.AuthView })));

const FinanceApp: React.FC = () => {
  const { user, loading, logout, showAuth, setShowAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('citrus_dark');
    return saved === null ? true : saved === 'true';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddVault, setShowAddVault] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const {
    accounts,
    transactions,
    accountTypes,
    notifications,
    currency,
    setCurrency,
    stats,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    deleteAllTransactions,
    addAccount,
    updateAccount,
    deleteAccount,
    addAccountType,
    deleteAccountType,
    resetData,
    weeklyChartData,
    monthlyChartData,
    markAllAsRead,
    transferFunds
  } = useFinance();

  useEffect(() => {
    localStorage.setItem('citrus_dark', isDarkMode.toString());
    document.body.className = isDarkMode ? 'theme-dark' : 'theme-light';
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--action-primary)] animate-pulse flex items-center justify-center">
            <ChevronRightIcon className="text-white animate-spin" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-muted)]">Citrus Synchronizing</p>
        </div>
      </div>
    );
  }

  const handleTransactionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as 'income' | 'expense';
    const amount = parseFloat(formData.get('amount') as string);
    const accountId = formData.get('accountId') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const dateInput = formData.get('date') as string;
    const date = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();

    if (isNaN(amount) || amount <= 0) return;

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, { type, amount, accountId, category, description, date });
      setEditingTransaction(null);
    } else {
      addTransaction({ type, amount, accountId, category, description, date });
      setShowAddTransaction(false);
    }
  };

  const handleVaultSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const balance = parseFloat(formData.get('balance') as string);
    const type = formData.get('type') as string;

    if (!name || isNaN(balance)) return;

    if (editingAccount) {
      updateAccount(editingAccount.id, { name, balance, type });
      setEditingAccount(null);
    } else {
      addAccount({ name, balance, type });
      setShowAddVault(false);
    }
  };

  const handleTransferSubmit = async (data: any) => {
    try {
      await transferFunds(data);
      setShowTransferModal(false);
    } catch (error) {
      console.error("Transfer failed", error);
    }
  };

  const appFormatCurrency = (val: number) => formatCurrency(val, currency);
  const currentChartData = chartView === 'weekly' ? weeklyChartData : monthlyChartData;

  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        user={user}
        onLogout={() => setShowLogoutConfirm(true)}
        onLoginClick={() => setShowAuth(true)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <TopHeader
          activeTab={activeTab}
          onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
          onAddClick={() => setShowAddTransaction(true)}
          onBack={() => setActiveTab('dashboard')}
          notifications={notifications}
          onMarkRead={markAllAsRead}
        />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-8 fade-in">
              <KpiCards stats={stats} currencySymbol={currency} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Suspense fallback={
                  <div className="lg:col-span-2 h-80 flex items-center justify-center bg-[var(--bg-primary)]/40 rounded-[3rem] border border-[var(--border-default)]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[var(--action-primary)] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Initializing Metrics...</p>
                    </div>
                  </div>
                }>
                  <MainChart
                    data={currentChartData}
                    view={chartView}
                    onViewChange={setChartView}
                  />
                </Suspense>

                <div className="flex flex-col gap-6 lg:h-full">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-lg font-bold tracking-tight">Active Wallets</h3>
                    <button
                      className="text-[var(--action-primary)] font-semibold text-xs flex items-center gap-1 hover:gap-2 transition-all"
                      onClick={() => setActiveTab('accounts')}
                    >
                      Manage <ChevronRightIcon size={14} />
                    </button>
                  </div>

                  <div className="relative">
                    <div className="flex lg:flex-col gap-8 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] py-6 lg:py-2 snap-x snap-mandatory no-scrollbar lg:custom-scrollbar -mx-4 px-4 lg:mx-0 lg:px-2">
                      {accounts.map(acc => (
                        <div key={acc.id} className="snap-center shrink-0">
                          <AccountCard
                            account={acc}
                            formatCurrency={appFormatCurrency}
                            onEdit={(e) => { e.stopPropagation(); setEditingAccount(acc); }}
                            onDelete={(e) => { e.stopPropagation(); deleteAccount(acc.id); }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <RecentHistory
                transactions={transactions}
                onSeeAll={() => setActiveTab('transactions')}
                currencySymbol={currency}
              />
            </div>
          )}

          {activeTab === 'accounts' && (
            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <ChevronRightIcon className="animate-spin text-[var(--action-primary)] mx-auto mb-2" size={32} />
                  <p className="text-sm text-[var(--text-muted)] font-semibold">Loading Accounts...</p>
                </div>
              </div>
            }>
              <VaultsView
                accounts={accounts}
                transactions={transactions}
                formatCurrency={appFormatCurrency}
                onAddVault={() => setShowAddVault(true)}
                onEditVault={(acc) => setEditingAccount(acc)}
                onDeleteVault={(id) => deleteAccount(id)}
                onTransfer={() => setShowTransferModal(true)}
                currencySymbol={currency}
                onSeeAll={() => setActiveTab('transactions')}
              />
            </Suspense>
          )}

          {activeTab === 'transactions' && (
            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <ChevronRightIcon className="animate-spin text-[var(--action-primary)] mx-auto mb-2" size={32} />
                  <p className="text-sm text-[var(--text-muted)] font-semibold">Loading Transactions...</p>
                </div>
              </div>
            }>
              <HistoryView
                transactions={transactions}
                accounts={accounts}
                onEdit={(t) => setEditingTransaction(t)}
                onDelete={deleteTransaction}
                onBulkDelete={bulkDeleteTransactions}
                onDeleteAll={deleteAllTransactions}
                currencySymbol={currency}
              />
            </Suspense>
          )}

          {activeTab === 'reports' && (
            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <ChevronRightIcon className="animate-spin text-[var(--action-primary)] mx-auto mb-2" size={32} />
                  <p className="text-sm text-[var(--text-muted)] font-semibold">Loading Analytics...</p>
                </div>
              </div>
            }>
              <AnalyticsView
                transactions={transactions}
                accounts={accounts}
                currencySymbol={currency}
              />
            </Suspense>
          )}

          {activeTab === 'settings' && (
            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <ChevronRightIcon className="animate-spin text-[var(--action-primary)] mx-auto mb-2" size={32} />
                  <p className="text-sm text-[var(--text-muted)] font-semibold">Loading Settings...</p>
                </div>
              </div>
            }>
              <SettingsView
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                currency={currency}
                onCurrencyChange={setCurrency}
                accountTypes={accountTypes}
                onAddType={addAccountType}
                onDeleteType={deleteAccountType}
                onResetData={resetData}
              />
            </Suspense>
          )}
        </div>
      </main>

      <TransactionModal
        isOpen={showAddTransaction || !!editingTransaction}
        onClose={() => {
          setShowAddTransaction(false);
          setEditingTransaction(null);
        }}
        accounts={accounts}
        onSubmit={handleTransactionSubmit}
        transaction={editingTransaction}
        currencySymbol={currency}
      />

      <AddVaultModal
        isOpen={showAddVault || !!editingAccount}
        onClose={() => {
          setShowAddVault(false);
          setEditingAccount(null);
        }}
        onSubmit={handleVaultSubmit}
        account={editingAccount}
        accountTypes={accountTypes}
      />

      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        accounts={accounts}
        onSubmit={handleTransferSubmit}
        currencySymbol={currency}
      />

      <LogoutConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
        }}
        userName={user?.name}
      />

      {showAuth && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300 bg-[var(--bg-primary)]/40 backdrop-blur-md flex items-center justify-center p-6">
          <Suspense fallback={
            <div className="glass p-10 rounded-[3rem] border border-white/10 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--action-primary)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Loading Secure Vault...</p>
            </div>
          }>
            <AuthView onBack={() => setShowAuth(false)} />
          </Suspense>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="glass rounded-3xl border border-white/10 p-8 flex flex-col items-center gap-4 animate-scale-in">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-2xl bg-[var(--action-primary)] animate-pulse"></div>
              <div className="absolute inset-2 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--action-primary)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold mb-1">Processing...</p>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.2em]">Please wait</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <FinanceApp />
  </AuthProvider>
);

export default App;
