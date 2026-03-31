import { Router, type IRouter } from "express";

const router: IRouter = Router();

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max));
}

const cities = [
  { name: "Shanghai", lat: 31.23, lng: 121.47 },
  { name: "Los Angeles", lat: 34.05, lng: -118.24 },
  { name: "Rotterdam", lat: 51.92, lng: 4.48 },
  { name: "Singapore", lat: 1.35, lng: 103.82 },
  { name: "New York", lat: 40.71, lng: -74.01 },
  { name: "Dubai", lat: 25.2, lng: 55.27 },
  { name: "Hamburg", lat: 53.55, lng: 9.99 },
  { name: "Tokyo", lat: 35.68, lng: 139.69 },
  { name: "Mumbai", lat: 19.08, lng: 72.88 },
  { name: "Chicago", lat: 41.88, lng: -87.63 },
];

const carriers = ["FedEx", "DHL", "UPS", "Maersk", "MSC", "COSCO"];
const statusOptions = ["in_transit", "delivered", "delayed", "pending", "customs"] as const;

function generateShipments(count = 60) {
  return Array.from({ length: count }, (_, i) => {
    const origin = cities[i % cities.length];
    const dest = cities[(i + 3) % cities.length];
    const status = statusOptions[i % statusOptions.length];
    const progress = status === "delivered" ? 100 : status === "pending" ? 0 : randomInt(15, 90);
    const daysOut = randomInt(1, 14);
    const estDelivery = new Date(Date.now() + daysOut * 24 * 3600 * 1000).toISOString();
    const actualDelivery = status === "delivered" ? new Date(Date.now() - randomInt(0, 3) * 24 * 3600 * 1000).toISOString() : null;

    return {
      id: `shp-${i + 1}`,
      trackingNumber: `TRK${String(100000 + i).padStart(8, "0")}`,
      origin: origin.name,
      destination: dest.name,
      carrier: carriers[i % carriers.length],
      status,
      progress,
      estimatedDelivery: estDelivery,
      actualDelivery,
      weight: parseFloat(randomBetween(50, 5000).toFixed(1)),
      value: parseFloat(randomBetween(1000, 150000).toFixed(2)),
      lat: origin.lat + randomBetween(-2, 2),
      lng: origin.lng + randomBetween(-2, 2),
    };
  });
}

const allShipments = generateShipments(80);

router.get("/logistics/shipments", (req, res) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  let filtered = allShipments;
  if (status) filtered = filtered.filter((s) => s.status === status);

  const p = parseInt(page);
  const l = parseInt(limit);
  const start = (p - 1) * l;
  res.json({ shipments: filtered.slice(start, start + l), total: filtered.length, page: p, limit: l });
});

router.get("/logistics/delivery-status", (_req, res) => {
  const counts = {
    in_transit: randomInt(145, 180),
    delivered: randomInt(210, 260),
    delayed: randomInt(28, 45),
    pending: randomInt(42, 65),
    customs: randomInt(12, 24),
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const data = Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    percentage: parseFloat(((count / total) * 100).toFixed(1)),
  }));
  res.json({ data });
});

router.get("/logistics/fleet", (_req, res) => {
  const types = ["Truck", "Van", "Container Ship", "Air Freight", "Rail"];
  const statusOpts = ["active", "idle", "maintenance", "offline"] as const;
  const locations = ["Route 66", "Port LA", "DFW Hub", "Chicago Rail", "Miami Port", "Seattle Dock"];
  const drivers = ["J. Smith", "M. Chen", "A. Kumar", "L. Garcia", "K. Johnson", "P. Müller"];

  const fleet = Array.from({ length: 18 }, (_, i) => ({
    id: `veh-${i + 1}`,
    name: `${types[i % types.length]} ${String(i + 1).padStart(3, "0")}`,
    type: types[i % types.length],
    utilization: parseFloat(randomBetween(45, 98).toFixed(1)),
    status: statusOpts[i % 4],
    location: locations[i % locations.length],
    driver: drivers[i % drivers.length],
  }));
  res.json({ fleet });
});

export default router;
