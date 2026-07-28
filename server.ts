import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { withDbRetry } from './src/db/index.ts';
import { appStore } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Enable CORS for mobile browsers and external cross-origin connections
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'Cloud SQL (PostgreSQL)' });
  });

  let sseClients: express.Response[] = [];

  function broadcastSyncEvent(key?: string) {
    const data = JSON.stringify({ type: 'sync', key: key || 'all', timestamp: Date.now() });
    sseClients.forEach((client) => {
      try {
        client.write(`data: ${data}\n\n`);
      } catch {}
    });
  }

  // SSE Realtime Push Event Stream (Instant delivery across mobile and desktop devices)
  app.get('/api/store/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    sseClients.push(res);
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

    const keepAlive = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(keepAlive);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients = sseClients.filter((c) => c !== res);
    });
  });

  // Get all store data (online sync)
  app.get('/api/store/all', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    try {
      const rows = await withDbRetry((db) => db.select().from(appStore));
      const result: Record<string, any> = {};
      rows.forEach((row) => {
        result[row.key] = row.data;
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error fetching appStore:', error);
      res.status(500).json({ error: 'Failed to fetch database store', details: error.message });
    }
  });

  // Get single store key
  app.get('/api/store/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const rows = await withDbRetry((db) => db.select().from(appStore).where(eq(appStore.key, key)));
      if (rows.length === 0) {
        return res.json({ success: true, data: null });
      }
      res.json({ success: true, data: rows[0].data });
    } catch (error: any) {
      console.error(`Error fetching key ${req.params.key}:`, error);
      res.status(500).json({ error: 'Failed to fetch key from store', details: error.message });
    }
  });

  // Set single store key
  app.post('/api/store/set', async (req, res) => {
    try {
      const { key, data } = req.body;
      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      await withDbRetry((db) =>
        db
          .insert(appStore)
          .values({
            key,
            data,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: appStore.key,
            set: {
              data,
              updatedAt: new Date(),
            },
          })
      );

      res.json({ success: true, key });
      broadcastSyncEvent(key);
    } catch (error: any) {
      console.error('Error saving to appStore:', error);
      res.status(500).json({ error: 'Failed to save to store', details: error.message });
    }
  });

  // Bulk set store keys
  app.post('/api/store/bulk-set', async (req, res) => {
    try {
      const { items } = req.body; // Array of { key, data }
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required' });
      }

      await withDbRetry(async (db) => {
        for (const item of items) {
          if (item.key) {
            await db
              .insert(appStore)
              .values({
                key: item.key,
                data: item.data,
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: appStore.key,
                set: {
                  data: item.data,
                  updatedAt: new Date(),
                },
              });
          }
        }
      });

      res.json({ success: true, count: items.length });
      broadcastSyncEvent('bulk');
    } catch (error: any) {
      console.error('Error bulk saving to appStore:', error);
      res.status(500).json({ error: 'Failed to bulk save to store', details: error.message });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cloud SQL backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
