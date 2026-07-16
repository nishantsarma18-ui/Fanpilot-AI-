import serverless from 'serverless-http';
import { app } from '../../src/apiApp.js';

export const handler = serverless(app);
