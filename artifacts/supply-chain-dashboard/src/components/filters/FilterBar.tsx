import { useState, useEffect, useRef, type ReactNode } from "react";
import { Search, Calendar, X, ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useFilters, type DateRange } from "@/contexts/FiltersContext";

/* ─── Config types ─────────────────────────────────────────── */
export interface FilterBarConfig {
  page: string;
  show?: {
    search?: boolean;
    dateRange?: boolean;
    category?: boolean;
    status?: boolean;
    location?: boolean;
  };
  options?: {
    categories?: string[];
    statuses?: { value: string; label: string; color?: string }[];
    locations?: string[];
  };
}

const DATE_PRESETS: { value: DateRange["preset"]; label: string }[] = [
  { value: "7d",  label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y",  label: "Last 12 months" },
];

/* ─── FilterBar ────────────────────────────────────────────── */
export function FilterBar({ config }: { config: FilterBarConfig }) {
  const { filters, setFilter, reset, hasActive } = useFilters(config.page);
  const show = config.show ?? {};
  const opts = config.options ?? {};
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setFilter("search", searchInput), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const activeCount = [
    filters.category !== "all",
    filters.status !== "all",
    filters.location !== "all",
    filters.search !== "",
    filters.dateRange?.preset !== "30d",
  ].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="filter-bar"
    >
      {/* Search */}
      {show.search !== false && (
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            id={`filter-search-${config.page}`}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search..."
            className="pl-8 h-9 text-sm bg-card border-border focus-visible:ring-primary/50 rounded-lg"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setFilter("search", ""); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Date Range */}
      {show.dateRange !== false && (
        <Popover>
          <PopoverTrigger asChild>
            <button className={`filter-chip ${filters.dateRange?.preset !== "30d" ? "active" : ""}`}>
              <Calendar className="h-3.5 w-3.5" />
              {DATE_PRESETS.find(p => p.value === filters.dateRange?.preset)?.label ?? "Last 30 days"}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="flex flex-col gap-0.5">
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setFilter("dateRange", { preset: preset.value })}
                  className={`text-left text-sm px-3 py-2 rounded-md transition-colors ${
                    filters.dateRange?.preset === preset.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Category */}
      {show.category && opts.categories && opts.categories.length > 0 && (
        <Select value={filters.category} onValueChange={v => setFilter("category", v)}>
          <SelectTrigger className={`h-9 text-sm border-border bg-card rounded-lg min-w-[140px] ${filters.category !== "all" ? "border-primary/50 text-primary bg-primary/5" : ""}`}>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {opts.categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {/* Status */}
      {show.status && opts.statuses && opts.statuses.length > 0 && (
        <Select value={filters.status} onValueChange={v => setFilter("status", v)}>
          <SelectTrigger className={`h-9 text-sm border-border bg-card rounded-lg min-w-[130px] ${filters.status !== "all" ? "border-primary/50 text-primary bg-primary/5" : ""}`}>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {opts.statuses.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Location */}
      {show.location && opts.locations && opts.locations.length > 0 && (
        <Select value={filters.location} onValueChange={v => setFilter("location", v)}>
          <SelectTrigger className={`h-9 text-sm border-border bg-card rounded-lg min-w-[140px] ${filters.location !== "all" ? "border-primary/50 text-primary bg-primary/5" : ""}`}>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {opts.locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {/* Active count badge + Reset */}
      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 ml-auto"
          >
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold px-2 py-0.5">
              {activeCount} filter{activeCount > 1 ? "s" : ""}
            </Badge>
            <button
              onClick={() => { reset(); setSearchInput(""); }}
              className="filter-chip text-muted-foreground hover:text-destructive hover:border-destructive/40"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
