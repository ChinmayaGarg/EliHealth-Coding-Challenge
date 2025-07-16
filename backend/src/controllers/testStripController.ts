import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { extractQRCode } from '../utils/qrReader';
import { generateThumbnail } from '../utils/thumbnail';
import { imageSize as getImageSize } from 'image-size';
import {db} from '../db/db';
import {
  INSERT_SUBMISSION,
  SELECT_HISTORY,
  SELECT_BY_ID,
  SELECT_PAGINATED,
  SELECT_BY_QR
} from '../db/queries/testStripQueries';
import { validateImage } from '../utils/imageValidator';
import { getQRCodeStatus } from '../utils/statusHelper';

const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500 KB
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 1000;

// POST /api/test-strips/upload
export const uploadTestStrip = async (req: Request, res: Response) => {
  try {
    if (!req?.file) return res.status(400).json({ error: 'No file uploaded' });

    if (!['image/png', 'image/jpeg'].includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const dimensions = getImageSize(fileBuffer);
    const imageSize = req.file.size;

    const validationError = validateImage(imageSize, dimensions);
    if (validationError) return res.status(400).json({ error: validationError });

    const qrCode = await extractQRCode(filePath);
    const existing = await db.query(SELECT_BY_QR, [qrCode]);
    if (existing.rows.length > 0) return res.status(409).json({ message: 'Duplicate QR code' });

    const status = getQRCodeStatus(qrCode);
    const thumbnailPath = await generateThumbnail(filePath, 'uploads');
    const dimensionText = `${dimensions.width}x${dimensions.height}`;

    await db.query(INSERT_SUBMISSION, [
      qrCode,
      filePath,
      thumbnailPath,
      imageSize,
      dimensionText,
      status,
    ]);

    res.json({
      qrCode,
      status,
      thumbnailPath,
      imageSize,
      dimensions,
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
};

// GET /api/test-strips/history
export const getTestStripHistory = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(SELECT_HISTORY);
    const host = req.protocol + '://' + req.get('host');

    const updatedRows = rows.map((row: any) => ({
      ...row,
      imageUrl: `${host}/api/test-strips/${row.filename}`,
    }));

    res.json(updatedRows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// GET /api/test-strips
export const getTestStripsPaginated = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const { rows } = await db.query(SELECT_PAGINATED, [limit, offset]);
    res.json({ data: rows, page, limit });
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// GET /api/test-strips/:id
export const getTestStripById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query(SELECT_BY_ID, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Detail Error:', err);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};

// GET /api/test-strips/uploads/:filename
export const getImageByFilename = (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads', filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Image send error:', err);
      res.status(404).json({ error: 'Image not found' });
    }
  });
};
