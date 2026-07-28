import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { appStore } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'Cloud SQL (PostgreSQL)' });
  });

  // Get all store data (online sync)
  app.get('/api/store/all', async (req, res) => {
    try {
      const rows = await db.select().from(appStore);
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
      const rows = await db.select().from(appStore).where(eq(appStore.key, key));
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

      await db
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
        });

      res.json({ success: true, key });
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

      res.json({ success: true, count: items.length });
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
