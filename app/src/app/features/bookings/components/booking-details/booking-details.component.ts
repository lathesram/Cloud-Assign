import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingService } from '../../../../shared/services/booking.service';
import { Booking } from '../../../../shared/models/booking.model';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          @if (loading) {
            <div class="text-center py-5">
              <mat-spinner></mat-spinner>
            </div>
          } @else if (booking) {
            <div class="row">
              <!-- Main Details Card -->
              <div class="col-lg-8 mb-4">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ booking.sessionTitle || 'Mentoring Session' }}</mat-card-title>
                    <mat-card-subtitle>Session Details</mat-card-subtitle>
                    <div class="ms-auto">
                      <mat-chip [color]="getStatusColor(booking.status)">
                        {{ booking.status | titlecase }}
                      </mat-chip>
                    </div>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <h6 class="text-muted mb-2">Session Date & Time</h6>
                        <div class="d-flex align-items-center gap-2">
                          <mat-icon class="text-primary">schedule</mat-icon>
                          <div>
                            <div class="fw-bold">{{ formatDate(booking.timeslot) }}</div>
                            <div class="text-muted">{{ formatTime(booking.timeslot) }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <h6 class="text-muted mb-2">Duration</h6>
                        <div class="d-flex align-items-center gap-2">
                          <mat-icon class="text-primary">timer</mat-icon>
                          <span>{{ booking.duration || 60 }} minutes</span>
                        </div>
                      </div>
                    </div>

                    @if (booking.description) {
                      <mat-divider class="my-4"></mat-divider>
                      <div class="mb-3">
                        <h6 class="text-muted mb-2">Description</h6>
                        <p>{{ booking.description }}</p>
                      </div>
                    }

                    @if (booking.meetingLink) {
                      <mat-divider class="my-4"></mat-divider>
                      <div class="mb-3">
                        <h6 class="text-muted mb-2">Meeting Link</h6>
                        <div class="d-flex align-items-center gap-2">
                          <mat-icon class="text-primary">video_call</mat-icon>
                          <a [href]="booking.meetingLink" target="_blank" class="text-decoration-none">
                            {{ booking.meetingLink }}
                            <mat-icon class="ms-1" style="font-size: 16px;">open_in_new</mat-icon>
                          </a>
                        </div>
                      </div>
                    }

                    @if (booking.notes) {
                      <mat-divider class="my-4"></mat-divider>
                      <div class="mb-3">
                        <h6 class="text-muted mb-2">Notes</h6>
                        <p>{{ booking.notes }}</p>
                      </div>
                    }

                    <mat-divider class="my-4"></mat-divider>
                    <div class="row">
                      <div class="col-sm-6 mb-3">
                        <h6 class="text-muted mb-1">Created</h6>
                        <p class="mb-0">{{ booking.createdAt | date:'medium' }}</p>
                      </div>
                      <div class="col-sm-6 mb-3">
                        <h6 class="text-muted mb-1">Last Updated</h6>
                        <p class="mb-0">{{ booking.updatedAt | date:'medium' }}</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Participants & Actions Card -->
              <div class="col-lg-4">
                <mat-card class="mb-4">
                  <mat-card-header>
                    <mat-card-title>Participants</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="participant-item mb-3">
                      <div class="d-flex align-items-center gap-3">
                        <div class="participant-avatar mentor">
                          <mat-icon>school</mat-icon>
                        </div>
                        <div>
                          <div class="fw-bold">{{ booking.mentorName || 'Mentor' }}</div>
                          <small class="text-muted">{{ booking.mentorEmail || 'mentor@example.com' }}</small>
                          <div class="badge-mentor">Mentor</div>
                        </div>
                      </div>
                    </div>
                    
                    <mat-divider class="my-3"></mat-divider>
                    
                    <div class="participant-item">
                      <div class="d-flex align-items-center gap-3">
                        <div class="participant-avatar mentee">
                          <mat-icon>person</mat-icon>
                        </div>
                        <div>
                          <div class="fw-bold">{{ booking.menteeName || 'Mentee' }}</div>
                          <small class="text-muted">{{ booking.menteeEmail || 'mentee@example.com' }}</small>
                          <div class="badge-mentee">Mentee</div>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Payment Info Card -->
                @if (booking.totalAmount || booking.mentorRate) {
                  <mat-card class="mb-4">
                    <mat-card-header>
                      <mat-card-title>Payment Info</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      @if (booking.mentorRate) {
                        <div class="mb-2">
                          <span class="text-muted">Rate:</span>
                          <span class="fw-bold ms-2">\${{ booking.mentorRate }}/hour</span>
                        </div>
                      }
                      @if (booking.totalAmount) {
                        <div>
                          <span class="text-muted">Total:</span>
                          <span class="fw-bold ms-2 text-success">\${{ booking.totalAmount }}</span>
                        </div>
                      }
                    </mat-card-content>
                  </mat-card>
                }

                <!-- Actions Card -->
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Actions</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="d-grid gap-2">
                      <button mat-raised-button color="primary" [routerLink]="['/bookings/form', booking.bookingId]">
                        <mat-icon>edit</mat-icon>
                        Edit Booking
                      </button>
                      
                      @if (booking.status === 'requested') {
                        <button mat-raised-button color="accent" (click)="acceptBooking()">
                          <mat-icon>check</mat-icon>
                          Accept
                        </button>
                        <button mat-stroked-button color="warn" (click)="declineBooking()">
                          <mat-icon>close</mat-icon>
                          Decline
                        </button>
                      }
                      
                      @if (booking.status === 'accepted') {
                        <button mat-raised-button color="accent" (click)="completeBooking()">
                          <mat-icon>done</mat-icon>
                          Mark Complete
                        </button>
                      }
                      
                      @if (booking.status !== 'completed' && booking.status !== 'cancelled') {
                        <button mat-stroked-button color="warn" (click)="cancelBooking()">
                          <mat-icon>cancel</mat-icon>
                          Cancel Booking
                        </button>
                      }
                      
                      <button mat-stroked-button routerLink="/bookings">
                        <mat-icon>arrow_back</mat-icon>
                        Back to Bookings
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          } @else {
            <mat-card>
              <mat-card-content class="text-center py-5">
                <mat-icon class="large-icon text-muted mb-3">event_busy</mat-icon>
                <h4>Booking Not Found</h4>
                <p class="text-muted">The requested booking could not be found.</p>
                <button mat-raised-button color="primary" routerLink="/bookings">
                  Back to Bookings
                </button>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .participant-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      
      &.mentor {
        background: var(--mat-primary);
      }
      
      &.mentee {
        background: var(--mat-accent);
      }
    }
    
    .badge-mentor {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      display: inline-block;
      margin-top: 4px;
    }
    
    .badge-mentee {
      background: #f3e5f5;
      color: #7b1fa2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      display: inline-block;
      margin-top: 4px;
    }
    
    .large-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
    }
    
    mat-card-header {
      display: flex;
      align-items: center;
    }
  `
})
export class BookingDetailsComponent implements OnInit {
  booking: Booking | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBooking(bookingId);
    } else {
      this.router.navigate(['/bookings']);
    }
  }

  loadBooking(bookingId: string): void {
    this.loading = true;
    this.bookingService.getBookingById(bookingId).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.booking = null;
        this.loading = false;
      }
    });
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
    return new Date(timeslot).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatTime(timeslot: string): string {
    return new Date(timeslot).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  acceptBooking(): void {
    if (this.booking) {
      this.updateBookingStatus('accepted');
    }
  }

  declineBooking(): void {
    if (this.booking) {
      this.updateBookingStatus('declined');
    }
  }

  completeBooking(): void {
    if (this.booking) {
      this.updateBookingStatus('completed');
    }
  }

  cancelBooking(): void {
    if (this.booking && confirm('Are you sure you want to cancel this booking?')) {
      this.updateBookingStatus('cancelled');
    }
  }

  private updateBookingStatus(status: 'accepted' | 'declined' | 'completed' | 'cancelled'): void {
    if (this.booking) {
      this.bookingService.updateBooking(this.booking.bookingId, { status }).subscribe({
        next: (updatedBooking) => {
          this.booking = updatedBooking;
        },
        error: (error) => {
          console.error('Error updating booking:', error);
        }
      });
    }
  }
}