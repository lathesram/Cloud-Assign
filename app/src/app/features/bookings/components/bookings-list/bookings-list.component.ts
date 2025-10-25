import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../../shared/services/booking.service';
import { Booking } from '../../../../shared/models/booking.model';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterLink
  ],
  template: `
    <div class="main-container">
      <div class="page-header">
        <h1 class="page-title">Booking Management</h1>
        <p class="page-subtitle">Manage mentor-mentee sessions and appointments</p>
      </div>
      
      <div class="content-card">
        <div class="filters-section">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="search-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Search bookings...</mat-label>
                  <input matInput 
                         [(ngModel)]="searchQuery" 
                         (input)="onSearchChange()"
                         placeholder="Search by title, mentor, or mentee">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-2">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Status</mat-label>
                  <mat-select [(value)]="selectedStatus" (selectionChange)="onFilterChange()">
                    <mat-option value="">All Status</mat-option>
                    <mat-option value="requested">Requested</mat-option>
                    <mat-option value="accepted">Accepted</mat-option>
                    <mat-option value="completed">Completed</mat-option>
                    <mat-option value="cancelled">Cancelled</mat-option>
                    <mat-option value="declined">Declined</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-3">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>From Date</mat-label>
                  <input matInput 
                         [matDatepicker]="fromPicker" 
                         [(ngModel)]="fromDate"
                         (dateChange)="onFilterChange()">
                  <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #fromPicker></mat-datepicker>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-3">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>To Date</mat-label>
                  <input matInput 
                         [matDatepicker]="toPicker" 
                         [(ngModel)]="toDate"
                         (dateChange)="onFilterChange()">
                  <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
                  <mat-datepicker #toPicker></mat-datepicker>
                </mat-form-field>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="action-bar">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="mb-0">Bookings ({{ filteredBookings.length }})</h3>
            <button mat-raised-button routerLink="/bookings/form">
              <mat-icon>event_available</mat-icon>
              Create New Booking
            </button>
          </div>
        </div>

        <div class="table-container">
          @if (loading) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
              <div class="loading-text">Loading bookings...</div>
            </div>
          } @else if (filteredBookings.length === 0) {
            <div class="empty-state">
              <mat-icon>event_busy</mat-icon>
              <h3>No bookings found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table mat-table [dataSource]="filteredBookings" class="w-100">
                    <!-- Session Column -->
                    <ng-container matColumnDef="session">
                      <th mat-header-cell *matHeaderCellDef>Session</th>
                      <td mat-cell *matCellDef="let booking">
                        <div class="session-info">
                          <div class="session-title">{{ booking.sessionTitle || 'Mentoring Session' }}</div>
                          <div class="session-description">{{ booking.description }}</div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Participants Column -->
                    <ng-container matColumnDef="participants">
                      <th mat-header-cell *matHeaderCellDef>Participants</th>
                      <td mat-cell *matCellDef="let booking">
                        <div class="participants">
                          <span class="participant-chip">
                            👨‍🏫 {{ booking.mentorName || 'Mentor' }}
                          </span>
                          <span class="participant-chip">
                            👤 {{ booking.menteeName || 'Mentee' }}
                          </span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Schedule Column -->
                    <ng-container matColumnDef="schedule">
                      <th mat-header-cell *matHeaderCellDef>Schedule</th>
                      <td mat-cell *matCellDef="let booking">
                        <div class="datetime-info">
                          <div class="date-text">{{ formatDate(booking.timeslot) }}</div>
                          <div class="time-text">{{ formatTime(booking.timeslot) }}</div>
                          @if (booking.duration) {
                            <div class="duration-badge">{{ booking.duration }} min</div>
                          }
                        </div>
                      </td>
                    </ng-container>

                    <!-- Status Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let booking">
                        <span class="status-chip" [class]="booking.status">
                          {{ booking.status | titlecase }}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Amount Column -->
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Amount</th>
                      <td mat-cell *matCellDef="let booking">
                        @if (booking.totalAmount) {
                          <div class="fw-bold">\${{ booking.totalAmount }}</div>
                          @if (booking.mentorRate) {
                            <small class="text-muted">\${{ booking.mentorRate }}/hr</small>
                          }
                        } @else {
                          <span class="text-muted">-</span>
                        }
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let booking">
                        <button mat-icon-button [routerLink]="['/bookings/details', booking.bookingId]" 
                                matTooltip="View Details" class="action-button">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button [routerLink]="['/bookings/form', booking.bookingId]" 
                                matTooltip="Edit Booking" class="action-button">
                          <mat-icon>edit</mat-icon>
                        </button>
                        @if (booking.status === 'requested') {
                          <button mat-icon-button color="primary" (click)="acceptBooking(booking.bookingId)" 
                                  matTooltip="Accept" class="action-button">
                            <mat-icon>check</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" (click)="declineBooking(booking.bookingId)" 
                                  matTooltip="Decline" class="action-button">
                            <mat-icon>close</mat-icon>
                          </button>
                        }
                        @if (booking.status === 'accepted') {
                          <button mat-icon-button color="accent" (click)="completeBooking(booking.bookingId)" 
                                  matTooltip="Mark Complete" class="action-button">
                            <mat-icon>done</mat-icon>
                          </button>
                        }
                        <button mat-icon-button color="warn" (click)="cancelBooking(booking.bookingId)" 
                                matTooltip="Cancel" class="action-button">
                          <mat-icon>cancel</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: #ffffff;
      min-height: calc(100vh - 64px);
      padding: 24px 0;
    }

    .main-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .page-header {
      background: #ffffff;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .page-title {
      font-size: 2rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      color: #718096;
      font-size: 1rem;
      margin: 0;
    }

    .content-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .filters-section {
      padding: 24px;
      background: linear-gradient(135deg, #f8faff 0%, #e8f4ff 100%);
      border-bottom: 1px solid rgba(116, 185, 255, 0.1);
    }

    .search-field, .filter-field {
      .mat-mdc-form-field {
        background: transparent;
        
        .mat-mdc-text-field-wrapper {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        
        .mat-mdc-notched-outline {
          display: none;
        }
        
        .mat-mdc-floating-label {
          color: rgba(255,255,255,0.8);
        }
        
        .mat-mdc-input-element {
          color: white;
        }
        
        .mat-mdc-select-arrow {
          color: rgba(255,255,255,0.8);
        }
        
        &:hover .mat-mdc-text-field-wrapper {
          background: rgba(255,255,255,0.15);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        &.mat-focused {
          .mat-mdc-text-field-wrapper {
            background: rgba(255,255,255,0.15);
            border-color: rgba(255,255,255,0.4);
            box-shadow: 0 4px 16px rgba(116, 185, 255, 0.3);
          }
          
          .mat-mdc-floating-label {
            color: white;
          }
        }
      }
    }

    .table-container {
      padding: 0;
      background: white;
    }

    .mat-mdc-table {
      background: transparent;
      border-radius: 0;
      box-shadow: none;
      
      .mat-mdc-header-row {
        background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
        
        .mat-mdc-header-cell {
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border: none;
          padding: 16px 12px;
        }
      }
      
      .mat-mdc-row {
        transition: all 0.3s ease;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        
        &:hover {
          background: linear-gradient(135deg, rgba(116, 185, 255, 0.05) 0%, rgba(9, 132, 227, 0.05) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .mat-mdc-cell {
          padding: 16px 12px;
          border: none;
        }
      }
    }

    .session-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .session-title {
      font-weight: 600;
      color: #2d3748;
      font-size: 1rem;
    }

    .session-description {
      color: #718096;
      font-size: 0.875rem;
      margin-top: 2px;
    }

    .participants {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      max-width: 200px;
    }

    .participant-chip {
      background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
      color: white;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(116, 185, 255, 0.3);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(116, 185, 255, 0.4);
      }
    }

    .status-chip {
      font-weight: 600;
      font-size: 0.75rem;
      padding: 6px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &.requested {
        background: linear-gradient(135deg, #fbb6ce 0%, #f687b3 100%);
        color: #97266d;
      }
      
      &.accepted {
        background: linear-gradient(135deg, #9ae6b4 0%, #68d391 100%);
        color: #276749;
      }
      
      &.completed {
        background: linear-gradient(135deg, #bee3f8 0%, #90cdf4 100%);
        color: #2c5282;
      }
      
      &.cancelled, &.declined {
        background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
        color: #c53030;
      }
    }

    .datetime-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .date-text {
      font-weight: 600;
      color: #2d3748;
      font-size: 0.9rem;
    }

    .time-text {
      color: #718096;
      font-size: 0.875rem;
    }

    .duration-badge {
      background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
      color: #234e52;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 4px;
      display: inline-block;
      box-shadow: 0 2px 4px rgba(35, 78, 82, 0.1);
    }

    .action-button {
      transition: all 0.3s ease;
      border-radius: 8px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }

    .loading-container {
      padding: 48px;
      text-align: center;
      
      .mat-mdc-progress-spinner {
        margin: 0 auto 16px;
      }
      
      .loading-text {
        color: #718096;
        font-size: 1rem;
      }
    }

    .empty-state {
      padding: 48px;
      text-align: center;
      color: #718096;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      h3 {
        margin: 0 0 8px 0;
        font-weight: 500;
      }
      
      p {
        margin: 0;
        opacity: 0.7;
      }
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 1.5rem;
      }
      
      .filters-section {
        padding: 16px;
      }
      
      .participants {
        max-width: 120px;
      }
      
      .participant-chip {
        font-size: 0.7rem;
        padding: 2px 6px;
      }
    }
  `
})
export class BookingsListComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  loading = false;
  selectedStatus = '';
  searchQuery = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  displayedColumns: string[] = ['session', 'participants', 'schedule', 'status', 'amount', 'actions'];
  private searchTimeout: any;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingService.getBookings().subscribe({
      next: (response) => {
        // Ensure response.data is an array, fallback to empty array if not
        this.bookings = Array.isArray(response.data) ? response.data : (response as any) || [];
        this.filteredBookings = [...this.bookings];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.bookings = [];
        this.filteredBookings = [];
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.bookings];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        (booking.sessionTitle && booking.sessionTitle.toLowerCase().includes(query)) ||
        (booking.mentorName && booking.mentorName.toLowerCase().includes(query)) ||
        (booking.menteeName && booking.menteeName.toLowerCase().includes(query)) ||
        (booking.description && booking.description.toLowerCase().includes(query))
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(booking => booking.status === this.selectedStatus);
    }

    if (this.fromDate) {
      filtered = filtered.filter(booking => 
        new Date(booking.timeslot) >= this.fromDate!
      );
    }

    if (this.toDate) {
      filtered = filtered.filter(booking => 
        new Date(booking.timeslot) <= this.toDate!
      );
    }

    this.filteredBookings = filtered;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'requested': return 'warn';
      case 'accepted': return 'primary';
      case 'completed': return 'accent';
      case 'cancelled': 
      case 'declined': return 'warn';
      default: return 'primary';
    }
  }

  formatDate(timeslot: string): string {
    return new Date(timeslot).toLocaleDateString();
  }

  formatTime(timeslot: string): string {
    return new Date(timeslot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  acceptBooking(bookingId: string): void {
    this.updateBookingStatus(bookingId, 'accepted');
  }

  declineBooking(bookingId: string): void {
    this.updateBookingStatus(bookingId, 'declined');
  }

  completeBooking(bookingId: string): void {
    this.updateBookingStatus(bookingId, 'completed');
  }

  cancelBooking(bookingId: string): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.updateBookingStatus(bookingId, 'cancelled');
    }
  }

  private updateBookingStatus(bookingId: string, status: 'accepted' | 'declined' | 'completed' | 'cancelled'): void {
    this.bookingService.updateBooking(bookingId, { status }).subscribe({
      next: () => {
        this.loadBookings(); // Reload the list
      },
      error: (error) => {
        console.error('Error updating booking:', error);
      }
    });
  }
}