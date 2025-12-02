import app from "./server";

export default {
  fetch: app.fetch,
  port: process.env.PORT,
};
