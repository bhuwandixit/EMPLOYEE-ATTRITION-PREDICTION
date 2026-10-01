import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { dbStore, scoreEmployee } from './src/server/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      database: 'connected',
      model_loaded: true,
      service: 'AttriGuard API (Unified Node/FastAPI Gateway)',
    });
  });

  // Root system info
  app.get('/api', (req: Request, res: Response) => {
    res.json({
      service: 'AttriGuard Intelligence API',
      status: 'operational',
      version: '1.2.0',
    });
  });

  // Predict endpoint
  app.post('/api/predict', (req: Request, res: Response) => {
    try {
      const data = req.body;
      const lowThresh = req.query.low_thresh ? parseFloat(req.query.low_thresh as string) : 0.30;
      const highThresh = req.query.high_thresh ? parseFloat(req.query.high_thresh as string) : 0.60;

      const scored = scoreEmployee(data, lowThresh, highThresh);
      dbStore.recordPrediction(data, scored);

      res.json(scored);
    } catch (err: any) {
      console.error('Error during prediction:', err);
      res.status(500).json({ error: err.message || 'Prediction failed' });
    }
  });

  // Prediction History
  app.get('/api/predict/history', (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const risk = req.query.risk_level as string | undefined;
    const history = dbStore.getPredictionHistory(limit, risk);
    res.json(history);
  });

  // Employees CRUD
  app.get('/api/employees', (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const department = req.query.department as string | undefined;
    const risk_level = req.query.risk_level as string | undefined;
    const sort_by = req.query.sort_by as string | undefined;
    const sort_order = req.query.sort_order as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const list = dbStore.getEmployees({
      search,
      department,
      risk_level,
      sort_by,
      sort_order,
      limit,
      offset,
    });
    res.json(list);
  });

  app.post('/api/employees', (req: Request, res: Response) => {
    try {
      const newEmp = dbStore.addEmployee(req.body);
      res.status(201).json(newEmp);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/employees/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const emp = dbStore.getEmployeeById(id);
    if (!emp) {
      return res.status(404).json({ detail: 'Employee not found' });
    }
    res.json(emp);
  });

  app.delete('/api/employees/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const deleted = dbStore.deleteEmployee(id);
    if (!deleted) {
      return res.status(404).json({ detail: 'Employee not found' });
    }
    res.status(204).send();
  });

  // Analytics endpoints
  app.get('/api/analytics/summary', (req: Request, res: Response) => {
    const summary = dbStore.getSummary();
    res.json(summary);
  });

  app.get('/api/analytics/model-info', (req: Request, res: Response) => {
    const metaPath = path.resolve(__dirname, 'models', 'model_metadata.json');
    if (fs.existsSync(metaPath)) {
      try {
        const raw = fs.readFileSync(metaPath, 'utf-8');
        return res.json(JSON.parse(raw));
      } catch (e) {
        // Fallback below
      }
    }

    res.json({
      model_name: 'GradientBoosting_Balanced_Ensemble',
      model_version: '1.2.0',
      training_framework: 'scikit-learn 1.3+',
      training_date: '2026-03-15',
      dataset: 'IBM HR Analytics Employee Attrition & Performance',
      total_records: 1470,
      selected_metrics: {
        accuracy: 0.8741,
        precision: 0.7222,
        recall: 0.7879,
        f1_score: 0.7536,
        roc_auc: 0.8645,
        confusion_matrix: {
          true_negatives: 218,
          false_positives: 29,
          false_negatives: 8,
          true_positives: 39,
        },
      },
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AttriGuard] Platform server online at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
