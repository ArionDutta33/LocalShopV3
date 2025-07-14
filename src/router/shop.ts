import { Router } from "express";
import { followShop } from "../controller/shop";
import { isAuthenticated } from "../middleware/isAuthenticated";
const router = Router();
router.post("/:id/follow", isAuthenticated, followShop);
router.get("/");
export default router;
