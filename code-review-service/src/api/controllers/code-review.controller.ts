import { Request, Response } from 'express';
import { CodeReviewService } from '../../core/services/code-review.service';

const codeReviewService = new CodeReviewService();

export class CodeReviewController {

  /**
   * GET /code-reviews - Get all code reviews with pagination and filters
   */
  async getAllReviews(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status, programmingLanguage } = req.query;
      const filters = {
        status: status as string,
        programmingLanguage: programmingLanguage as string
      };

      const result = await codeReviewService.getAllReviews(
        parseInt(page as string),
        parseInt(limit as string),
        filters
      );

      res.status(200).json({
        success: true,
        message: 'Reviews retrieved successfully',
        data: result.reviews,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Get all reviews error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /code-reviews - Create new code review
   */
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const reviewData = req.body;
      
      if (!reviewData.title || !reviewData.description || !reviewData.programmingLanguage || !reviewData.menteeId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: title, description, programmingLanguage, menteeId'
        });
        return;
      }

      const review = await codeReviewService.createReview(reviewData);
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const review = await codeReviewService.uploadFileAndCreateReview(req.file, req.body);
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /reviews/:id - Get review metadata
   */
  async getReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Review ID is required'
        });
        return;
      }

      const review = await codeReviewService.getReviewById(id);

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Review retrieved successfully',
        data: review
      });

    } catch (error) {
      console.error('Get review error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  /**
   * PUT /reviews/:id - Add annotations (mentor functionality)
   */
  async addAnnotations(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const updatedReview = await codeReviewService.addAnnotations(
        req.params.id,
        req.body.mentorId,
        req.body.annotations
      );

      if (!updatedReview) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      res.status(200).json({ success: true, data: updatedReview });
    } catch (error) {
      console.error('Add annotations error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /reviews/mentee/:menteeId - Get reviews by mentee
   */
  async getReviewsByMentee(req: Request, res: Response): Promise<void> {
    try {
      const reviews = await codeReviewService.getReviewsByMenteeId(req.params.menteeId);
      res.status(200).json({ success: true, data: reviews, count: reviews.length });
    } catch (error) {
      console.error('Get reviews by mentee error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /reviews/mentor/:mentorId - Get reviews by mentor
   */
  async getReviewsByMentor(req: Request, res: Response): Promise<void> {
    try {
      const reviews = await codeReviewService.getReviewsByMentorId(req.params.mentorId);
      res.status(200).json({ success: true, data: reviews, count: reviews.length });
    } catch (error) {
      console.error('Get reviews by mentor error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * PUT /code-reviews/:id - Update code review
   */
  async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedReview = await codeReviewService.updateReview(id, updateData);
      
      if (!updatedReview) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      res.status(200).json({ success: true, data: updatedReview });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * DELETE /code-reviews/:id - Delete code review
   */
  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await codeReviewService.deleteReview(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /code-reviews/pending - Get pending reviews
   */
  async getPendingReviews(req: Request, res: Response): Promise<void> {
    try {
      const { mentorId } = req.query;
      const reviews = await codeReviewService.getPendingReviews(mentorId as string);
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      console.error('Get pending reviews error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /code-reviews/stats - Get review statistics
   */
  async getReviewStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const stats = await codeReviewService.getReviewStats(userId as string);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error('Get review stats error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /code-reviews/:id/annotations - Get annotations for a review
   */
  async getAnnotations(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const review = await codeReviewService.getReviewById(id);
      
      if (!review) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      res.status(200).json({ success: true, data: review.annotations });
    } catch (error) {
      console.error('Get annotations error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /code-reviews/:id/annotations - Create annotation
   */
  async createAnnotation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const annotationData = req.body;

      if (!annotationData.lineNumber || !annotationData.comment || !annotationData.severity || !annotationData.mentorId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: lineNumber, comment, severity, mentorId'
        });
        return;
      }

      const annotation = await codeReviewService.createAnnotation(id, annotationData);
      res.status(201).json({ success: true, data: annotation });
    } catch (error) {
      console.error('Create annotation error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * PUT /code-reviews/:reviewId/annotations/:annotationId - Update annotation
   */
  async updateAnnotation(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId, annotationId } = req.params;
      const updateData = req.body;

      const updatedAnnotation = await codeReviewService.updateAnnotation(reviewId, annotationId, updateData);
      
      if (!updatedAnnotation) {
        res.status(404).json({ success: false, message: 'Annotation not found' });
        return;
      }

      res.status(200).json({ success: true, data: updatedAnnotation });
    } catch (error) {
      console.error('Update annotation error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * DELETE /code-reviews/:reviewId/annotations/:annotationId - Delete annotation
   */
  async deleteAnnotation(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId, annotationId } = req.params;
      const deleted = await codeReviewService.deleteAnnotation(reviewId, annotationId);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Annotation not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Annotation deleted successfully' });
    } catch (error) {
      console.error('Delete annotation error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}