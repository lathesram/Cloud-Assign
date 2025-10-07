import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();

const REGION = process.env.AWS_REGION || 'us-east-1';
export const USERS_TABLE = process.env.USERS_TABLE_NAME || 'skillbridge-users-college';
export const USER_EMAIL_GSI = process.env.USER_EMAIL_GSI_NAME || 'email-index';

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
  USERS: USERS_TABLE
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
