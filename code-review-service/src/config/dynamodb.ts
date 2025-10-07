import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();

export const CODE_REVIEWS_TABLE = process.env.CODE_REVIEWS_TABLE_NAME || 'skillbridge-code-reviews';

const baseClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1'
});

export const ddbDocClient = DynamoDBDocumentClient.from(baseClient);

export const validateTableSchema = () => {
  if (!process.env.CODE_REVIEWS_TABLE_NAME || !process.env.AWS_REGION) {
    throw new Error('Missing required environment variables');
  }
};