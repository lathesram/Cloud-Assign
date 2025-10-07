import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import * as dotenv from "dotenv";

dotenv.config();

const REGION = process.env.AWS_REGION || "us-east-1";
export const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE_NAME || "skillbridge-bookings-college";

let ddbDocClient: DynamoDBDocumentClient;

try {
  const clientConfig: any = {
    region: REGION,
    maxAttempts: 3,
    retryMode: "adaptive" as const
  };

  // Add credentials if provided in environment variables
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
  }

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
  throw new Error("DynamoDB AWS client initialization failed");
}

export const dynamodb = ddbDocClient;

export const TABLES = {
  BOOKINGS: BOOKINGS_TABLE
} as const;

export async function checkDynamoDBConnection(): Promise<boolean> {
  try {
    const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
    await (ddbDocClient as any).send(new ListTablesCommand({}));
    return true;
  } catch (error) {
    return false;
  }
}

export default dynamodb;
