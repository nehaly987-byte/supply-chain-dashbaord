import { useState } from "react";
import { 
  useGetShipments, getGetShipmentsQueryKey,
  useGetDeliveryStatus, getGetDeliveryStatusQueryKey,
  useGetFleetUtilization, getGetFleetUtilizationQueryKey
} from "@workspace/api-client-react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Navigation, Truck, Plane, Ship } from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from "recharts";
import { FilterBar } from "@/components/filters/FilterBar";
import { useFilters } from "@/contexts/FiltersContext";

const PAGE = "logistics";
const REGIONS = ["North America", "Europe", "Asia Pacific", "South America", "Middle East"];
const STATUSES = [
  { value: "in_transit", label: "In Transit" },
  { value: "delayed",    label: "Delayed" },
  { value: "customs",   label: "Customs" },
  { value: "delivered", label: "Delivered" },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))', 'hsl(var(--secondary))'];

export default function LogisticsDashboard() {
  const { filters } = useFilters(PAGE);
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: shipmentsData, isLoading: shipmentsLoading } = useGetShipments(
    { status: activeTab === "all" ? undefined : activeTab, limit: 10 },
    { query: { queryKey: getGetShipmentsQueryKey({ status: activeTab === "all" ? undefined : activeTab, limit: 10 }) } }
  );
  
  const { data: statusData, isLoading: statusLoading } = useGetDeliveryStatus({ query: { queryKey: getGetDeliveryStatusQueryKey() } });
  const { data: fleetData, isLoading: fleetLoading } = useGetFleetUtilization({ query: { queryKey: getGetFleetUtilizationQueryKey() } });

  const getCarrierIcon = (carrier: string) => {
    if (carrier.toLowerCase().includes('air')) return <Plane className="h-4 w-4" />;
    if (carrier.toLowerCase().includes('ocean') || carrier.toLowerCase().includes('sea')) return <Ship className="h-4 w-4" />;
    return <Truck className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_transit': return 'bg-primary/10 text-primary border-primary/20';
      case 'delayed': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'customs': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="page-header">
          <h1>Logistics &amp; Transportation</h1>
          <p className="text-sm text-muted-foreground">Global fleet tracking and delivery status.</p>
        </div>

        <FilterBar config={{
          page: PAGE,
          show: { search: true, dateRange: true, status: true, location: true },
          options: { statuses: STATUSES, locations: REGIONS },
        }} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Shipments</CardTitle>
                  <CardDescription>Live tracking progress</CardDescription>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="in_transit">In Transit</TabsTrigger>
                    <TabsTrigger value="delayed">Delayed</TabsTrigger>
                    <TabsTrigger value="customs">Customs</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {shipmentsLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-2 mb-6">
                      <div className="flex justify-between"><Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-20" /></div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))
                ) : shipmentsData?.shipments.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">No shipments found for this status.</div>
                ) : (
                  shipmentsData?.shipments.map((shipment) => (
                    <div key={shipment.id} className="p-4 rounded-lg border border-border bg-card/50 hover:bg-muted/20 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            {getCarrierIcon(shipment.carrier)}
                          </div>
                          <div>
                            <p className="font-mono text-sm font-medium">{shipment.trackingNumber}</p>
                            <p className="text-xs text-muted-foreground">{shipment.carrier}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-muted-foreground">Est. Delivery</p>
                            <p className="text-sm font-medium">
                              {new Date(shipment.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(shipment.status)}>
                            {shipment.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm mt-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {shipment.origin}
                            </span>
                            <span className="font-medium text-primary">{shipment.progress}%</span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Navigation className="h-3 w-3" /> {shipment.destination}
                            </span>
                          </div>
                          <Progress 
                            value={shipment.progress} 
                            className="h-2" 
                            indicatorColor={shipment.status === 'delayed' ? 'bg-destructive' : 'bg-primary'} 
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
              </CardHeader>
              <CardContent>
                {statusLoading ? (
                  <Skeleton className="w-full h-[250px]" />
                ) : (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData?.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="status"
                        >
                          {statusData?.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          formatter={(value, name: string) => [value, name.replace('_', ' ').toUpperCase()]}
                        />
                        <Legend formatter={(value) => value.replace('_', ' ').toUpperCase()} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Fleet Utilization</CardTitle>
                <CardDescription>Live vehicle status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fleetLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1"><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-2 w-full" /></div>
                      </div>
                    ))
                  ) : (
                    fleetData?.fleet.slice(0, 5).map(vehicle => (
                      <div key={vehicle.id} className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          vehicle.status === 'active' ? 'bg-green-500/10 text-green-500' :
                          vehicle.status === 'idle' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{vehicle.name}</span>
                            <span className="text-xs font-mono text-muted-foreground">{vehicle.utilization}%</span>
                          </div>
                          <Progress 
                            value={vehicle.utilization} 
                            className="h-1.5" 
                            indicatorColor={
                              vehicle.status === 'active' ? 'bg-green-500' :
                              vehicle.status === 'idle' ? 'bg-yellow-500' : 'bg-destructive'
                            }
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Simple visual shipment map concept using styled elements */}
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle>Global Operations Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0 relative">
            <div className="h-[300px] w-full bg-[#0a1020] relative flex items-center justify-center border-y border-border/50">
              {/* Abstract map grid background */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
              
              {/* Abstract continents concept using glowing nodes and SVG paths */}
              <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                {/* Connection lines */}
                <path d="M 200 150 Q 400 50 600 120" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="5,5" className="opacity-50" />
                <path d="M 600 120 Q 800 200 950 160" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="5,5" className="opacity-50" />
                <path d="M 200 150 Q 300 250 500 220" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="5,5" className="opacity-30" />
              </svg>

              {/* Hubs / Nodes */}
              <div className="absolute left-[20%] top-[45%] flex flex-col items-center group">
                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(79,70,229,0.8)] z-10 animate-pulse" />
                <span className="text-[10px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-1 rounded">NY Hub</span>
              </div>
              <div className="absolute left-[45%] top-[65%] flex flex-col items-center group">
                <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_15px_rgba(6,182,212,0.8)] z-10" />
                <span className="text-[10px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-1 rounded">SA Hub</span>
              </div>
              <div className="absolute left-[60%] top-[35%] flex flex-col items-center group">
                <div className="w-5 h-5 rounded-full bg-primary shadow-[0_0_20px_rgba(79,70,229,1)] z-10 animate-pulse" />
                <span className="text-[10px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-1 rounded">EU Hub</span>
              </div>
              <div className="absolute left-[85%] top-[45%] flex flex-col items-center group">
                <div className="w-4 h-4 rounded-full bg-accent shadow-[0_0_15px_rgba(6,182,212,0.8)] z-10" />
                <span className="text-[10px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-1 rounded">ASIA Hub</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
