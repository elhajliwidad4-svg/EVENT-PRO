import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { handleApiRequest } from './functions/_lib/router.ts';
import {
  INITIAL_CATEGORIES,
  INITIAL_GALLERY,
  INITIAL_SERVICES,
  INITIAL_SETTINGS,
  INITIAL_TESTIMONIALS,
} from './functions/_lib/seedData.ts';
import type { D1DatabaseLike, D1PreparedStatementLike, Env, R2BucketLike } from './functions/_lib/types.ts';

type Row = Record<string, unknown>;
type Store = Record<string, Row[]>;

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'local-d1.json');
const R2_DIR = path.join(DATA_DIR, 'r2');

function ensureDirs(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(R2_DIR, { recursive: true });
}

function createInitialStore(): Store {
  const now = new Date().toISOString();
  return {
    users: [],
    admin_roles: [],
    customers: [],
    service_categories: INITIAL_CATEGORIES.map((c) => ({ ...c, is_active: 1, created_at: now, updated_at: now })),
    services: INITIAL_SERVICES.map((s) => ({ ...s, created_at: now, updated_at: now })),
    bookings: [],
    booking_services: [],
    quotes: [],
    quote_items: [],
    contact_messages: [],
    gallery_images: INITIAL_GALLERY.map((g) => ({ ...g, r2_key: null, created_at: now, updated_at: now })),
    testimonials: INITIAL_TESTIMONIALS.map((t) => ({ ...t, created_at: now })),
    notifications: [],
    company_settings: [{ ...INITIAL_SETTINGS, updated_at: now }],
  };
}

function loadStore(): Store {
  ensureDirs();
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialStore();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as Store;
    const base = createInitialStore();
    for (const key of Object.keys(base)) {
      if (!Array.isArray(parsed[key])) {
        parsed[key] = base[key];
      }
    }
    return parsed;
  } catch {
    return createInitialStore();
  }
}

function saveStore(store: Store): void {
  ensureDirs();
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
}

function createLocalD1(): D1DatabaseLike {
  const store = loadStore();

  const execute = (query: string, params: unknown[]) => {
    const sql = query.replace(/\s+/g, ' ').trim();

    // SELECT
    const selectMatch = sql.match(/^SELECT (.+?) FROM ([a-z_]+)(?: WHERE (.+?))?(?: ORDER BY ([a-z_]+) (ASC|DESC))?$/i);
    if (selectMatch) {
      const [, colsRaw, table, whereClause, orderCol, orderDir] = selectMatch;
      let rows = [...(store[table] || [])];
      if (whereClause) {
        const parts = whereClause.split(/ AND /i);
        rows = rows.filter((row) =>
          parts.every((part, idx) => {
            const m = part.trim().match(/^([a-z_]+)\s*=\s*\?$/i);
            if (!m) return true;
            return row[m[1]] === params[idx];
          })
        );
      }
      if (orderCol) {
        rows.sort((a, b) => {
          const av = a[orderCol];
          const bv = b[orderCol];
          if (av === bv) return 0;
          if (av === null || av === undefined) return 1;
          if (bv === null || bv === undefined) return -1;
          const cmp = av < bv ? -1 : 1;
          return orderDir.toUpperCase() === 'DESC' ? -cmp : cmp;
        });
      }
      if (colsRaw.trim() !== '*') {
        const cols = colsRaw.split(',').map((c) => c.trim());
        rows = rows.map((r) => {
          const obj: Row = {};
          for (const c of cols) obj[c] = r[c];
          return obj;
        });
      }
      return { rows, changes: 0 };
    }

    // INSERT
    const insertMatch = sql.match(/^INSERT INTO ([a-z_]+) \((.+?)\) VALUES \((.+?)\)$/i);
    if (insertMatch) {
      const [, table, colsRaw] = insertMatch;
      const cols = colsRaw.split(',').map((c) => c.trim());
      const newRow: Row = {};
      cols.forEach((col, idx) => {
        newRow[col] = params[idx] ?? null;
      });
      if (!store[table]) store[table] = [];
      store[table].push(newRow);
      saveStore(store);
      return { rows: [], changes: 1 };
    }

    // UPDATE
    const updateMatch = sql.match(/^UPDATE ([a-z_]+) SET (.+?) WHERE ([a-z_]+)\s*=\s*\?$/i);
    if (updateMatch) {
      const [, table, setRaw, whereCol] = updateMatch;
      const setCols = setRaw.split(',').map((s) => s.trim().replace(/\s*=\s*\?$/, ''));
      const whereVal = params[setCols.length];
      let changes = 0;
      store[table] = (store[table] || []).map((row) => {
        if (row[whereCol] === whereVal) {
          changes++;
          const updated = { ...row };
          setCols.forEach((col, idx) => {
            updated[col] = params[idx] ?? null;
          });
          return updated;
        }
        return row;
      });
      saveStore(store);
      return { rows: [], changes };
    }

    // DELETE
    const deleteMatch = sql.match(/^DELETE FROM ([a-z_]+) WHERE ([a-z_]+)\s*=\s*\?$/i);
    if (deleteMatch) {
      const [, table, whereCol] = deleteMatch;
      const before = (store[table] || []).length;
      store[table] = (store[table] || []).filter((row) => row[whereCol] !== params[0]);
      const changes = before - store[table].length;
      saveStore(store);
      return { rows: [], changes };
    }

    throw new Error(`Unsupported local D1 query: ${sql}`);
  };

  return {
    prepare(query: string): D1PreparedStatementLike {
      let bound: unknown[] = [];
      const stmt: D1PreparedStatementLike = {
        bind(...values: unknown[]) {
          bound = values;
          return stmt;
        },
        async first<T = Row>() {
          const { rows } = execute(query, bound);
          return (rows[0] as T) || null;
        },
        async all<T = Row>() {
          const { rows } = execute(query, bound);
          return { results: rows as T[], success: true };
        },
        async run() {
          const { changes } = execute(query, bound);
          return { success: true, meta: { changes } };
        },
      };
      return stmt;
    },
  };
}

