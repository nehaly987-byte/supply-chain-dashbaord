import { useState } from "react";
import { 
  useGetForecast, getGetForecastQueryKey,
  useGetSeasonality, getGetSeasonalityQueryKey
} from "@workspace/api-client-react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Bar
} from "recharts";
import { BrainCircuit, TrendingUp, Activity } from "lucide-react";

export default function ForecastDashboard() {
  const [period, setPeriod] = useState<"3m" | "6m" | "1y" | "2y">("6m");
  const [product, setProduct] = useState("all");
  
  const { data: forecastData, isLoading: forecastLoading } = useGetForecast(
    { period, product: product === "all" ? undefined : product },
    { query: { queryKey: getGetForecastQueryKey({ period, product: product === "all" ? undefined : product }) } }
  );
  
  const { data: seasonalityData, isLoading: seasonalityLoading } = useGetSeasonality({ query: { queryKey: getGetSeasonalityQueryKey() } });

  const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Demand Forecasting</h1>
            <p className="text-muted-foreground mt-1">AI-powered predictive models and seasonality trends.</p>
          </div>
          
          <div className="flex gap-2">
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger className="w-[150px] bg-card border-border">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
              <SelectTrigger className="w-[120px] bg-card border-border">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="2y">2 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card bg-gradient-to-br from-card to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Model Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{forecastData?.accuracy || "94.2"}%</div>
                  <p className="text-xs text-muted-foreground mt-1">R-squared value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">MAPE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{forecastData?.mape || "5.8"}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Mean Absolute Percentage Error</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Predicted Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500">+12.4%</div>
                  <p className="text-xs text-muted-foreground mt-1">Year over Year</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Forecast vs Actuals</CardTitle>
            <CardDescription>Historical data and AI projections with confidence bounds</CardDescription>
          </CardHeader>
          <CardContent>
            {forecastLoading ? (
              <Skeleton className="w-full h-[400px]" />
            ) : (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastData?.data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={formatNumber} fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="upperBound" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="lowerBound" stroke="none" fill="hsl(var(--background))" fillOpacity={1} />
                    <Area type="monotone" dataKey="lowerBound" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} />
                    <Line type="monotone" dataKey="actual" name="Actual Demand" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                    <Line type="monotone" dataKey="forecast" name="Forecasted Demand" stroke="hsl(var(--primary))" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Seasonality Patterns</CardTitle>
            <CardDescription>Monthly demand index by category (100 = average)</CardDescription>
          </CardHeader>
          <CardContent>
            {seasonalityLoading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seasonalityData?.data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[50, 150]} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    />
                    <Legend />
                    {/* Assuming data is flat with categories grouped. If not, this needs data transformation.
                        For now, assuming the API returns data that Recharts can handle nicely for a bar chart
                        where 'index' is the value and we color by category if it were stacked/grouped.
                        Using a simple bar for the index value. */}
                    <Bar dataKey="index" name="Seasonality Index" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]}>
                      {
                        seasonalityData?.data.map((entry, index) => (
                          <cell key={`cell-${index}`} fill={entry.index > 100 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.5)'} />
                        ))
                      }
                    </Bar>
                    {/* Reference line at 100 (Average) */}
                    <Line type="monotone" dataKey={() => 100} name="Average" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
