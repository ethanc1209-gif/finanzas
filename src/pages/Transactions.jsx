import { useState, useEffect } from "react";
import { client }   from "@/lib/app-params";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getCategoryInfo, formatMoney } from "@/lib/categories";
import AddTransactionSheet from "@/components/transactions/AddTransactionSheet";
import moment from "moment";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Loader2 as LoaderIcon } from "lucide-react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [txType, setTxType] = useState("expense");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action === "income" || action === "expense") {
      setTxType(action);
      setSheetOpen(true);
    }
  }, []);

  async function loadData() {
    const me = await client.auth.me();
    const [txs, accs] = await Promise.all([
      client.entities.Transaction.filter({ created_by: me.email }, "-date", 100),
      client.entities.Account.filter({ created_by: me.email }),
    ]);
    setTransactions(txs);
    setAccounts(accs);
    setLoading(false);
  }

  const { pulling, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(loadData);

  const filtered = transactions.filter(t => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (search && !t.description?.toLowerCase().includes(search.toLowerCase()) && !t.category?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = {};
  filtered.forEach(t => {
    const key = moment(t.date).format("YYYY-MM-DD");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  return (
    <div
      className="max-w-lg mx-auto px-4 pt-6 pb-4"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {(pulling || refreshing) && (
        <div className="flex justify-center mb-2">
          <LoaderIcon className={`h-5 w-5 text-primary ${refreshing ? 'animate-spin' : ''}`} />
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-heading font-bold text-foreground">Movimientos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setTxType("income"); setSheetOpen(true); }}
            className="h-9 px-3 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-medium flex items-center gap-1"
          >
            <ArrowUpRight className="h-3.5 w-3.5" /> Ingreso
          </button>
          <button
            onClick={() => { setTxType("expense"); setSheetOpen(true); }}
            className="h-9 px-3 rounded-xl bg-red-500/15 text-red-400 text-xs font-medium flex items-center gap-1"
          >
            <ArrowDownRight className="h-3.5 w-3.5" /> Gasto
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary border-none text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
        </div>
        <div className="flex bg-secondary rounded-xl p-0.5">
          {[["all", "Todo"], ["income", "Ingresos"], ["expense", "Gastos"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filterType === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">No hay movimientos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, txs]) => (
              <div key={date}>
                <p className="text-xs text-muted-foreground font-medium mb-2 px-1">
                  {moment(date).format("dddd, D MMMM")}
                </p>
                <div className="space-y-1.5">
                  {txs.map((tx, i) => {
                    const cat = getCategoryInfo(tx.category, tx.type);
                    const Icon = cat.icon;
                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-all"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${cat.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {tx.description || cat.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {cat.label} · {tx.account}
                            {tx.is_recurring && " · 🔄"}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                          {tx.type === "income" ? "+" : "-"}{formatMoney(tx.amount)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      <AddTransactionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        type={txType}
        accounts={accounts}
        onSuccess={loadData}
      />
    </div>
  );
}