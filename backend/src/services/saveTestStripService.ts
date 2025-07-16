import { db } from '../db/db';
import { INSERT_SUBMISSION } from '../db/queries';
import { getQRCodeStatus } from '../utils/qrStatusGetter';

interface SubmissionInput {
  qrCode: string;
  filePath: string;
  thumbnailPath: string;
  imageSize: number;
  dimensionText: string;
}

export const saveTestStrip = async ({
  qrCode,
  filePath,
  thumbnailPath,
  imageSize,
  dimensionText,
}: SubmissionInput) => {
  const status = getQRCodeStatus(qrCode);

  await db.query(INSERT_SUBMISSION, [
    qrCode,
    filePath,
    thumbnailPath,
    imageSize,
    dimensionText,
    status,
  ]);

  return {
    qrCode,
    status,
    thumbnailPath,
    imageSize,
    dimensions: dimensionText,
    processedAt: new Date().toISOString(),
  };
};
