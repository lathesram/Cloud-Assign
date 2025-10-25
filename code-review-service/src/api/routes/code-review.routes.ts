import { Router } from 'express';
import { CodeReviewController } from '../controllers/code-review.controller';
import { upload, handleMulterError } from '../middlewares/upload.middleware';

const router = Router();
const controller = new CodeReviewController();

// Main CRUD operations
router.get('/', controller.getAllReviews.bind(controller));
router.post('/', controller.createReview.bind(controller));
router.get('/pending', controller.getPendingReviews.bind(controller));
router.get('/stats', controller.getReviewStats.bind(controller));

// File upload
router.post('/upload', upload.single('file'), handleMulterError, controller.uploadFile.bind(controller));

// User-specific routes
router.get('/mentee/:menteeId', controller.getReviewsByMentee.bind(controller));
router.get('/mentor/:mentorId', controller.getReviewsByMentor.bind(controller));

// Specific review operations
router.get('/:id', controller.getReview.bind(controller));
router.put('/:id', controller.updateReview.bind(controller));
router.delete('/:id', controller.deleteReview.bind(controller));

// Legacy route for adding annotations (keep for backward compatibility)
router.put('/:id/annotations', controller.addAnnotations.bind(controller));

// Annotation operations
router.get('/:id/annotations', controller.getAnnotations.bind(controller));
router.post('/:id/annotations', controller.createAnnotation.bind(controller));
router.put('/:reviewId/annotations/:annotationId', controller.updateAnnotation.bind(controller));
router.delete('/:reviewId/annotations/:annotationId', controller.deleteAnnotation.bind(controller));

export default router;