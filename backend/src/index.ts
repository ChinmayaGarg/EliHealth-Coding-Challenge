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

// Multer setup for image upload
const upload = multer({ dest: 'uploads/' });

// PostgreSQL client
const db = new Client({
  connectionString: process.env.DATABASE_URL,
});
db.connect();

// Health check
app.get('/', (req, res) => {
  res.send('Eli Backend is running!');
});

// Upload endpoint
app.post('/api/test-strips/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }


    if (!['image/png', 'image/jpeg'].includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported file format' });
    }


    
    const filePath = req.file.path;


    console.log('Uploaded file:', req.file);

    // QR Code extraction
    console.log('Received file:', req.file?.originalname, 'at', req.file?.path);

    const qrCode = await extractQRCode(filePath);
    console.log('Extracted QR:', qrCode || 'None');


    // Determine status
    let status = 'invalid';
    if (qrCode?.startsWith('ELI-2025')) status = 'valid';
    else if (qrCode?.startsWith('ELI-2024')) status = 'expired';

    // Generate thumbnail
    const thumbnailPath = await generateThumbnail(filePath, 'uploads');

    // Image metadata
    // const dimensions = sizeOf(filePath);
    
    const fileBuffer = fs.readFileSync(filePath); 
    const dimensions = getImageSize(fileBuffer);
    // const dimensionText = `${dimensions.width}x${dimensions.height}`;
    const imageSize = req.file.size;
    const dimensionText = `${dimensions.width}x${dimensions.height}`;

    // Save to DB
    await db.query(
      `INSERT INTO test_strip_submissions (
        qr_code, original_image_path, thumbnail_path,
        image_size, image_dimensions, status
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [qrCode, filePath, thumbnailPath, imageSize, dimensionText, status]
    );

    return res.json({
      qrCode,
      status,
      thumbnailPath,
      imageSize,
      dimensions,
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Upload Error:', err);
    return res.status(500).json({ error: 'Failed to process image' });
  }
});

// Get all submissions (paginated)
app.get('/api/test-strips', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const { rows } = await db.query(
      `SELECT id, qr_code, status, thumbnail_path, image_size, image_dimensions, created_at
       FROM test_strip_submissions
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.json({ data: rows, page, limit });
  } catch (err) {
    console.error('Fetch Error:', err);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.get('/api/test-strips/history', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, status, thumbnail_path AS filename, qr_code AS "qrCode", created_at 
       FROM test_strip_submissions 
       ORDER BY created_at DESC`
    );

    const host = req.protocol + '://' + req.get('host');

    const updatedRows = rows.map((row: any) => ({
      ...row,
      imageUrl: `${host}/api/test-strips/${row.filename}`
    }));
    console.log(updatedRows);
    res.json(updatedRows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Eli backend listening at http://localhost:${PORT}`);
});
