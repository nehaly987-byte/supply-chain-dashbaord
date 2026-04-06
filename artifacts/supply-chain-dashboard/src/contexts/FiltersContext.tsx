import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface DateRange {
  from?: Date;
  to?: Date;
  preset?: "7d" | "30d" | "90d" | "1y" | "custom";
}

export interface PageFilters {
  dateRange: DateRange;
  category: string;
  status: string;
  location: string;
  search: string;
}

export type FilterKey = keyof PageFilters;

const DEFAULT_FILTERS: PageFilters = {
  dateRange: { preset: "30d" },
  category: "all",
  status: "all",
  location: "all",
  search: "",
};

interface FiltersContextValue {
  getFilters: (page: string) => PageFilters;
  setFilter: <K extends FilterKey>(page: string, key: K, value: PageFilters[K]) => void;
  resetFilters: (page: string) => void;
  hasActiveFilters: (page: string) => boolean;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filterMap, setFilterMap] = useState<Record<string, PageFilters>>({});

  const getFilters = useCallback((page: string): PageFilters => {
    return filterMap[page] ?? { ...DEFAULT_FILTERS };
  }, [filterMap]);

  const setFilter = useCallback(<K extends FilterKey>(
    page: string,
    key: K,
    value: PageFilters[K]
  ) => {
    setFilterMap(prev => ({
      ...prev,
      [page]: { ...(prev[page] ?? { ...DEFAULT_FILTERS }), [key]: value },
    }));
  }, []);

  const resetFilters = useCallback((page: string) => {
    setFilterMap(prev => ({ ...prev, [page]: { ...DEFAULT_FILTERS } }));
  }, []);

  const hasActiveFilters = useCallback((page: string): boolean => {
    const f = filterMap[page];
    if (!f) return false;
    return (
      (f.dateRange?.preset !== "30d" && f.dateRange?.preset !== undefined) ||
      f.category !== "all" ||
      f.status !== "all" ||
      f.location !== "all" ||
      f.search !== ""
    );
  }, [filterMap]);

  return (
    <FiltersContext.Provider value={{ getFilters, setFilter, resetFilters, hasActiveFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters(page: string) {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used inside FiltersProvider");

  const filters = ctx.getFilters(page);
  const setFilter = useCallback(<K extends FilterKey>(key: K, value: PageFilters[K]) => {
    ctx.setFilter(page, key, value);
  }, [ctx, page]);
  const reset = useCallback(() => ctx.resetFilters(page), [ctx, page]);
  const hasActive = ctx.hasActiveFilters(page);

  return { filters, setFilter, reset, hasActive };
}
