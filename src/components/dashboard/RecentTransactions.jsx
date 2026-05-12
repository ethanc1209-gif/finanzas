import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatMoney } from "@/lib/categories";

export default function RecentTransactions({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">No hay transacciones aún</p>
        <Link to="/transactions" className="text-primary text-sm mt-1 inline-block">Agregar primer gasto</Link>
      </div>
    );
  }

  const allCats = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Recientes</h3>
        <Link to="/transactions" className="text-xs text-primary">Ver todo</Link>
      </div>
      <div className="space-y-2">
        {transactions.slice(0, 5).map((t, i) => {
          const cat = allCats.find(c => c.key === t.category);
          const Icon = cat?.icon;
          return (
            <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
              <div className={"p-2 rounded-xl bg-muted"}>
                {Icon && <Icon className={"h-4 w-4 " + (cat?.color || "text-muted-foreground")} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{t.description || t.category}</p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
              </div>
              <span className={"text-sm font-semibold " + (t.type === "income" ? "text-emerald-400" : "text-red-400")}>
                {t.type === "income" ? "+" : "-"}{formatMoney(t.amount)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}