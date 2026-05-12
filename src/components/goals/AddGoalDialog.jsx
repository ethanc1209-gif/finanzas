import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/app-params";
import { Loader2, Target, Car, Home, Plane, Smartphone, GraduationCap, Heart } from "lucide-react";

const ICONS = [
  { key: "target", icon: Target },
  { key: "car", icon: Car },
  { key: "home", icon: Home },
  { key: "plane", icon: Plane },
  { key: "phone", icon: Smartphone },
  { key: "education", icon: GraduationCap },
  { key: "health", icon: Heart },
];

export default function AddGoalDialog({ open, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState("target");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name || !target) return;
    setLoading(true);
    const me = await client.auth.me();
    if (!me?.email) {
      setLoading(false);
      return;
    }
    await client.entities.SavingsGoal.create({
      name, target_amount: parseFloat(target),
      current_amount: 0, deadline, icon,
      created_by: me.email,
    });
    setLoading(false);
    setName(""); setTarget(""); setDeadline(""); setIcon("target");
    onSuccess?.();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Nueva meta de ahorro</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la meta" className="bg-secondary border-none" />
          <Input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="Monto objetivo ($)" className="bg-secondary border-none" />
          <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-secondary border-none" />
          <div>
            <p className="text-xs text-muted-foreground mb-2">Ícono</p>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(({ key, icon: Icon }) => (
                <button key={key} onClick={() => setIcon(key)} className={"p-2 rounded-xl transition-all " + (icon === key ? "bg-primary/20 ring-1 ring-primary" : "bg-secondary")}>
                  <Icon className={"h-5 w-5 " + (icon === key ? "text-primary" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={loading || !name || !target} className="w-full h-11 rounded-xl bg-primary text-primary-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear meta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}