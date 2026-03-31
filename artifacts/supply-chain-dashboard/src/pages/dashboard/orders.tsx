import { useState } from "react";
import { 
  useGetOrders, getGetOrdersQueryKey,
  useGetFulfillmentMetrics, getGetFulfillmentMetricsQueryKey,
  useGetReturnsAnalytics, getGetReturnsAnalyticsQueryKey
} from "@workspace/api-client-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import { Search, PackageCheck, AlertCircle, RotateCcw, PackageX } from "lucide-react";

export default function OrdersDashboard() {
  const [status, setStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: ordersData, isLoading: ordersLoading } = useGetOrders(
    { status: status === "all" ? undefined : status, limit: 15 },
    { query: { queryKey: getGetOrdersQueryKey({ status: status === "all" ? undefined : status, limit: 15 }) } }
  );
  
  const { data: metricsData, isLoading: metricsLoading } = useGetFulfillmentMetrics({ query: { queryKey: getGetFulfillmentMetricsQueryKey() } });
  const { data: returnsData, isLoading: returnsLoading } = useGetReturnsAnalytics({ query: { queryKey: getGetReturnsAnalyticsQueryKey() } });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'delivered': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Delivered</Badge>;
      case 'shipped': return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Shipped</Badge>;
      case 'processing': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Processing</Badge>;
      case 'pending': return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Pending</Badge>;
      case 'cancelled': return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Cancelled</Badge>;
      case 'returned': return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Returned</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'urgent') return <span className="flex items-center text-xs text-destructive font-medium"><AlertCircle className="w-3 h-3 mr-1" /> Urgent</span>;
    if (priority === 'express') return <span className="text-xs text-primary font-medium">Express</span>;
    return <span className="text-xs text-muted-foreground">Standard</span>;
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const filteredOrders = ordersData?.orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground mt-1">Lifecycle tracking and fulfillment performance.</p>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fulfillment Rate</p>
                    {metricsLoading ? <Skeleton className="h-8 w-20 mt-2" /> : <h3 className="text-3xl font-bold mt-1">{metricsData?.fulfillmentRate}%</h3>}
                  </div>
                  <div className="p-3 rounded-full bg-primary/10 text-primary"><PackageCheck className="h-5 w-5" /></div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">On-Time Shipment</p>
                    {metricsLoading ? <Skeleton className="h-8 w-20 mt-2" /> : <h3 className="text-3xl font-bold mt-1">{metricsData?.onTimeShipmentRate}%</h3>}
                  </div>
                  <div className="p-3 rounded-full bg-green-500/10 text-green-500"><PackageCheck className="h-5 w-5" /></div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Backorder Rate</p>
                    {metricsLoading ? <Skeleton className="h-8 w-20 mt-2" /> : <h3 className="text-3xl font-bold mt-1">{metricsData?.backorderRate}%</h3>}
                  </div>
                  <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500"><PackageX className="h-5 w-5" /></div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Return Rate</p>
                    {metricsLoading ? <Skeleton className="h-8 w-20 mt-2" /> : <h3 className="text-3xl font-bold mt-1 text-destructive">{metricsData?.returnRate}%</h3>}
                  </div>
                  <div className="p-3 rounded-full bg-destructive/10 text-destructive"><RotateCcw className="h-5 w-5" /></div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Order Log</CardTitle>
                <CardDescription>Recent transactions and status</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search orders..." 
                    className="pl-9 bg-background/50 border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[130px] bg-background/50 border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="w-full h-80" />
              ) : (
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders?.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/30 cursor-pointer">
                          <TableCell className="font-medium font-mono text-xs">
                            {order.orderNumber}
                            <div className="mt-1">{getPriorityBadge(order.priority)}</div>
                          </TableCell>
                          <TableCell>
                            {order.customer}
                            <div className="text-[10px] text-muted-foreground mt-1">{order.region}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(order.value)}</TableCell>
                        </TableRow>
                      ))}
                      {filteredOrders?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No orders found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Returns & Exceptions</CardTitle>
              <CardDescription>Monthly trend of order issues</CardDescription>
            </CardHeader>
            <CardContent>
              {returnsLoading ? (
                <Skeleton className="w-full h-[300px]" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={returnsData?.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      />
                      <Legend />
                      <Bar dataKey="returns" name="Returns" stackId="a" fill="hsl(var(--orange-500))" />
                      <Bar dataKey="backorders" name="Backorders" stackId="a" fill="hsl(var(--yellow-500))" />
                      <Bar dataKey="cancellations" name="Cancellations" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
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
