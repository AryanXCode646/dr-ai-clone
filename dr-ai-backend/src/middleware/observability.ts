import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface ObservableRequest extends Request {
  id?: string;
  startTime?: number;
}

export const requestLogger = (req: ObservableRequest, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = requestId;
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    const latency = Date.now() - (req.startTime || Date.now());
    // Safe structured log: only metadata, never req.body with credentials/PII
    console.log(
      JSON.stringify({
        requestId,
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        latencyMs: latency,
        ip: req.ip || req.socket.remoteAddress,
      })
    );
  });

  next();
};
