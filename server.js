import express from 'express';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Persistent data directory on Fly.io (mounted volume at /data) or local ./data
const DATA_DIR = process.env.DATA_DIR || (process.env.NODE_ENV === 'production' ? '/data' : path.join(__dirname, 'data'));
const DATA_FILE = path.join(DATA_DIR, 'regimen_data.json');
const BACKUP_FILE = path.join(DATA_DIR, 'regimen_data.backup.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`[Storage] Created data directory at: ${DATA_DIR}`);
  } catch (err) {
    console.error(`[Storage] Failed to create data directory ${DATA_DIR}:`, err);
  }
}

// Middleware
app.use(express.json({ limit: '25mb' }));

// Security & Caching Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Optional PIN verification middleware if APP_PIN env is configured
const configuredPin = process.env.APP_PIN;
const verifyPin = (req, res, next) => {
  if (!configuredPin) {
    return next();
  }
  const pinHeader = req.headers['x-app-pin'];
  if (pinHeader !== configuredPin) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing PIN' });
  }
  next();
};

// Health Check Endpoints (used by Fly.io machine monitoring)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptimeSec: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    dataDir: DATA_DIR,
    dataFileExists: fs.existsSync(DATA_FILE),
    pinConfigured: !!configuredPin
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// GET /api/data - Retrieve all user training state from Fly.io cloud storage
app.get('/api/data', verifyPin, async (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(200).json({
        exists: false,
        data: null,
        message: 'No cloud state found yet. Initial sync will create baseline.'
      });
    }

    const content = await fsPromises.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return res.status(200).json({
      exists: true,
      updatedAt: parsed.updatedAt || null,
      data: parsed.data || parsed
    });
  } catch (err) {
    console.error('[API] Error reading cloud data:', err);
    return res.status(500).json({ error: 'Failed to read data from cloud storage' });
  }
});

// POST /api/data - Atomically save user training state to Fly.io cloud storage
app.post('/api/data', verifyPin, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.data) {
      return res.status(400).json({ error: 'Invalid payload: data object required' });
    }

    const record = {
      updatedAt: new Date().toISOString(),
      data: payload.data
    };

    const serialized = JSON.stringify(record, null, 2);

    // Atomic write pattern: write to temporary file first, then rename
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    await fsPromises.writeFile(tempFile, serialized, 'utf-8');

    // If main data file already exists, create a backup copy before replacing
    if (fs.existsSync(DATA_FILE)) {
      try {
        await fsPromises.copyFile(DATA_FILE, BACKUP_FILE);
      } catch (backupErr) {
        console.warn('[Storage] Warning: Could not create backup snapshot:', backupErr);
      }
    }

    await fsPromises.rename(tempFile, DATA_FILE);
    console.log(`[Storage] Successfully saved cloud state to ${DATA_FILE} (${serialized.length} bytes)`);

    return res.status(200).json({
      success: true,
      updatedAt: record.updatedAt,
      bytes: serialized.length
    });
  } catch (err) {
    console.error('[API] Error saving cloud data:', err);
    return res.status(500).json({ error: 'Failed to write data to cloud storage' });
  }
});

// GET /api/export - Direct download of latest cloud backup
app.get('/api/export', verifyPin, (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.status(404).json({ error: 'No data file found to export' });
  }
  const filename = `capacity_program_fly_backup_${new Date().toISOString().split('T')[0]}.json`;
  res.download(DATA_FILE, filename);
});

// Serve compiled static frontend
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  // Static assets with caching
  app.use(express.static(distPath, {
    maxAge: '7d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        // Do not cache HTML to ensure instant updates
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
    }
  }));

  // SPA client-side fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('[Warning] dist directory not found. Please run npm run build.');
  app.get('/', (req, res) => {
    res.send('Physical Capacity Regimen API server running. Run "npm run build" to build frontend.');
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(` Physical Capacity Regimen Production Server    `);
  console.log(` Port: ${PORT}                                  `);
  console.log(` Data Directory: ${DATA_DIR}                    `);
  console.log(` Persistent File: ${DATA_FILE}                  `);
  console.log(` PIN Protection: ${configuredPin ? 'Enabled' : 'Disabled'} `);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'} `);
  console.log(`=================================================`);
});
