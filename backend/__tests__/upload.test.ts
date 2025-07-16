import request from 'supertest';
import app from '../src';
import path from 'path';
import fs from 'fs';

const noQrTestImagePath = path.join(__dirname, 'test-assets/test-strip-no-qr.png');
const validQrTestImagePath = path.join(__dirname, 'test-assets/test-strip-valid-1.png');

describe('📤 Upload Endpoint - /api/test-strips/upload', () => {
  it('should upload an image and return a QR code', async () => {
    const res = await request(app)
      .post('/api/test-strips/upload')
      .attach('image', validQrTestImagePath);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('qrCode');
    expect(res.body.qrCode).toMatch(/.+/);
  });

  it('should fail if no image is attached', async () => {
    const res = await request(app)
      .post('/api/test-strips/upload');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('📜 History Endpoint - /api/test-strips/history', () => {
  it('should return submission history array', async () => {
    const res = await request(app).get('/api/test-strips/history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('🔍 Get By ID Endpoint - /api/test-strips/:id', () => {
  it('should return 404 for non-existent ID', async () => {
    // const fakeId = '999999';
    const fakeId = 'f6a16ff7-4a31-11eb-be7b-8344edc8f36b';
    const res = await request(app).get(`/api/test-strips/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('🖼️ Image Serve Endpoint - /api/test-strips/uploads/:filename', () => {
  it('should return the image file', async () => {
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    if (files.length === 0) {
      return console.warn('⚠️ No files in uploads/ directory to test image serving.');
    }

    const fileName = files[1];
    console.log(fileName);
    const res = await request(app).get(`/api/test-strips/uploads/${fileName}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/image/);
  });
});
