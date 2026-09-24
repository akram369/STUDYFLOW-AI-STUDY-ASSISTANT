import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';
import { app } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = process.env.PORT || 3001;

// Production: serve built static files from dist/ if present or build automatically
const distPath = path.join(rootDir, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('[StudyFlow] Production bundle not found in dist/. Automatically building frontend with Vite...');
  try {
    execSync('npx vite build', { stdio: 'inherit', cwd: rootDir });
  } catch (err) {
    console.error('[StudyFlow] Automatic build failed:', err.message);
  }
}

if (fs.existsSync(distPath)) {
  app.use(expressStaticFallback(distPath));
}

function expressStaticFallback(staticDir) {
  return (req, res, next) => {
    // Only handle non-API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    const filePath = path.join(staticDir, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }
    return res.sendFile(path.join(staticDir, 'index.html'));
  };
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[StudyFlow API] Server running on http://localhost:${PORT}`);
    console.log(`[StudyFlow AI] Mode: ${process.env.AI_API_KEY ? 'Live (' + (process.env.AI_PROVIDER || 'gemini') + ')' : 'Intelligent Mock Engine'}`);
  });
}

export default app;
