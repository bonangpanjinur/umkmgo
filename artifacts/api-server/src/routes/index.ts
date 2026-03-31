import { type IRouter, Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import categoriesRouter from "./categories.js";
import storesRouter from "./stores.js";
import productsRouter from "./products.js";
import analyticsRouter from "./analytics.js";
import adminRouter from "./admin.js";
import ticketsRouter from "./tickets.js";
import flagsRouter from "./flags.js";
import ordersRouter from "./orders.js";
import customersRouter from "./customers.js";
import domainsRouter from "./domains.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(storesRouter);
router.use(productsRouter);
router.use(analyticsRouter);
router.use(adminRouter);
router.use(ticketsRouter);
router.use(flagsRouter);
router.use(ordersRouter);
router.use(customersRouter);
router.use(domainsRouter);

export default router;
