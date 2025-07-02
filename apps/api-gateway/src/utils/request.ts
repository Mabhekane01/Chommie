import { Request } from "express";

export const getRequestContext = (req: Request) => ({
  requestId: (req.headers["x-request-id"] as string) || "unknown",
  clientIp: (req.headers["x-client-ip"] as string) || req.ip || "unknown",
  userAgent: (req.headers["user-agent"] as string) || "unknown",
});
