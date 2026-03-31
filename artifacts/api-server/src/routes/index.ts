import { Router, type IRouter } from "express";
import healthRouter from "./health";
import overviewRouter from "./overview";
import inventoryRouter from "./inventory";
import logisticsRouter from "./logistics";
import suppliersRouter from "./suppliers";
import forecastRouter from "./forecast";
import productionRouter from "./production";
import costsRouter from "./costs";
import risksRouter from "./risks";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(overviewRouter);
router.use(inventoryRouter);
router.use(logisticsRouter);
router.use(suppliersRouter);
router.use(forecastRouter);
router.use(productionRouter);
router.use(costsRouter);
router.use(risksRouter);
router.use(ordersRouter);

export default router;
