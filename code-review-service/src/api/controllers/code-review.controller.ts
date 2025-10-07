import { Request, Response } from 'express';
import { CodeReviewService } from '../../core/services/code-review.service';

const codeReviewService = new CodeReviewService();

export class CodeReviewController {

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
}