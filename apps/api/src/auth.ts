import type { MiddlewareHandler } from "hono";

export const createAdminGuard = (adminToken: string): MiddlewareHandler => {
  return async (c, next) => {
    const token = c.req.header("x-admin-token");

    if (!adminToken || token !== adminToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
  };
};
