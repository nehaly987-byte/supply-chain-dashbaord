import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ChartTheme = "indigo" | "emerald" | "violet" | "amber";

const CHART_PALETTES: Record<ChartTheme, { primary: string; accent: string }> = {
  indigo:  { primary: "238 65% 59%", accent: "188 94% 43%" },
  emerald: { primary: "160 84% 39%", accent: "173 80% 40%" },
  violet:  { primary: "270 76% 63%", accent: "322 65% 55%" },
  amber:   { primary: "38 92% 50%",  accent: "25 95% 53%"  },
};

export interface AppSettings {
  name: string;
  email: string;
  role: string;
  timezone: string;
  density: "compact" | "comfortable" | "spacious";
  chartTheme: ChartTheme;
  animationsEnabled: boolean;
  sidebarCollapsed: boolean;
  criticalAlerts: boolean;
  shipmentUpdates: boolean;
  inventoryWarnings: boolean;
  weeklyReport: boolean;
  emailDigest: boolean;
  smsAlerts: boolean;
  refreshInterval: string;
  historicalRange: string;
  cacheEnabled: boolean;
  autoExport: boolean;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  regionalTimezone: string;
  defaultPage: string;
  kpiCount: "4" | "6" | "8";
  chartAnimations: boolean;
  compactMode: boolean;
}

const DEFAULTS: AppSettings = {
  name: "Alex Mercer",
  email: "alex.mercer@nexuschain.io",
  role: "Supply Chain Manager",
  timezone: "UTC-5",
  density: "comfortable",
  chartTheme: "indigo",
  animationsEnabled: true,
  sidebarCollapsed: false,
  criticalAlerts: true,
  shipmentUpdates: true,
  inventoryWarnings: true,
  weeklyReport: true,
  emailDigest: false,
  smsAlerts: false,
  refreshInterval: "30",
  historicalRange: "12m",
  cacheEnabled: true,
  autoExport: false,
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  numberFormat: "1,000.00",
  regionalTimezone: "America/New_York",
  defaultPage: "/",
  kpiCount: "6",
  chartAnimations: true,
  compactMode: false,
};

interface SettingsContextValue {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  updateMany: (patch: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem("nexus-settings");
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

function applyChartTheme(theme: ChartTheme) {
  const palette = CHART_PALETTES[theme];
  document.documentElement.style.setProperty("--primary", palette.primary);
  document.documentElement.style.setProperty("--accent", palette.accent);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    applyChartTheme(settings.chartTheme);
  }, [settings.chartTheme]);

  useEffect(() => {
    try { localStorage.setItem("nexus-settings", JSON.stringify(settings)); } catch {}
  }, [settings]);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function updateMany(patch: Partial<AppSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
  }

  return (
    <SettingsContext.Provider value={{ settings, update, updateMany }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
