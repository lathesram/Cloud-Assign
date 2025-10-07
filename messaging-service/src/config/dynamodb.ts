import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();

const REGION = process.env.AWS_REGION || 'ap-southeast-1';
export const MESSAGES_TABLE = process.env.MESSAGES_TABLE_NAME || 'skillbridge-messages-college';
export const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE_NAME || 'skillbridge-conversations-college';

let ddbDocClient: DynamoDBDocumentClient;

try {
  const clientConfig = {
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    },
    maxAttempts: 3,
    retryMode: 'adaptive' as const
  };

  const baseClient = new DynamoDBClient(clientConfig);
  ddbDocClient = DynamoDBDocumentClient.from(baseClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
      convertEmptyValues: false
    },
    unmarshallOptions: {
      wrapNumbers: false
    }
  });

} catch (error) {

  throw new Error('DynamoDB AWS client initialization failed');
}

export const dynamodb = ddbDocClient;

export const TABLES = {
  MESSAGES: MESSAGES_TABLE,
  CONVERSATIONS: CONVERSATIONS_TABLE
} as const;
