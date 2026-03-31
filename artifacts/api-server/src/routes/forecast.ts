import { Router, type IRouter } from "express";

const router: IRouter = Router();

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

router.get("/forecast", (req, res) => {
  const period = (req.query.period as string) || "6m";
  const points = period === "3m" ? 13 : period === "6m" ? 26 : period === "1y" ? 52 : 104;
  const product = (req.query.product as string) || "All Products";

  const today = new Date();
  const pastCutoff = Math.floor(points * 0.7);

  const data = Array.from({ length: points }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (points - i) * (period === "2y" ? 7 : 3));
    const date = d.toISOString().split("T")[0];

    const base = 5000 + i * 80 + Math.sin(i * 0.3) * 800 + randomBetween(-200, 200);
    const forecast = parseFloat((base + randomBetween(-150, 150)).toFixed(0));
    const upper = parseFloat((forecast * 1.12).toFixed(0));
    const lower = parseFloat((forecast * 0.88).toFixed(0));
    const actual = i < pastCutoff ? parseFloat((base + randomBetween(-300, 300)).toFixed(0)) : null;

    return { date, actual, forecast, upperBound: upper, lowerBound: lower };
  });

  res.json({
    product,
    data,
    accuracy: parseFloat(randomBetween(87.5, 96.8).toFixed(1)),
    mape: parseFloat(randomBetween(3.2, 9.5).toFixed(1)),
  });
});

router.get("/forecast/seasonality", (_req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const categories = ["Electronics", "Apparel", "Raw Materials", "Industrial"];
  const seasonalProfiles: Record<string, number[]> = {
    Electronics: [0.8, 0.75, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.3, 1.5, 1.6],
    Apparel: [0.9, 0.85, 1.1, 1.2, 1.15, 0.95, 0.85, 0.9, 1.1, 1.0, 1.3, 1.4],
    "Raw Materials": [1.0, 1.0, 1.1, 1.15, 1.2, 1.15, 1.0, 0.95, 1.0, 1.0, 0.9, 0.85],
    Industrial: [0.95, 1.0, 1.05, 1.1, 1.1, 1.05, 0.9, 0.85, 1.0, 1.05, 1.0, 0.9],
  };

  const data = categories.flatMap((category) =>
    months.map((month, i) => ({
      month,
      index: parseFloat((((seasonalProfiles[category] || [1])[i] ?? 1) + randomBetween(-0.05, 0.05)).toFixed(2)),
      category,
    }))
  );
  res.json({ data });
});

export default router;
