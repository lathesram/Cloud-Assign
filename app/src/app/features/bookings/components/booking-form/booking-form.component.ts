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
import { BookingService } from '../../../../shared/services/booking.service';
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
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ isEditMode ? 'Edit Booking' : 'Create New Booking' }}</mat-card-title>
              <mat-card-subtitle>{{ isEditMode ? 'Update booking details' : 'Schedule a mentoring session' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
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
                    <button mat-raised-button color="primary" type="submit" [disabled]="bookingForm.invalid || submitting">
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
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    mat-form-field {
      margin-bottom: 0;
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
    private notificationService: NotificationService
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
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.mentors = response.data.filter(user => user.type === 'mentor');
      },
      error: (error) => {
        console.error('Error loading mentors:', error);
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