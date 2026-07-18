import express from 'express';
import { securityAndRoutingMiddleware } from './server/middleware.js';
import { router as apiRouter } from './server/routes.js';
import { loadApiKey } from './server/config.js';
import { stadiumKnowledge, getSmartLocalResponse } from './server/stadiumData.js';
import { ai } from './server/gemini.js';

const app = express();
app.use(express.json());

// Set up security headers, normalization, and Netlify routing middlewares
app.use(securityAndRoutingMiddleware);

// Mount core endpoints
app.use('/api', apiRouter);

// Export parameters and utilities for server listeners and testing frameworks
export { app, stadiumKnowledge, ai, loadApiKey, getSmartLocalResponse };
