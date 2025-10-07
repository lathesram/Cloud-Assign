#!/usr/bin/env node

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const region = process.env.AWS_REGION || 'us-east-1';
const dynamodbClient = new DynamoDBClient({ region });

// Table names from environment variables
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || 'skillbridge-users-college';
const BOOKINGS_TABLE_NAME = process.env.BOOKINGS_TABLE_NAME || 'skillbridge-bookings-college';
const MESSAGES_TABLE_NAME = process.env.MESSAGES_TABLE_NAME || 'skillbridge-messages-college';
const CODE_REVIEWS_TABLE_NAME = process.env.CODE_REVIEWS_TABLE_NAME || 'skillbridge-code-reviews-college';

// GSI names from environment variables
const USER_EMAIL_GSI_NAME = process.env.USER_EMAIL_GSI_NAME || 'email-index';
const USER_TYPE_GSI_NAME = process.env.USER_TYPE_GSI_NAME || 'type-index';
const USER_DOMAIN_GSI_NAME = process.env.USER_DOMAIN_GSI_NAME || 'domain-index';

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
      },
      {
        AttributeName: 'type',
        AttributeType: 'S'
      },
      {
        AttributeName: 'domain',
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
      },
      {
        IndexName: USER_TYPE_GSI_NAME,
        KeySchema: [
          {
            AttributeName: 'type',
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
      },
      {
        IndexName: USER_DOMAIN_GSI_NAME,
        KeySchema: [
          {
            AttributeName: 'domain',
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
        Value: 'user-service'
      }
    ]
  };

  try {
    const createResult = await dynamodbClient.send(new CreateTableCommand(tableParams));
    console.log(`✅ Users table created successfully: ${createResult.TableDescription.TableName}`);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Users table already exists: ${USERS_TABLE_NAME}`);
    } else {
      console.error('❌ Error creating Users table:', error);
      throw error;
    }
  }
}

async function createBookingsTable() {
  const tableParams = {
    TableName: BOOKINGS_TABLE_NAME,
    KeySchema: [
      {
        AttributeName: 'bookingId',
        KeyType: 'HASH'
      }
    ],
    AttributeDefinitions: [
      {
        AttributeName: 'bookingId',
        AttributeType: 'S'
      },
      {
        AttributeName: 'mentorId',
        AttributeType: 'S'
      },
      {
        AttributeName: 'menteeId',
        AttributeType: 'S'
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'mentor-index',
        KeySchema: [
          {
            AttributeName: 'mentorId',
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
      },
      {
        IndexName: 'mentee-index',
        KeySchema: [
          {
            AttributeName: 'menteeId',
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
        Value: 'user-service'
      }
    ]
  };

  try {
    const createResult = await dynamodbClient.send(new CreateTableCommand(tableParams));
    console.log(`✅ Bookings table created successfully: ${createResult.TableDescription.TableName}`);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Bookings table already exists: ${BOOKINGS_TABLE_NAME}`);
    } else {
      console.error('❌ Error creating Bookings table:', error);
      throw error;
    }
  }
}

async function createMessagesTable() {
  const tableParams = {
    TableName: MESSAGES_TABLE_NAME,
    KeySchema: [
      {
        AttributeName: 'messageId',
        KeyType: 'HASH'
      }
    ],
    AttributeDefinitions: [
      {
        AttributeName: 'messageId',
        AttributeType: 'S'
      },
      {
        AttributeName: 'conversationId',
        AttributeType: 'S'
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'conversation-index',
        KeySchema: [
          {
            AttributeName: 'conversationId',
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
        Value: 'user-service'
      }
    ]
  };

  try {
    const createResult = await dynamodbClient.send(new CreateTableCommand(tableParams));
    console.log(`✅ Messages table created successfully: ${createResult.TableDescription.TableName}`);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Messages table already exists: ${MESSAGES_TABLE_NAME}`);
    } else {
      console.error('❌ Error creating Messages table:', error);
      throw error;
    }
  }
}

async function createCodeReviewsTable() {
  const tableParams = {
    TableName: CODE_REVIEWS_TABLE_NAME,
    KeySchema: [
      {
        AttributeName: 'reviewId',
        KeyType: 'HASH'
      }
    ],
    AttributeDefinitions: [
      {
        AttributeName: 'reviewId',
        AttributeType: 'S'
      },
      {
        AttributeName: 'mentorId',
        AttributeType: 'S'
      },
      {
        AttributeName: 'menteeId',
        AttributeType: 'S'
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'mentor-reviews-index',
        KeySchema: [
          {
            AttributeName: 'mentorId',
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
      },
      {
        IndexName: 'mentee-reviews-index',
        KeySchema: [
          {
            AttributeName: 'menteeId',
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
        Value: 'user-service'
      }
    ]
  };

  try {
    const createResult = await dynamodbClient.send(new CreateTableCommand(tableParams));
    console.log(`✅ Code Reviews table created successfully: ${createResult.TableDescription.TableName}`);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Code Reviews table already exists: ${CODE_REVIEWS_TABLE_NAME}`);
    } else {
      console.error('❌ Error creating Code Reviews table:', error);
      throw error;
    }
  }
}

async function checkTableStatus(tableName) {
  try {
    const describeResult = await dynamodbClient.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`📊 Table ${tableName} status: ${describeResult.Table.TableStatus}`);
    return describeResult.Table.TableStatus === 'ACTIVE';
  } catch (error) {
    console.error(`❌ Error checking table ${tableName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting DynamoDB table creation for User Service...');
  console.log(`📍 Region: ${region}`);
  console.log(`📋 Tables to create:`);
  console.log(`   - ${USERS_TABLE_NAME}`);
  console.log(`   - ${BOOKINGS_TABLE_NAME}`);
  console.log(`   - ${MESSAGES_TABLE_NAME}`);
  console.log(`   - ${CODE_REVIEWS_TABLE_NAME}`);
  console.log('');

  try {
    // Create all tables
    await createUsersTable();
    await createBookingsTable();
    await createMessagesTable();
    await createCodeReviewsTable();

    console.log('');
    console.log('⏳ Waiting for tables to become active...');
    
    // Wait for all tables to become active
    const tableNames = [USERS_TABLE_NAME, BOOKINGS_TABLE_NAME, MESSAGES_TABLE_NAME, CODE_REVIEWS_TABLE_NAME];
    
    for (const tableName of tableNames) {
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max wait time
      
      while (attempts < maxAttempts) {
        const isActive = await checkTableStatus(tableName);
        if (isActive) {
          break;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`⏳ Waiting for ${tableName} to become active... (${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        }
      }
    }
    
    console.log('');
    console.log('🎉 All DynamoDB tables have been created successfully!');
    console.log('💡 You can now run your User Service application.');
  } catch (error) {
    console.error('💥 Failed to create DynamoDB tables:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createUsersTable,
  createBookingsTable,
  createMessagesTable,
  createCodeReviewsTable,
  checkTableStatus
};