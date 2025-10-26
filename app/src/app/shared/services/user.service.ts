import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserProfile,
  SearchUsersRequest,
  UserSearchResult,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '../models';
import { BaseHttpService } from './base-http.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseHttpService {
  protected baseUrl = `${environment.services.userService}/api/users`;

  constructor(private http: HttpClient) {
    super();
  }
  getUsers(params?: PaginationParams): Observable<PaginatedResponse<User>> {
    const queryString = params ? this.buildPaginationParams(params) : '';
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return this.http.get<PaginatedResponse<User>>(url)
      .pipe(
        map(response => this.handleResponse<PaginatedResponse<User>>(response)),
        catchError(this.handleError)
      );
  }
  getUserById(userId: string): Observable<User> {
    const url = `${this.baseUrl}/${userId}`;
    console.log('Making API call to:', url);
    
    return this.http.get<any>(url)
      .pipe(
        map(response => {
          console.log('Raw API Response for getUserById:', response);
          if (response.success === false) {
            throw new Error(response.message || 'Request failed');
          }
          // Backend returns data in 'user' property, not 'data'
          const userData = response.user || response.data || response;
          console.log('Extracted user data:', userData);
          return userData;
        }),
        catchError((error) => {
          console.error('API Error in getUserById:', error);
          return this.handleError(error);
        })
      );
  }
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.baseUrl}/${userId}/profile`)
      .pipe(
        map(response => this.handleResponse<UserProfile>(response)),
        catchError(this.handleError)
      );
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.baseUrl, userData)
      .pipe(
        map(response => this.handleResponse<User>(response)),
        catchError(this.handleError)
      );
  }

  updateUser(userId: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${userId}`, userData)
      .pipe(
        map(response => this.handleResponse<User>(response)),
        catchError(this.handleError)
      );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${userId}`)
      .pipe(
        map(response => this.handleResponse<void>(response)),
        catchError(this.handleError)
      );
  }

  getMentors(params?: PaginationParams): Observable<PaginatedResponse<User>> {
    const queryString = params ? this.buildPaginationParams(params) : '';
    const baseQuery = 'type=mentor';
    const url = queryString 
      ? `${this.baseUrl}/search?${baseQuery}&${queryString}`
      : `${this.baseUrl}/search?${baseQuery}`;
    
    return this.http.get<any>(url)
      .pipe(
        map(response => {
          if (response.success === false) {
            throw new Error(response.message || 'Request failed');
          }
          // Transform backend response to frontend expected format
          return {
            data: response.users || [],
            pagination: response.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
          } as PaginatedResponse<User>;
        }),
        catchError(this.handleError)
      );
  }

  getMentees(params?: PaginationParams): Observable<PaginatedResponse<User>> {
    const queryString = params ? this.buildPaginationParams(params) : '';
    const baseQuery = 'type=mentee';
    const url = queryString 
      ? `${this.baseUrl}/search?${baseQuery}&${queryString}`
      : `${this.baseUrl}/search?${baseQuery}`;
    
    return this.http.get<any>(url)
      .pipe(
        map(response => {
          if (response.success === false) {
            throw new Error(response.message || 'Request failed');
          }
          // Transform backend response to frontend expected format
          return {
            data: response.users || [],
            pagination: response.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
          } as PaginatedResponse<User>;
        }),
        catchError(this.handleError)
      );
  }

  searchUsers(searchParams: SearchUsersRequest): Observable<UserSearchResult> {
    const params = this.buildQueryParams(searchParams);
    return this.http.get<ApiResponse<UserSearchResult>>(`${this.baseUrl}/search?${params}`)
      .pipe(
        map(response => this.handleResponse<UserSearchResult>(response)),
        catchError(this.handleError)
      );
  }

  getUserByEmail(email: string): Observable<User | null> {
    // Since there's no direct by-email endpoint, we'll use search to find the user
    // Note: This is a workaround and assumes the search can find users by email
    return this.searchUsers({ search: email, page: 1, limit: 1 })
      .pipe(
        map(response => {
          // Look for exact email match in the results
          const user = response.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
          return user as User || null;
        }),
        catchError((error) => {
          if (error.status === 404) {
            return [null];
          }
          return this.handleError(error);
        })
      );
  }

  deactivateUser(userId: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${userId}/deactivate`, {})
      .pipe(
        map(response => this.handleResponse<void>(response)),
        catchError(this.handleError)
      );
  }

  activateUser(userId: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${userId}/activate`, {})
      .pipe(
        map(response => this.handleResponse<void>(response)),
        catchError(this.handleError)
      );
  }

  // Advanced search with all filters
  advancedSearch(params: {
    query?: string;
    type?: 'mentor' | 'mentee';
    domain?: string;
    seniority?: string;
    skills?: string[];
    minRating?: number;
    maxHourlyRate?: number;
    minHourlyRate?: number;
    page?: number;
    limit?: number;
  }): Observable<UserSearchResult> {
    const searchParams: SearchUsersRequest = {
      search: params.query,
      type: params.type,
      domain: params.domain,
      seniority: params.seniority,
      skills: params.skills,
      minRating: params.minRating,
      maxHourlyRate: params.maxHourlyRate,
      page: params.page || 1,
      limit: params.limit || 10
    };
    
    return this.searchUsers(searchParams);
  }

  // Get users with detailed filters
  getUsersWithFilters(filters: {
    type?: 'mentor' | 'mentee';
    domain?: string;
    seniority?: string;
    status?: 'active' | 'inactive';
    minRating?: number;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<User>> {
    const queryParams = {
      ...filters,
      isActive: filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined
    };
    
    const queryString = this.buildQueryParams(queryParams);
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return this.http.get<PaginatedResponse<User>>(url)
      .pipe(
        map(response => this.handleResponse<PaginatedResponse<User>>(response)),
        catchError(this.handleError)
      );
  }
}