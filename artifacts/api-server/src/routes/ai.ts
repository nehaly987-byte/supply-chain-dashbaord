import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ── Schema ────────────────────────────────────────────────────────────────────
const SCHEMA = {
  domains: [
    {
      name: "Inventory",
      color: "indigo",
      fields: ["sku", "category", "warehouse", "quantity", "reorderPoint", "maxStock", "unitCost", "status", "lastUpdated"],
    },
    {
      name: "Orders",
      color: "violet",
      fields: ["orderId", "customerId", "customer", "status", "value", "quantity", "orderDate", "deliveryDate", "region"],
    },
    {
      name: "Logistics",
      color: "cyan",
      fields: ["shipmentId", "origin", "destination", "carrier", "status", "estimatedDelivery", "actualDelivery", "weight", "cost"],
    },
    {
      name: "Suppliers",
      color: "emerald",
      fields: ["supplierId", "name", "country", "score", "leadTime", "onTimeRate", "defectRate", "spend", "category"],
    },
    {
      name: "Production",
      color: "amber",
      fields: ["lineId", "product", "plannedOutput", "actualOutput", "efficiency", "downtime", "shift", "date"],
    },
    {
      name: "Financial",
      color: "rose",
      fields: ["month", "revenue", "cost", "profit", "margin", "freight", "duties", "warehouse_cost", "labor"],
    },
    {
      name: "Forecast",
      color: "purple",
      fields: ["date", "demand", "supply", "forecast", "variance", "confidence", "category"],
    },
    {
      name: "Risks",
      color: "orange",
      fields: ["riskId", "type", "severity", "probability", "impact", "status", "region", "category", "daysOpen"],
    },
  ],
};

router.get("/ai/schema", (_req, res) => {
  res.json(SCHEMA);
});

// ── Grok proxy ────────────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  const schemaStr = SCHEMA.domains
    .map((d) => `${d.name}: ${d.fields.join(", ")}`)
    .join("\n");

  return `You are an expert data visualization assistant for a supply-chain analytics platform.
You will receive a natural language query from the user and must respond ONLY with valid JSON — no markdown, no explanation.

Available data schema:
${schemaStr}

Your response must be a JSON object with this exact structure:
{
  "charts": [
    {
      "id": "chart-1",
      "title": "Short chart title",
      "description": "One sentence describing what the chart shows",
      "type": "bar" | "line" | "area" | "pie" | "composed",
      "xKey": "field name for X-axis or category key",
      "dataKeys": ["field1", "field2"],
      "colors": ["#6366f1", "#06b6d4", "#10b981"],
      "data": [
        { "label or xKey value": "...", "field1": number, "field2": number }
      ]
    }
  ]
}

Rules:
- Return 2-3 charts that best visualize the requested insight
- data arrays should have 6-12 realistic mock data points using plausible supply-chain values
- For pie charts, use dataKeys: ["value"] and data objects: [{"name": "...", "value": number}]
- Keep titles concise (max 6 words)
- Use colors from this palette: #6366f1 (indigo), #06b6d4 (cyan), #10b981 (emerald), #f59e0b (amber), #ef4444 (red), #8b5cf6 (violet), #ec4899 (pink)
- Respond ONLY with the JSON object, nothing else`;
}

