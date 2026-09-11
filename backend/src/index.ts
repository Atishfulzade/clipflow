import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes';

// Import BullMQ background worker to initialize job listener thread
import './workers/videoWorker';
import './workers/publishWorker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Global Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
  },
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Serve static mock uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount Routing modules
app.use('/api', apiRouter);

// Base Health probe
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    service: 'clipflow-backend-api'
  });
});

app.listen(PORT, () => {
  console.log(`[Server] ClipFlow API server running successfully on port ${PORT}`);
});
