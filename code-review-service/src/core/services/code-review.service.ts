import { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ddbDocClient, CODE_REVIEWS_TABLE } from '../../config/dynamodb';
import { s3Client, S3_BUCKET_NAME, generateS3Key, getS3ObjectUrl } from '../../config/s3';
import { CodeReview, CreateReviewRequest, Annotation } from '../../models/review.model';
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
}