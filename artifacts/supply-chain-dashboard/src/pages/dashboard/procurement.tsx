import { useState } from "react";
import { 
  useGetSuppliers, getGetSuppliersQueryKey,
  useGetLeadTimeTrend, getGetLeadTimeTrendQueryKey
} from "@workspace/api-client-react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import { Award, Clock, DollarSign, Search, ShieldCheck, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProcurementDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: suppliersData, isLoading: suppLoading } = useGetSuppliers(
    { limit: 20 },
    { query: { queryKey: getGetSuppliersQueryKey({ limit: 20 }) } }
  );
  
  const { data: leadTimeData, isLoading: leadLoading } = useGetLeadTimeTrend({ query: { queryKey: getGetLeadTimeTrendQueryKey() } });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500 font-semibold";
    if (score >= 75) return "text-primary";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive font-semibold";
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'preferred': return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20"><ShieldCheck className="w-3 h-3 mr-1" /> Preferred</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'under_review': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Under Review</Badge>;
      case 'suspended': return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><ShieldAlert className="w-3 h-3 mr-1" /> Suspended</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSuppliers = suppliersData?.suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement & Suppliers</h1>
          <p className="text-muted-foreground mt-1">Supplier performance, spend analysis, and compliance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle>Average Lead Time Trend</CardTitle>
              <CardDescription>Historical performance vs Target</CardDescription>
            </CardHeader>
            <CardContent>
              {leadLoading ? (
                <Skeleton className="w-full h-[300px]" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadTimeData?.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}d`} width={40} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        formatter={(value: number) => [`${value} days`]}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="avgLeadTime" name="Market Avg" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="monotone" dataKey="targetLeadTime" name="Target" stroke="hsl(var(--green-500))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="supplierA" name="Top Tier Suppliers" stroke="hsl(var(--primary))" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card flex flex-col justify-between bg-gradient-to-b from-card to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Supplier Scorecard Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Quality Score</p>
                  <p className="text-3xl font-bold">92.4 <span className="text-sm font-normal text-muted-foreground">/ 100</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">On-Time Delivery Rate</p>
                  <p className="text-3xl font-bold">88.7%</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price Variance vs Target</p>
                  <p className="text-3xl font-bold">+2.1%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Supplier Directory</CardTitle>
              <CardDescription>Assess and manage vendor relationships</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search suppliers..." 
                className="pl-9 bg-background/50 border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {suppLoading ? (
              <Skeleton className="w-full h-96" />
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Lead Time</TableHead>
                      <TableHead className="text-right">Quality</TableHead>
                      <TableHead className="text-right">Overall Score</TableHead>
                      <TableHead className="text-right">Active Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers?.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-muted/30 cursor-pointer transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {supplier.name.substring(0,2).toUpperCase()}
                            </div>
                            {supplier.name}
                            <span className="text-[10px] text-muted-foreground ml-1 border px-1 rounded">{supplier.country}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{supplier.category}</TableCell>
                        <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                        <TableCell className="text-right">{supplier.leadTimeDays} days</TableCell>
                        <TableCell className="text-right">{supplier.qualityScore}/100</TableCell>
                        <TableCell className="text-right">
                          <span className={getScoreColor(supplier.overallScore)}>
                            {supplier.overallScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{supplier.activeOrders}</TableCell>
                      </TableRow>
                    ))}
                    {filteredSuppliers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No suppliers found matching "{searchTerm}"
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
