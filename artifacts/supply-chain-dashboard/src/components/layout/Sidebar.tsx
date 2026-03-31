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
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", icon: BarChart3, label: "Executive Overview" },
  { href: "/inventory", icon: Package, label: "Inventory" },
  { href: "/logistics", icon: Truck, label: "Logistics" },
  { href: "/procurement", icon: Users, label: "Procurement" },
  { href: "/forecast", icon: LineChart, label: "Forecast" },
  { href: "/production", icon: Factory, label: "Production" },
  { href: "/costs", icon: DollarSign, label: "Costs & Financial" },
  { href: "/risks", icon: AlertTriangle, label: "Risk & Exceptions" },
  { href: "/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-card/50 backdrop-blur-xl h-screen sticky top-0 flex flex-col z-20 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg glow-primary">
            <Factory size={18} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            NexusChain
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer relative group overflow-hidden ${
                    isActive 
                      ? "text-primary-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-100 z-0 rounded-lg shadow-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <item.icon 
                    size={18} 
                    className={`relative z-10 transition-colors ${
                      isActive ? "text-primary-foreground" : "group-hover:text-primary"
                    }`} 
                  />
                  <span className="relative z-10 text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-foreground">System Status</span>
          </div>
          <p className="text-xs text-muted-foreground">All systems operational. Data latency &lt; 50ms.</p>
        </div>
      </div>
    </aside>
  );
}
