import { Router, type IRouter } from "express";

const router: IRouter = Router();

const categories = ["Electronics", "Raw Materials", "Finished Goods", "Packaging", "Chemicals", "Machinery Parts"];
const warehouses = ["WH-North", "WH-South", "WH-East", "WH-West", "WH-Central"];
const statuses = ["normal", "low_stock", "overstock", "critical"] as const;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max));
}

function generateInventoryItems(count = 100) {
  return Array.from({ length: count }, (_, i) => {
    const maxStock = randomInt(200, 2000);
    const reorderPoint = Math.floor(maxStock * randomBetween(0.1, 0.25));
    const quantity = randomInt(0, maxStock + 200);
    let status: (typeof statuses)[number];
    if (quantity < reorderPoint * 0.5) status = "critical";
    else if (quantity < reorderPoint) status = "low_stock";
    else if (quantity > maxStock) status = "overstock";
    else status = "normal";

    const skuPrefix = ["EL", "RM", "FG", "PK", "CH", "MP"][i % 6];
    return {
      id: `inv-${i + 1}`,
      sku: `${skuPrefix}-${String(1000 + i).padStart(5, "0")}`,
      name: `Item ${i + 1} - ${categories[i % categories.length]}`,
      category: categories[i % categories.length],
      warehouse: warehouses[i % warehouses.length],
      quantity,
      reorderPoint,
      maxStock,
      unitCost: parseFloat(randomBetween(5, 500).toFixed(2)),
      status,
      lastUpdated: new Date(Date.now() - randomInt(0, 7 * 24 * 3600 * 1000)).toISOString(),
    };
  });
}

const allItems = generateInventoryItems(120);

router.get("/inventory", (req, res) => {
  const { warehouse, category, page = "1", limit = "20" } = req.query as Record<string, string>;
  let filtered = allItems;
  if (warehouse) filtered = filtered.filter((i) => i.warehouse === warehouse);
  if (category) filtered = filtered.filter((i) => i.category === category);

  const p = parseInt(page);
  const l = parseInt(limit);
  const start = (p - 1) * l;
  const items = filtered.slice(start, start + l);

  res.json({ items, total: filtered.length, page: p, limit: l });
});

router.get("/inventory/stock-levels", (_req, res) => {
  const data = categories.flatMap((category) =>
    warehouses.slice(0, 3).map((warehouse) => ({
      category,
      warehouse,
      current: randomInt(200, 1800),
      target: randomInt(800, 1500),
      minimum: randomInt(100, 400),
    }))
  );
  res.json({ data });
});

router.get("/inventory/aging", (_req, res) => {
  const data = categories.map((category) => ({
    category,
    age0to30: randomInt(200, 800),
    age31to60: randomInt(100, 500),
    age61to90: randomInt(50, 250),
    age90plus: randomInt(20, 100),
  }));
  res.json({ data });
});

router.get("/inventory/alerts", (_req, res) => {
  const alerts = allItems
    .filter((i) => i.status !== "normal")
    .slice(0, 15)
    .map((i) => ({
      id: `alert-${i.id}`,
      sku: i.sku,
      name: i.name,
      type: i.status,
      currentLevel: i.quantity,
      threshold: i.status === "overstock" ? i.maxStock : i.reorderPoint,
      warehouse: i.warehouse,
    }));
  res.json({ alerts });
});

export default router;
