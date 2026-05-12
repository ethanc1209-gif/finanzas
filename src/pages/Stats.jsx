import { useState, useEffect } from "react";
import { client } from "@/lib/app-params";
import { motion } from "framer-motion";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { getCategoryInfo, formatMoney, EXPENSE_CATEGORIES } from "@/lib/categories";
import { TrendingUp, TrendingDown, Lightbulb, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";

export default function Stats() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(moment());
  const [insight, setInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const me = await client.auth.me();
    const [txs, bdgs] = await Promise.all([
      client.entities.Transaction.filter({ created_by: me.email }, "-date", 500),
      client.entities.Budget.filter({ created_by: me.email }),
    ]);
    setTransactions(txs);
    setBudgets(bdgs);
    setLoading(false);
  }

  const monthKey = month.format("YYYY-MM");
  const monthTxs = transactions.filter(t => t.date?.startsWith(monthKey));
  const income = monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // Category breakdown
  const catSpending = {};
  monthTxs.filter(t => t.type === "expense").forEach(t => {
    catSpending[t.category] = (catSpending[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(catSpending)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({
      name: getCategoryInfo(key).label,
      value,
      key,
    }));

  const PIE_COLORS = ["#34d399", "#60a5fa", "#a78bfa", "#fbbf24", "#f87171", "#fb923c", "#e879f9", "#2dd4bf"];

  // Weekly breakdown
  const weeklyData = [];
  for (let w = 0; w < 5; w++) {
    const weekStart = moment(monthKey, "YYYY-MM").startOf("month").add(w * 7, "days");
    const weekEnd = moment(weekStart).add(6, "days");
    const weekTxs = monthTxs.filter(t => {
      const d = moment(t.date);
      return d.isSameOrAfter(weekStart, "day") && d.isSameOrBefore(weekEnd, "day");
    });
    if (weekStart.month() === month.month()) {
      weeklyData.push({
        name: `Sem ${w + 1}`,
        gastos: weekTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        ingresos: weekTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
      });
    }
  }

  // Monthly trend (last 6 months)
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    const m = moment().subtract(i, "months");
    const mk = m.format("YYYY-MM");
    const mTxs = transactions.filter(t => t.date?.startsWith(mk));
    trendData.push({
      name: m.format("MMM"),
      gastos: mTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      ingresos: mTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    });
  }

  // Budget vs actual
  const monthBudgets = budgets.filter(b => b.month === monthKey);

  async function getInsight() {
    setLoadingInsight(true);
    const summary = pieData.map(p => `${p.name}: $${p.value}`).join(", ");
    const res = await client.integrations.Core.InvokeLLM({
      prompt: `Eres un asesor financiero para jóvenes. Analiza estos gastos del mes: ${summary}. Total ingresos: $${income}, Total gastos: $${expenses}. Da 3 consejos breves y directos en español. Sé amigable y usa emojis.`,
    });
    setInsight(res);
    setLoadingInsight(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <h1 className="text-xl font-heading font-bold text-foreground mb-5">Estadísticas</h1>

      {/* Month selector */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <button onClick={() => setMonth(m => moment(m).subtract(1, "month"))} className="p-2 rounded-xl bg-secondary">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground capitalize">{month.format("MMMM YYYY")}</span>
        <button onClick={() => setMonth(m => moment(m).add(1, "month"))} className="p-2 rounded-xl bg-secondary">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Ingresos</span>
          </div>
          <p className="text-lg font-heading font-bold text-emerald-400">{formatMoney(income)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <span className="text-xs text-muted-foreground">Gastos</span>
          </div>
          <p className="text-lg font-heading font-bold text-red-400">{formatMoney(expenses)}</p>
        </motion.div>
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div className="p-4 rounded-2xl bg-card border border-border mb-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Gastos por categoría</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {pieData.slice(0, 5).map((item, i) => (
                <div key={item.key} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-medium text-foreground">{formatMoney(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Bar Chart */}
      {weeklyData.length > 0 && (
        <div className="p-4 rounded-2xl bg-card border border-border mb-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Gasto semanal</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(145 8% 55%)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "hsl(145 15% 8%)", border: "1px solid hsl(145 10% 16%)", borderRadius: "12px", fontSize: "12px" }}
                labelStyle={{ color: "hsl(145 10% 95%)" }}
                formatter={(v) => [formatMoney(v)]}
              />
              <Bar dataKey="gastos" fill="hsl(0 72% 55%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="ingresos" fill="hsl(152 70% 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 6 Month Trend */}
      <div className="p-4 rounded-2xl bg-card border border-border mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Tendencia (6 meses)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={trendData}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(145 8% 55%)" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "hsl(145 15% 8%)", border: "1px solid hsl(145 10% 16%)", borderRadius: "12px", fontSize: "12px" }}
              labelStyle={{ color: "hsl(145 10% 95%)" }}
              formatter={(v) => [formatMoney(v)]}
            />
            <Line type="monotone" dataKey="ingresos" stroke="hsl(152 70% 50%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="gastos" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Progress */}
      {monthBudgets.length > 0 && (
        <div className="p-4 rounded-2xl bg-card border border-border mb-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Presupuestos</h3>
          <div className="space-y-3">
            {monthBudgets.map(b => {
              const cat = getCategoryInfo(b.category);
              const Icon = cat.icon;
              const spent = catSpending[b.category] || 0;
              const pct = Math.min((spent / b.limit_amount) * 100, 100);
              const isOver = spent > b.limit_amount;
              return (
                <div key={b.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-3.5 w-3.5 ${cat.color}`} />
                    <span className="text-xs text-foreground flex-1">{cat.label}</span>
                    <span className={`text-xs font-medium ${isOver ? "text-red-400" : "text-muted-foreground"}`}>
                      {formatMoney(spent)} / {formatMoney(b.limit_amount)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOver ? "bg-red-400" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-card border border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Asesor financiero IA</h3>
        </div>
        {insight ? (
          <p className="text-sm text-muted-foreground whitespace-pre-line">{insight}</p>
        ) : (
          <button
            onClick={getInsight}
            disabled={loadingInsight || monthTxs.length === 0}
            className="text-sm text-primary font-medium flex items-center gap-1"
          >
            {loadingInsight ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Analizando...</>
            ) : (
              "Obtener consejos personalizados →"
            )}
          </button>
        )}
      </div>
    </div>
  );
}