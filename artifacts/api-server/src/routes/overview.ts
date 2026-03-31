import { Router, type IRouter } from "express";

const router: IRouter = Router();

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max));
}

router.get("/overview/kpis", (_req, res) => {
  res.json({
    totalOrders: randomInt(14200, 14600),
    totalOrdersChange: parseFloat(randomBetween(3.2, 8.5).toFixed(1)),
    inventoryValue: parseFloat(randomBetween(4.1, 4.5).toFixed(2)) * 1_000_000,
    inventoryValueChange: parseFloat(randomBetween(-2.1, 5.8).toFixed(1)),
    onTimeDelivery: parseFloat(randomBetween(92.1, 97.4).toFixed(1)),
    onTimeDeliveryChange: parseFloat(randomBetween(-1.5, 3.2).toFixed(1)),
    supplierScore: parseFloat(randomBetween(83.0, 91.5).toFixed(1)),
    supplierScoreChange: parseFloat(randomBetween(-0.8, 2.1).toFixed(1)),
    revenueAtRisk: parseFloat(randomBetween(120000, 180000).toFixed(0)),
    revenueAtRiskChange: parseFloat(randomBetween(-12.0, 8.5).toFixed(1)),
    activeShipments: randomInt(342, 410),
    activeShipmentsChange: parseFloat(randomBetween(-5.0, 12.0).toFixed(1)),
    fillRate: parseFloat(randomBetween(94.2, 98.8).toFixed(1)),
    fillRateChange: parseFloat(randomBetween(-1.2, 2.8).toFixed(1)),
    cycleTime: parseFloat(randomBetween(3.8, 5.2).toFixed(1)),
    cycleTimeChange: parseFloat(randomBetween(-8.0, 4.5).toFixed(1)),
  });
});

router.get("/overview/demand-supply", (req, res) => {
  const period = (req.query.period as string) || "30d";
  const points = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 13 : 12;
  const isWeekly = period === "7d";
  const isMonthly = period === "1y";

  const data = Array.from({ length: points }, (_, i) => {
    const base = 8000 + i * 150 + randomBetween(-400, 400);
    const demand = parseFloat((base + randomBetween(-300, 300)).toFixed(0));
    const supply = parseFloat((base * randomBetween(0.9, 1.1)).toFixed(0));
    const forecast = parseFloat((base * randomBetween(0.95, 1.05)).toFixed(0));

    let date: string;
    if (isMonthly) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      date = months[i] || `M${i + 1}`;
    } else if (isWeekly) {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      date = days[i] || `D${i + 1}`;
    } else {
      const d = new Date();
      d.setDate(d.getDate() - (points - i));
      date = `${d.getMonth() + 1}/${d.getDate()}`;
    }

    return { date, demand, supply, forecast };
  });

  res.json({ data });
});

router.get("/overview/monthly-performance", (_req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = months.map((month, i) => {
    const revenue = parseFloat((randomBetween(2.1, 3.8) * 1_000_000).toFixed(0));
    const cost = parseFloat((revenue * randomBetween(0.55, 0.70)).toFixed(0));
    const profit = revenue - cost;
    return {
      month,
      revenue,
      cost,
      profit,
      orders: randomInt(900 + i * 20, 1200 + i * 30),
    };
  });
  res.json({ data });
});

export default router;
