import { app } from './src/apiApp.js';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

// Integrate Vite Middleware & start local listener
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(expressStaticFallback(distPath));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FanPilot AI Server running on http://localhost:${PORT}`);
  });
}

// Helper to serve static files for SPA in production
import express from 'express';
function expressStaticFallback(distPath: string) {
  const router = express.Router();
  router.use(express.static(distPath));
  router.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  return router;
}

startServer();
