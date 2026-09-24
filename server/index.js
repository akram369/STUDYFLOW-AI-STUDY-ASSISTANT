import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GenerateRequestSchema } from './ai/schemas.js';
import { generateStudyContent } from './ai/provider.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health and provider info
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.trim().length > 0);
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  res.json({
    status: 'ok',
    mode: hasKey ? `live-${provider}` : 'mock-engine',
    hasApiKey: hasKey,
    provider: hasKey ? provider : 'intelligent-mock',
  });
});

// Generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const parseResult = GenerateRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        errorType: 'BAD_REQUEST',
        message: 'Invalid request parameters',
        details: parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
      });
    }

    const { input, mode, difficulty, simulationMode } = parseResult.data;

    const result = await generateStudyContent({
      input,
      mode,
      difficulty,
      simulationMode,
    });

    return res.json({
      success: true,
      raw: result.raw,
      mode,
      difficulty,
    });
  } catch (error) {
    console.error('[API Error in /api/generate]:', error.message);
    const status = error.status || 500;
    
    let errorType = 'API_ERROR';
    if (status === 429) errorType = 'RATE_LIMIT';
    if (status === 504) errorType = 'TIMEOUT';

    return res.status(status).json({
      success: false,
      errorType,
      message: error.message || 'An unexpected error occurred while communicating with the study engine.',
    });
  }
});

// Production: serve built static files from dist/ if present
const distPath = path.join(rootDir, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[StudyFlow API] Server running on http://localhost:${PORT}`);
  console.log(`[StudyFlow AI] Mode: ${process.env.AI_API_KEY ? 'Live (' + (process.env.AI_PROVIDER || 'gemini') + ')' : 'Intelligent Mock Engine'}`);
});
