import { Bell, Search, Moon, Sun, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const ROUTE_LABELS: Record<string, { label: string; parent?: string }> = {
  "/":             { label: "Executive Overview" },
  "/inventory":    { label: "Inventory", parent: "Operations" },
  "/logistics":    { label: "Logistics", parent: "Operations" },
  "/procurement":  { label: "Procurement", parent: "Operations" },
  "/orders":       { label: "Orders", parent: "Operations" },
  "/production":   { label: "Production", parent: "Operations" },
  "/forecast":     { label: "Forecast", parent: "Intelligence" },
  "/costs":        { label: "Costs & Financial", parent: "Intelligence" },
  "/risks":        { label: "Risk & Exceptions", parent: "Intelligence" },
  "/ai-dashboard": { label: "AI Dashboard", parent: "Intelligence" },
  "/settings":     { label: "Settings" },
};

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "critical", message: "SKU CH-01005 below safety stock in WH-North", time: "2m ago" },
  { id: 2, type: "warning",  message: "3 shipments delayed — Dallas route disruption", time: "18m ago" },
  { id: 3, type: "info",     message: "Monthly report ready for download", time: "1h ago" },
  { id: 4, type: "success",  message: "24 purchase orders auto-approved", time: "3h ago" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const routeInfo = ROUTE_LABELS[location] ?? { label: "Dashboard" };
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.type === "critical" || n.type === "warning").length;

  return (
    <header className="h-14 border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-10 px-4 md:px-6 flex items-center gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        {routeInfo.parent && (
          <>
            <span className="text-muted-foreground hidden sm:block">{routeInfo.parent}</span>
            <span className="text-muted-foreground/40 hidden sm:block">/</span>
          </>
        )}
        <motion.span
          key={location}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-foreground truncate"
        >
          {routeInfo.label}
        </motion.span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search hint */}
      <button
        className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border rounded-lg px-3 py-1.5 transition-colors min-w-[180px]"
        onClick={() => {
          // future: open command palette
        }}
      >
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="flex-1 text-left text-xs">Search anything...</span>
        <kbd className="text-[10px] font-mono border border-border rounded px-1.5 py-0.5 bg-background flex items-center gap-0.5">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Notifications */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-xl relative h-9 w-9" aria-label="Notifications">
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive pulse-critical" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 rounded-xl overflow-hidden" align="end">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="font-semibold text-sm">Notifications</span>
            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
              {unreadCount} urgent
            </Badge>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {MOCK_NOTIFICATIONS.map(n => (
              <div key={n.id} className="px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                <div className="flex gap-2.5">
                  <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    n.type === "critical" ? "bg-destructive" :
                    n.type === "warning"  ? "bg-orange-500" :
                    n.type === "success"  ? "bg-green-500" : "bg-blue-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed text-foreground">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-border">
            <button className="text-xs text-primary hover:underline w-full text-center">View all notifications</button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl h-9 w-9"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 ring-2 ring-border hover:ring-primary/50 transition-all">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="@user" />
              <AvatarFallback>EC</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold">Elena Chen</p>
              <p className="text-xs text-muted-foreground">VP Supply Chain Ops</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
