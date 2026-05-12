import { motion } from "framer-motion";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { formatMoney } from "@/lib/categories";

export default function BalanceCard({ balance, income, expenses }) {
  const [visible, setVisible] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-card border border-primary/20 p-6"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-8 -translate-x-8" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-muted-foreground">Balance disponible</p>
          <button onClick={() => setVisible(!visible)} className="p-1 rounded-lg hover:bg-white/5">
            {visible ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
        
        <motion.h1
          key={visible ? "show" : "hide"}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl font-heading font-bold text-foreground mb-4"
        >
          {visible ? formatMoney(balance) : "••••••"}
        </motion.h1>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-emerald-500/10 rounded-xl px-3 py-2 flex-1">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-emerald-400/70">Ingresos</p>
              <p className="text-sm font-semibold text-emerald-400">{visible ? formatMoney(income) : "••••"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-500/10 rounded-xl px-3 py-2 flex-1">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <div>
              <p className="text-[10px] text-red-400/70">Gastos</p>
              <p className="text-sm font-semibold text-red-400">{visible ? formatMoney(expenses) : "••••"}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}