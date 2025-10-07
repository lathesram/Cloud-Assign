import { Router } from 'express';
import { CodeReviewController } from '../controllers/code-review.controller';
import { upload, handleMulterError } from '../middlewares/upload.middleware';

const router = Router();
const controller = new CodeReviewController();

router.post('/upload', upload.single('file'), handleMulterError, controller.uploadFile.bind(controller));
router.get('/:id', controller.getReview.bind(controller));
router.put('/:id', controller.addAnnotations.bind(controller));
router.get('/mentee/:menteeId', controller.getReviewsByMentee.bind(controller));
router.get('/mentor/:mentorId', controller.getReviewsByMentor.bind(controller));

export default router;