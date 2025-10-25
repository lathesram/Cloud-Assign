import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  CodeReview, 
  CreateReviewRequest, 
  UpdateReviewRequest,
  Annotation,
  CreateAnnotationRequest,
  ReviewFilter,
  ReviewStats,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '../models';
import { BaseHttpService } from './base-http.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CodeReviewService extends BaseHttpService {
  protected baseUrl = `${environment.services.codeReviewService}/api/code-reviews`;

  constructor(private http: HttpClient) {
    super();
  }

  getCodeReviews(params?: PaginationParams, filters?: ReviewFilter): Observable<PaginatedResponse<CodeReview>> {
    const paginationQuery = params ? this.buildPaginationParams(params) : '';
    const filterQuery = filters ? this.buildQueryParams(filters) : '';
    
    let queryString = '';
    if (paginationQuery && filterQuery) {
      queryString = `${paginationQuery}&${filterQuery}`;
    } else {
      queryString = paginationQuery || filterQuery;
    }
    
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return this.http.get<PaginatedResponse<CodeReview>>(url)
      .pipe(
        map(response => this.handleResponse<PaginatedResponse<CodeReview>>(response)),
        catchError(this.handleError)
      );
  }

  getCodeReviewById(reviewId: string): Observable<CodeReview> {
    return this.http.get<ApiResponse<CodeReview>>(`${this.baseUrl}/${reviewId}`)
      .pipe(
        map(response => this.handleResponse<CodeReview>(response)),
        catchError(this.handleError)
      );
  }

  createCodeReview(reviewData: CreateReviewRequest): Observable<CodeReview> {
    return this.http.post<ApiResponse<CodeReview>>(this.baseUrl, reviewData)
      .pipe(
        map(response => this.handleResponse<CodeReview>(response)),
        catchError(this.handleError)
      );
  }

  updateCodeReview(reviewId: string, reviewData: UpdateReviewRequest): Observable<CodeReview> {
    return this.http.put<ApiResponse<CodeReview>>(`${this.baseUrl}/${reviewId}`, reviewData)
      .pipe(
        map(response => this.handleResponse<CodeReview>(response)),
        catchError(this.handleError)
      );
  }

  deleteCodeReview(reviewId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${reviewId}`)
      .pipe(
        map(response => this.handleResponse<void>(response)),
        catchError(this.handleError)
      );
  }

  uploadFile(reviewId: string, file: File): Observable<{ fileUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<ApiResponse<{ fileUrl: string; fileName: string }>>(`${this.baseUrl}/${reviewId}/upload`, formData)
      .pipe(
        map(response => this.handleResponse<{ fileUrl: string; fileName: string }>(response)),
        catchError(this.handleError)
      );
  }

  getCodeReviewsByMentee(menteeId: string, params?: PaginationParams): Observable<PaginatedResponse<CodeReview>> {
    const queryString = params ? this.buildPaginationParams(params) : '';
    const url = queryString 
      ? `${this.baseUrl}/mentee/${menteeId}?${queryString}`
      : `${this.baseUrl}/mentee/${menteeId}`;
    
    return this.http.get<PaginatedResponse<CodeReview>>(url)
      .pipe(
        map(response => this.handleResponse<PaginatedResponse<CodeReview>>(response)),
        catchError(this.handleError)
      );
  }

  getCodeReviewsByMentor(mentorId: string, params?: PaginationParams): Observable<PaginatedResponse<CodeReview>> {
    const queryString = params ? this.buildPaginationParams(params) : '';
    const url = queryString 
      ? `${this.baseUrl}/mentor/${mentorId}?${queryString}`
      : `${this.baseUrl}/mentor/${mentorId}`;
    
    return this.http.get<PaginatedResponse<CodeReview>>(url)
      .pipe(
        map(response => this.handleResponse<PaginatedResponse<CodeReview>>(response)),
        catchError(this.handleError)
      );
  }

  assignMentor(reviewId: string, mentorId: string): Observable<CodeReview> {
    return this.updateCodeReview(reviewId, { mentorId, status: 'in-review' });
  }

  completeCodeReview(reviewId: string): Observable<CodeReview> {
    return this.updateCodeReview(reviewId, { status: 'completed' });
  }

  getCodeReviewStats(userId?: string): Observable<ReviewStats> {
    const url = userId ? `${this.baseUrl}/stats?userId=${userId}` : `${this.baseUrl}/stats`;
    return this.http.get<ApiResponse<ReviewStats>>(url)
      .pipe(
        map(response => this.handleResponse<ReviewStats>(response)),
        catchError(this.handleError)
      );
  }

  getAnnotations(reviewId: string): Observable<Annotation[]> {
    return this.http.get<ApiResponse<Annotation[]>>(`${this.baseUrl}/${reviewId}/annotations`)
      .pipe(
        map(response => this.handleResponse<Annotation[]>(response)),
        catchError(this.handleError)
      );
  }

  createAnnotation(reviewId: string, annotationData: CreateAnnotationRequest): Observable<Annotation> {
    return this.http.post<ApiResponse<Annotation>>(`${this.baseUrl}/${reviewId}/annotations`, annotationData)
      .pipe(
        map(response => this.handleResponse<Annotation>(response)),
        catchError(this.handleError)
      );
  }

  updateAnnotation(reviewId: string, annotationId: string, annotationData: Partial<CreateAnnotationRequest>): Observable<Annotation> {
    return this.http.put<ApiResponse<Annotation>>(`${this.baseUrl}/${reviewId}/annotations/${annotationId}`, annotationData)
      .pipe(
        map(response => this.handleResponse<Annotation>(response)),
        catchError(this.handleError)
      );
  }

  deleteAnnotation(reviewId: string, annotationId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${reviewId}/annotations/${annotationId}`)
      .pipe(
        map(response => this.handleResponse<void>(response)),
        catchError(this.handleError)
      );
  }

  getPendingReviews(mentorId?: string): Observable<CodeReview[]> {
    const url = mentorId ? `${this.baseUrl}/pending?mentorId=${mentorId}` : `${this.baseUrl}/pending`;
    return this.http.get<ApiResponse<CodeReview[]>>(url)
      .pipe(
        map(response => this.handleResponse<CodeReview[]>(response)),
        catchError(this.handleError)
      );
  }
}
