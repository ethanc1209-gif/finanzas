import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, ArrowLeftRight, Target, BarChart3, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "Inicio" },
  { path: "/transactions", icon: ArrowLeftRight, label: "Movimientos" },
  { path: "/goals", icon: Target, label: "Metas" },
  { path: "/stats", icon: BarChart3, label: "Estadísticas" },
  { path: "/profile", icon: User, label: "Perfil" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <main
        className="flex-1 overflow-y-auto hide-scrollbar overscroll-none"
        style={{
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                replace
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`h-5 w-5 transition-colors relative z-10 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium relative z-10 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>
    </div>
  );
}