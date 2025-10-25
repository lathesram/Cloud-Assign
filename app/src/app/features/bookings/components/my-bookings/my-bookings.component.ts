import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../../shared/services/booking.service';
import { Booking } from '../../../../shared/models/booking.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h2 mb-1">My Bookings</h1>
              <p class="text-muted mb-0">Manage your mentoring sessions</p>
            </div>
            <button mat-raised-button color="primary" routerLink="/bookings/form">
              <mat-icon>add</mat-icon>
              New Booking
            </button>
          </div>

          <mat-tab-group class="mb-4">
            <mat-tab label="Upcoming Sessions">
              @if (loadingUpcoming) {
                <div class="text-center py-4">
                  <mat-spinner></mat-spinner>
                </div>
              } @else {
                <div class="row mt-3">
                  @for (booking of upcomingBookings; track booking.bookingId) {
                    <div class="col-lg-6 col-xl-4 mb-4">
                      <mat-card class="booking-card h-100">
                        <mat-card-header>
                          <mat-card-title class="booking-title">{{ booking.sessionTitle || 'Mentoring Session' }}</mat-card-title>
                          <mat-card-subtitle>{{ booking.description }}</mat-card-subtitle>
                          <div class="ms-auto">
                            <mat-chip [color]="getStatusColor(booking.status)" class="status-chip">
                              {{ booking.status | titlecase }}
                            </mat-chip>
                          </div>
                        </mat-card-header>
                        <mat-card-content>
                          <div class="booking-info">
                            <div class="info-item">
                              <mat-icon class="info-icon">schedule</mat-icon>
                              <div>
                                <div class="fw-bold">{{ formatDate(booking.timeslot) }}</div>
                                <small class="text-muted">{{ formatTime(booking.timeslot) }}</small>
                              </div>
                            </div>
                            
                            <div class="info-item">
                              <mat-icon class="info-icon">person</mat-icon>
                              <div>
                                <div class="fw-bold">{{ booking.mentorName || booking.menteeName || 'Participant' }}</div>
                                <small class="text-muted">{{ booking.mentorEmail || booking.menteeEmail }}</small>
                              </div>
                            </div>
                            
                            @if (booking.duration) {
                              <div class="info-item">
                                <mat-icon class="info-icon">timer</mat-icon>
                                <span>{{ booking.duration }} minutes</span>
                              </div>
                            }
                          </div>
                        </mat-card-content>
                        <mat-card-actions>
                          <button mat-button [routerLink]="['/bookings/details', booking.bookingId]">
                            <mat-icon>visibility</mat-icon>
                            View Details
                          </button>
                          @if (booking.meetingLink) {
                            <button mat-button color="primary" (click)="joinMeeting(booking.meetingLink)">
                              <mat-icon>video_call</mat-icon>
                              Join Meeting
                            </button>
                          }
                        </mat-card-actions>
                      </mat-card>
                    </div>
                  } @empty {
                    <div class="col-12">
                      <div class="text-center py-5">
                        <mat-icon class="large-icon text-muted mb-3">event_available</mat-icon>
                        <h5>No Upcoming Sessions</h5>
                        <p class="text-muted">You don't have any upcoming mentoring sessions.</p>
                        <button mat-raised-button color="primary" routerLink="/bookings/form">
                          Schedule a Session
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </mat-tab>

            <mat-tab label="Past Sessions">
              @if (loadingPast) {
                <div class="text-center py-4">
                  <mat-spinner></mat-spinner>
                </div>
              } @else {
                <div class="row mt-3">
                  @for (booking of pastBookings; track booking.bookingId) {
                    <div class="col-lg-6 col-xl-4 mb-4">
                      <mat-card class="booking-card h-100 past-booking">
                        <mat-card-header>
                          <mat-card-title class="booking-title">{{ booking.sessionTitle || 'Mentoring Session' }}</mat-card-title>
                          <mat-card-subtitle>{{ booking.description }}</mat-card-subtitle>
                          <div class="ms-auto">
                            <mat-chip [color]="getStatusColor(booking.status)" class="status-chip">
                              {{ booking.status | titlecase }}
                            </mat-chip>
                          </div>
                        </mat-card-header>
                        <mat-card-content>
                          <div class="booking-info">
                            <div class="info-item">
                              <mat-icon class="info-icon">schedule</mat-icon>
                              <div>
                                <div class="fw-bold">{{ formatDate(booking.timeslot) }}</div>
                                <small class="text-muted">{{ formatTime(booking.timeslot) }}</small>
                              </div>
                            </div>
                            
                            <div class="info-item">
                              <mat-icon class="info-icon">person</mat-icon>
                              <div>
                                <div class="fw-bold">{{ booking.mentorName || booking.menteeName || 'Participant' }}</div>
                                <small class="text-muted">{{ booking.mentorEmail || booking.menteeEmail }}</small>
                              </div>
                            </div>
                            
                            @if (booking.notes) {
                              <div class="info-item">
                                <mat-icon class="info-icon">note</mat-icon>
                                <span class="text-muted">{{ booking.notes }}</span>
                              </div>
                            }
                          </div>
                        </mat-card-content>
                        <mat-card-actions>
                          <button mat-button [routerLink]="['/bookings/details', booking.bookingId]">
                            <mat-icon>visibility</mat-icon>
                            View Details
                          </button>
                        </mat-card-actions>
                      </mat-card>
                    </div>
                  } @empty {
                    <div class="col-12">
                      <div class="text-center py-5">
                        <mat-icon class="large-icon text-muted mb-3">history</mat-icon>
                        <h5>No Past Sessions</h5>
                        <p class="text-muted">You don't have any completed or cancelled sessions yet.</p>
                      </div>
                    </div>
                  }
                </div>
              }
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>
  `,
  styles: `
    .booking-card {
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      &.past-booking {
        opacity: 0.8;
      }
    }
    
    .booking-title {
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .booking-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .info-icon {
      color: var(--mat-primary);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .status-chip {
      font-size: 0.75rem;
    }
    
    .large-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
    }
    
    mat-card-header {
      display: flex;
      align-items: flex-start;
    }
    
    mat-card-actions {
      border-top: 1px solid #f0f0f0;
      padding-top: 12px;
    }
  `
})
export class MyBookingsComponent implements OnInit {
  upcomingBookings: Booking[] = [];
  pastBookings: Booking[] = [];
  loadingUpcoming = false;
  loadingPast = false;

  // Mock user ID - in real app, get from auth service
  private currentUserId = 'current-user-id';

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadUpcomingBookings();
    this.loadPastBookings();
  }

  loadUpcomingBookings(): void {
    this.loadingUpcoming = true;
    // Filter for future bookings with accepted or requested status
    const filters = {
      dateFrom: new Date().toISOString(),
      status: 'accepted,requested'
    };
    
    this.bookingService.getBookings(undefined, filters).subscribe({
      next: (response) => {
        this.upcomingBookings = response.data.filter(booking => 
          new Date(booking.timeslot) > new Date() && 
          (booking.status === 'accepted' || booking.status === 'requested')
        );
        this.loadingUpcoming = false;
      },
      error: (error) => {
        console.error('Error loading upcoming bookings:', error);
        this.loadingUpcoming = false;
      }
    });
  }

  loadPastBookings(): void {
    this.loadingPast = true;
    // Filter for past bookings
    const filters = {
      dateTo: new Date().toISOString(),
      status: 'completed,cancelled,declined'
    };
    
    this.bookingService.getBookings(undefined, filters).subscribe({
      next: (response) => {
        this.pastBookings = response.data.filter(booking => 
          new Date(booking.timeslot) < new Date() || 
          ['completed', 'cancelled', 'declined'].includes(booking.status)
        );
        this.loadingPast = false;
      },
      error: (error) => {
        console.error('Error loading past bookings:', error);
        this.loadingPast = false;
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
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(timeslot: string): string {
    return new Date(timeslot).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  joinMeeting(meetingLink: string): void {
    window.open(meetingLink, '_blank');
  }
}