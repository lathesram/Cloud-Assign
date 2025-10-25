import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserProfile,
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
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${userId}`)
      .pipe(
        map(response => this.handleResponse<User>(response)),
        catchError(this.handleError)
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
      ? `${this.baseUrl}?${baseQuery}&${queryString}`
      : `${this.baseUrl}?${baseQuery}`;
    
    return this.http.get<PaginatedResponse<User>>(url)
      .pipe(
        map(response => this.handleResponse<PaginatedResponse<User>>(response)),
        catchError(this.handleError)
      );
  }

  getMentees(params?: PaginationParams): Observable<PaginatedResponse<User>> {
    const queryString = params ? this.buildPaginationParams(params) : '';
    const baseQuery = 'type=mentee';
    const url = queryString 
      ? `${this.baseUrl}?${baseQuery}&${queryString}`
      : `${this.baseUrl}?${baseQuery}`;
    
    return this.http.get<PaginatedResponse<User>>(url)
      .pipe(
        map(response => this.handleResponse<PaginatedResponse<User>>(response)),
        catchError(this.handleError)
      );
  }

  searchUsers(query: string, type?: 'mentor' | 'mentee'): Observable<User[]> {
    const params = this.buildQueryParams({ q: query, type });
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/search?${params}`)
      .pipe(
        map(response => this.handleResponse<User[]>(response)),
        catchError(this.handleError)
      );
  }
}