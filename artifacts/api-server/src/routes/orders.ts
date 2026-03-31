import { Router, type IRouter } from "express";

const router: IRouter = Router();

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max));
}

const customers = [
  "Acme Corp", "TechGiant Inc", "Global Retail Ltd", "MegaStore Inc", "FastShip Co",
  "Prime Electronics", "Industrial Partners", "Nexus Trading", "Summit Retail", "Nordic Commerce",
  "Pacific Distributors", "Eastern Enterprise", "Western Supply Co", "Central Goods Ltd", "Apex Consumer",
];
const statusOpts = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"] as const;
const priorities = ["standard", "express", "urgent"] as const;
const regions = ["North America", "Europe", "Asia Pacific", "Middle East", "Latin America"];

const allOrders = Array.from({ length: 200 }, (_, i) => {
  const createdDate = new Date(Date.now() - randomInt(0, 60) * 24 * 3600 * 1000);
  const deliveryDate = new Date(createdDate);
  deliveryDate.setDate(deliveryDate.getDate() + randomInt(2, 14));

  return {
    id: `ord-${i + 1}`,
    orderNumber: `ORD-${String(10000 + i).padStart(6, "0")}`,
    customer: customers[i % customers.length],
    status: statusOpts[i % statusOpts.length],
    items: randomInt(1, 25),
    value: parseFloat(randomBetween(150, 45000).toFixed(2)),
    createdAt: createdDate.toISOString(),
    estimatedDelivery: deliveryDate.toISOString(),
    priority: priorities[i % priorities.length],
    region: regions[i % regions.length],
  };
});

router.get("/orders", (req, res) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  let filtered = allOrders;
  if (status) filtered = filtered.filter((o) => o.status === status);

  const p = parseInt(page);
  const l = parseInt(limit);
  const start = (p - 1) * l;
  res.json({ orders: filtered.slice(start, start + l), total: filtered.length, page: p, limit: l });
});

router.get("/orders/fulfillment", (_req, res) => {
  res.json({
    fulfillmentRate: parseFloat(randomBetween(91.5, 97.8).toFixed(1)),
    averageProcessingTime: parseFloat(randomBetween(18.5, 36.2).toFixed(1)),
    onTimeShipmentRate: parseFloat(randomBetween(88.0, 96.5).toFixed(1)),
    backorderRate: parseFloat(randomBetween(2.1, 6.8).toFixed(1)),
    cancelRate: parseFloat(randomBetween(1.2, 4.5).toFixed(1)),
    returnRate: parseFloat(randomBetween(3.5, 8.2).toFixed(1)),
    stagesBreakdown: [
      { stage: "Order Received", count: randomInt(180, 220), avgHours: parseFloat(randomBetween(0.1, 0.5).toFixed(1)) },
      { stage: "Payment Verified", count: randomInt(170, 210), avgHours: parseFloat(randomBetween(0.5, 2).toFixed(1)) },
      { stage: "Warehouse Processing", count: randomInt(150, 200), avgHours: parseFloat(randomBetween(4, 12).toFixed(1)) },
      { stage: "Quality Check", count: randomInt(140, 190), avgHours: parseFloat(randomBetween(1, 4).toFixed(1)) },
      { stage: "Dispatched", count: randomInt(130, 180), avgHours: parseFloat(randomBetween(2, 8).toFixed(1)) },
      { stage: "In Transit", count: randomInt(120, 170), avgHours: parseFloat(randomBetween(24, 96).toFixed(1)) },
      { stage: "Delivered", count: randomInt(100, 150), avgHours: parseFloat(randomBetween(0, 2).toFixed(1)) },
    ],
  });
});

router.get("/orders/returns", (_req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = months.map((month) => ({
    month,
    returns: randomInt(80, 220),
    backorders: randomInt(40, 130),
    cancellations: randomInt(30, 90),
  }));
  res.json({ data });
});

export default router;
