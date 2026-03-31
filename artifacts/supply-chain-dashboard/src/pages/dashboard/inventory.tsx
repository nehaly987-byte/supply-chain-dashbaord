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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, TrendingDown, PackageMinus, Info } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell
} from "recharts";

export default function InventoryDashboard() {
  const [warehouse, setWarehouse] = useState<string>("all");
  
  const { data: alertsData, isLoading: alertsLoading } = useGetInventoryAlerts({ query: { queryKey: getGetInventoryAlertsQueryKey() } });
  
  // Use "all" as undefined for API
  const apiWarehouse = warehouse === "all" ? undefined : warehouse;
  const { data: inventoryData, isLoading: inventoryLoading } = useGetInventory(
    { warehouse: apiWarehouse, limit: 10 }, 
    { query: { queryKey: getGetInventoryQueryKey({ warehouse: apiWarehouse, limit: 10 }) } }
  );
  
  const { data: stockData, isLoading: stockLoading } = useGetStockLevels({ query: { queryKey: getGetStockLevelsQueryKey() } });
  const { data: agingData, isLoading: agingLoading } = useGetInventoryAging({ query: { queryKey: getGetInventoryAgingQueryKey() } });

  const criticalAlerts = alertsData?.alerts.filter(a => a.type === "critical") || [];
  
  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Intelligence</h1>
            <p className="text-muted-foreground mt-1">Multi-echelon stock visibility and smart alerts.</p>
          </div>
          
          <div className="flex gap-2">
            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger className="w-[180px] bg-card border-border">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                <SelectItem value="WH-North">WH-North (Chicago)</SelectItem>
                <SelectItem value="WH-South">WH-South (Dallas)</SelectItem>
                <SelectItem value="WH-West">WH-West (Phoenix)</SelectItem>
                <SelectItem value="WH-East">WH-East (Newark)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Smart Alerts Banner */}
        {criticalAlerts.length > 0 && (
          <StaggerItem>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-4 shadow-sm glow-destructive relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-destructive pulse-critical" />
              <div className="bg-destructive/20 p-2 rounded-full mt-0.5">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-destructive font-semibold flex items-center gap-2">
                  Action Required: {criticalAlerts.length} Critical Stock Alerts
                </h3>
                <p className="text-sm text-foreground/80 mt-1">
                  SKUs {criticalAlerts.map(a => a.sku).join(', ')} are below minimum safety stock levels and risk causing production downtime.
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
                      <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      />
                      <Legend />
                      <Bar dataKey="current" name="Current Stock" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} barSize={20} />
                      <Bar dataKey="target" name="Target Level" fill="hsl(var(--muted-foreground)/0.3)" radius={[2, 2, 0, 0]} barSize={20} />
                      <Bar dataKey="minimum" name="Min Safety Stock" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} barSize={20} />
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
                        {alert.type === 'critical' ? <AlertTriangle className="h-4 w-4 text-destructive" /> :
                         alert.type === 'low_stock' ? <TrendingDown className="h-4 w-4 text-orange-500" /> :
                         <PackageMinus className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{alert.sku}</span>
                          <Badge variant="outline" className={
                            alert.type === 'critical' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                            alert.type === 'low_stock' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                            'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                          }>
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{alert.name}</p>
                        <div className="flex text-xs mt-2 font-medium bg-background/50 rounded px-2 py-1 w-fit">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 glass-card">
            <CardHeader>
              <CardTitle>Inventory Aging</CardTitle>
              <CardDescription>Stock duration breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {agingLoading ? (
                <Skeleton className="w-full h-[250px]" />
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agingData?.data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                      <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} fontSize={12} width={80} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      />
                      <Legend />
                      <Bar dataKey="age0to30" name="0-30 Days" stackId="a" fill="hsl(var(--green-500))" barSize={16} />
                      <Bar dataKey="age31to60" name="31-60 Days" stackId="a" fill="hsl(var(--yellow-500))" />
                      <Bar dataKey="age61to90" name="61-90 Days" stackId="a" fill="hsl(var(--orange-500))" />
                      <Bar dataKey="age90plus" name="90+ Days" stackId="a" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle>SKU Management</CardTitle>
              <CardDescription>Current stock positions by location</CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <Skeleton className="w-full h-64" />
              ) : (
                <div className="rounded-md border border-border">
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
                      {inventoryData?.items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium font-mono text-xs">{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-muted-foreground">{item.warehouse}</TableCell>
                          <TableCell className="text-right font-medium">
                            {new Intl.NumberFormat().format(item.quantity)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {new Intl.NumberFormat().format(item.reorderPoint)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              item.status === 'normal' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              item.status === 'low_stock' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                              item.status === 'overstock' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                              'bg-destructive/20 text-destructive border-destructive/30'
                            }>
                              {item.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
