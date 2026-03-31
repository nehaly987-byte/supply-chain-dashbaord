import { Router, type IRouter } from "express";

const router: IRouter = Router();

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

router.get("/costs/breakdown", (_req, res) => {
  const categories = [
    { name: "Procurement", base: 35 },
    { name: "Logistics", base: 22 },
    { name: "Manufacturing", base: 28 },
    { name: "Overhead", base: 10 },
    { name: "Quality Control", base: 5 },
  ];
  let totalPct = 0;
  const data = categories.map((c, i) => {
    const pct = i === categories.length - 1 ? 100 - totalPct : parseFloat((c.base + randomBetween(-2, 2)).toFixed(1));
    totalPct += pct;
    return {
      name: c.name,
      value: parseFloat(randomBetween(500000, 4000000).toFixed(0)),
      percentage: pct,
      change: parseFloat(randomBetween(-8, 12).toFixed(1)),
    };
  });
  res.json({ data });
});

router.get("/costs/trends", (req, res) => {
  const period = (req.query.period as string) || "6m";
  const months = period === "3m" ? ["Jan", "Feb", "Mar"] : period === "1y"
    ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    : ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const data = months.map((month) => {
    const logistics = parseFloat(randomBetween(200000, 450000).toFixed(0));
    const manufacturing = parseFloat(randomBetween(400000, 800000).toFixed(0));
    const procurement = parseFloat(randomBetween(600000, 1200000).toFixed(0));
    const overhead = parseFloat(randomBetween(100000, 250000).toFixed(0));
    return {
      month,
      logistics,
      manufacturing,
      procurement,
      overhead,
      total: logistics + manufacturing + procurement + overhead,
    };
  });
  res.json({ data });
});

router.get("/costs/kpis", (_req, res) => {
  const kpis = [
    { name: "Cost Per Unit", unit: "USD", target: 42.0, trendDir: -1 },
    { name: "Logistics Cost Ratio", unit: "%", target: 8.5, trendDir: -1 },
    { name: "Procurement Savings", unit: "%", target: 5.0, trendDir: 1 },
    { name: "Overhead Rate", unit: "%", target: 12.0, trendDir: -1 },
    { name: "Working Capital Turns", unit: "x", target: 6.5, trendDir: 1 },
  ];

  const data = kpis.map((k) => {
    const value = parseFloat((k.target * randomBetween(0.85, 1.15)).toFixed(2));
    const variance = parseFloat(((value - k.target) / k.target * 100).toFixed(1));
    const trend = k.trendDir > 0
      ? (value > k.target ? "up" : "down")
      : (value < k.target ? "up" : "down");
    return { name: k.name, value, unit: k.unit, variance, target: k.target, trend };
  });
  res.json({ kpis: data });
});

export default router;
