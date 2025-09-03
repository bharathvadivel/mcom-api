// Temporary file to force TypeScript server refresh
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Check the Session type
type SessionType = typeof prisma.session;
