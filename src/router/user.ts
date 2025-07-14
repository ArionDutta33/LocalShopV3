import { Router } from "express";
import { loginUser, registerUser } from "../controller/user";
import { isAuthenticated } from "../middleware/isAuthenticated";
const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/ping", isAuthenticated, (req, res) => {
  res.send("Hello");
});

export default router;
