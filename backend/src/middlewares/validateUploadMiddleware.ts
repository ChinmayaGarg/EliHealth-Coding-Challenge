import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { imageSize as getImageSize } from 'image-size';
import { validateImage } from '../utils/imageValidator';

export const validateUpload = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
    return res.status(400).json({ error: 'Unsupported file format' });
  }

  const buffer = fs.readFileSync(file.path);
  const dimensions = getImageSize(buffer);
  const size = file.size;

  const error = validateImage(size, dimensions);
  if (error) return res.status(400).json({ error });

  (req as any).imageDetails = { buffer, dimensions, size };
  next();
};
