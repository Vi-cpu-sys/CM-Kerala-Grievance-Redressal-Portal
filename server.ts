import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

export async function createApp() {
  const app = express();

  // Security Headers via Helmet (configured to allow Vite scripts and styles)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for seamless Vite SPA inline scripts in development
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );

  // Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    return res.json({
      status: 'ok',
      service: 'Kerala CMO Public Grievance Redressal Portal API',
      version: '1.0.0-prototype',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // REST API Routes under /api/v1
  app.use('/api/v1', apiRouter);

  // Frontend Dev Server (Vite middlewares) or Static Prod Servicing
  if (process.env.NODE_ENV !== 'test') {
    if (!isProd) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.resolve(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  createApp().then(app => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Kerala CMO Grievance Portal server running on http://0.0.0.0:${PORT}`);
    });
  });
}
