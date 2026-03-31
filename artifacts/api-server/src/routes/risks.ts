import { Router, type IRouter } from "express";

const router: IRouter = Router();

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max));
}

const alertTemplates = [
  { title: "Critical Supplier Disruption", desc: "Apex Manufacturing Co. has reported force majeure event. 3 active POs affected.", severity: "critical", category: "Supplier" },
  { title: "Port Congestion - Shanghai", desc: "Severe congestion at Shanghai port causing 5-7 day delays. 12 shipments impacted.", severity: "high", category: "Logistics" },
  { title: "Inventory Level Warning", desc: "Electronics category inventory at 18% of reorder point. Urgent replenishment needed.", severity: "critical", category: "Inventory" },
  { title: "Quality Issue Detected", desc: "Batch QC-2024-081 shows 4.2% defect rate, exceeding 2% threshold.", severity: "high", category: "Quality" },
  { title: "Demand Spike Forecast", desc: "AI model predicts 34% demand increase in Q4. Current inventory insufficient.", severity: "medium", category: "Demand" },
  { title: "Regulatory Compliance Alert", desc: "New EU customs regulations effective next month. 8 supplier certifications need renewal.", severity: "medium", category: "Compliance" },
  { title: "Currency Risk - JPY", desc: "JPY/USD volatility at 3-year high. Procurement costs may increase by 8-12%.", severity: "medium", category: "Financial" },
  { title: "Fleet Maintenance Overdue", desc: "3 vehicles past scheduled maintenance window. Insurance compliance at risk.", severity: "low", category: "Logistics" },
  { title: "Supplier Lead Time Increase", desc: "Nordic Components AB increasing lead times from 14 to 22 days starting next quarter.", severity: "low", category: "Supplier" },
  { title: "Warehouse Capacity Alert", desc: "WH-North at 94% capacity. Overflow risk in next 7 days if inbound continues.", severity: "high", category: "Inventory" },
];

router.get("/risks/alerts", (_req, res) => {
  const alerts = alertTemplates.map((t, i) => ({
    id: `alert-${i + 1}`,
    title: t.title,
    description: t.desc,
    severity: t.severity,
    category: t.category,
    timestamp: new Date(Date.now() - randomInt(0, 48) * 3600 * 1000).toISOString(),
    resolved: i > 7,
  }));
  res.json({ alerts });
});

router.get("/risks/heatmap", (_req, res) => {
  const riskCategories = ["Supplier", "Logistics", "Inventory", "Financial", "Regulatory", "Geopolitical"];
  const regions = ["North America", "Europe", "Asia Pacific", "Middle East", "Latin America"];
  const impactLevels = ["low", "medium", "high", "critical"] as const;

  const data = riskCategories.flatMap((category) =>
    regions.map((region) => {
      const riskScore = parseFloat(randomBetween(1, 100).toFixed(1));
      let impactLevel: (typeof impactLevels)[number];
      if (riskScore >= 75) impactLevel = "critical";
      else if (riskScore >= 50) impactLevel = "high";
      else if (riskScore >= 25) impactLevel = "medium";
      else impactLevel = "low";
      return { category, region, riskScore, impactLevel };
    })
  );
  res.json({ data });
});

router.get("/risks/delayed-shipments", (_req, res) => {
  const cities = ["Shanghai", "Los Angeles", "Rotterdam", "Singapore", "New York", "Dubai", "Hamburg", "Tokyo"];
  const reasons = ["Port Congestion", "Weather Delay", "Customs Hold", "Documentation Issue", "Carrier Delay", "Force Majeure"];
  const carriers = ["FedEx", "DHL", "UPS", "Maersk", "MSC"];

  const shipments = Array.from({ length: 12 }, (_, i) => ({
    id: `delayed-${i + 1}`,
    trackingNumber: `TRK${String(200000 + i).padStart(8, "0")}`,
    origin: cities[i % cities.length],
    destination: cities[(i + 4) % cities.length],
    delayDays: randomInt(1, 14),
    reason: reasons[i % reasons.length],
    value: parseFloat(randomBetween(5000, 250000).toFixed(2)),
    carrier: carriers[i % carriers.length],
  }));
  res.json({ shipments });
});

export default router;
