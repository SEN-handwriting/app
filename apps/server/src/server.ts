import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import { serveStatic } from "hono/bun";

const app = new Hono()
  .use(
    "*",
    cors({
      origin: process.env.WEBAPP_URL!,
      credentials: true,
    })
  )
  .use("/static/*", serveStatic({ root: "./" }))
  .get("/", c => {
    return c.json("Hello!");
  })
  .route("/api/auth", authRoutes)
  .route("/users", usersRoutes);

export default app;

export type App = typeof app;
