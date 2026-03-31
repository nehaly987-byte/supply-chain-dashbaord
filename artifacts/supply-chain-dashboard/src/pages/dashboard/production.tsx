import { useState } from "react";
import { 
  useGetProductionOutput, getGetProductionOutputQueryKey,
  useGetMachines, getGetMachinesQueryKey,
  useGetDowntime, getGetDowntimeQueryKey
} from "@workspace/api-client-react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Line, ComposedChart, Cell
} from "recharts";
import { Settings, AlertOctagon, Activity, Wrench, CheckCircle2, Clock } from "lucide-react";

export default function ProductionDashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  
  const { data: outputData, isLoading: outputLoading } = useGetProductionOutput(
    { period },
    { query: { queryKey: getGetProductionOutputQueryKey({ period }) } }
  );
  
  const { data: machinesData, isLoading: machinesLoading } = useGetMachines({ query: { queryKey: getGetMachinesQueryKey() } });
  const { data: downtimeData, isLoading: downtimeLoading } = useGetDowntime({ query: { queryKey: getGetDowntimeQueryKey() } });

  const getMachineStatusIcon = (status: string) => {
    switch(status) {
      case 'running': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'idle': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'maintenance': return <Wrench className="h-5 w-5 text-primary" />;
      case 'fault': return <AlertOctagon className="h-5 w-5 text-destructive" />;
      default: return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Production Floor</h1>
            <p className="text-muted-foreground mt-1">Manufacturing output, machine health, and OEE.</p>
          </div>
          
          <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
            <SelectTrigger className="w-[150px] bg-card border-border">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Production Output vs Plan</CardTitle>
            <CardDescription>Daily manufacturing volume and defect rate</CardDescription>
          </CardHeader>
          <CardContent>
            {outputLoading ? (
              <Skeleton className="w-full h-[350px]" />
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={outputData?.data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" tickFormatter={formatNumber} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="planned" name="Planned Output" fill="hsl(var(--muted-foreground)/0.2)" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="actual" name="Actual Output" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    {/* Calculate defect rate percentage for the line chart */}
                    <Line yAxisId="right" type="monotone" dataKey={(row) => ((row.defects / row.actual) * 100).toFixed(2)} name="Defect Rate %" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Machine Fleet Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {machinesLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
            ) : (
              machinesData?.machines.map((machine) => (
                <Card key={machine.id} className={`glass-card overflow-hidden relative ${machine.status === 'fault' ? 'border-destructive/50' : ''}`}>
                  {machine.status === 'fault' && <div className="absolute top-0 left-0 w-full h-1 bg-destructive pulse-critical" />}
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{machine.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{machine.line}</p>
                      </div>
                      {getMachineStatusIcon(machine.status)}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Utilization</span>
                          <span className="font-medium">{machine.utilization}%</span>
                        </div>
                        <Progress value={machine.utilization} className="h-1.5" indicatorColor={
                          machine.utilization > 85 ? 'bg-green-500' :
                          machine.utilization > 60 ? 'bg-primary' : 'bg-yellow-500'
                        } />
                      </div>
                      
                      <div className="flex justify-between items-end text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">OEE Score</p>
                          <p className="font-semibold">{machine.efficiency}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-xs">Defect Rate</p>
                          <p className={`font-semibold ${machine.defectRate > 2 ? 'text-destructive' : ''}`}>
                            {machine.defectRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Downtime Events</CardTitle>
            <CardDescription>Impact analysis of machine stops</CardDescription>
          </CardHeader>
          <CardContent>
            {downtimeLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {downtimeData?.events.map((event) => (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-muted/20 transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-full ${
                        event.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                        event.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                        event.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <Settings className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{event.reason}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{event.machineName}</span>
                          <span>•</span>
                          <span>{new Date(event.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-muted-foreground">Impact</p>
                        <p className="font-semibold">{event.impactHours} hours</p>
                      </div>
                      <Badge variant="outline" className={
                        event.endTime ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20 pulse-critical'
                      }>
                        {event.endTime ? 'Resolved' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
