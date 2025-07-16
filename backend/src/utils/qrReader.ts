// Use CommonJS-style require to get the Jimp module object
const JimpLib = require('jimp');
const Jimp = JimpLib.Jimp; // Extract the actual class
import QrCode from 'qrcode-reader';

export const extractQRCode = async (filePath: string): Promise<string | null> => {
  try {
    const image = await Jimp.read(filePath); 
    const qr = new QrCode();

    return new Promise((resolve) => {
      qr.callback = (err: Error | null, value: { result: string } | null) => {
        if (err || !value || !value.result) {
          console.warn('QR decode error:', err?.message || 'Not found');
          return resolve(null);
        }
        console.log('QR code found:', value.result);
        resolve(value.result);
      };

      qr.decode(image.bitmap);
    });
  } catch (err) {
    console.error('QR extraction failed:', (err as Error).message);
    return null;
  }
};
