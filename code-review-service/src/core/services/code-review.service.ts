import { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ddbDocClient, CODE_REVIEWS_TABLE } from '../../config/dynamodb';
import { s3Client, S3_BUCKET_NAME, generateS3Key, getS3ObjectUrl } from '../../config/s3';
import { 
  CodeReview, 
  CreateReviewRequest, 
  Annotation, 
  ReviewFilter, 
  ReviewStats,
  CreateAnnotationRequest 
} from '../../models/review.model';
import { v4 as uuidv4 } from 'uuid';

export class CodeReviewService {
  
  async uploadFileAndCreateReview(
    file: Express.Multer.File,
    reviewData: CreateReviewRequest
  ): Promise<CodeReview> {
    try {

      const reviewId = uuidv4();
      const s3Key = generateS3Key(reviewId, file.originalname);
      
      const uploadParams = {
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      const s3FileUrl = getS3ObjectUrl(s3Key);

      const review: CodeReview = {
        reviewId,
        menteeId: reviewData.menteeId,
        title: reviewData.title,
        description: reviewData.description,
        programmingLanguage: reviewData.programmingLanguage,
        s3FileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        status: 'pending',
        annotations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await ddbDocClient.send(new PutCommand({
        TableName: CODE_REVIEWS_TABLE,
        Item: review
      }));
      
      return review;

    } catch (error) {
      throw new Error(`Failed to create review: ${error}`);
    }
  }

  async getReviewById(reviewId: string): Promise<CodeReview | null> {
    try {

      const result = await ddbDocClient.send(new GetCommand({
        TableName: CODE_REVIEWS_TABLE,
        Key: { reviewId }
      }));
      
      return result.Item ? result.Item as CodeReview : null;
    } catch (error) {
      throw new Error(`Failed to fetch review: ${error}`);
    }
  }

  async addAnnotations(
    reviewId: string, 
    mentorId: string, 
    newAnnotations: Omit<Annotation, 'annotationId' | 'mentorId' | 'createdAt'>[]
  ): Promise<CodeReview | null> {
    try {

      const currentReview = await this.getReviewById(reviewId);
      if (!currentReview) return null;

      const annotationsWithIds: Annotation[] = newAnnotations.map(annotation => ({
        ...annotation,
        annotationId: uuidv4(),
        mentorId,
        createdAt: new Date().toISOString()
      }));

      const updatedAnnotations = [...currentReview.annotations, ...annotationsWithIds];

      const result = await ddbDocClient.send(new UpdateCommand({
        TableName: CODE_REVIEWS_TABLE,
        Key: { reviewId },
        UpdateExpression: 'SET annotations = :annotations, mentorId = :mentorId, #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':annotations': updatedAnnotations,
          ':mentorId': mentorId,
          ':status': 'reviewed',
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW' as const
      }));
      
      return result.Attributes as CodeReview;
    } catch (error) {
      throw new Error(`Failed to add annotations: ${error}`);
    }
  }

  async getReviewsByMenteeId(menteeId: string): Promise<CodeReview[]> {
    try {
      const result = await ddbDocClient.send(new ScanCommand({
        TableName: CODE_REVIEWS_TABLE,
        FilterExpression: 'menteeId = :menteeId',
        ExpressionAttributeValues: { ':menteeId': menteeId }
      }));
      return result.Items as CodeReview[] || [];
    } catch (error) {
      throw new Error(`Failed to fetch reviews: ${error}`);
    }
  }

  async getReviewsByMentorId(mentorId: string): Promise<CodeReview[]> {
    try {
      const result = await ddbDocClient.send(new ScanCommand({
        TableName: CODE_REVIEWS_TABLE,
        FilterExpression: 'mentorId = :mentorId',
        ExpressionAttributeValues: { ':mentorId': mentorId }
      }));
      return result.Items as CodeReview[] || [];
    } catch (error) {
      throw new Error(`Failed to fetch reviews: ${error}`);
    }
  }

  async getAllReviews(page: number = 1, limit: number = 10, filters?: ReviewFilter): Promise<{ reviews: CodeReview[], total: number }> {
    try {
      let filterExpression = '';
      let expressionAttributeValues: any = {};

      if (filters?.status) {
        filterExpression += '#status = :status';
        expressionAttributeValues[':status'] = filters.status;
      }

      if (filters?.programmingLanguage) {
        if (filterExpression) filterExpression += ' AND ';
        filterExpression += 'programmingLanguage = :language';
        expressionAttributeValues[':language'] = filters.programmingLanguage;
      }

      const scanParams: any = {
        TableName: CODE_REVIEWS_TABLE,
      };

      if (filterExpression) {
        scanParams.FilterExpression = filterExpression;
        scanParams.ExpressionAttributeValues = expressionAttributeValues;
        if (filters?.status) {
          scanParams.ExpressionAttributeNames = { '#status': 'status' };
        }
      }

      const result = await ddbDocClient.send(new ScanCommand(scanParams));
      const allReviews = result.Items as CodeReview[] || [];

      // Simple pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedReviews = allReviews.slice(startIndex, endIndex);

      return {
        reviews: paginatedReviews,
        total: allReviews.length
      };
    } catch (error) {
      throw new Error(`Failed to fetch reviews: ${error}`);
    }
  }

  async createReview(reviewData: CreateReviewRequest): Promise<CodeReview> {
    try {
      const reviewId = uuidv4();
      
      const review: CodeReview = {
        reviewId,
        menteeId: reviewData.menteeId,
        title: reviewData.title,
        description: reviewData.description,
        programmingLanguage: reviewData.programmingLanguage,
        s3FileUrl: '', // Will be set when file is uploaded
        fileName: '',
        fileSize: 0,
        status: 'pending',
        annotations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await ddbDocClient.send(new PutCommand({
        TableName: CODE_REVIEWS_TABLE,
        Item: review
      }));
      
      return review;
    } catch (error) {
      throw new Error(`Failed to create review: ${error}`);
    }
  }

  async updateReview(reviewId: string, updateData: Partial<CodeReview>): Promise<CodeReview | null> {
    try {
      const currentReview = await this.getReviewById(reviewId);
      if (!currentReview) return null;

      const updateExpression: string[] = [];
      const expressionAttributeNames: any = {};
      const expressionAttributeValues: any = {};

      Object.keys(updateData).forEach((key, index) => {
        if (key !== 'reviewId') {
          const attributeKey = `#attr${index}`;
          const valueKey = `:val${index}`;
          
          updateExpression.push(`${attributeKey} = ${valueKey}`);
          expressionAttributeNames[attributeKey] = key;
          expressionAttributeValues[valueKey] = updateData[key as keyof CodeReview];
        }
      });

      // Always update the updatedAt field
      updateExpression.push(`#updatedAt = :updatedAt`);
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const result = await ddbDocClient.send(new UpdateCommand({
        TableName: CODE_REVIEWS_TABLE,
        Key: { reviewId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      }));

      return result.Attributes as CodeReview;
    } catch (error) {
      throw new Error(`Failed to update review: ${error}`);
    }
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      const review = await this.getReviewById(reviewId);
      if (!review) return false;

      await ddbDocClient.send(new DeleteCommand({
        TableName: CODE_REVIEWS_TABLE,
        Key: { reviewId }
      }));

      return true;
    } catch (error) {
      throw new Error(`Failed to delete review: ${error}`);
    }
  }

  async getPendingReviews(mentorId?: string): Promise<CodeReview[]> {
    try {
      let filterExpression = '#status = :pendingStatus';
      let expressionAttributeValues: any = { ':pendingStatus': 'pending' };
      let expressionAttributeNames: any = { '#status': 'status' };

      if (mentorId) {
        filterExpression += ' AND mentorId = :mentorId';
        expressionAttributeValues[':mentorId'] = mentorId;
      }

      const result = await ddbDocClient.send(new ScanCommand({
        TableName: CODE_REVIEWS_TABLE,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));

      return result.Items as CodeReview[] || [];
    } catch (error) {
      throw new Error(`Failed to fetch pending reviews: ${error}`);
    }
  }

  async getReviewStats(userId?: string): Promise<ReviewStats> {
    try {
      let filterExpression = '';
      let expressionAttributeValues: any = {};

      if (userId) {
        filterExpression = 'menteeId = :userId OR mentorId = :userId';
        expressionAttributeValues[':userId'] = userId;
      }

      const scanParams: any = {
        TableName: CODE_REVIEWS_TABLE,
      };

      if (filterExpression) {
        scanParams.FilterExpression = filterExpression;
        scanParams.ExpressionAttributeValues = expressionAttributeValues;
      }

      const result = await ddbDocClient.send(new ScanCommand(scanParams));
      const reviews = result.Items as CodeReview[] || [];

      const stats: ReviewStats = {
        totalReviews: reviews.length,
        pendingReviews: reviews.filter(r => r.status === 'pending').length,
        inReviewReviews: reviews.filter(r => r.status === 'in-review').length,
        completedReviews: reviews.filter(r => r.status === 'completed' || r.status === 'reviewed').length,
        reviewsByLanguage: {}
      };

      // Count by programming language
      reviews.forEach(review => {
        const lang = review.programmingLanguage;
        stats.reviewsByLanguage[lang] = (stats.reviewsByLanguage[lang] || 0) + 1;
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get review stats: ${error}`);
    }
  }

  async createAnnotation(reviewId: string, annotationData: CreateAnnotationRequest): Promise<Annotation> {
    try {
      const currentReview = await this.getReviewById(reviewId);
      if (!currentReview) throw new Error('Review not found');

      const annotation: Annotation = {
        ...annotationData,
        annotationId: uuidv4(),
        createdAt: new Date().toISOString()
      };

      const updatedAnnotations = [...currentReview.annotations, annotation];

      await ddbDocClient.send(new UpdateCommand({
        TableName: CODE_REVIEWS_TABLE,
        Key: { reviewId },
        UpdateExpression: 'SET annotations = :annotations, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':annotations': updatedAnnotations,
          ':updatedAt': new Date().toISOString()
        }
      }));

      return annotation;
    } catch (error) {
      throw new Error(`Failed to create annotation: ${error}`);
    }
  }

  async updateAnnotation(reviewId: string, annotationId: string, updateData: Partial<Annotation>): Promise<Annotation | null> {
    try {
      const currentReview = await this.getReviewById(reviewId);
      if (!currentReview) return null;

      const annotationIndex = currentReview.annotations.findIndex(a => a.annotationId === annotationId);
      if (annotationIndex === -1) return null;

      const updatedAnnotation = { ...currentReview.annotations[annotationIndex], ...updateData };
      const updatedAnnotations = [...currentReview.annotations];
      updatedAnnotations[annotationIndex] = updatedAnnotation;

      await ddbDocClient.send(new UpdateCommand({
        TableName: CODE_REVIEWS_TABLE,
        Key: { reviewId },
        UpdateExpression: 'SET annotations = :annotations, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':annotations': updatedAnnotations,
          ':updatedAt': new Date().toISOString()
        }
      }));

      return updatedAnnotation;
    } catch (error) {
      throw new Error(`Failed to update annotation: ${error}`);
    }
  }

  async deleteAnnotation(reviewId: string, annotationId: string): Promise<boolean> {
    try {
      const currentReview = await this.getReviewById(reviewId);
      if (!currentReview) return false;

      const annotationIndex = currentReview.annotations.findIndex(a => a.annotationId === annotationId);
      if (annotationIndex === -1) return false;

      const updatedAnnotations = currentReview.annotations.filter(a => a.annotationId !== annotationId);

      await ddbDocClient.send(new UpdateCommand({
        TableName: CODE_REVIEWS_TABLE,
        Key: { reviewId },
        UpdateExpression: 'SET annotations = :annotations, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':annotations': updatedAnnotations,
          ':updatedAt': new Date().toISOString()
        }
      }));

      return true;
    } catch (error) {
      throw new Error(`Failed to delete annotation: ${error}`);
    }
  }
}