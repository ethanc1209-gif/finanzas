import { useState, useEffect } from "react";
import { client } from "@/lib/app-params";
import { motion } from "framer-motion";
import { Plus, Trophy, Target } from "lucide-react";
import GoalCard from "@/components/goals/GoalCard";
import AddGoalDialog from "@/components/goals/AddGoalDialog";
import AddToGoalDialog from "@/components/goals/AddToGoalDialog";
import { formatMoney } from "@/lib/categories";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => { loadGoals(); }, []);

  async function loadGoals() {
    const me = await client.auth.me();
    const data = await client.entities.SavingsGoal.filter({ created_by: me.email }, "-created_date");
    setGoals(data);
    setLoading(false);
  }

  const totalSaved = goals.reduce((s, g) => s + (g.current_amount || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + (g.target_amount || 0), 0);
  const completedGoals = goals.filter(g => g.current_amount >= g.target_amount).length;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-heading font-bold text-foreground">Metas de ahorro</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="h-9 px-3 rounded-xl bg-primary/15 text-primary text-xs font-medium flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" /> Nueva
        </button>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-primary/15 via-card to-card border border-primary/10 mb-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total ahorrado</p>
            <p className="text-xl font-heading font-bold text-foreground">{formatMoney(totalSaved)}</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{goals.length} metas</span>
          <span>·</span>
          <span>{completedGoals} completadas</span>
          <span>·</span>
          <span>Meta: {formatMoney(totalTarget)}</span>
        </div>
      </motion.div>

      {/* Goal List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16">
          <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No tienes metas aún</p>
          <button onClick={() => setAddOpen(true)} className="text-primary text-sm font-medium mt-1">
            Crea tu primera meta →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={i}
              onClick={() => setSelectedGoal(goal)}
            />
          ))}
        </div>
      )}

      <AddGoalDialog open={addOpen} onClose={() => setAddOpen(false)} onSuccess={loadGoals} />
      <AddToGoalDialog
        open={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
        goal={selectedGoal}
        onSuccess={loadGoals}
      />
    </div>
  );
}