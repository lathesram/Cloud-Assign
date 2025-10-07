import { S3Client } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

dotenv.config();

const REGION = process.env.AWS_REGION || 'ap-southeast-1';
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'skillbridge-code-reviews-bucket';

export const s3Client = new S3Client({ region: REGION });

export const validateS3Config = () => {
  if (!process.env.S3_BUCKET_NAME || !process.env.AWS_REGION) {
    throw new Error('Missing S3 environment variables');
  }
};

export const generateS3Key = (reviewId: string, fileName: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `reviews/${reviewId}/${timestamp}/${fileName}`;
};

export const getS3ObjectUrl = (key: string): string => {
  return `https://${S3_BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
};