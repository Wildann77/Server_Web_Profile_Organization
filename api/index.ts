import path from 'path';
const moduleAlias = require('module-alias');

// Set up aliases for Vercel runtime
moduleAlias.addAlias('@', path.join(__dirname, '..', 'src'));

import { createServer } from '../src/app';

const app = createServer();

export default app;