function createLocalR2(): R2BucketLike {
  ensureDirs();
  return {
    async put(key, value, options) {
      const safeName = key.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = path.join(R2_DIR, safeName);
      const buf =
        value instanceof ArrayBuffer
          ? Buffer.from(value)
          : typeof value === 'string'
            ? Buffer.from(value)
            : Buffer.from(value);
      fs.writeFileSync(filePath, buf);
      fs.writeFileSync(
        `${filePath}.meta.json`,
        JSON.stringify({ contentType: options?.httpMetadata?.contentType || 'image/jpeg' })
      );
    },
    async get(key) {
      const safeName = key.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = path.join(R2_DIR, safeName);
      if (!fs.existsSync(filePath)) return null;
      const data = fs.readFileSync(filePath);
      let contentType = 'image/jpeg';
      if (fs.existsSync(`${filePath}.meta.json`)) {
        try {
          contentType = JSON.parse(fs.readFileSync(`${filePath}.meta.json`, 'utf-8')).contentType || contentType;
        } catch {
          // ignore
        }
      }
      return {
        body: new Uint8Array(data),
        httpMetadata: { contentType },
      };
    },
    async delete(key) {
      const safeName = key.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = path.join(R2_DIR, safeName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(`${filePath}.meta.json`)) fs.unlinkSync(`${filePath}.meta.json`);
    },
  };
}

async function startDevServer() {
  const app = express();
  const db = createLocalD1();
  const r2 = createLocalR2();

  const env: Env = {
    DB: db,
    R2_BUCKET: r2,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ADMIN_BOOTSTRAP_PASSCODE: process.env.ADMIN_BOOTSTRAP_PASSCODE,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    ENVIRONMENT: 'development',
    APP_URL: process.env.APP_URL,
  };

  // Bridge /api/* requests to the Cloudflare Pages Functions router
  app.use('/api', async (req, res) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const rawBody = Buffer.concat(chunks);
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      const fullUrl = `${protocol}://${host}${req.originalUrl}`;

      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string') headers.set(k, v);
        else if (Array.isArray(v)) headers.set(k, v.join(', '));
      }

      const webRequest = new Request(fullUrl, {
        method: req.method,
        headers,
        body: req.method === 'GET' || req.method === 'HEAD' ? undefined : rawBody,
      });

      const webResponse = await handleApiRequest(webRequest, env);
      res.status(webResponse.status);
      webResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const outBuf = Buffer.from(await webResponse.arrayBuffer());
      res.send(outBuf);
    } catch (err) {
      console.error('API bridge error:', err);
      res.status(500).json({ error: 'Erreur interne du serveur local.' });
    }
  });

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(3000, '0.0.0.0', () => {
    console.log('EVENT PRO dev server listening on http://localhost:3000');
  });
}

startDevServer();
