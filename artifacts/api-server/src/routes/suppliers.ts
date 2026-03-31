import { Router, type IRouter } from "express";

const router: IRouter = Router();

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max));
}

const supplierNames = [
  "Apex Manufacturing Co.", "Global Supply Partners", "TechParts International", "Pacific Rim Supplies",
  "Nordic Components AB", "Midwest Industrial LLC", "Summit Materials Inc.", "Eastern Trade Group",
  "Premier Logistics Corp", "Horizon Chemicals Ltd", "Atlas Packaging Solutions", "Vertex Electronics",
  "BlueLine Metals", "Cascade Raw Materials", "Delta Fabrication Inc.", "Empire Parts & Supply",
  "First Choice Manufacturing", "Gamma Industrial Group", "Harbor Components", "Infinity Supply Chain",
];
const countries = ["China", "USA", "Germany", "Japan", "India", "South Korea", "Mexico", "UK", "Canada", "Brazil"];
const categories = ["Electronics", "Raw Materials", "Packaging", "Chemicals", "Machinery", "Textiles"];
const statusOpts = ["preferred", "approved", "under_review", "suspended"] as const;

const allSuppliers = supplierNames.map((name, i) => {
  const quality = parseFloat(randomBetween(65, 99).toFixed(1));
  const delivery = parseFloat(randomBetween(60, 99).toFixed(1));
  const price = parseFloat(randomBetween(60, 95).toFixed(1));
  return {
    id: `sup-${i + 1}`,
    name,
    country: countries[i % countries.length],
    category: categories[i % categories.length],
    leadTimeDays: randomInt(3, 45),
    qualityScore: quality,
    deliveryScore: delivery,
    priceScore: price,
    overallScore: parseFloat(((quality + delivery + price) / 3).toFixed(1)),
    status: statusOpts[i % statusOpts.length],
    activeOrders: randomInt(0, 24),
    totalSpend: parseFloat(randomBetween(50000, 2000000).toFixed(0)),
  };
});

router.get("/suppliers", (req, res) => {
  const { sortBy, sortOrder = "asc", page = "1", limit = "20" } = req.query as Record<string, string>;
  let filtered = [...allSuppliers];

  if (sortBy) {
    filtered.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortBy];
      const bVal = (b as Record<string, unknown>)[sortBy];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
      }
      return sortOrder === "desc"
        ? String(bVal).localeCompare(String(aVal))
        : String(aVal).localeCompare(String(bVal));
    });
  }

  const p = parseInt(page);
  const l = parseInt(limit);
  const start = (p - 1) * l;
  res.json({ suppliers: filtered.slice(start, start + l), total: filtered.length, page: p, limit: l });
});

router.get("/suppliers/scorecards", (_req, res) => {
  const scorecards = allSuppliers.slice(0, 8).map((s) => ({
    supplierId: s.id,
    supplierName: s.name,
    onTimeDelivery: parseFloat(randomBetween(75, 99).toFixed(1)),
    qualityRating: s.qualityScore,
    responsiveness: parseFloat(randomBetween(70, 98).toFixed(1)),
    compliance: parseFloat(randomBetween(80, 100).toFixed(1)),
    sustainability: parseFloat(randomBetween(60, 95).toFixed(1)),
  }));
  res.json({ scorecards });
});

router.get("/suppliers/lead-times", (_req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = months.map((month) => ({
    month,
    avgLeadTime: parseFloat(randomBetween(12, 28).toFixed(1)),
    targetLeadTime: 18,
    supplierA: parseFloat(randomBetween(8, 22).toFixed(1)),
    supplierB: parseFloat(randomBetween(14, 32).toFixed(1)),
  }));
  res.json({ data });
});

export default router;
