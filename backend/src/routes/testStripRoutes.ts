import express from 'express';
const multer = require('multer');
import {
  uploadTestStrip,
  getTestStripHistory,
  getTestStripsPaginated,
  getTestStripById,
  getImageByFilename
} from '../controllers/testStripController';
import { validateUpload } from '../middlewares/validateUploadMiddleware';
import { processImage } from '../middlewares/processImageMiddleware';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post( '/upload', upload.single('image'), validateUpload, processImage, uploadTestStrip );
router.get('/', getTestStripsPaginated);
router.get('/history', getTestStripHistory);
router.get('/uploads/:filename', getImageByFilename);
router.get('/:id', getTestStripById);

export default router;