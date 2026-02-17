import 'dotenv/config';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { errorHandler } from './shared/middlewares/errorHandler';
import { requestLogger } from './shared/middlewares/requestLogger';
import { rateLimiter } from './shared/middlewares/rateLimiter';

// Feature routes
import { authRoutes } from './features/auth/routes';
import { articleRoutes } from './features/articles/routes';
import { uploadRoutes } from './features/upload/routes';
import { adminRoutes } from './features/admin/routes';

export const createServer = (): Application => {
  const app = express();

  // Security middlewares
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:', '*.cloudinary.com'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }));

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // WAJIB untuk HttpOnly cookie
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Compression & logging
  app.use(compression());
  app.use(requestLogger);

  // Rate limiting
  app.use('/api/', rateLimiter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // API Routes v1
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/articles', articleRoutes);
  app.use('/api/v1/upload', uploadRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint tidak ditemukan',
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};
