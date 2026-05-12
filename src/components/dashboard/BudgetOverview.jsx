import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/categories";

export default function BudgetOverview({ budgets }) {
  if (!budgets || budgets.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Presupuestos</h3>
        <Link to="/stats" className="text-xs text-primary">Ver todo</Link>
      </div>
      <div className="space-y-2">
        {budgets.slice(0, 3).map((b, i) => {
          const pct = Math.min((b.spent / b.limit_amount) * 100, 100);
          const over = b.spent > b.limit_amount;
          return (
            <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-secondary rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground capitalize">{b.category}</span>
                <span className={"text-xs font-semibold " + (over ? "text-red-400" : "text-muted-foreground")}>{formatMoney(b.spent || 0)} / {formatMoney(b.limit_amount)}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={"h-full rounded-full transition-all " + (over ? "bg-red-400" : "bg-primary")} style={{ width: pct + "%" }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}