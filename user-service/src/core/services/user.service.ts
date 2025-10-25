import { v4 as uuidv4 } from 'uuid';
import { dynamodb, TABLES, USER_EMAIL_GSI } from '../../config/dynamodb';
import { 
  User, 
  UserProfile, 
  CreateUserRequest, 
  UpdateUserRequest, 
  SearchUsersRequest, 
  UserSearchResult 
} from '../models/user.model';
import { PutCommand, QueryCommand, GetCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

export class UserService {
  /**
   * Create a new user profile
   */
  async createUser(userData: CreateUserRequest): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {

      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists with this email'
        };
      }


      const userId = uuidv4();
      const now = new Date().toISOString();
      
      const user: User = {
        userId,
        email: userData.email,
        name: userData.name,
        type: userData.type,
        domain: userData.domain,
        seniority: userData.seniority,
        bio: userData.bio,
        skills: userData.skills || [],
        hourlyRate: userData.hourlyRate,
        availability: userData.timezone ? {
          timezone: userData.timezone,
          slots: []
        } : undefined,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        rating: 0,
        totalSessions: 0
      };


      await dynamodb.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: user,
        ConditionExpression: 'attribute_not_exists(userId)'
      }));

      return {
        success: true,
        user: this.mapToUserProfile(user),
        message: 'User profile created successfully'
      };
    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        message: 'Failed to create user profile'
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const result = await dynamodb.send(new GetCommand({
        TableName: TABLES.USERS,
        Key: { userId }
      }));

      if (!result.Item) {
        return null;
      }

      return this.mapToUserProfile(result.Item as User);
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await dynamodb.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: USER_EMAIL_GSI,
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        },
        Limit: 1
      }));

      return result.Items && result.Items.length > 0 ? result.Items[0] as User : null;
    } catch (error) {
      console.error('Get user by email error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {

      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        return {
          success: false,
          message: 'User not found'
        };
      }


      const updateExpression: string[] = [];
      const expressionAttributeNames: { [key: string]: string } = {};
      const expressionAttributeValues: { [key: string]: any } = {};

      if (updateData.name !== undefined) {
        updateExpression.push('#name = :name');
        expressionAttributeNames['#name'] = 'name';
        expressionAttributeValues[':name'] = updateData.name;
      }

      if (updateData.domain !== undefined) {
        updateExpression.push('domain = :domain');
        expressionAttributeValues[':domain'] = updateData.domain;
      }

      if (updateData.seniority !== undefined) {
        updateExpression.push('seniority = :seniority');
        expressionAttributeValues[':seniority'] = updateData.seniority;
      }

      if (updateData.bio !== undefined) {
        updateExpression.push('bio = :bio');
        expressionAttributeValues[':bio'] = updateData.bio;
      }

      if (updateData.skills !== undefined) {
        updateExpression.push('skills = :skills');
        expressionAttributeValues[':skills'] = updateData.skills;
      }

      if (updateData.hourlyRate !== undefined) {
        updateExpression.push('hourlyRate = :hourlyRate');
        expressionAttributeValues[':hourlyRate'] = updateData.hourlyRate;
      }

      if (updateData.availability !== undefined) {
        updateExpression.push('availability = :availability');
        expressionAttributeValues[':availability'] = updateData.availability;
      }

      if (updateData.profilePicture !== undefined) {
        updateExpression.push('profilePicture = :profilePicture');
        expressionAttributeValues[':profilePicture'] = updateData.profilePicture;
      }

      if (updateData.linkedinProfile !== undefined) {
        updateExpression.push('linkedinProfile = :linkedinProfile');
        expressionAttributeValues[':linkedinProfile'] = updateData.linkedinProfile;
      }

      if (updateData.githubProfile !== undefined) {
        updateExpression.push('githubProfile = :githubProfile');
        expressionAttributeValues[':githubProfile'] = updateData.githubProfile;
      }


      updateExpression.push('updatedAt = :updatedAt');
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      if (updateExpression.length === 1) { // Only updatedAt
        return {
          success: false,
          message: 'No fields to update'
        };
      }


      const updateParams: any = {
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: 'SET ' + updateExpression.join(', '),
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      };

      if (Object.keys(expressionAttributeNames).length > 0) {
        updateParams.ExpressionAttributeNames = expressionAttributeNames;
      }

      const result = await dynamodb.send(new UpdateCommand(updateParams));

      return {
        success: true,
        user: this.mapToUserProfile(result.Attributes as User),
        message: 'User profile updated successfully'
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        message: 'Failed to update user profile'
      };
    }
  }

  /**
   * Search users
   */
  async searchUsers(searchParams: SearchUsersRequest): Promise<UserSearchResult> {
    try {
      const {
        type,
        domain,
        skills,
        seniority,
        minRating,
        maxHourlyRate,
        page = 1,
        limit = 10
      } = searchParams;


      const filterExpressions: string[] = [];
      const expressionAttributeValues: { [key: string]: any } = {};

      if (type) {
        filterExpressions.push('#type = :type');
        expressionAttributeValues[':type'] = type;
      }

      if (domain) {
        filterExpressions.push('domain = :domain');
        expressionAttributeValues[':domain'] = domain;
      }

      if (seniority) {
        filterExpressions.push('seniority = :seniority');
        expressionAttributeValues[':seniority'] = seniority;
      }

      if (minRating !== undefined) {
        filterExpressions.push('rating >= :minRating');
        expressionAttributeValues[':minRating'] = minRating;
      }

      if (maxHourlyRate !== undefined) {
        filterExpressions.push('hourlyRate <= :maxHourlyRate');
        expressionAttributeValues[':maxHourlyRate'] = maxHourlyRate;
      }


      filterExpressions.push('isActive = :isActive');
      expressionAttributeValues[':isActive'] = true;

      let params: any = {
        TableName: TABLES.USERS,
        FilterExpression: filterExpressions.join(' AND '),
        ExpressionAttributeValues: expressionAttributeValues
      };

      if (type) {
        params.ExpressionAttributeNames = { '#type': 'type' };
      }

      const result = await dynamodb.send(new ScanCommand(params));
      let users = result.Items as User[] || [];


      if (skills && skills.length > 0) {
        users = users.filter(user => 
          user.skills && skills.some(skill => 
            user.skills?.some(userSkill => 
              userSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }


      const total = users.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedUsers = users.slice(startIndex, startIndex + limit);

      return {
        users: paginatedUsers.map(user => this.mapToUserProfile(user)),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Search users error:', error);
      return {
        users: [],
        pagination: {
          page: searchParams.page || 1,
          limit: searchParams.limit || 10,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await dynamodb.send(new UpdateCommand({
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: 'SET isActive = :isActive, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':isActive': false,
          ':updatedAt': new Date().toISOString()
        }
      }));

      return {
        success: true,
        message: 'User deactivated successfully'
      };
    } catch (error) {
      console.error('Deactivate user error:', error);
      return {
        success: false,
        message: 'Failed to deactivate user'
      };
    }
  }

  /**
   * Map User to UserProfile
   */
  private mapToUserProfile(user: User): UserProfile {
    return {
      userId: user.userId,
      name: user.name,
      type: user.type,
      domain: user.domain,
      seniority: user.seniority,
      bio: user.bio,
      skills: user.skills,
      rating: user.rating,
      totalSessions: user.totalSessions,
      hourlyRate: user.hourlyRate,
      profilePicture: user.profilePicture
    };
  }
}