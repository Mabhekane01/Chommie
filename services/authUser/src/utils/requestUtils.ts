// src/utils/requestUtils.ts
import { Request } from "express";

export function getRequestId(req: Request): string {
  return (req.headers["x-request-id"] as string) || "unknown";
}
