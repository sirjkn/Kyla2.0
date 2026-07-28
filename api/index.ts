import express from 'express';
import { withDbRetry } from '../src/db/index';
import { appStore } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const app = express();

app.use(express.json({ limit: '10mb' }));

// Enable CORS
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

// Get all store data
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
    console.error('Error fetching appStore on Vercel:', error);
    res.status(500).json({ error: 'Failed to fetch store data', details: error.message });
  }
});

// Get single key
app.get('/api/store/:key', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const { key } = req.params;
    const rows = await withDbRetry((db) => db.select().from(appStore).where(eq(appStore.key, key)));
    if (rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: rows[0].data });
  } catch (error: any) {
    console.error('Error fetching key on Vercel:', error);
    res.status(500).json({ error: 'Failed to fetch key', details: error.message });
  }
});

// Save single key
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
  } catch (error: any) {
    console.error('Error saving to appStore on Vercel:', error);
    res.status(500).json({ error: 'Failed to save to store', details: error.message });
  }
});

// Bulk save keys
app.post('/api/store/bulk-set', async (req, res) => {
  try {
    const { items } = req.body;
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
  } catch (error: any) {
    console.error('Error bulk saving to appStore on Vercel:', error);
    res.status(500).json({ error: 'Failed to bulk save to store', details: error.message });
  }
});

export default app;
