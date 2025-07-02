// src/middlewares/requestId.ts

/*
This is your helper greeter at the door of your app.

When a request comes in, it:

🎫 Gives it a ticket number (requestId)

🕓 Writes down the time it arrived

👣 Checks where it came from (IP)

🧠 Checks what device is calling

📎 Attaches that info to the request

✅ Lets the rest of your app do its jobS
*/

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const attachRequestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.requestId = (req.headers["x-request-id"] as string) || randomUUID();
  req.startTime = Date.now();
  req.clientIp = req.ip || req.connection.remoteAddress || "unknown";
  req.userAgent = req.get("User-Agent") || "unknown";

  // Set response header for tracing
  res.setHeader("X-Request-ID", req.requestId);

  next();
};
