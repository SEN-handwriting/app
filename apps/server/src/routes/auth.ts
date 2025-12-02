import { Hono } from "hono";
import { auth } from "@repo/auth/server";

const authRoutes = new Hono().on(["POST", "GET"], "/*", c =>
  auth.handler(c.req.raw)
);

export default authRoutes;
