import app from './app.js';
import { config } from './config/env.js';
import prisma from './config/db.js';
import { logger } from './middleware/requestLogger.js';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    const server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use by another process. Please close it or set another PORT in .env.`);
      } else {
        logger.error({ err }, 'Server error');
      }
      process.exit(1);
    });

    process.on('unhandledRejection', async (err) => {
      logger.error({ err }, 'UNHANDLED REJECTION! 💥 Shutting down...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(1);
      });
    });

    process.on('uncaughtException', async (err) => {
      logger.error({ err }, 'UNCAUGHT EXCEPTION! 💥 Shutting down...');
      await prisma.$disconnect();
      process.exit(1);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
