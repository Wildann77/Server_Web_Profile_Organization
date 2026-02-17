import 'dotenv/config';
import { createServer } from './app';
import { prisma } from './shared/lib/prisma';
import { logger } from './shared/lib/logger';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Database connection check
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    const app = createServer();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
