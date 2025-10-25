import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();

const REGION = process.env.AWS_REGION || 'us-east-1';
export const USERS_TABLE = process.env.USERS_TABLE_NAME || 'skillbridge-users-college';
export const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE_NAME || 'skillbridge-bookings-college';
export const MESSAGES_TABLE = process.env.MESSAGES_TABLE_NAME || 'skillbridge-messages-college';
export const CODE_REVIEWS_TABLE = process.env.CODE_REVIEWS_TABLE_NAME || 'skillbridge-code-reviews-college';


export const USER_EMAIL_GSI = process.env.USER_EMAIL_GSI_NAME || 'email-index';
export const USER_TYPE_GSI = process.env.USER_TYPE_GSI_NAME || 'type-index';
export const USER_DOMAIN_GSI = process.env.USER_DOMAIN_GSI_NAME || 'domain-index';

let ddbDocClient: DynamoDBDocumentClient;

try {
  const clientConfig = {
    region: REGION,
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
  console.error('DynamoDB initialization failed:', error);
  throw new Error('DynamoDB AWS client initialization failed');
}

export const dynamodb = ddbDocClient;

export const TABLES = {
  USERS: USERS_TABLE,
  BOOKINGS: BOOKINGS_TABLE,
  MESSAGES: MESSAGES_TABLE,
  CODE_REVIEWS: CODE_REVIEWS_TABLE
} as const;

export async function checkDynamoDBConnection(): Promise<boolean> {
  try {
    const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
    await (ddbDocClient as any).send(new ListTablesCommand({}));
    return true;
  } catch (error) {
    console.error('DynamoDB connection test failed:', error);
    return false;
  }
}

export default dynamodb;