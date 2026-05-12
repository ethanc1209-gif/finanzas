import {
  Utensils, Car, Gamepad2, GraduationCap, ShoppingBag,
  Home, Heart, Smartphone, Zap, Gift, Briefcase, DollarSign,
  Music, Plane, Dumbbell, Stethoscope, Coffee
} from "lucide-react";

export const EXPENSE_CATEGORIES = [
  { key: "food", label: "Comida", icon: Utensils, color: "text-orange-400" },
  { key: "transport", label: "Transporte", icon: Car, color: "text-blue-400" },
  { key: "entertainment", label: "Entretenimiento", icon: Gamepad2, color: "text-purple-400" },
  { key: "education", label: "Educación", icon: GraduationCap, color: "text-cyan-400" },
  { key: "shopping", label: "Compras", icon: ShoppingBag, color: "text-pink-400" },
  { key: "home", label: "Hogar", icon: Home, color: "text-amber-400" },
  { key: "health", label: "Salud", icon: Stethoscope, color: "text-red-400" },
  { key: "subscriptions", label: "Suscripciones", icon: Smartphone, color: "text-indigo-400" },
  { key: "services", label: "Servicios", icon: Zap, color: "text-yellow-400" },
  { key: "gifts", label: "Regalos", icon: Gift, color: "text-rose-400" },
  { key: "coffee", label: "Café", icon: Coffee, color: "text-amber-600" },
  { key: "fitness", label: "Gym", icon: Dumbbell, color: "text-lime-400" },
  { key: "travel", label: "Viajes", icon: Plane, color: "text-sky-400" },
  { key: "music", label: "Música", icon: Music, color: "text-fuchsia-400" },
  { key: "other", label: "Otro", icon: DollarSign, color: "text-gray-400" },
];

export const INCOME_CATEGORIES = [
  { key: "salary", label: "Salario", icon: Briefcase, color: "text-emerald-400" },
  { key: "freelance", label: "Freelance", icon: DollarSign, color: "text-green-400" },
  { key: "gift", label: "Regalo", icon: Gift, color: "text-rose-400" },
  { key: "investment", label: "Inversión", icon: Zap, color: "text-yellow-400" },
  { key: "other", label: "Otro", icon: DollarSign, color: "text-gray-400" },
];

export function getCategoryInfo(key, type = "expense") {
  const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find(c => c.key === key) || list[list.length - 1];
}

export function formatMoney(amount) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}