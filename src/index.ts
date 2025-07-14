import express from "express";
import * as dotenv from "dotenv";
import { globalErrorHandler } from "./middleware/errorHandler";
import userRoutes from "./router/user";
import morgan from "morgan";
import shopRoutes from "./router/shop";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("dev"));
app.get("/", (_req, res) => {
  res.json({ message: "Hello from Express + TypeScript!" });
});
app.use("/api/auth", userRoutes);
app.use("/api/shop", shopRoutes);
app.use(globalErrorHandler);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
