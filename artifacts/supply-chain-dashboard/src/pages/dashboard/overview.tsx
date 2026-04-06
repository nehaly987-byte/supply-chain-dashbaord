import { useGetKpis, getGetKpisQueryKey, useGetDemandSupply, getGetDemandSupplyQueryKey, useGetMonthlyPerformance, getGetMonthlyPerformanceQueryKey } from "@workspace/api-client-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { RealTimeCounter } from "@/components/AnimatedCounter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, Package, Truck, Activity, DollarSign, AlertTriangle, ShoppingCart, Clock } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { useSettings } from "@/contexts/SettingsContext";
import { FilterBar } from "@/components/filters/FilterBar";
import { useFilters } from "@/contexts/FiltersContext";

const PAGE = "overview";

export default function ExecutiveOverview() {
  const { filters } = useFilters(PAGE);
  const period = filters.dateRange?.preset === "7d" ? "7d"
              : filters.dateRange?.preset === "90d" ? "90d"
              : filters.dateRange?.preset === "1y"  ? "1y"
              : "30d";

  const { data: kpiData, isLoading: kpiLoading } = useGetKpis({ query: { queryKey: getGetKpisQueryKey() } });
  const { data: demandSupply, isLoading: dsLoading } = useGetDemandSupply({ period }, { query: { queryKey: getGetDemandSupplyQueryKey({ period }) } });
  const { data: performance, isLoading: perfLoading } = useGetMonthlyPerformance({ query: { queryKey: getGetMonthlyPerformanceQueryKey() } });
  const { settings } = useSettings();

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(val);
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);

  const allKpiCards = [
    { title: "Total Inventory Value", value: kpiData?.inventoryValue,    change: kpiData?.inventoryValueChange,    icon: Package,           format: formatCurrency,                         invertTrend: false },
    { title: "Revenue at Risk",       value: kpiData?.revenueAtRisk,     change: kpiData?.revenueAtRiskChange,     icon: AlertTriangleIcon, format: formatCurrency,                         invertTrend: true  },
    { title: "On-Time Delivery",      value: kpiData?.onTimeDelivery,    change: kpiData?.onTimeDeliveryChange,    icon: Truck,             format: formatPercent,                          invertTrend: false },
    { title: "Supplier Score",        value: kpiData?.supplierScore,     change: kpiData?.supplierScoreChange,     icon: Activity,          format: (v: number) => `${v.toFixed(1)} / 100`, invertTrend: false },
    { title: "Total Orders",          value: kpiData?.totalOrders,       change: kpiData?.totalOrdersChange,       icon: ShoppingCart,      format: formatNumber,                           invertTrend: false },
    { title: "Active Shipments",      value: kpiData?.activeShipments,   change: kpiData?.activeShipmentsChange,  icon: Truck,             format: formatNumber,                           invertTrend: false },
    { title: "Fill Rate",             value: (kpiData as any)?.fillRate,        change: (kpiData as any)?.fillRateChange,       icon: DollarSign,        format: formatPercent,                          invertTrend: false },
    { title: "Avg Cycle Time (days)", value: (kpiData as any)?.cycleTime,       change: (kpiData as any)?.cycleTimeChange,      icon: Clock,             format: (v: number) => `${v.toFixed(1)}d`,      invertTrend: true  },
  ];

  const visibleCards = allKpiCards.slice(0, parseInt(settings.kpiCount, 10));
  const cols = visibleCards.length <= 4 ? "lg:grid-cols-4" : visibleCards.length <= 6 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="page-header">
          <h1>Executive Overview</h1>
          <p className="text-sm text-muted-foreground">Real-time supply chain command center.</p>
        </div>

        <FilterBar config={{
          page: PAGE,
          show: { search: true, dateRange: true },
        }} />

        <StaggerContainer className={`grid grid-cols-1 md:grid-cols-2 ${cols} gap-4`}>
          {visibleCards.map((card) => (
            <KpiCard
              key={card.title}
              title={card.title}
              value={card.value}
              change={card.change}
              icon={card.icon}
              format={card.format}
              loading={kpiLoading}
              invertTrend={card.invertTrend}
            />
          ))}
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle>Demand vs. Supply Forecast</CardTitle>
              <CardDescription>{period === "7d" ? "7-day" : period === "90d" ? "90-day" : period === "1y" ? "12-month" : "30-day"} projection with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              {dsLoading ? (
                <Skeleton className="w-full h-[300px]" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={demandSupply?.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
                      <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(val) => formatNumber(val)} fontSize={11} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '10px', fontSize: '12px' }}
                      />
                      <Legend iconType="circle" iconSize={8} />
                      <Area type="monotone" dataKey="demand" name="Demand" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" />
                      <Area type="monotone" dataKey="supply" name="Supply" stroke="hsl(var(--accent))" strokeWidth={2} fillOpacity={1} fill="url(#colorSupply)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
              <CardDescription>Monthly Revenue vs Cost</CardDescription>
            </CardHeader>
            <CardContent>
              {perfLoading ? (
                <Skeleton className="w-full h-[300px]" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performance?.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
                      <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(val) => `$${formatNumber(val)}`} fontSize={11} tickLine={false} axisLine={false} width={40} />
                      <RechartsTooltip
                        cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '10px', fontSize: '12px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend iconType="circle" iconSize={8} />
                      <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cost" name="Cost" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

function AlertTriangleIcon(props: any) {
  return <AlertTriangle {...props} />;
}

interface KpiCardProps {
  title: string;
  value?: number;
  change?: number;
  icon: any;
  format: (v: number) => string;
  loading: boolean;
  invertTrend?: boolean;
}

function KpiCard({ title, value, change, icon: Icon, format, loading, invertTrend }: KpiCardProps) {
  if (loading || value === undefined || change === undefined) {
    return (
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium"><Skeleton className="h-4 w-24" /></CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change > 0;
  const isGood = invertTrend ? !isPositive : isPositive;

  return (
    <StaggerItem>
      <Card className="glass-card group">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            <RealTimeCounter value={value} format={format} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <span className={`flex items-center font-medium mr-1 ${isGood ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
              {Math.abs(change)}%
            </span>
            from last period
          </p>
        </CardContent>
      </Card>
    </StaggerItem>
  );
}
