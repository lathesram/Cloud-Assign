import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingService, AuthService } from '../../../../shared/services';
import { UserService } from '../../../../shared/services/user.service';
import { Booking, CreateBookingRequest, UpdateBookingRequest } from '../../../../shared/models/booking.model';
import { User } from '../../../../shared/models/user.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CustomValidators } from '../../../../shared/utils/custom-validators';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  template: `
    <div class="main-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? 'Edit Booking' : 'Create New Booking' }}</h1>
        <p class="page-subtitle">{{ isEditMode ? 'Update session details and schedule' : 'Schedule a personalized mentoring session' }}</p>
      </div>
      
      <div class="form-container">
        <div class="content-card">
              @if (loading) {
                <div class="text-center py-4">
                  <mat-spinner></mat-spinner>
                </div>
              } @else {
                <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Session Title</mat-label>
                        <input matInput formControlName="sessionTitle" placeholder="e.g., JavaScript Fundamentals">
                      </mat-form-field>
                    </div>
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Duration (minutes)</mat-label>
                        <mat-select formControlName="duration">
                          <mat-option value="30">30 minutes</mat-option>
                          <mat-option value="60">60 minutes</mat-option>
                          <mat-option value="90">90 minutes</mat-option>
                          <mat-option value="120">120 minutes</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Mentor</mat-label>
                        <mat-select formControlName="mentorId" [disabled]="isEditMode">
                          @for (mentor of mentors; track mentor.userId) {
                            <mat-option [value]="mentor.userId">{{ mentor.name }}</mat-option>
                          }
                        </mat-select>
                        @if (bookingForm.get('mentorId')?.hasError('required') && bookingForm.get('mentorId')?.touched) {
                          <mat-error>Mentor is required</mat-error>
                        }
                      </mat-form-field>
                    </div>
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Session Date</mat-label>
                        <input matInput [matDatepicker]="picker" formControlName="sessionDate">
                        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                        @if (bookingForm.get('sessionDate')?.hasError('required') && bookingForm.get('sessionDate')?.touched) {
                          <mat-error>Date is required</mat-error>
                        }
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Start Time</mat-label>
                        <input matInput type="time" formControlName="startTime">
                        @if (bookingForm.get('startTime')?.hasError('required') && bookingForm.get('startTime')?.touched) {
                          <mat-error>Start time is required</mat-error>
                        }
                      </mat-form-field>
                    </div>
                    @if (isEditMode) {
                      <div class="col-md-6 mb-3">
                        <mat-form-field class="w-100">
                          <mat-label>Status</mat-label>
                          <mat-select formControlName="status">
                            <mat-option value="requested">Requested</mat-option>
                            <mat-option value="accepted">Accepted</mat-option>
                            <mat-option value="completed">Completed</mat-option>
                            <mat-option value="cancelled">Cancelled</mat-option>
                            <mat-option value="declined">Declined</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    }
                  </div>

                  <div class="mb-3">
                    <mat-form-field class="w-100">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="description" rows="4" 
                                placeholder="Describe what you'd like to learn or discuss..."></textarea>
                    </mat-form-field>
                  </div>

                  @if (isEditMode) {
                    <div class="mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Meeting Link</mat-label>
                        <input matInput formControlName="meetingLink" placeholder="https://zoom.us/j/...">
                      </mat-form-field>
                    </div>

                    <div class="mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Notes</mat-label>
                        <textarea matInput formControlName="notes" rows="3" 
                                  placeholder="Additional notes or feedback..."></textarea>
                      </mat-form-field>
                    </div>
                  }

                  <div class="d-flex gap-2">
                    <button mat-raised-button type="submit" [disabled]="bookingForm.invalid || submitting">
                      @if (submitting) {
                        <mat-spinner diameter="20" class="me-2"></mat-spinner>
                      }
                      {{ isEditMode ? 'Update Booking' : 'Create Booking' }}
                    </button>
                    <button mat-stroked-button type="button" routerLink="/bookings">
                      Cancel
                    </button>
                  </div>
                </form>
              }
        </div>
      </div>
    </div>
  `,
  styles: `
    .main-container {
      min-height: 100vh;
      background: #ffffff;
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 600;
      color: #333333;
      margin-bottom: 0.5rem;
    }

    .page-subtitle {
      font-size: 1rem;
      color: #666666;
      margin: 0;
    }

    .form-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .content-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 2.5rem;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -0.75rem;
    }

    .col-md-6 {
      flex: 0 0 50%;
      max-width: 50%;
      padding: 0 0.75rem;
    }

    .mb-3 {
      margin-bottom: 1.5rem;
    }

    .mb-4 {
      margin-bottom: 2rem;
    }

    .w-100 {
      width: 100%;
    }

    ::ng-deep mat-form-field {
      width: 100%;
      margin-bottom: 0;
    }

    ::ng-deep .mat-mdc-form-field {
      background: transparent;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-floating-label {
      color: rgba(255,255,255,0.8);
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-input-element {
      color: white;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-input-element::placeholder {
      color: rgba(255,255,255,0.6);
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-floating-label {
      color: white;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-text-field-wrapper {
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.4);
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline {
      display: none;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline-leading,
    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline-trailing,
    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline-notch {
      border: none;
    }

    ::ng-deep .mat-mdc-select-arrow {
      color: rgba(255,255,255,0.8);
    }

    ::ng-deep .mat-datepicker-toggle {
      color: rgba(255,255,255,0.8);
    }

    .d-flex {
      display: flex;
    }

    .gap-2 {
      gap: 1rem;
    }

    ::ng-deep .mat-mdc-raised-button {
      background: rgba(255,255,255,0.2);
      color: white;
      border-radius: 12px;
      padding: 0.75rem 2rem;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }

    ::ng-deep .mat-mdc-raised-button:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }

    ::ng-deep .mat-mdc-outlined-button {
      color: white;
      border-color: rgba(255,255,255,0.3);
      border-radius: 12px;
      padding: 0.75rem 2rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    ::ng-deep .mat-mdc-outlined-button:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
    }

    ::ng-deep .mat-mdc-progress-spinner circle {
      stroke: white;
    }

    .text-center {
      text-align: center;
    }

    .py-4 {
      padding: 2rem 0;
    }

    .me-2 {
      margin-right: 0.5rem;
    }

    @media (max-width: 768px) {
      .main-container {
        padding: 1rem;
      }

      .page-title {
        font-size: 2rem;
      }

      .content-card {
        padding: 1.5rem;
      }

      .col-md-6 {
        flex: 0 0 100%;
        max-width: 100%;
      }

      .d-flex {
        flex-direction: column;
      }

      .gap-2 {
        gap: 0.5rem;
      }
    }
  `
})
export class BookingFormComponent implements OnInit {
  bookingForm: FormGroup;
  isEditMode = false;
  loading = false;
  submitting = false;
  bookingId: string | null = null;
  mentors: User[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private userService: UserService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    this.bookingForm = this.fb.group({
      sessionTitle: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      mentorId: ['', Validators.required],
      sessionDate: ['', [Validators.required, CustomValidators.futureDate()]],
      startTime: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
      status: ['requested'],
      meetingLink: ['', CustomValidators.validUrl()],
      notes: ['', Validators.maxLength(1000)]
    });
  }

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.bookingId;
    
    this.loadMentors();
    
    if (this.isEditMode && this.bookingId) {
      this.loadBooking(this.bookingId);
    }
  }

  loadMentors(): void {
    // Use the dedicated getMentors method to fetch only mentors from user service
    this.userService.getMentors({ page: 1, limit: 100 }).subscribe({
      next: (response) => {
        this.mentors = response.data;
      },
      error: (error) => {
        console.error('Error loading mentors:', error);
        this.notificationService.showError('Failed to load mentors. Please refresh the page.');
      }
    });
  }

  loadBooking(bookingId: string): void {
    this.loading = true;
    this.bookingService.getBookingById(bookingId).subscribe({
      next: (booking) => {
        const sessionDate = new Date(booking.timeslot);
        const startTime = sessionDate.toTimeString().slice(0, 5); // HH:MM format
        
        this.bookingForm.patchValue({
          sessionTitle: booking.sessionTitle || '',
          description: booking.description || '',
          mentorId: booking.mentorId,
          sessionDate: sessionDate,
          startTime: startTime,
          duration: booking.duration || 60,
          status: booking.status,
          meetingLink: booking.meetingLink || '',
          notes: booking.notes || ''
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.loading = false;
        this.router.navigate(['/bookings']);
      }
    });
  }

  onSubmit(): void {
    if (this.bookingForm.valid) {
      this.submitting = true;
      const formData = this.bookingForm.value;
      
      // Combine date and time into ISO string
      const sessionDateTime = new Date(formData.sessionDate);
      const [hours, minutes] = formData.startTime.split(':');
      sessionDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      if (this.isEditMode && this.bookingId) {
        const updateData: UpdateBookingRequest = {
          sessionTitle: formData.sessionTitle,
          description: formData.description,
          status: formData.status,
          meetingLink: formData.meetingLink,
          notes: formData.notes
        };
        
        this.bookingService.updateBooking(this.bookingId, updateData).subscribe({
          next: () => {
            this.submitting = false;
            this.notificationService.showSuccess('Booking updated successfully');
            this.router.navigate(['/bookings']);
          },
          error: (error) => {
            console.error('Error updating booking:', error);
            this.notificationService.showError('Failed to update booking. Please try again.');
            this.submitting = false;
          }
        });
      } else {
        const createData: CreateBookingRequest = {
          mentorId: formData.mentorId,
          timeslot: sessionDateTime.toISOString(),
          sessionTitle: formData.sessionTitle,
          description: formData.description,
          duration: formData.duration
        };
        
        this.bookingService.createBooking(createData).subscribe({
          next: () => {
            this.submitting = false;
            this.notificationService.showSuccess('Booking created successfully');
            this.router.navigate(['/bookings']);
          },
          error: (error) => {
            console.error('Error creating booking:', error);
            this.notificationService.showError('Failed to create booking. Please try again.');
            this.submitting = false;
          }
        });
      }
    }
  }


}