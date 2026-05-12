import { motion } from "framer-motion";
import { Target, Car, Home, Plane, Smartphone, GraduationCap, Heart } from "lucide-react";

const ICON_MAP = {
  target: Target, car: Car, home: Home, plane: Plane,
  phone: Smartphone, education: GraduationCap, health: Heart,
};

function formatMoney(n) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n || 0);
}

export default function GoalCard({ goal, onAddFunds }) {
  const Icon = ICON_MAP[goal.icon] || Target;
  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
  const completed = progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{goal.name}</p>
            <p className="text-xs text-muted-foreground">{formatMoney(goal.current_amount)} / {formatMoney(goal.target_amount)}</p>
          </div>
        </div>
        <span className={"text-xs font-bold px-2 py-1 rounded-full " + (completed ? "bg-emerald-500/20 text-emerald-400" : "bg-primary/10 text-primary")}>
          {Math.round(progress)}%
        </span>
      </div>

      <div className="w-full bg-secondary rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={"h-2 rounded-full " + (completed ? "bg-emerald-400" : "bg-primary")}
        />
      </div>

      {!completed && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Faltan {formatMoney(remaining)}</p>
          <button
            onClick={() => onAddFunds(goal)}
            className="text-xs text-primary font-semibold hover:underline"
          >
            + Abonar
          </button>
        </div>
      )}

      {completed && (
        <p className="text-xs text-emerald-400 font-semibold text-center">¡Meta completada! 🎉</p>
      )}
    </motion.div>
  );
}