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

// POST /api/test-strips/upload
export const uploadTestStrip = async (req: Request, res: Response) => {
  try {
    // 1. Ensure file exists
    if (!req?.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 2. Validate file type
    if (!['image/png', 'image/jpeg'].includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Unsupported file format. Only JPEG and PNG are allowed.' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // 3. Validate dimensions and size
    let dimensions;
    try {
      dimensions = getImageSize(fileBuffer);
      if (!dimensions.width || !dimensions.height) throw new Error('Invalid image dimensions');
    } catch (err) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unable to read image dimensions' });
    }

    const imageSize = req.file.size;
    const validationError = validateImage(imageSize, dimensions);
    if (validationError) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: validationError });
    }

    // 4. Extract QR Code
    const qrCode = await extractQRCode(filePath);
    if (!qrCode) {
      fs.unlinkSync(filePath);
      return res.status(422).json({ error: 'No QR code detected in image' });
    }

    // 5. Check for duplicates
    const existing = await db.query(SELECT_BY_QR, [qrCode]);
    if (existing.rows.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(409).json({ message: 'Duplicate QR code. This strip was already submitted.' });
    }

    // 6. Derive status and thumbnail
    const status = getQRCodeStatus(qrCode);
    const thumbnailPath = await generateThumbnail(filePath, 'uploads');
    const dimensionText = `${dimensions.width}x${dimensions.height}`;

    // 7. Insert into DB
    await db.query(INSERT_SUBMISSION, [
      qrCode,
      filePath,
      thumbnailPath,
      imageSize,
      dimensionText,
      status,
    ]);

    return res.json({
      qrCode,
      status,
      thumbnailPath,
      imageSize,
      dimensions,
      processedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[Upload Error]', err);

    // Attempt to clean up the file if it exists
    if (req?.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Failed to clean up uploaded file:', unlinkErr);
      }
    }

    return res.status(500).json({ error: 'Failed to process image. Please try again later.' });
  }
};

/**
 * Handles GET /api/test-strips/history
 * Returns all uploaded test strip records with URLs for accessing images
 */
export const getTestStripHistory = async (req: Request, res: Response) => {
  try {
    // Query all history records from the database
    const { rows } = await db.query(SELECT_HISTORY);

    // If no history exists, return a 404 response
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No history found.' });
    }

    // Construct the base URL for images (e.g., http://localhost:3000)
    const host = req.protocol + '://' + req.get('host');

    // Map over each row to add a complete image URL
    const updatedRows = rows.map((row: any) => {
      const filename = row.filename?.trim(); // Safely trim the filename
      return {
        ...row,
        imageUrl: filename ? `${host}/api/test-strips/${filename}` : null, // Only add if filename is valid
      };
    });

    // Return the enriched rows
    res.json(updatedRows);
  } catch (err) {
    // Log and return server error if something goes wrong
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

/**
 * Handles GET /api/test-strips?page=1&limit=10
 * Returns paginated test strip records
 */
export const getTestStripsPaginated = async (req: Request, res: Response) => {
  // Parse pagination params from query string
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Ensure page and limit are valid
  if (page <= 0 || limit <= 0) {
    return res.status(400).json({ error: 'Page and limit must be positive integers' });
  }

  const offset = (page - 1) * limit;

  try {
    // Query paginated rows from the database
    const { rows } = await db.query(SELECT_PAGINATED, [limit, offset]);

    // If no results found for page, return empty array
    if (!rows || rows.length === 0) {
      return res.status(200).json({ data: [], page, limit, message: 'No records found on this page' });
    }

    // Return paginated data
    res.json({ data: rows, page, limit });
  } catch (err) {
    // Handle database or query errors
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
