import type { NextFunction , Request, Response} from "express"

export function requestLoggerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  // Use req.socket.remoteAddress instead of req.ip and handle potential undefined
  const ip = req.socket.remoteAddress ? req.socket.remoteAddress : "unknown";

  console.log(`[${timestamp}] ${method} ${url} from ${ip}`);
  next();
}
