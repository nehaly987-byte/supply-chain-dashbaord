import { Router, type IRouter } from "express";

const router: IRouter = Router();

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max));
}

router.get("/production/output", (req, res) => {
  const period = (req.query.period as string) || "30d";
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const lines = ["Line A", "Line B", "Line C"];

  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - i));
    const date = `${d.getMonth() + 1}/${d.getDate()}`;
    const line = lines[i % lines.length];
    const planned = randomInt(800, 1200);
    const actual = randomInt(planned * 0.8, planned * 1.05);
    const defects = randomInt(0, Math.floor(actual * 0.04));
    return { date, planned, actual, defects, line };
  });
  res.json({ data });
});

router.get("/production/machines", (_req, res) => {
  const machineNames = [
    "CNC Mill 1", "CNC Mill 2", "Injection Molder A", "Injection Molder B",
    "Lathe 1", "Lathe 2", "Assembly Robot 1", "Assembly Robot 2",
    "Press Machine 1", "Welding Unit A", "QC Scanner 1", "Conveyor System A",
  ];
  const statusOpts = ["running", "idle", "maintenance", "fault"] as const;
  const lines = ["Line A", "Line B", "Line C", "Line D"];

  const machines = machineNames.map((name, i) => {
    const status = i < 8 ? "running" : statusOpts[i % 4];
    const now = new Date();
    const lastMaint = new Date(now);
    lastMaint.setDate(lastMaint.getDate() - randomInt(5, 60));
    const nextMaint = new Date(now);
    nextMaint.setDate(nextMaint.getDate() + randomInt(3, 45));

    return {
      id: `mach-${i + 1}`,
      name,
      line: lines[i % lines.length],
      utilization: parseFloat(randomBetween(45, 97).toFixed(1)),
      efficiency: parseFloat(randomBetween(78, 99).toFixed(1)),
      status,
      lastMaintenance: lastMaint.toISOString().split("T")[0],
      nextMaintenance: nextMaint.toISOString().split("T")[0],
      defectRate: parseFloat(randomBetween(0.2, 4.5).toFixed(2)),
    };
  });
  res.json({ machines });
});

router.get("/production/downtime", (_req, res) => {
  const machineNames = ["CNC Mill 1", "Injection Molder A", "Press Machine 1", "Welding Unit A", "Assembly Robot 1"];
  const reasons = ["Scheduled Maintenance", "Equipment Failure", "Power Outage", "Material Shortage", "Operator Training", "Quality Check"];
  const severities = ["low", "medium", "high", "critical"] as const;

  const events = Array.from({ length: 12 }, (_, i) => {
    const startHour = randomInt(0, 20);
    const duration = randomInt(1, 8);
    const now = new Date();
    const dayOffset = randomInt(-7, 0);
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() + dayOffset);
    startTime.setHours(startHour, 0, 0, 0);

    const isOngoing = i === 0;
    const endTime = isOngoing ? null : new Date(startTime.getTime() + duration * 3600 * 1000).toISOString();

    const machineId = `mach-${(i % 5) + 1}`;
    return {
      id: `dt-${i + 1}`,
      machineId,
      machineName: machineNames[i % machineNames.length],
      startTime: startTime.toISOString(),
      endTime,
      reason: reasons[i % reasons.length],
      severity: severities[i % severities.length],
      impactHours: parseFloat(randomBetween(0.5, 8).toFixed(1)),
    };
  });
  res.json({ events });
});

export default router;
