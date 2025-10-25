import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamodb, TABLES } from '../../config/dynamodb';
import { Message, Conversation, SendMessageRequest } from '../../models/message.model';

export class MessagingService {

  private generateConversationId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `conv_${sortedIds[0]}_${sortedIds[1]}`;
  }

  async sendMessage(senderId: string, messageRequest: SendMessageRequest): Promise<Message> {
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();
    const conversationId = this.generateConversationId(senderId, messageRequest.receiverId);

    const message: Message = {
      messageId,
      conversationId,
      senderId,
      receiverId: messageRequest.receiverId,
      content: messageRequest.content,
      messageType: messageRequest.messageType,
      timestamp,
      isRead: false
    };

    try {
      await dynamodb.send(new PutCommand({
        TableName: TABLES.MESSAGES,
        Item: message
      }));

      await this.updateConversation(conversationId, [senderId, messageRequest.receiverId], message);

      return message;
    } catch (error) {
      throw new Error('Failed to send message');
    }
  }

  async getConversationMessages(
    userId1: string, 
    userId2: string, 
    limit: number = 50,
    lastEvaluatedKey?: any
  ): Promise<{ messages: Message[]; lastEvaluatedKey?: any }> {
    const conversationId = this.generateConversationId(userId1, userId2);

    try {
      const result = await dynamodb.send(new QueryCommand({
        TableName: TABLES.MESSAGES,
        KeyConditionExpression: 'conversationId = :conversationId',
        ExpressionAttributeValues: {
          ':conversationId': conversationId
        },
        ScanIndexForward: false,
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey
      }));

      return {
        messages: (result.Items as Message[]) || [],
        lastEvaluatedKey: result.LastEvaluatedKey
      };
    } catch (error) {
      throw new Error('Failed to retrieve messages');
    }
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const result = await dynamodb.send(new QueryCommand({
        TableName: TABLES.MESSAGES,
        KeyConditionExpression: 'conversationId = :conversationId',
        FilterExpression: 'receiverId = :userId AND isRead = :isRead',
        ExpressionAttributeValues: {
          ':conversationId': conversationId,
          ':userId': userId,
          ':isRead': false
        }
      }));

      const updatePromises = (result.Items || []).map((message: any) => 
        dynamodb.send(new UpdateCommand({
          TableName: TABLES.MESSAGES,
          Key: {
            conversationId: message.conversationId,
            timestamp: message.timestamp
          },
          UpdateExpression: 'SET isRead = :isRead',
          ExpressionAttributeValues: {
            ':isRead': true
          }
        }))
      );

      await Promise.all(updatePromises);
    } catch (error) {
      throw new Error('Failed to mark messages as read');
    }
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const result = await dynamodb.send(new QueryCommand({
        TableName: TABLES.CONVERSATIONS,
        FilterExpression: 'contains(participants, :userId)',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }));

      return (result.Items as Conversation[]) || [];
    } catch (error) {
      throw new Error('Failed to retrieve conversations');
    }
  }

  private async updateConversation(
    conversationId: string, 
    participants: string[], 
    lastMessage: Message
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    const conversation: Conversation = {
      conversationId,
      participants,
      lastMessage,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    try {
      await dynamodb.send(new PutCommand({
        TableName: TABLES.CONVERSATIONS,
        Item: conversation,
        ConditionExpression: 'attribute_not_exists(conversationId)'
      }));
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        await dynamodb.send(new UpdateCommand({
          TableName: TABLES.CONVERSATIONS,
          Key: { conversationId },
          UpdateExpression: 'SET lastMessage = :lastMessage, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':lastMessage': lastMessage,
            ':updatedAt': timestamp
          }
        }));
      } else {
        throw error;
      }
    }
  }
}
