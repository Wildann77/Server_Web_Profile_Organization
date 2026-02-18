import 'module-alias/register';
import * as tsConfigPaths from 'tsconfig-paths';
import * as path from 'path';

const tsConfig = require('../tsconfig.json');

tsConfigPaths.register({
    baseUrl: path.resolve(__dirname, '..'),
    paths: tsConfig.compilerOptions.paths,
});

import { createServer } from '../src/app';
import { prisma } from '../src/shared/lib/prisma';

const app = createServer();

// Initialize database connection
prisma.$connect()
    .then(() => {
        console.log('✅ Database connected (Vercel)');
    })
    .catch((err: unknown) => {
        console.error('❌ Database connection error (Vercel):', err);
    });

export default app;
