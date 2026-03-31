import { 
  useGetRiskAlerts, getGetRiskAlertsQueryKey,
  useGetRiskHeatmap, getGetRiskHeatmapQueryKey,
  useGetDelayedShipments, getGetDelayedShipmentsQueryKey
} from "@workspace/api-client-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ShieldAlert, AlertCircle, Info, Clock, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RisksDashboard() {
  const { data: alertsData, isLoading: alertsLoading } = useGetRiskAlerts({ query: { queryKey: getGetRiskAlertsQueryKey() } });
  const { data: heatmapData, isLoading: heatmapLoading } = useGetRiskHeatmap({ query: { queryKey: getGetRiskHeatmapQueryKey() } });
  const { data: delaysData, isLoading: delaysLoading } = useGetDelayedShipments({ query: { queryKey: getGetDelayedShipmentsQueryKey() } });

  const getSeverityStyles = (severity: string) => {
    switch(severity) {
      case 'critical': return { icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', glow: 'glow-destructive pulse-critical' };
      case 'high': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: '' };
      case 'medium': return { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: '' };
      default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: '' };
    }
  };

  const getHeatmapColor = (score: number) => {
    if (score > 80) return 'bg-destructive';
    if (score > 60) return 'bg-orange-500';
    if (score > 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val);

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk & Exceptions</h1>
          <p className="text-muted-foreground mt-1">Real-time threat monitoring and mitigation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Active Alerts Feed
              </CardTitle>
              <CardDescription>System-detected anomalies requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertsLoading ? (
                  Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                ) : (
                  <AnimatePresence>
                    {alertsData?.alerts.filter(a => !a.resolved).map((alert) => {
                      const styles = getSeverityStyles(alert.severity);
                      const Icon = styles.icon;
                      
                      return (
                        <motion.div 
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-lg border ${styles.border} ${styles.bg} ${styles.glow} relative overflow-hidden`}
                        >
                          {alert.severity === 'critical' && <div className="absolute left-0 top-0 w-1 h-full bg-destructive" />}
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full bg-background/50 ${styles.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-foreground">{alert.title}</h3>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                  {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                              <div className="flex items-center gap-3 mt-3">
                                <Badge variant="outline" className={`text-xs ${styles.color} border-current/20`}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono">{alert.category}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Global Risk Heatmap</CardTitle>
                <CardDescription>Risk concentration by region</CardDescription>
              </CardHeader>
              <CardContent>
                {heatmapLoading ? (
                  <Skeleton className="w-full h-64" />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {heatmapData?.data.map((cell) => (
                      <div key={`${cell.region}-${cell.category}`} className="relative group cursor-pointer">
                        <div className={`p-3 rounded border border-border/50 transition-opacity ${getHeatmapColor(cell.riskScore)} bg-opacity-20 hover:bg-opacity-30`}>
                          <p className="text-xs font-medium text-foreground truncate">{cell.region}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{cell.category}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs font-bold">{cell.riskScore}</span>
                            <div className={`w-2 h-2 rounded-full ${getHeatmapColor(cell.riskScore)}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Delayed Shipments</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                  {delaysLoading ? (
                    Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full mx-4 my-2" />)
                  ) : (
                    delaysData?.shipments.map((shipment) => (
                      <div key={shipment.id} className="p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-mono text-sm font-medium">{shipment.trackingNumber}</span>
                          <span className="text-destructive font-medium text-sm flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> +{shipment.delayDays}d
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{shipment.origin} → {shipment.destination}</p>
                        <div className="flex justify-between mt-2">
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{shipment.reason}</span>
                          <span className="text-xs font-medium">{formatCurrency(shipment.value)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
