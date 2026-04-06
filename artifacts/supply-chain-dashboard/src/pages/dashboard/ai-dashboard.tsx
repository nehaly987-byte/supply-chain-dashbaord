import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Loader2, X, ChevronDown, RefreshCw, BookmarkPlus,
  BarChart2, TrendingUp, PieChart, AreaChart, LayoutGrid, Palette,
  Database, Tag, Trash2, Check, AlertCircle,
} from "lucide-react";
import {
  AreaChart as RechartsArea, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { PageTransition } from "@/components/PageTransition";
import { useTheme } from "@/components/theme-provider";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface ChartConfig {
  id: string;
  title: string;
  description: string;
  type: "bar" | "line" | "area" | "pie";
  xKey: string;
  dataKeys: string[];
  colors: string[];
  data: Record<string, any>[];
}

interface SchemaDomain {
  name: string;
  color: string;
  fields: string[];
}

interface SavedChart extends ChartConfig {
  savedAt: string;
  targetPage: string;
  prompt: string;
}

const PAGE_OPTIONS = [
  { value: "overview",    label: "Executive Overview" },
  { value: "inventory",  label: "Inventory" },
  { value: "logistics",  label: "Logistics" },
  { value: "orders",     label: "Orders" },
  { value: "costs",      label: "Costs & Financial" },
  { value: "forecast",   label: "Forecast" },
  { value: "production", label: "Production" },
  { value: "risks",      label: "Risk & Exceptions" },
];

const CHART_TYPES = [
  { value: "bar", label: "Bar", Icon: BarChart2 },
  { value: "line", label: "Line", Icon: TrendingUp },
  { value: "area", label: "Area", Icon: AreaChart },
  { value: "pie", label: "Pie", Icon: PieChart },
] as const;

const PROMPT_SUGGESTIONS = [
  "Show monthly revenue trend for the past year",
  "Compare inventory levels vs safety stock by category",
  "Display supplier performance scores ranking",
  "Show order fulfillment status distribution",
  "Visualize logistics cost breakdown by region",
  "Show demand vs supply forecast for next quarter",
];

const DOMAIN_COLORS: Record<string, string> = {
  indigo:  "#6366f1",
  violet:  "#8b5cf6",
  cyan:    "#06b6d4",
  emerald: "#10b981",
  amber:   "#f59e0b",
  rose:    "#ef4444",
  purple:  "#a855f7",
  orange:  "#f97316",
};

const COLOR_SWATCHES = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#14b8a6",
];

/* ─── Saved Charts storage ───────────────────────────────────────────── */
const SS_KEY = "nexus-saved-charts";
function loadSaved(): SavedChart[] {
  try { return JSON.parse(localStorage.getItem(SS_KEY) ?? "[]"); } catch { return []; }
}
function saveSaved(charts: SavedChart[]) {
  localStorage.setItem(SS_KEY, JSON.stringify(charts));
}

/* ─── API helpers ────────────────────────────────────────────────────── */
async function fetchSchema(): Promise<{ domains: SchemaDomain[] }> {
  const r = await fetch(`/api/ai/schema`);
  if (!r.ok) throw new Error("Failed to load schema");
  return r.json();
}

async function generateCharts(prompt: string): Promise<{ charts: ChartConfig[]; mock?: boolean }> {
  const r = await fetch(`/api/ai/grok`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!r.ok) throw new Error("Generation failed");
  return r.json();
}

