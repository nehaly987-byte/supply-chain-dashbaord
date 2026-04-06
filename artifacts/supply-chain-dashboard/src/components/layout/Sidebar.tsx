import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Package,
  Truck,
  Users,
  LineChart,
  Factory,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/", icon: BarChart3, label: "Executive Overview" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/inventory",   icon: Package,       label: "Inventory" },
      { href: "/logistics",   icon: Truck,         label: "Logistics" },
      { href: "/procurement", icon: Users,         label: "Procurement" },
      { href: "/orders",      icon: ShoppingCart,  label: "Orders" },
      { href: "/production",  icon: Factory,       label: "Production" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/forecast",     icon: LineChart,      label: "Forecast" },
      { href: "/costs",        icon: DollarSign,     label: "Costs & Financial" },
      { href: "/risks",        icon: AlertTriangle,  label: "Risk & Exceptions" },
      { href: "/ai-dashboard", icon: Sparkles,       label: "AI Dashboard", highlight: true },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { settings, update } = useSettings();
  const collapsed = settings.sidebarCollapsed;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-shrink-0 border-r border-sidebar-border glass-sidebar h-screen sticky top-0 flex flex-col z-20 hidden md:flex overflow-hidden"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg flex-shrink-0 glow-primary">
            <Factory size={16} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent whitespace-nowrap overflow-hidden"
              >
                NexusChain
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7 rounded-md text-muted-foreground hover:text-foreground flex-shrink-0"
          onClick={() => update("sidebarCollapsed", !collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location === item.href;
                const navItem = (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer relative group overflow-hidden ${
                        isActive
                          ? "text-primary-foreground font-semibold"
                          : item.highlight
                          ? "text-muted-foreground hover:text-foreground hover:bg-primary/8"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-nav"
                          className={`absolute inset-0 ${item.highlight ? "bg-gradient-to-r from-primary via-violet-500 to-accent" : "bg-gradient-to-r from-primary to-primary/80"} rounded-xl shadow z-0`}
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon
                        size={17}
                        className={`relative z-10 flex-shrink-0 transition-colors ${
                          isActive
                            ? "text-primary-foreground"
                            : item.highlight
                            ? "group-hover:text-primary text-violet-500"
                            : "group-hover:text-primary"
                        }`}
                      />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="relative z-10 text-sm whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {!collapsed && item.highlight && !isActive && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="relative z-10 ml-auto text-[9px] font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent border border-primary/30 rounded-full px-1.5 py-0.5"
                        >
                          AI
                        </motion.span>
                      )}
                    </div>
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href} delayDuration={0}>
                      <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return navItem;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Status footer */}
      <div className="p-3 border-t border-sidebar-border flex-shrink-0">
        <AnimatePresence>
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-br from-primary/8 to-accent/8 rounded-xl p-3 border border-primary/15"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[11px] font-semibold text-foreground">All Systems Operational</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">API latency &lt; 50ms · 99.98% uptime</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
