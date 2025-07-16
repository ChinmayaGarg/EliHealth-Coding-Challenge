import { db } from '../db/db';
import { SELECT_BY_QR } from '../db/queries';
import { extractQRCode } from '../utils/qrReader';

export const isDuplicateQRCode = async (qrCode: string) => {
  const { rows } = await db.query(SELECT_BY_QR, [qrCode]);
  return rows.length > 0;
};

export const extractQRCodeFromFile = async (filePath: string) => {
  return extractQRCode(filePath);
};
