import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../../shared/services/booking.service';
import { Booking } from '../../../../shared/models/booking.model';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterLink
  ],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Booking Management</mat-card-title>
              <mat-card-subtitle>Manage mentor-mentee sessions</mat-card-subtitle>
              <div class="ms-auto d-flex gap-2">
                <mat-form-field class="filter-field">
                  <mat-label>Filter by Status</mat-label>
                  <mat-select [(value)]="selectedStatus" (selectionChange)="onStatusFilter()">
                    <mat-option value="">All Status</mat-option>
                    <mat-option value="requested">Requested</mat-option>
                    <mat-option value="accepted">Accepted</mat-option>
                    <mat-option value="completed">Completed</mat-option>
                    <mat-option value="cancelled">Cancelled</mat-option>
                    <mat-option value="declined">Declined</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="primary" routerLink="/bookings/form">
                  <mat-icon>add</mat-icon>
                  New Booking
                </button>
              </div>
            </mat-card-header>
            <mat-card-content>
              @if (loading) {
                <div class="text-center py-4">
                  <mat-spinner></mat-spinner>
                </div>
              } @else {
                <div class="table-responsive">
                  <table mat-table [dataSource]="bookings" class="w-100">
                    <!-- Session Column -->
                    <ng-container matColumnDef="session">
                      <th mat-header-cell *matHeaderCellDef>Session</th>
                      <td mat-cell *matCellDef="let booking">
                        <div>
                          <div class="fw-bold">{{ booking.sessionTitle || 'Mentoring Session' }}</div>
                          <small class="text-muted">{{ booking.description }}</small>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Participants Column -->
                    <ng-container matColumnDef="participants">
                      <th mat-header-cell *matHeaderCellDef>Participants</th>
                      <td mat-cell *matCellDef="let booking">
                        <div class="participants">
                          <div class="participant">
                            <mat-icon class="participant-icon">school</mat-icon>
                            <span>{{ booking.mentorName || 'Mentor' }}</span>
                          </div>
                          <div class="participant">
                            <mat-icon class="participant-icon">person</mat-icon>
                            <span>{{ booking.menteeName || 'Mentee' }}</span>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Schedule Column -->
                    <ng-container matColumnDef="schedule">
                      <th mat-header-cell *matHeaderCellDef>Schedule</th>
                      <td mat-cell *matCellDef="let booking">
                        <div>
                          <div class="fw-bold">{{ formatDate(booking.timeslot) }}</div>
                          <small class="text-muted">{{ formatTime(booking.timeslot) }}</small>
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
                        <mat-chip [color]="getStatusColor(booking.status)">
                          {{ booking.status | titlecase }}
                        </mat-chip>
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
                        <button mat-icon-button [routerLink]="['/bookings/details', booking.bookingId]" matTooltip="View Details">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button [routerLink]="['/bookings/form', booking.bookingId]" matTooltip="Edit Booking">
                          <mat-icon>edit</mat-icon>
                        </button>
                        @if (booking.status === 'requested') {
                          <button mat-icon-button color="primary" (click)="acceptBooking(booking.bookingId)" matTooltip="Accept">
                            <mat-icon>check</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" (click)="declineBooking(booking.bookingId)" matTooltip="Decline">
                            <mat-icon>close</mat-icon>
                          </button>
                        }
                        @if (booking.status === 'accepted') {
                          <button mat-icon-button color="accent" (click)="completeBooking(booking.bookingId)" matTooltip="Mark Complete">
                            <mat-icon>done</mat-icon>
                          </button>
                        }
                        <button mat-icon-button color="warn" (click)="cancelBooking(booking.bookingId)" matTooltip="Cancel">
                          <mat-icon>cancel</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    .filter-field {
      width: 150px;
    }
    
    .participants {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .participant {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }
    
    .participant-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .duration-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      display: inline-block;
      margin-top: 4px;
    }
    
    mat-card-header {
      display: flex;
      align-items: center;
    }
    
    .table-responsive {
      overflow-x: auto;
    }
  `
})
export class BookingsListComponent implements OnInit {
  bookings: Booking[] = [];
  loading = false;
  selectedStatus = '';
  displayedColumns: string[] = ['session', 'participants', 'schedule', 'status', 'amount', 'actions'];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    const filters = this.selectedStatus ? { status: this.selectedStatus } : undefined;
    
    this.bookingService.getBookings(undefined, filters).subscribe({
      next: (response) => {
        this.bookings = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loading = false;
      }
    });
  }

  onStatusFilter(): void {
    this.loadBookings();
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