/* ─── Chart Renderer ─────────────────────────────────────────────────── */
function ChartRenderer({ chart }: { chart: ChartConfig }) {
  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    borderColor: "hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  if (chart.type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <RechartsPie>
          <Pie
            data={chart.data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chart.data.map((_, i) => (
              <Cell key={i} fill={chart.colors[i % chart.colors.length]} />
            ))}
          </Pie>
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Legend iconType="circle" iconSize={8} />
        </RechartsPie>
      </ResponsiveContainer>
    );
  }

  const commonProps = {
    data: chart.data,
    margin: { top: 10, right: 10, left: -10, bottom: 0 },
  };

  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
      <XAxis dataKey={chart.xKey} fontSize={11} tickLine={false} axisLine={false} />
      <YAxis fontSize={11} tickLine={false} axisLine={false} width={40} />
      <RechartsTooltip contentStyle={tooltipStyle} />
      <Legend iconType="circle" iconSize={8} />
    </>
  );

  if (chart.type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart {...commonProps}>
          {axes}
          {chart.dataKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={chart.colors[i % chart.colors.length]} radius={[4, 4, 0, 0]} barSize={18} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === "line") {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart {...commonProps}>
          {axes}
          {chart.dataKeys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={chart.colors[i % chart.colors.length]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // area
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RechartsArea {...commonProps}>
        <defs>
          {chart.dataKeys.map((key, i) => (
            <linearGradient key={key} id={`grad-${chart.id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chart.colors[i % chart.colors.length]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chart.colors[i % chart.colors.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {axes}
        {chart.dataKeys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={chart.colors[i % chart.colors.length]}
            strokeWidth={2}
            fill={`url(#grad-${chart.id}-${i})`}
          />
        ))}
      </RechartsArea>
    </ResponsiveContainer>
  );
}

/* ─── Chart Preview Card ─────────────────────────────────────────────── */
function ChartPreviewCard({
  chart,
  onSave,
  onDiscard,
  onRegenerate,
  isRegenerating,
}: {
  chart: ChartConfig;
  onSave: (chart: ChartConfig, targetPage: string) => void;
  onDiscard: () => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}) {
  const [localChart, setLocalChart] = useState<ChartConfig>({ ...chart });
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [targetPage, setTargetPage] = useState("overview");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(localChart, targetPage);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      className="chart-preview-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm leading-tight">{localChart.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{localChart.description}</p>
        </div>
        <button onClick={onDiscard} className="text-muted-foreground hover:text-destructive transition-colors ml-2 flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Chart */}
      <div className="px-4 py-2">
        <ChartRenderer chart={localChart} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-3 pt-2 border-t border-border flex-wrap">
        {/* Chart type switcher */}
        <div className="flex gap-1">
          {CHART_TYPES.map(({ value, Icon }) => (
            <button
              key={value}
              onClick={() => setLocalChart(c => ({ ...c, type: value }))}
              className={`p-1.5 rounded-md transition-colors ${
                localChart.type === value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title={value}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        {/* Color picker */}
        <Popover open={customizeOpen} onOpenChange={setCustomizeOpen}>
          <PopoverTrigger asChild>
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Customize colors">
              <Palette className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-3" align="start">
            <p className="text-xs font-semibold mb-2 text-muted-foreground">Primary Color</p>
            <div className="grid grid-cols-4 gap-1.5">
              {COLOR_SWATCHES.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    const newColors = [...localChart.colors];
                    newColors[0] = color;
                    setLocalChart(c => ({ ...c, colors: newColors }));
                  }}
                  className="w-8 h-8 rounded-md border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: localChart.colors[0] === color ? "white" : "transparent",
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Regenerate */}
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          title="Regenerate"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
        </button>

        <div className="flex-1" />

        {/* Save */}
        <Select value={targetPage} onValueChange={setTargetPage}>
          <SelectTrigger className="h-7 text-xs border-border bg-muted/50 rounded-md w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_OPTIONS.map(p => (
              <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? (
            <><Check className="h-3 w-3" /> Saved</>
          ) : (
            <><BookmarkPlus className="h-3 w-3" /> Save</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Saved Chart Mini Card ──────────────────────────────────────────── */
function SavedChartCard({ chart, onDelete }: { chart: SavedChart; onDelete: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="chart-preview-card group"
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate">{chart.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
              {chart.targetPage}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {new Date(chart.savedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-2 pointer-events-none">
        <ChartRenderer chart={chart} />
      </div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function AIDashboard() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [schema, setSchema] = useState<SchemaDomain[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>(loadSaved);
  const [isMock, setIsMock] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchSchema()
      .then(d => setSchema(d.domains ?? []))
      .catch(() => {})
      .finally(() => setSchemaLoading(false));
  }, []);

  const handleGenerate = useCallback(async (overridePrompt?: string) => {
    const p = overridePrompt ?? prompt;
    if (!p.trim()) return;
    setLoading(true);
    setError(null);
    setCharts([]);
    try {
      const result = await generateCharts(p.trim());
      setCharts(result.charts ?? []);
      setIsMock(!!result.mock);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const handleSaveChart = (chart: ChartConfig, targetPage: string) => {
    const sc: SavedChart = {
      ...chart,
      savedAt: new Date().toISOString(),
      targetPage,
      prompt,
    };
    const updated = [sc, ...savedCharts];
    setSavedCharts(updated);
    saveSaved(updated);
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedCharts.filter(c => c.id !== id);
    setSavedCharts(updated);
    saveSaved(updated);
  };

  const handleDiscardChart = (id: string) => {
    setCharts(cs => cs.filter(c => c.id !== id));
  };

  const handleFieldClick = (field: string) => {
    setPrompt(prev => prev ? `${prev}, ${field}` : `Show ${field} trend`);
    textareaRef.current?.focus();
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-8 max-w-6xl">

        {/* ── Header ── */}
        <div className="flex flex-col gap-1 page-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-accent flex items-center justify-center shadow-lg dark:glow-ai flex-shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1>AI Dashboard</h1>
              <p className="text-sm text-muted-foreground -mt-1">
                Describe any insight in plain language — get beautiful charts instantly
              </p>
            </div>
          </div>
        </div>

        {/* ── Schema Explorer ── */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Schema Explorer</h2>
            <span className="text-xs text-muted-foreground ml-1">Click any field to add it to your prompt</span>
          </div>

          {schemaLoading ? (
            <div className="flex gap-2 flex-wrap">
              {Array(20).fill(0).map((_, i) => (
                <div key={i} className="h-6 rounded-full bg-muted shimmer" style={{ width: `${60 + (i % 5) * 20}px` }} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {schema.map(domain => (
                <div key={domain.name}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: DOMAIN_COLORS[domain.color] ?? "#6366f1" }}
                    />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {domain.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {domain.fields.map(field => (
                      <button
                        key={field}
                        onClick={() => handleFieldClick(field)}
                        className="schema-chip"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {field}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Prompt Area ── */}
        <div className="flex flex-col gap-3">
          <div className="ai-prompt-ring dark:glow-ai">
            <div className="ai-prompt-inner">
              <textarea
                ref={textareaRef}
                id="ai-prompt-input"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
                }}
                placeholder="e.g. &quot;Show monthly revenue trend for the past year&quot; or &quot;Compare supplier scores by country&quot;..."
                rows={3}
                className="ai-prompt-textarea"
              />
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Press <kbd className="px-1 border border-border rounded text-[10px] font-mono">Ctrl</kbd>+<kbd className="px-1 border border-border rounded text-[10px] font-mono">Enter</kbd> to generate
                </span>
                <Button
                  onClick={() => handleGenerate()}
                  disabled={!prompt.trim() || loading}
                  className="gap-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-lg"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate Charts</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Prompt suggestions */}
          <div className="flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => {
                  setPrompt(s);
                  handleGenerate(s);
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-muted-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading skeleton ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="chart-preview-card p-4">
                  <div className="h-4 w-32 bg-muted shimmer rounded mb-2" />
                  <div className="h-3 w-48 bg-muted shimmer rounded mb-4" />
                  <div className="h-[240px] bg-muted shimmer rounded" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Generated Charts ── */}
        <AnimatePresence>
          {charts.length > 0 && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-base font-semibold">Generated Visualizations</h2>
                {isMock && (
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                    Demo Mode · Add GROK_API_KEY for real AI
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1.5 text-xs"
                  onClick={() => setCharts([])}
                >
                  <X className="h-3.5 w-3.5" /> Clear all
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {charts.map(chart => (
                    <ChartPreviewCard
                      key={chart.id}
                      chart={chart}
                      onSave={handleSaveChart}
                      onDiscard={() => handleDiscardChart(chart.id)}
                      onRegenerate={() => handleGenerate()}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Saved Charts ── */}
        {savedCharts.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold">Saved Charts Gallery</h2>
              <Badge variant="outline" className="text-xs">{savedCharts.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {savedCharts.map(chart => (
                  <SavedChartCard
                    key={`${chart.id}-${chart.savedAt}`}
                    chart={chart}
                    onDelete={() => handleDeleteSaved(chart.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty state (no generated, no saved) */}
        {charts.length === 0 && savedCharts.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Visualize</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Type a natural language question above or click a suggestion to generate interactive charts from your supply chain data.
            </p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
