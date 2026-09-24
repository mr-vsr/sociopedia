import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import { upload, ASSETS_DIR } from "./middleware/upload.js";
import { errorHandler, notFound } from "./middleware/errors.js";

/* CONFIGURATIONS */
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Add it to server/.env");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined)
);

app.use("/assets", express.static(ASSETS_DIR, { maxAge: "7d" }));

/* HEALTH */
app.get("/health", (req, res) =>
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 })
);

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

app.use(notFound);
app.use(errorHandler);

/* MONGOOSE SETUP */
mongoose.set("strictQuery", true);
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME: `npm run seed` */
  })
  .catch((error) => {
    console.error(`${error} did not connect`);
    process.exit(1);
  });

export default app;
