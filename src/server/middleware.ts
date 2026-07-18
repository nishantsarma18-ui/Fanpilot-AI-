import { Request, Response, NextFunction } from 'express';

export function securityAndRoutingMiddleware(req: Request, res: Response, next: NextFunction) {
  // Add robust security headers to protect against clickjacking, sniff attacks, and cross-site scripting
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  } else if (
    !req.url.startsWith('/api') &&
    (req.url.startsWith('/copilot') || req.url.startsWith('/translate') || req.url.startsWith('/navigation'))
  ) {
    req.url = '/api' + req.url;
  }
  next();
}

// Helper to safely clean and parse JSON response from LLM, removing any markdown formatting backticks
export function parseCleanJson(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return JSON.parse(cleaned.trim());
}
