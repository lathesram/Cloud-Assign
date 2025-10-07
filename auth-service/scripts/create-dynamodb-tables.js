#!/usr/bin/env node

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const region = process.env.AWS_REGION || 'us-east-1';
const dynamodbClient = new DynamoDBClient({ region });
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || 'skillbridge-users-college';
const USER_EMAIL_GSI_NAME = process.env.USER_EMAIL_GSI_NAME || 'email-index';

async function createUsersTable() {
  const tableParams = {
    TableName: USERS_TABLE_NAME,
    KeySchema: [
      {
        AttributeName: 'userId',
        KeyType: 'HASH'
      }
    ],
    AttributeDefinitions: [
      {
        AttributeName: 'userId',
        AttributeType: 'S'
      },
      {
        AttributeName: 'email',
        AttributeType: 'S'
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: USER_EMAIL_GSI_NAME,
        KeySchema: [
          {
            AttributeName: 'email',
            KeyType: 'HASH'
          }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    // Check if table already exists
    try {
      await dynamodbClient.send(new DescribeTableCommand({ TableName: USERS_TABLE_NAME }));
      console.log(`✅ Table '${USERS_TABLE_NAME}' already exists`);
      return;
    } catch (error) {
      // Table doesn't exist, create it
    }

    console.log(`🔄 Creating table '${USERS_TABLE_NAME}'...`);
    const result = await dynamodbClient.send(new CreateTableCommand(tableParams));
    
    console.log(`✅ Successfully created table '${USERS_TABLE_NAME}'`);
    console.log(`📝 Table ARN: ${result.TableDescription.TableArn}`);
    console.log(`🔍 GSI '${USER_EMAIL_GSI_NAME}' created for email lookups`);
    
  } catch (error) {
    console.error(`❌ Error creating table '${USERS_TABLE_NAME}':`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting DynamoDB table creation...');
    console.log(`📍 Region: ${region}`);
    console.log(`🔗 Endpoint: AWS DynamoDB`);
    
    await createUsersTable();
    
    console.log('✅ All tables created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your AWS credentials in .env file');
    console.log('2. Start your auth service with: npm run dev');
    console.log('3. Test the registration endpoint: POST /auth/register');
    
  } catch (error) {
    console.error('❌ Failed to create tables:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createUsersTable };