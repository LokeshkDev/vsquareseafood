import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

let prisma;

if (config.nodeEnv === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export default prisma;
