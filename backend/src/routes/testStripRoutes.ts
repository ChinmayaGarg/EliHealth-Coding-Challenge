import express from 'express';
import multer from 'multer';
import {
  uploadTestStrip,
  getTestStripHistory,
  getTestStripsPaginated,
  getTestStripById,
  getImageByFilename
} from '../controllers/testStripController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), uploadTestStrip);
router.get('/', getTestStripsPaginated);
router.get('/history', getTestStripHistory);
router.get('/uploads/:filename', getImageByFilename);
router.get('/:id', getTestStripById);

export default router;