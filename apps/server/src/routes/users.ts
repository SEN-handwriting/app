import { Hono } from "hono";

const usersRoutes = new Hono().get("/me", async c => {});

export default usersRoutes;
