import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/app-params";
import { Loader2 } from "lucide-react";

function formatMoney(n) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n || 0);
}

export default function AddToGoalDialog({ open, onClose, goal, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!goal) return null;

  const remaining = goal.target_amount - goal.current_amount;

  async function handleSubmit() {
    if (!amount) return;
    onSuccess?.();
    onClose();
    await client.entities.SavingsGoal.update(goal.id, {
      current_amount: goal.current_amount + parseFloat(amount),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Abonar a "{goal.name}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Te faltan <span className="text-foreground font-semibold">{formatMoney(Math.max(remaining, 0))}</span> para completar esta meta.
          </p>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Monto a abonar ($)"
            className="bg-secondary border-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !amount}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Abonar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}