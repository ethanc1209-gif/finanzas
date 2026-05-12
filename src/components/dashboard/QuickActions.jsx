import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Target, Wallet } from "lucide-react";

const actions = [
  { icon: TrendingUp, label: "Ingreso", path: "/transactions?type=income", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: TrendingDown, label: "Gasto", path: "/transactions?type=expense", color: "text-red-400", bg: "bg-red-400/10" },
  { icon: Target, label: "Metas", path: "/goals", color: "text-blue-400", bg: "bg-blue-400/10" },
  { icon: Wallet, label: "Cuentas", path: "/profile", color: "text-purple-400", bg: "bg-purple-400/10" },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((a, i) => {
        const Icon = a.icon;
        return (
          <motion.div key={a.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={a.path} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all">
              <div className={"p-2 rounded-xl " + a.bg}>
                <Icon className={"h-5 w-5 " + a.color} />
              </div>
              <span className="text-[11px] text-muted-foreground">{a.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}