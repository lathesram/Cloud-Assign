import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseHttpService {
  protected abstract baseUrl: string;

  protected handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  protected handleResponse<T>(response: any): T {
    if (response.success === false) {
      throw new Error(response.message || 'Request failed');
    }
    return response.data || response;
  }

  protected buildQueryParams(params: any): string {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key].toString());
      }
    });
    
    return queryParams.toString();
  }

  protected buildPaginationParams(params: PaginationParams): string {
    return this.buildQueryParams({
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder || 'asc'
    });
  }
}