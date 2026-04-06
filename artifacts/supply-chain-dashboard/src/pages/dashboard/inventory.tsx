import { useState } from "react";
import {
  useGetInventory, getGetInventoryQueryKey,
  useGetStockLevels, getGetStockLevelsQueryKey,
  useGetInventoryAging, getGetInventoryAgingQueryKey,
  useGetInventoryAlerts, getGetInventoryAlertsQueryKey
} from "@workspace/api-client-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, TrendingDown, PackageMinus, Info } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import { FilterBar } from "@/components/filters/FilterBar";
import { useFilters } from "@/contexts/FiltersContext";

const PAGE = "inventory";
const CATEGORIES = ["Electronics", "Raw Materials", "Finished Goods", "Packaging", "Chemicals", "Machinery Parts"];
const WAREHOUSES = ["WH-North", "WH-South", "WH-East", "WH-West", "WH-Central"];
const STATUSES = [
  { value: "normal",    label: "Normal" },
  { value: "low_stock", label: "Low Stock" },
  { value: "critical",  label: "Critical" },
  { value: "overstock", label: "Overstock" },
];

export default function InventoryDashboard() {
  const { filters } = useFilters(PAGE);

  const apiWarehouse = filters.location !== "all" ? filters.location : undefined;
  const apiCategory  = filters.category !== "all" ? filters.category : undefined;

  const { data: alertsData, isLoading: alertsLoading } = useGetInventoryAlerts({ query: { queryKey: getGetInventoryAlertsQueryKey() } });
  const { data: inventoryData, isLoading: inventoryLoading } = useGetInventory(
    { warehouse: apiWarehouse, limit: 10 },
    { query: { queryKey: getGetInventoryQueryKey({ warehouse: apiWarehouse, limit: 10 }) } }
  );
  const { data: stockData, isLoading: stockLoading } = useGetStockLevels({ query: { queryKey: getGetStockLevelsQueryKey() } });
  const { data: agingData, isLoading: agingLoading } = useGetInventoryAging({ query: { queryKey: getGetInventoryAgingQueryKey() } });

  const criticalAlerts = alertsData?.alerts.filter(a => a.type === "critical") || [];

  // Client-side filter by search + status
  const filteredItems = (inventoryData?.items ?? []).filter(item => {
    const matchSearch = !filters.search ||
      item.sku.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.status === "all" || item.status === filters.status;
    return matchSearch && matchStatus;
  });

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="page-header">
          <h1>Inventory Intelligence</h1>
          <p className="text-sm text-muted-foreground">Multi-echelon stock visibility and smart alerts.</p>
        </div>

        <FilterBar config={{
          page: PAGE,
          show: { search: true, dateRange: true, category: true, status: true, location: true },
          options: { categories: CATEGORIES, statuses: STATUSES, locations: WAREHOUSES },
        }} />

        {/* Smart Alerts Banner */}
        {criticalAlerts.length > 0 && (
          <StaggerItem>
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-4 shadow-sm glow-destructive relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-destructive pulse-critical" />
              <div className="bg-destructive/20 p-2 rounded-full mt-0.5">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-destructive font-semibold flex items-center gap-2">
                  Action Required: {criticalAlerts.length} Critical Stock Alert{criticalAlerts.length > 1 ? "s" : ""}
                </h3>
                <p className="text-sm text-foreground/80 mt-1">
                  SKUs {criticalAlerts.map(a => a.sku).join(', ')} are below minimum safety stock levels.
                </p>
              </div>
            </div>
          </StaggerItem>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle>Stock Levels by Category</CardTitle>
              <CardDescription>Current vs Target vs Minimum thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              {stockLoading ? (
                <Skeleton className="w-full h-[300px]" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockData?.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '10px', fontSize: '12px' }}
                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      />
                      <Legend iconType="circle" iconSize={8} />
                      <Bar dataKey="current" name="Current Stock" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} barSize={18} />
                      <Bar dataKey="target"  name="Target Level" fill="hsl(var(--muted-foreground)/0.3)" radius={[3, 3, 0, 0]} barSize={18} />
                      <Bar dataKey="minimum" name="Min Safety"   fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>AI-detected anomalies</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0 h-[300px] overflow-y-auto">
                {alertsLoading ? (
                  Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2 mx-4" />)
                ) : alertsData?.alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                    <Info className="h-8 w-8 mb-2 opacity-50" />
                    <p>No active inventory alerts.</p>
                    <p className="text-xs mt-1">Stock levels are optimal.</p>
                  </div>
                ) : (
                  alertsData?.alerts.map((alert) => (
                    <div key={alert.id} className="p-4 border-b border-border hover:bg-muted/30 transition-colors flex items-start gap-3">
                      <div className="mt-0.5">
                        {alert.type === 'critical'  ? <AlertTriangle className="h-4 w-4 text-destructive" /> :
                         alert.type === 'low_stock' ? <TrendingDown className="h-4 w-4 text-orange-500" /> :
                         <PackageMinus className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{alert.sku}</span>
                          <Badge variant="outline" className={
                            alert.type === 'critical'  ? 'badge-critical' :
                            alert.type === 'low_stock' ? 'badge-low' :
                            'badge-overstock'
                          }>
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{alert.name}</p>
                        <div className="flex text-xs mt-2 font-medium bg-background/50 rounded px-2 py-1 w-fit font-mono">
                          {alert.currentLevel} / {alert.threshold} in {alert.warehouse}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SKU table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>SKU Management</CardTitle>
            <CardDescription>
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              {filters.location !== "all" ? ` · ${filters.location}` : ""}
              {filters.category !== "all" ? ` · ${filters.category}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <Skeleton className="w-full h-64" />
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Reorder Pt.</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium font-mono text-xs">{item.sku}</TableCell>
                        <TableCell className="text-sm">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{item.warehouse}</TableCell>
                        <TableCell className="text-right font-medium">{new Intl.NumberFormat().format(item.quantity)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{new Intl.NumberFormat().format(item.reorderPoint)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            item.status === 'normal'    ? 'badge-normal' :
                            item.status === 'low_stock' ? 'badge-low' :
                            item.status === 'overstock' ? 'badge-overstock' :
                            'badge-critical'
                          }>
                            {item.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                          No items match the active filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
