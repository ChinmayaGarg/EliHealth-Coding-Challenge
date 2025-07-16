declare module 'qrcode-reader' {
  import { Bitmap } from 'jimp';

  type QRCallback = (
    err: Error | null,
    result: { result: string; points: any[] } | null
  ) => void;

  class QrCode {
    decode(imageData: Bitmap): void;
    callback: QRCallback;
  }

  export = QrCode;
}
