import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  Booking, 
  CreateBookingRequest, 
  UpdateBookingRequest,
  BookingFilter,
  BookingStats,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '../models';
import { BaseHttpService } from './base-http.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService extends BaseHttpService {
  protected baseUrl = `${environment.services.bookingService}/api/bookings`;

  constructor(private http: HttpClient) {
    super();
  }

  getBookings(params?: PaginationParams, filters?: BookingFilter): Observable<PaginatedResponse<Booking>> {
    const paginationQuery = params ? this.buildPaginationParams(params) : '';
    const filterQuery = filters ? this.buildQueryParams(filters) : '';
    
    let queryString = '';
    if (paginationQuery && filterQuery) {
      queryString = `${paginationQuery}&${filterQuery}`;
    } else {
      queryString = paginationQuery || filterQuery;
    }
    
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return this.http.get<PaginatedResponse<Booking>>(url)
      .pipe(
        map(response => this.handleResponse<PaginatedResponse<Booking>>(response)),
        catchError(this.handleError)
      );
  }

  getBookingById(bookingId: string): Observable<Booking> {
    return this.http.get<ApiResponse<Booking>>(`${this.baseUrl}/${bookingId}`)
      .pipe(
        map(response => this.handleResponse<Booking>(response)),
        catchError(this.handleError)
      );
  }

  createBooking(bookingData: CreateBookingRequest): Observable<Booking> {
    return this.http.post<ApiResponse<Booking>>(this.baseUrl, bookingData)
      .pipe(
        map(response => this.handleResponse<Booking>(response)),
        catchError(this.handleError)
      );
  }

  updateBooking(bookingId: string, bookingData: UpdateBookingRequest): Observable<Booking> {
    return this.http.put<ApiResponse<Booking>>(`${this.baseUrl}/${bookingId}`, bookingData)
      .pipe(
        map(response => this.handleResponse<Booking>(response)),
        catchError(this.handleError)
      );
  }

  deleteBooking(bookingId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${bookingId}`)
      .pipe(
        map(response => this.handleResponse<void>(response)),
        catchError(this.handleError)
      );
  }

  getBookingsByMentor(mentorId: string, params?: PaginationParams): Observable<PaginatedResponse<Booking>> {
    const queryString = params ? this.buildPaginationParams(params) : '';
    const url = queryString 
      ? `${this.baseUrl}/mentor/${mentorId}?${queryString}`
      : `${this.baseUrl}/mentor/${mentorId}`;
    
    return this.http.get<PaginatedResponse<Booking>>(url)
      .pipe(
        map(response => this.handleResponse<PaginatedResponse<Booking>>(response)),
        catchError(this.handleError)
      );
  }

  getBookingsByMentee(menteeId: string, params?: PaginationParams): Observable<PaginatedResponse<Booking>> {
    const queryString = params ? this.buildPaginationParams(params) : '';
    const url = queryString 
      ? `${this.baseUrl}/mentee/${menteeId}?${queryString}`
      : `${this.baseUrl}/mentee/${menteeId}`;
    
    return this.http.get<PaginatedResponse<Booking>>(url)
      .pipe(
        map(response => this.handleResponse<PaginatedResponse<Booking>>(response)),
        catchError(this.handleError)
      );
  }

  acceptBooking(bookingId: string, meetingLink?: string): Observable<Booking> {
    const updateData: UpdateBookingRequest = { 
      status: 'accepted',
      meetingLink 
    };
    return this.updateBooking(bookingId, updateData);
  }

  declineBooking(bookingId: string, notes?: string): Observable<Booking> {
    const updateData: UpdateBookingRequest = { 
      status: 'declined',
      notes 
    };
    return this.updateBooking(bookingId, updateData);
  }

  completeBooking(bookingId: string, notes?: string): Observable<Booking> {
    const updateData: UpdateBookingRequest = { 
      status: 'completed',
      notes 
    };
    return this.updateBooking(bookingId, updateData);
  }

  getBookingStats(userId?: string): Observable<BookingStats> {
    const url = userId ? `${this.baseUrl}/stats?userId=${userId}` : `${this.baseUrl}/stats`;
    return this.http.get<ApiResponse<BookingStats>>(url)
      .pipe(
        map(response => this.handleResponse<BookingStats>(response)),
        catchError(this.handleError)
      );
  }

  getUpcomingBookings(userId: string, userType: 'mentor' | 'mentee'): Observable<Booking[]> {
    const endpoint = userType === 'mentor' ? 'mentor' : 'mentee';
    return this.http.get<ApiResponse<Booking[]>>(`${this.baseUrl}/${endpoint}/${userId}/upcoming`)
      .pipe(
        map(response => this.handleResponse<Booking[]>(response)),
        catchError(this.handleError)
      );
  }
}
