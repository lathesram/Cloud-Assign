#!/usr/bin/env node

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const region = process.env.AWS_REGION || 'us-east-1';
const dynamodbClient = new DynamoDBClient({ region });

// Table names from environment variables
const MESSAGES_TABLE_NAME = process.env.MESSAGES_TABLE_NAME || 'skillbridge-messages-college';
const CONVERSATIONS_TABLE_NAME = process.env.CONVERSATIONS_TABLE_NAME || 'skillbridge-conversations-college';

async function createMessagesTable() {
  const tableParams = {
    TableName: MESSAGES_TABLE_NAME,
    KeySchema: [
      {
        AttributeName: 'conversationId',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'timestamp',
        KeyType: 'RANGE'
      }
    ],
    AttributeDefinitions: [
      {
        AttributeName: 'conversationId',
        AttributeType: 'S'
      },
      {
        AttributeName: 'timestamp',
        AttributeType: 'S'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    StreamSpecification: {
      StreamEnabled: true,
      StreamViewType: 'NEW_AND_OLD_IMAGES'
    },
    Tags: [
      {
        Key: 'Environment',
        Value: 'college'
      },
      {
        Key: 'Project',
        Value: 'skillbridge'
      },
      {
        Key: 'Service',
        Value: 'messaging'
      }
    ]
  };

  try {
    console.log(`Creating Messages table: ${MESSAGES_TABLE_NAME}...`);
    const result = await dynamodbClient.send(new CreateTableCommand(tableParams));
    console.log(`✅ Messages table created successfully:`, result.TableDescription.TableName);
    return result.TableDescription;
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Messages table ${MESSAGES_TABLE_NAME} already exists`);
      return await getTableDescription(MESSAGES_TABLE_NAME);
    } else {
      console.error(`❌ Error creating Messages table:`, error);
      throw error;
    }
  }
}

async function createConversationsTable() {
  const tableParams = {
    TableName: CONVERSATIONS_TABLE_NAME,
    KeySchema: [
      {
        AttributeName: 'conversationId',
        KeyType: 'HASH'
      }
    ],
    AttributeDefinitions: [
      {
        AttributeName: 'conversationId',
        AttributeType: 'S'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    StreamSpecification: {
      StreamEnabled: true,
      StreamViewType: 'NEW_AND_OLD_IMAGES'
    },
    Tags: [
      {
        Key: 'Environment',
        Value: 'college'
      },
      {
        Key: 'Project',
        Value: 'skillbridge'
      },
      {
        Key: 'Service',
        Value: 'messaging'
      }
    ]
  };

  try {
    console.log(`Creating Conversations table: ${CONVERSATIONS_TABLE_NAME}...`);
    const result = await dynamodbClient.send(new CreateTableCommand(tableParams));
    console.log(`✅ Conversations table created successfully:`, result.TableDescription.TableName);
    return result.TableDescription;
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Conversations table ${CONVERSATIONS_TABLE_NAME} already exists`);
      return await getTableDescription(CONVERSATIONS_TABLE_NAME);
    } else {
      console.error(`❌ Error creating Conversations table:`, error);
      throw error;
    }
  }
}

async function getTableDescription(tableName) {
  try {
    const result = await dynamodbClient.send(new DescribeTableCommand({
      TableName: tableName
    }));
    return result.Table;
  } catch (error) {
    console.error(`Error describing table ${tableName}:`, error);
    throw error;
  }
}

async function waitForTableActive(tableName, maxWaitTime = 300000) { // 5 minutes max
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const table = await getTableDescription(tableName);
      console.log(`📊 Table ${tableName} status: ${table.TableStatus}`);
      
      if (table.TableStatus === 'ACTIVE') {
        console.log(`✅ Table ${tableName} is now ACTIVE`);
        return table;
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error checking table status for ${tableName}:`, error);
      throw error;
    }
  }
  
  throw new Error(`Table ${tableName} did not become ACTIVE within ${maxWaitTime / 1000} seconds`);
}

async function createAllTables() {
  console.log('🚀 Starting DynamoDB table creation for Messaging Service...\n');

  try {
    // Create Messages table
    const messagesTable = await createMessagesTable();
    
    // Create Conversations table
    const conversationsTable = await createConversationsTable();

    // Wait for both tables to become active
    console.log('\n⏳ Waiting for tables to become active...');
    
    await Promise.all([
      waitForTableActive(MESSAGES_TABLE_NAME),
      waitForTableActive(CONVERSATIONS_TABLE_NAME)
    ]);

    console.log('\n🎉 All Messaging Service tables are ready!\n');
    
    console.log('📋 Table Summary:');
    console.log(`   • Messages Table: ${MESSAGES_TABLE_NAME}`);
    console.log(`   • Conversations Table: ${CONVERSATIONS_TABLE_NAME}\n`);

    console.log('🔗 You can now start the messaging service with:');
    console.log('   npm run dev\n');

  } catch (error) {
    console.error('❌ Failed to create tables:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  createAllTables();
}

module.exports = {
  createAllTables,
  createMessagesTable,
  createConversationsTable
};