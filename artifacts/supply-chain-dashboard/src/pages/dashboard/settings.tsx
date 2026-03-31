import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSettings, type ChartTheme, type AppSettings } from "@/contexts/SettingsContext";
import { useState } from "react";
import {
  User, Bell, Palette, RefreshCw, Globe, Shield, Database, LayoutDashboard, Save, ChevronRight
} from "lucide-react";

type Section = "profile" | "appearance" | "notifications" | "data" | "regional" | "security" | "dashboard";

const sections: { id: Section; icon: typeof User; label: string; description: string }[] = [
  { id: "profile",       icon: User,           label: "Profile",           description: "Manage your account details" },
  { id: "appearance",    icon: Palette,         label: "Appearance",        description: "Theme, density and display" },
  { id: "notifications", icon: Bell,            label: "Notifications",     description: "Alerts and notification rules" },
  { id: "data",          icon: Database,        label: "Data & Refresh",    description: "Sync intervals and data sources" },
  { id: "regional",      icon: Globe,           label: "Regional",          description: "Currency, timezone and formats" },
  { id: "dashboard",     icon: LayoutDashboard, label: "Dashboard",         description: "Default views and layout" },
  { id: "security",      icon: Shield,          label: "Security",          description: "Sessions and access control" },
];

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("profile");
  const { settings, update } = useSettings();
  const [saved, setSaved] = useState(false);

  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    update(key, value);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PageTransition>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your dashboard preferences and account settings.</p>
        </div>

        <div className="flex gap-6">
          {/* Left nav */}
          <div className="w-56 flex-shrink-0 space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-150 group ${
                  active === s.id
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <s.icon size={16} className={active === s.id ? "text-primary-foreground" : "group-hover:text-primary"} />
                <span>{s.label}</span>
                {active !== s.id && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-50" />}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">

            {/* PROFILE */}
            {active === "profile" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User size={18} /> Profile</CardTitle>
                  <CardDescription>Your personal account information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {settings.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold">{settings.name}</p>
                      <p className="text-sm text-muted-foreground">{settings.email}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{settings.role}</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {([
                      { label: "Full Name",      value: settings.name,     key: "name"     },
                      { label: "Email Address",  value: settings.email,    key: "email"    },
                      { label: "Job Title",      value: settings.role,     key: "role"     },
                      { label: "Timezone",       value: settings.timezone, key: "timezone" },
                    ] as const).map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">{f.label}</Label>
                        <input
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                          value={f.value}
                          onChange={(e) => set(f.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* APPEARANCE */}
            {active === "appearance" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Palette size={18} /> Appearance</CardTitle>
                  <CardDescription>Customize how the dashboard looks and feels.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Display Density</Label>
                      <Select value={settings.density} onValueChange={(v) => set("density", v as AppSettings["density"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="comfortable">Comfortable</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Chart Color Theme</Label>
                      <Select value={settings.chartTheme} onValueChange={(v) => set("chartTheme", v as ChartTheme)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indigo">Indigo / Cyan</SelectItem>
                          <SelectItem value="emerald">Emerald / Teal</SelectItem>
                          <SelectItem value="violet">Violet / Pink</SelectItem>
                          <SelectItem value="amber">Amber / Orange</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Live color swatch preview */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/30">
                    <span className="text-xs text-muted-foreground">Preview:</span>
                    <div className="w-6 h-6 rounded-full bg-primary shadow" title="Primary" />
                    <div className="w-6 h-6 rounded-full bg-accent shadow" title="Accent" />
                    <span className="text-xs text-muted-foreground capitalize ml-1">{settings.chartTheme} palette</span>
                  </div>

                  <Separator />
                  {([
                    { label: "Enable page animations",      desc: "Smooth transitions between pages",      key: "animationsEnabled",  value: settings.animationsEnabled  },
                    { label: "Collapse sidebar by default", desc: "Start with the sidebar minimized",      key: "sidebarCollapsed",   value: settings.sidebarCollapsed   },
                  ] as const).map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch checked={item.value} onCheckedChange={(v) => set(item.key, v)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* NOTIFICATIONS */}
            {active === "notifications" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bell size={18} /> Notifications</CardTitle>
                  <CardDescription>Choose which alerts and updates you receive.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {([
                    { key: "criticalAlerts",    label: "Critical Risk Alerts",      desc: "Immediate alerts for critical supply chain events", value: settings.criticalAlerts    },
                    { key: "shipmentUpdates",   label: "Shipment Status Updates",   desc: "Notify when shipments are delayed or delivered",    value: settings.shipmentUpdates   },
                    { key: "inventoryWarnings", label: "Inventory Warnings",        desc: "Low stock and overstock threshold breaches",        value: settings.inventoryWarnings },
                    { key: "weeklyReport",      label: "Weekly Performance Report", desc: "Summary of key metrics every Monday",               value: settings.weeklyReport      },
                    { key: "emailDigest",       label: "Email Digest",              desc: "Daily email summary of dashboard activity",         value: settings.emailDigest       },
                    { key: "smsAlerts",         label: "SMS Alerts",                desc: "Text messages for critical-severity events only",   value: settings.smsAlerts         },
                  ] as const).map((item, i) => (
                    <div key={item.key}>
                      {i > 0 && <Separator className="my-3" />}
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch checked={item.value} onCheckedChange={(v) => set(item.key, v)} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* DATA */}
            {active === "data" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><RefreshCw size={18} /> Data &amp; Refresh</CardTitle>
                  <CardDescription>Control how data is fetched and cached.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Auto-Refresh Interval</Label>
                      <Select value={settings.refreshInterval} onValueChange={(v) => set("refreshInterval", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">Every 10 seconds</SelectItem>
                          <SelectItem value="30">Every 30 seconds</SelectItem>
                          <SelectItem value="60">Every minute</SelectItem>
                          <SelectItem value="300">Every 5 minutes</SelectItem>
                          <SelectItem value="0">Manual only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Historical Data Range</Label>
                      <Select value={settings.historicalRange} onValueChange={(v) => set("historicalRange", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3m">Last 3 months</SelectItem>
                          <SelectItem value="6m">Last 6 months</SelectItem>
                          <SelectItem value="12m">Last 12 months</SelectItem>
                          <SelectItem value="24m">Last 24 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  {([
                    { key: "cacheEnabled", label: "Enable response caching",  desc: "Cache API responses to reduce server load",    value: settings.cacheEnabled },
                    { key: "autoExport",   label: "Scheduled data export",    desc: "Automatically export reports every Sunday",   value: settings.autoExport   },
                  ] as const).map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch checked={item.value} onCheckedChange={(v) => set(item.key, v)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* REGIONAL */}
            {active === "regional" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Globe size={18} /> Regional Settings</CardTitle>
                  <CardDescription>Locale, currency and formatting preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {([
                      { label: "Currency",      key: "currency",         value: settings.currency,         options: [["USD","US Dollar (USD)"],["EUR","Euro (EUR)"],["GBP","British Pound (GBP)"],["JPY","Japanese Yen (JPY)"],["CNY","Chinese Yuan (CNY)"]] },
                      { label: "Date Format",   key: "dateFormat",       value: settings.dateFormat,       options: [["MM/DD/YYYY","MM/DD/YYYY"],["DD/MM/YYYY","DD/MM/YYYY"],["YYYY-MM-DD","YYYY-MM-DD"]] },
                      { label: "Number Format", key: "numberFormat",     value: settings.numberFormat,     options: [["1,000.00","1,000.00 (US)"],["1.000,00","1.000,00 (EU)"],["1 000.00","1 000.00 (FR)"]] },
                      { label: "Timezone",      key: "regionalTimezone", value: settings.regionalTimezone, options: [["America/New_York","Eastern Time (ET)"],["America/Chicago","Central Time (CT)"],["America/Los_Angeles","Pacific Time (PT)"],["Europe/London","London (GMT)"],["Europe/Berlin","Berlin (CET)"],["Asia/Tokyo","Tokyo (JST)"],["Asia/Shanghai","Shanghai (CST)"]] },
                    ] as const).map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">{f.label}</Label>
                        <Select value={f.value} onValueChange={(v) => set(f.key, v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {f.options.map(([val, lbl]) => <SelectItem key={val} value={val}>{lbl}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* DASHBOARD */}
            {active === "dashboard" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><LayoutDashboard size={18} /> Dashboard Preferences</CardTitle>
                  <CardDescription>Default landing page and layout options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Default Landing Page</Label>
                      <Select value={settings.defaultPage} onValueChange={(v) => set("defaultPage", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="/">Executive Overview</SelectItem>
                          <SelectItem value="/inventory">Inventory</SelectItem>
                          <SelectItem value="/logistics">Logistics</SelectItem>
                          <SelectItem value="/orders">Orders</SelectItem>
                          <SelectItem value="/risks">Risk & Exceptions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">KPI Cards Shown</Label>
                      <Select value={settings.kpiCount} onValueChange={(v) => set("kpiCount", v as AppSettings["kpiCount"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 cards</SelectItem>
                          <SelectItem value="6">6 cards</SelectItem>
                          <SelectItem value="8">8 cards</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  {([
                    { key: "chartAnimations", label: "Chart enter animations", desc: "Animate charts when they first load",  value: settings.chartAnimations },
                    { key: "compactMode",     label: "Compact table rows",     desc: "Show more rows per page in tables",   value: settings.compactMode     },
                  ] as const).map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch checked={item.value} onCheckedChange={(v) => set(item.key, v)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* SECURITY */}
            {active === "security" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield size={18} /> Security</CardTitle>
                  <CardDescription>Sessions, access tokens and permissions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Active Sessions</p>
                    {[
                      { device: "Chrome on macOS",     location: "New York, US",  time: "Now — current session", current: true },
                      { device: "Safari on iPhone 15", location: "New York, US",  time: "2 hours ago",           current: false },
                      { device: "Edge on Windows",     location: "Chicago, US",   time: "Yesterday, 14:32",      current: false },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${session.current ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"}`} />
                          <div>
                            <p className="text-sm font-medium">{session.device}</p>
                            <p className="text-xs text-muted-foreground">{session.location} · {session.time}</p>
                          </div>
                        </div>
                        {session.current
                          ? <Badge variant="secondary" className="text-xs">Current</Badge>
                          : <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs h-7">Revoke</Button>
                        }
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Two-factor authentication</p>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs">Not enabled</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Enable 2FA</Button>
                </CardContent>
              </Card>
            )}

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                className={`gap-2 transition-all ${saved ? "bg-green-600 hover:bg-green-600" : ""}`}
              >
                <Save size={15} />
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
