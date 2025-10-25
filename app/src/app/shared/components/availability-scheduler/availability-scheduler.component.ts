import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Availability, TimeSlot } from '../../models/user.model';

@Component({
  selector: 'app-availability-scheduler',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <mat-card class="availability-card">
      <mat-card-header>
        <mat-card-title>Availability Schedule</mat-card-title>
        <mat-card-subtitle>Set your available time slots</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <form [formGroup]="availabilityForm">
          <!-- Timezone Selection -->
          <div class="timezone-section mb-4">
            <mat-form-field class="w-100">
              <mat-label>Timezone</mat-label>
              <mat-select formControlName="timezone">
                <mat-option *ngFor="let tz of timezones" [value]="tz.value">
                  {{ tz.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-divider class="mb-4"></mat-divider>

          <!-- Time Slots -->
          <div class="time-slots-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="mb-0">Time Slots</h4>
              <button mat-raised-button type="button" (click)="addTimeSlot()">
                <mat-icon>add</mat-icon>
                Add Slot
              </button>
            </div>

            <div formArrayName="slots" class="slots-container">
              <div *ngFor="let slot of slotsArray.controls; let i = index" 
                   [formGroupName]="i" 
                   class="slot-item">
                <mat-card class="slot-card">
                  <mat-card-content>
                    <div class="row g-3">
                      <div class="col-md-4">
                        <mat-form-field class="w-100">
                          <mat-label>Day of Week</mat-label>
                          <mat-select formControlName="dayOfWeek">
                            <mat-option [value]="0">Sunday</mat-option>
                            <mat-option [value]="1">Monday</mat-option>
                            <mat-option [value]="2">Tuesday</mat-option>
                            <mat-option [value]="3">Wednesday</mat-option>
                            <mat-option [value]="4">Thursday</mat-option>
                            <mat-option [value]="5">Friday</mat-option>
                            <mat-option [value]="6">Saturday</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                      <div class="col-md-3">
                        <mat-form-field class="w-100">
                          <mat-label>Start Time</mat-label>
                          <input matInput type="time" formControlName="startTime">
                        </mat-form-field>
                      </div>
                      <div class="col-md-3">
                        <mat-form-field class="w-100">
                          <mat-label>End Time</mat-label>
                          <input matInput type="time" formControlName="endTime">
                        </mat-form-field>
                      </div>
                      <div class="col-md-2 d-flex align-items-center">
                        <button mat-icon-button color="warn" type="button" (click)="removeTimeSlot(i)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>

            <div *ngIf="slotsArray.length === 0" class="empty-slots">
              <p class="text-muted text-center">No time slots added yet. Click "Add Slot" to get started.</p>
            </div>
          </div>
        </form>
      </mat-card-content>

      <mat-card-actions class="card-actions">
        <button mat-raised-button color="primary" (click)="saveAvailability()" [disabled]="availabilityForm.invalid">
          Save Availability
        </button>
        <button mat-button (click)="clearAll()">
          Clear All
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .availability-card {
      margin: 1rem 0;
    }

    .slot-item {
      margin-bottom: 1rem;
    }

    .slot-card {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -0.75rem;
    }

    .col-md-2, .col-md-3, .col-md-4 {
      padding: 0 0.75rem;
    }

    .col-md-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
    .col-md-3 { flex: 0 0 25%; max-width: 25%; }
    .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }

    .w-100 { width: 100%; }
    .mb-0 { margin-bottom: 0; }
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }

    .d-flex { display: flex; }
    .justify-content-between { justify-content: space-between; }
    .align-items-center { align-items: center; }

    .empty-slots {
      padding: 2rem;
      text-align: center;
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .card-actions {
      padding: 1rem;
      gap: 1rem;
    }

    .text-muted {
      color: #6c757d;
    }

    .text-center {
      text-align: center;
    }

    @media (max-width: 768px) {
      .col-md-2, .col-md-3, .col-md-4 {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
      }

      .row {
        flex-direction: column;
      }
    }
  `
})
export class AvailabilitySchedulerComponent implements OnInit {
  @Input() availability: Availability | null = null;
  @Output() availabilityChange = new EventEmitter<Availability>();

  availabilityForm: FormGroup;
  timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' },
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'IST', label: 'IST (India Standard Time)' },
    { value: 'JST', label: 'JST (Japan Standard Time)' },
    { value: 'AEST', label: 'AEST (Australian Eastern Standard Time)' }
  ];

  constructor(private fb: FormBuilder) {
    this.availabilityForm = this.fb.group({
      timezone: ['UTC', Validators.required],
      slots: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (this.availability) {
      this.loadAvailability(this.availability);
    }
  }

  get slotsArray(): FormArray {
    return this.availabilityForm.get('slots') as FormArray;
  }

  loadAvailability(availability: Availability): void {
    this.availabilityForm.patchValue({
      timezone: availability.timezone
    });

    const slotsArray = this.availabilityForm.get('slots') as FormArray;
    slotsArray.clear();

    availability.slots.forEach(slot => {
      slotsArray.push(this.createTimeSlotFormGroup(slot));
    });
  }

  createTimeSlotFormGroup(slot?: TimeSlot): FormGroup {
    return this.fb.group({
      dayOfWeek: [slot?.dayOfWeek ?? 1, Validators.required],
      startTime: [slot?.startTime ?? '09:00', Validators.required],
      endTime: [slot?.endTime ?? '17:00', Validators.required]
    });
  }

  addTimeSlot(): void {
    this.slotsArray.push(this.createTimeSlotFormGroup());
  }

  removeTimeSlot(index: number): void {
    this.slotsArray.removeAt(index);
  }

  clearAll(): void {
    this.slotsArray.clear();
    this.availabilityForm.patchValue({
      timezone: 'UTC'
    });
  }

  saveAvailability(): void {
    if (this.availabilityForm.valid) {
      const formValue = this.availabilityForm.value;
      const availability: Availability = {
        timezone: formValue.timezone,
        slots: formValue.slots
      };
      
      this.availabilityChange.emit(availability);
    }
  }
}