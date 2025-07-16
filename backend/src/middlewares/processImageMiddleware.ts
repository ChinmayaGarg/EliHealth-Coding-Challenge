import { Request, Response, NextFunction } from 'express';
import { extractQRCode } from '../utils/qrReader';
import { generateThumbnail } from '../utils/thumbnailGenerator';

export const processImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = req.file!.path;

    const qrCode = await extractQRCode(filePath);
    const thumbnailPath = await generateThumbnail(filePath, 'uploads');

    (req as any).imageMeta = {
      qrCode,
      thumbnailPath,
    };

    next();
  } catch (err) {
    console.error('Image processing failed:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
};
