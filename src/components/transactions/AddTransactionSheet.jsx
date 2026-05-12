import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/app-params";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { Loader2 } from "lucide-react";
import moment from "moment";

export default function AddTransactionSheet({ open, onClose, type = "expense", accounts, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (open) {
      setAmount("");
      setCategory("");
      setDescription("");
      setAccount(accounts?.[0]?.name || "Efectivo");
      setLoading(false);
      setDate(moment().format("YYYY-MM-DD"));
      setIsRecurring(false);
    }
  }, [open, accounts]);

  async function classifyWithAI() {
    if (!description) return;
    setClassifying(true);
    const res = await client.integrations.Core.InvokeLLM({
      prompt: `Classify this expense into ONE category. Description: "${description}". Categories: ${categories.map(c => c.key).join(", ")}. Return only the category key.`,
      response_json_schema: { type: "object", properties: { category: { type: "string" } } },
    });
    if (res.category) setCategory(res.category);
    setClassifying(false);
  }

  async function handleSubmit() {
    if (!amount || !category) return;
    onSuccess?.();
    onClose();
    await client.entities.Transaction.create({
      type, amount: parseFloat(amount), category,
      description, date, account, is_recurring: isRecurring,
    });
    const acc = accounts?.find(a => a.name === account);
    if (acc) {
      const delta = type === "income" ? parseFloat(amount) : -parseFloat(amount);
      await client.entities.Account.update(acc.id, { balance: acc.balance + delta });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="bg-card border-border rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground font-heading">
            {type === "income" ? "Nuevo ingreso" : "Nuevo gasto"}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-5 py-4">
          <div className="text-center">
            <div className="inline-flex items-baseline gap-1">
              <span className="text-2xl text-muted-foreground">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="text-5xl font-heading font-bold bg-transparent border-none outline-none text-center w-48 text-foreground placeholder:text-muted-foreground/30"
              />
            </div>
          </div>
          <div>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={classifyWithAI}
              placeholder="¿En qué gastaste? (la IA clasificará automáticamente)"
              className="bg-secondary border-none resize-none text-sm"
              rows={2}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">Categoría</p>
              {classifying && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" /> Clasificando...
                </span>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isActive = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={"flex flex-col items-center gap-1 p-2 rounded-xl transition-all " + (isActive ? "bg-primary/20 ring-1 ring-primary" : "bg-secondary hover:bg-secondary/80")}
                  >
                    <Icon className={"h-4 w-4 " + (isActive ? "text-primary" : cat.color)} />
                    <span className="text-[9px] text-muted-foreground leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary border-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Cuenta</label>
              <select value={account} onChange={e => setAccount(e.target.value)} className="w-full bg-secondary border-none rounded-md px-3 py-2 text-sm text-foreground outline-none">
                {(accounts || []).map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="rounded bg-secondary border-border" />
            <span className="text-sm text-muted-foreground">Gasto recurrente (suscripción)</span>
          </label>
          <Button onClick={handleSubmit} disabled={loading || !amount || !category} className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}