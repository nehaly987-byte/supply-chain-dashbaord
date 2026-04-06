import { 
  useGetCostBreakdown, getGetCostBreakdownQueryKey,
  useGetCostTrends, getGetCostTrendsQueryKey,
  useGetCostKpis, getGetCostKpisQueryKey
} from "@workspace/api-client-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { FilterBar } from "@/components/filters/FilterBar";
import { useFilters } from "@/contexts/FiltersContext";

const PAGE = "costs";
const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function CostsDashboard() {
  const { filters } = useFilters(PAGE);
  const period = (filters.dateRange?.preset === "7d" || filters.dateRange?.preset === "30d" ? "3m"
               : filters.dateRange?.preset === "90d" ? "6m"
               : "1y") as "3m" | "6m" | "1y";
  
  const { data: breakdownData, isLoading: breakdownLoading } = useGetCostBreakdown({ query: { queryKey: getGetCostBreakdownQueryKey() } });
  const { data: trendsData, isLoading: trendsLoading } = useGetCostTrends(
    { period },
    { query: { queryKey: getGetCostTrendsQueryKey({ period }) } }
  );
  const { data: kpisData, isLoading: kpisLoading } = useGetCostKpis({ query: { queryKey: getGetCostKpisQueryKey() } });

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val);

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="page-header">
          <h1>Cost &amp; Financial</h1>
          <p className="text-sm text-muted-foreground">Spend analysis and efficiency metrics.</p>
        </div>

        <FilterBar config={{
          page: PAGE,
          show: { search: false, dateRange: true },
        }} />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpisLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="glass-card"><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : (
            kpisData?.kpis.map((kpi) => {
              const isPositiveTrend = kpi.trend === 'up'; // For costs, up is usually bad, but depends on metric
              const isGood = (kpi.name.includes("Savings") || kpi.name.includes("Margin")) ? isPositiveTrend : !isPositiveTrend;
              
              return (
                <StaggerItem key={kpi.name}>
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{kpi.name}</p>
                      <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-bold">
                          {kpi.unit === '$' ? formatCurrency(kpi.value) : `${kpi.value}${kpi.unit}`}
                        </h3>
                        <div className={`flex items-center text-sm font-medium ${isGood ? 'text-green-500' : 'text-destructive'}`}>
                          {isPositiveTrend ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                          {Math.abs(kpi.variance)}%
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">vs Target: {kpi.unit === '$' ? formatCurrency(kpi.target) : `${kpi.target}${kpi.unit}`}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })
          )}
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle>Operating Cost Trends</CardTitle>
              <CardDescription>Historical spend by category</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <Skeleton className="w-full h-[350px]" />
              ) : (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsData?.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={formatCurrency} fontSize={12} tickLine={false} axisLine={false} width={50} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="procurement" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                      <Area type="monotone" dataKey="manufacturing" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />
                      <Area type="monotone" dataKey="logistics" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} />
                      <Area type="monotone" dataKey="overhead" stackId="1" stroke={COLORS[3]} fill={COLORS[3]} fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>Current period distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {breakdownLoading ? (
                <Skeleton className="w-full h-[350px]" />
              ) : (
                <div className="flex flex-col items-center justify-center h-[350px]">
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdownData?.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {breakdownData?.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full mt-4 space-y-2">
                    {breakdownData?.data.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-medium">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
