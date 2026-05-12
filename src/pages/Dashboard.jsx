import { useState, useEffect } from "react";
import { client } from "@/lib/app-params";
import { motion } from "framer-motion";
import { Bell, Sparkles } from "lucide-react";
import BalanceCard from "@/components/dashboard/BalanceCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import BudgetOverview from "@/components/dashboard/BudgetOverview";
import moment from "moment";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const { pulling, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(loadData);

  async function loadData() {
    const me = await client.auth.me();
    const [txs, budgetList, accs] = await Promise.all([
      client.entities.Transaction.filter({ created_by: me.email }, "-date", 20),
      client.entities.Budget.filter({ month: moment().format("YYYY-MM"), created_by: me.email }),
      client.entities.Account.filter({ created_by: me.email }),
    ]);
    setUser(me);
    setTransactions(txs);
    setBudgets(budgetList);
    setAccounts(accs);
    setLoading(false);
  }

  const currentMonth = moment().format("YYYY-MM");
  const monthTxs = transactions.filter(t => t.date?.startsWith(currentMonth));
  const income = monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  const spending = {};
  monthTxs.filter(t => t.type === "expense").forEach(t => {
    spending[t.category] = (spending[t.category] || 0) + t.amount;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="max-w-lg mx-auto px-4 pt-6 pb-4 relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {(pulling || refreshing) && (
        <div className="flex justify-center mb-3">
          <Loader2 className={`h-5 w-5 text-primary ${refreshing ? 'animate-spin' : ''}`} />
        </div>
      )}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-xs text-muted-foreground">Hola 👋</p>
          <h2 className="text-lg font-heading font-bold text-foreground">
            {user?.full_name?.split(" ")[0] || "Usuario"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        <BalanceCard balance={balance} income={income} expenses={expenses} />
        <QuickActions />
        <BudgetOverview budgets={budgets} spending={spending} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}