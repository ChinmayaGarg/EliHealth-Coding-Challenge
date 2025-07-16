import express from 'express';
import multer from 'multer';
import path from 'path';
import { extractQRCode } from './utils/qrReader';
import { generateThumbnail } from './utils/thumbnail';
import { imageSize as getImageSize } from 'image-size';
import fs from 'fs';

import { Client } from 'pg';

const cors = require('cors');
// const sizeOf = require('image-size');
// const sizeOf = imageSize;

// Setup Express
const app = express();
const PORT = 3000;

// Enable CORS (important for frontend integration)
app.use(cors());
// PostgreSQL client
const db = new Client({
  connectionString: process.env.DATABASE_URL,
});
db.connect();

// Health check
app.get('/', (req, res) => {
  res.send('Eli Backend is running!');
});
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Eli backend listening at http://localhost:${PORT}`);
});