function buildMockCharts(prompt: string): object {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("revenue") || lowerPrompt.includes("financial") || lowerPrompt.includes("sales")) {
    return {
      charts: [
        {
          id: "chart-1",
          title: "Monthly Revenue vs Cost",
          description: "Comparison of revenue and operational costs over 12 months",
          type: "bar",
          xKey: "month",
          dataKeys: ["revenue", "cost", "profit"],
          colors: ["#6366f1", "#ef4444", "#10b981"],
          data: [
            { month: "Jan", revenue: 2800000, cost: 1680000, profit: 1120000 },
            { month: "Feb", revenue: 3100000, cost: 1820000, profit: 1280000 },
            { month: "Mar", revenue: 2950000, cost: 1740000, profit: 1210000 },
            { month: "Apr", revenue: 3400000, cost: 1950000, profit: 1450000 },
            { month: "May", revenue: 3800000, cost: 2100000, profit: 1700000 },
            { month: "Jun", revenue: 3650000, cost: 2050000, profit: 1600000 },
            { month: "Jul", revenue: 3200000, cost: 1900000, profit: 1300000 },
            { month: "Aug", revenue: 3550000, cost: 2020000, profit: 1530000 },
            { month: "Sep", revenue: 4100000, cost: 2280000, profit: 1820000 },
            { month: "Oct", revenue: 4350000, cost: 2400000, profit: 1950000 },
            { month: "Nov", revenue: 4800000, cost: 2600000, profit: 2200000 },
            { month: "Dec", revenue: 5200000, cost: 2800000, profit: 2400000 },
          ],
        },
        {
          id: "chart-2",
          title: "Revenue Trend Analysis",
          description: "12-month revenue growth trend with smoothed forecast",
          type: "area",
          xKey: "month",
          dataKeys: ["revenue", "forecast"],
          colors: ["#6366f1", "#8b5cf6"],
          data: [
            { month: "Jan", revenue: 2800000, forecast: 2750000 },
            { month: "Feb", revenue: 3100000, forecast: 2900000 },
            { month: "Mar", revenue: 2950000, forecast: 3050000 },
            { month: "Apr", revenue: 3400000, forecast: 3200000 },
            { month: "May", revenue: 3800000, forecast: 3500000 },
            { month: "Jun", revenue: 3650000, forecast: 3700000 },
            { month: "Jul", revenue: 3200000, forecast: 3900000 },
            { month: "Aug", revenue: 3550000, forecast: 4100000 },
            { month: "Sep", revenue: 4100000, forecast: 4300000 },
            { month: "Oct", revenue: 4350000, forecast: 4500000 },
            { month: "Nov", revenue: 4800000, forecast: 4700000 },
            { month: "Dec", revenue: 5200000, forecast: 5000000 },
          ],
        },
        {
          id: "chart-3",
          title: "Cost Breakdown by Category",
          description: "Distribution of operational costs across departments",
          type: "pie",
          xKey: "name",
          dataKeys: ["value"],
          colors: ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"],
          data: [
            { name: "Logistics", value: 8400000 },
            { name: "Labor", value: 6200000 },
            { name: "Warehouse", value: 4800000 },
            { name: "Procurement", value: 7100000 },
            { name: "Duties & Taxes", value: 2100000 },
          ],
        },
      ],
    };
  }

  if (lowerPrompt.includes("inventory") || lowerPrompt.includes("stock")) {
    return {
      charts: [
        {
          id: "chart-1",
          title: "Stock Levels by Category",
          description: "Current inventory vs target and minimum safety stock",
          type: "bar",
          xKey: "category",
          dataKeys: ["current", "target", "minimum"],
          colors: ["#6366f1", "#06b6d4", "#ef4444"],
          data: [
            { category: "Electronics", current: 1250, target: 1500, minimum: 300 },
            { category: "Raw Materials", current: 820, target: 1000, minimum: 200 },
            { category: "Finished Goods", current: 2100, target: 1800, minimum: 400 },
            { category: "Packaging", current: 340, target: 600, minimum: 150 },
            { category: "Chemicals", current: 180, target: 400, minimum: 100 },
            { category: "Machinery", current: 95, target: 200, minimum: 50 },
          ],
        },
        {
          id: "chart-2",
          title: "Inventory Turnover Rate",
          description: "Monthly inventory turnover ratio over the past year",
          type: "line",
          xKey: "month",
          dataKeys: ["turnover", "benchmark"],
          colors: ["#10b981", "#f59e0b"],
          data: [
            { month: "Jan", turnover: 4.2, benchmark: 5.0 },
            { month: "Feb", turnover: 4.8, benchmark: 5.0 },
            { month: "Mar", turnover: 5.1, benchmark: 5.0 },
            { month: "Apr", turnover: 4.6, benchmark: 5.0 },
            { month: "May", turnover: 5.4, benchmark: 5.0 },
            { month: "Jun", turnover: 5.8, benchmark: 5.0 },
            { month: "Jul", turnover: 4.9, benchmark: 5.0 },
            { month: "Aug", turnover: 5.2, benchmark: 5.0 },
            { month: "Sep", turnover: 6.1, benchmark: 5.0 },
            { month: "Oct", turnover: 5.7, benchmark: 5.0 },
            { month: "Nov", turnover: 6.3, benchmark: 5.0 },
            { month: "Dec", turnover: 7.1, benchmark: 5.0 },
          ],
        },
        {
          id: "chart-3",
          title: "Stock Status Distribution",
          description: "Proportion of SKUs by stock health status",
          type: "pie",
          xKey: "name",
          dataKeys: ["value"],
          colors: ["#10b981", "#f59e0b", "#ef4444", "#6366f1"],
          data: [
            { name: "Normal", value: 68 },
            { name: "Low Stock", value: 18 },
            { name: "Critical", value: 7 },
            { name: "Overstock", value: 7 },
          ],
        },
      ],
    };
  }

  // Default / generic
  return {
    charts: [
      {
        id: "chart-1",
        title: "Supply Chain Performance",
        description: "Key performance metrics across supply chain operations",
        type: "bar",
        xKey: "metric",
        dataKeys: ["current", "target"],
        colors: ["#6366f1", "#06b6d4"],
        data: [
          { metric: "On-Time Delivery", current: 94.2, target: 97 },
          { metric: "Fill Rate", current: 96.8, target: 98 },
          { metric: "Supplier Score", current: 87.5, target: 90 },
          { metric: "Forecast Accuracy", current: 82.3, target: 88 },
          { metric: "Order Cycle Time", current: 78.0, target: 85 },
        ],
      },
      {
        id: "chart-2",
        title: "Monthly Operations Trend",
        description: "Volume and efficiency trends across the past 6 months",
        type: "line",
        xKey: "month",
        dataKeys: ["orders", "shipments", "returns"],
        colors: ["#6366f1", "#10b981", "#ef4444"],
        data: [
          { month: "Jul", orders: 1240, shipments: 1180, returns: 42 },
          { month: "Aug", orders: 1380, shipments: 1320, returns: 38 },
          { month: "Sep", orders: 1520, shipments: 1490, returns: 51 },
          { month: "Oct", orders: 1690, shipments: 1640, returns: 47 },
          { month: "Nov", orders: 1820, shipments: 1780, returns: 63 },
          { month: "Dec", orders: 2140, shipments: 2090, returns: 88 },
        ],
      },
      {
        id: "chart-3",
        title: "Risk Distribution by Type",
        description: "Open risks categorized by domain area",
        type: "pie",
        xKey: "name",
        dataKeys: ["value"],
        colors: ["#ef4444", "#f59e0b", "#8b5cf6", "#06b6d4", "#10b981"],
        data: [
          { name: "Supplier", value: 34 },
          { name: "Logistics", value: 28 },
          { name: "Demand", value: 19 },
          { name: "Compliance", value: 12 },
          { name: "Other", value: 7 },
        ],
      },
    ],
  };
}

router.post("/ai/grok", async (req, res) => {
  const { prompt } = req.body as { prompt?: string };

  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  const apiKey = process.env.GROK_API_KEY;

  // If no API key, use mock
  if (!apiKey) {
    const mock = buildMockCharts(prompt);
    return res.json({ ...mock, mock: true });
  }

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Grok API error:", errText);
      // Fallback to mock on API error
      const mock = buildMockCharts(prompt);
      return res.json({ ...mock, mock: true, error: "Grok API unavailable" });
    }

    const grokData = await response.json() as any;
    const content = grokData.choices?.[0]?.message?.content ?? "";

    // Parse the JSON from Grok response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in Grok response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return res.json(parsed);
  } catch (err) {
    console.error("Grok parsing error:", err);
    const mock = buildMockCharts(prompt);
    return res.json({ ...mock, mock: true });
  }
});

export default router;
