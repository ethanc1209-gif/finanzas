import { useState, useEffect } from "react";
import { client } from "@/lib/app-params";
import { motion } from "framer-motion";
import {
  User, Wallet, Trophy, Calculator, LogOut, ChevronRight,
  Plus, CreditCard, Banknote, PiggyBank, Loader2, Sparkles, Trash2, AlertTriangle
} from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/categories";

const ACCOUNT_ICONS = {
  cash: Banknote,
  debit_card: CreditCard,
  credit_card: CreditCard,
  savings: PiggyBank,
  other: Wallet,
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addAccOpen, setAddAccOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => { loadData(); }, []);
  const { pulling, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(loadData);

  async function loadData() {
    const me = await client.auth.me();
    const [accs, achs, txs] = await Promise.all([
      client.entities.Account.filter({ created_by: me.email }),
      client.entities.Achievement.filter({ created_by: me.email }),
      client.entities.Transaction.filter({ created_by: me.email }, "-date", 100),
    ]);
    setUser(me);
    setAccounts(accs);
    setAchievements(achs);
    setTransactions(txs);
    setLoading(false);
  }

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="max-w-lg mx-auto px-4 pt-6 pb-4"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
          <User className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground">{user?.full_name || "Usuario"}</h2>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </motion.div>

      {/* Accounts */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Mis cuentas</h3>
          <button onClick={() => setAddAccOpen(true)} className="text-xs text-primary flex items-center gap-1">
            <Plus className="h-3 w-3" /> Agregar
          </button>
        </div>
        <div className="space-y-2">
          {accounts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No tienes cuentas configuradas</p>
          )}
          {accounts.map((acc, i) => {
            const Icon = ACCOUNT_ICONS[acc.type] || Wallet;
            return (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{acc.name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{acc.type?.replace("_", " ")}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{formatMoney(acc.balance)}</span>
              </motion.div>
            );
          })}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Balance total</span>
              <span className="text-sm font-bold text-primary">{formatMoney(totalBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2 mb-6">
        {[
          { icon: Trophy, label: "Logros", desc: `${achievements.filter(a => a.unlocked).length} desbloqueados`, color: "text-yellow-400" },
          { icon: Calculator, label: "Simulador", desc: "¿Cuánto tendrás en 3 meses?", color: "text-blue-400", onClick: () => setSimOpen(true) },
        ].map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={item.onClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => client.auth.logout()}
          className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
        </Button>
        <Button
          variant="ghost"
          onClick={() => setDeleteOpen(true)}
          className="text-red-600 hover:text-red-500 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AddAccountDialog open={addAccOpen} onClose={() => setAddAccOpen(false)} onSuccess={loadData} />
      <DeleteAccountDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
      <SimulatorDialog open={simOpen} onClose={() => setSimOpen(false)} transactions={transactions} accounts={accounts} />
    </div>
  );
}

function AddAccountDialog({ open, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("debit_card");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name) return;
    setLoading(true);
    await client.entities.Account.create({
      name,
      type,
      balance: parseFloat(balance) || 0,
    });
    setLoading(false);
    setName("");
    setBalance("");
    onSuccess?.();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Nueva cuenta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la cuenta" className="bg-secondary border-none" />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full bg-secondary border-none rounded-md px-3 py-2 text-sm text-foreground"
          >
            <option value="cash">Efectivo</option>
            <option value="debit_card">Tarjeta de débito</option>
            <option value="credit_card">Tarjeta de crédito</option>
            <option value="savings">Ahorro</option>
            <option value="other">Otra</option>
          </select>
          <Input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="Balance actual ($)" className="bg-secondary border-none" />
          <Button onClick={handleSubmit} disabled={loading || !name} className="w-full h-11 rounded-xl bg-primary text-primary-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog({ open, onClose }) {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (confirm !== "ELIMINAR") return;
    setLoading(true);
    // Delete all user data
    const [txs, goals, budgets, accs, achs] = await Promise.all([
      client.entities.Transaction.list(),
      client.entities.SavingsGoal.list(),
      client.entities.Budget.list(),
      client.entities.Account.list(),
      client.entities.Achievement.list(),
    ]);
    await Promise.all([
      ...txs.map(t => client.entities.Transaction.delete(t.id)),
      ...goals.map(g => client.entities.SavingsGoal.delete(g.id)),
      ...budgets.map(b => client.entities.Budget.delete(b.id)),
      ...accs.map(a => client.entities.Account.delete(a.id)),
      ...achs.map(a => client.entities.Achievement.delete(a.id)),
    ]);
    setLoading(false);
    client.auth.logout();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Eliminar cuenta
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Esta acción eliminará todos tus datos permanentemente. No se puede deshacer.</p>
          <Input
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder='Escribe "ELIMINAR" para confirmar'
            className="bg-secondary border-none"
          />
          <Button
            onClick={handleDelete}
            disabled={loading || confirm !== "ELIMINAR"}
            className="w-full h-11 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar todos mis datos"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SimulatorDialog({ open, onClose, transactions, accounts }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const balance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const last30 = transactions.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    return (now - d) / (1000 * 60 * 60 * 24) <= 30;
  });
  const monthlyIncome = last30.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = last30.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  async function simulate() {
    setLoading(true);
    const res = await client.integrations.Core.InvokeLLM({
      prompt: `Eres un asesor financiero. Datos: Balance actual: $${balance}. Ingresos mensuales: $${monthlyIncome}. Gastos mensuales: $${monthlyExpenses}. Calcula cuánto dinero tendrá en 1, 3 y 6 meses si mantiene este ritmo. Añade consejos para mejorar. Responde en español, amigable.`,
    });
    setResult(res);
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Simulador financiero
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-secondary">
              <p className="text-[10px] text-muted-foreground">Balance</p>
              <p className="text-xs font-bold text-foreground">{formatMoney(balance)}</p>
            </div>
            <div className="p-2 rounded-xl bg-secondary">
              <p className="text-[10px] text-muted-foreground">Ingresos/mes</p>
              <p className="text-xs font-bold text-emerald-400">{formatMoney(monthlyIncome)}</p>
            </div>
            <div className="p-2 rounded-xl bg-secondary">
              <p className="text-[10px] text-muted-foreground">Gastos/mes</p>
              <p className="text-xs font-bold text-red-400">{formatMoney(monthlyExpenses)}</p>
            </div>
          </div>

          {result ? (
            <p className="text-sm text-muted-foreground whitespace-pre-line">{result}</p>
          ) : (
            <Button onClick={simulate} disabled={loading} className="w-full h-11 rounded-xl bg-primary text-primary-foreground">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Simulando...</> : "Simular mi futuro financiero"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}