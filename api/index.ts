import path from 'path';
import moduleAlias from 'module-alias';

// Set up aliases for Vercel runtime
// __dirname is /var/task/api
moduleAlias.addAlias('@', path.join(__dirname, '..', 'src'));

import { createServer } from '../src/app';

const app = createServer();

// For Vercel, we export the app instance.
// Note: We don't call prisma.$connect() here because it might block
// the initial function cold start. Prisma will automatically connect on the first query.

export default app;
