import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import {db} from '../db/db';
import {
  SELECT_HISTORY,
  SELECT_BY_ID,
  SELECT_PAGINATED,
} from '../db/queries';
import {UUID_REGEX, FILENAME_REGEX} from '../constants';
import { isDuplicateQRCode, extractQRCodeFromFile } from '../services/qrCodeService';
import { saveTestStrip } from '../services/saveTestStripService';
import { imageSize as getImageSize } from 'image-size';
import { validateImage } from '../utils/imageValidator';
import { generateThumbnail } from '../utils/thumbnailGenerator';


export const uploadTestStrip = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    if (!['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const dimensions = getImageSize(fileBuffer);
    const imageSize = req.file.size;

    const validationError = validateImage(imageSize, dimensions);
    if (validationError) return res.status(400).json({ error: validationError });

    const qrCode = await extractQRCodeFromFile(filePath);
    if (!qrCode) throw new Error('QR code could not be extracted or is invalid.');
    const isDuplicate = await isDuplicateQRCode(qrCode);
    if (isDuplicate) return res.status(409).json({ message: 'Duplicate QR code' });

    const thumbnailPath = await generateThumbnail(filePath, 'uploads');
    const dimensionText = `${dimensions.width}x${dimensions.height}`;

    const saved = await saveTestStrip({
      qrCode,
      filePath,
      thumbnailPath,
      imageSize,
      dimensionText,
    });

    res.json(saved);
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
};


// Handles GET /api/test-strips/history
export const getTestStripHistory = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(SELECT_HISTORY);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No history found.' });
    }

    const host = req.protocol + '://' + req.get('host');

    const updatedRows = rows.map((row: any) => {
      const filename = row.filename?.trim();
      return {
        ...row,
        imageUrl: filename ? `${host}/api/test-strips/${filename}` : null,
      };
    });

    res.json(updatedRows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};


// Handles GET /api/test-strips?page=1&limit=10
export const getTestStripsPaginated = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (page <= 0 || limit <= 0) {
    return res.status(400).json({ error: 'Page and limit must be positive integers' });
  }

  const offset = (page - 1) * limit;

  try {
    const { rows } = await db.query(SELECT_PAGINATED, [limit, offset]);

    if (!rows || rows.length === 0) {
      return res.status(200).json({ data: [], page, limit, message: 'No records found on this page' });
    }

    res.json({ data: rows, page, limit });
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

export const getTestStripById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    // Fetch test strip data by ID
    const { rows } = await db.query(SELECT_BY_ID, [id]);

    // If no matching record is found, return a 404 response
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Detail Error:', err);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};

export const getImageByFilename = (req: Request, res: Response) => {
  const { filename } = req.params;

  // Validate filename format
  if (!FILENAME_REGEX.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename format' });
  }

  const filePath = path.join(__dirname, '../../uploads', filename);

  // Check if file exists 
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', filePath);
      return res.status(404).json({ error: 'Image not found' });
    }

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Image send error:', err);
        res.status(500).json({ error: 'Failed to send image' });
      }
    });
  });
};
