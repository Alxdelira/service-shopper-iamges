import express from 'express';
import multer from 'multer';
import ReaderImagesController from '../controllers/reader-images-controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router
    .post('/upload', upload.single('image'), ReaderImagesController.uploadImage)
    .get('/:customer_code/list', ReaderImagesController.getImage)
    .patch('/confirm', ReaderImagesController.confirmImage);

export default router;