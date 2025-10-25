import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CodeReviewService } from '../../../../shared/services/code-review.service';
import { FileUploadComponent, FileUploadResult } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-review-form',
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
    MatStepperModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    FileUploadComponent
  ],
  template: `
    <div class="main-container">
      <div class="page-header">
        <h1 class="page-title">Request Code Review</h1>
        <p class="page-subtitle">Submit your code for expert feedback and improvement suggestions</p>
      </div>
      
      <div class="form-container">
        <div class="content-card">
              <mat-stepper #stepper linear>
                <!-- Step 1: Basic Information -->
                <mat-step [stepControl]="basicInfoForm" label="Basic Information">
                  <form [formGroup]="basicInfoForm" class="mt-3">
                    <div class="row">
                      <div class="col-12">
                        <mat-form-field class="w-100">
                          <mat-label>Review Title</mat-label>
                          <input matInput formControlName="title" placeholder="Brief description of your code">
                          <mat-error *ngIf="basicInfoForm.get('title')?.hasError('required')">
                            Title is required
                          </mat-error>
                        </mat-form-field>
                      </div>
                    </div>
                    
                    <div class="row">
                      <div class="col-md-6">
                        <mat-form-field class="w-100">
                          <mat-label>Programming Language</mat-label>
                          <mat-select formControlName="programmingLanguage">
                            <mat-option value="javascript">JavaScript</mat-option>
                            <mat-option value="typescript">TypeScript</mat-option>
                            <mat-option value="python">Python</mat-option>
                            <mat-option value="java">Java</mat-option>
                            <mat-option value="csharp">C#</mat-option>
                            <mat-option value="cpp">C++</mat-option>
                          </mat-select>
                          <mat-error *ngIf="basicInfoForm.get('programmingLanguage')?.hasError('required')">
                            Programming language is required
                          </mat-error>
                        </mat-form-field>
                      </div>
                      
                      <div class="col-md-6">
                        <mat-form-field class="w-100">
                          <mat-label>Priority</mat-label>
                          <mat-select formControlName="priority">
                            <mat-option value="low">Low</mat-option>
                            <mat-option value="medium">Medium</mat-option>
                            <mat-option value="high">High</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </div>
                    
                    <div class="row">
                      <div class="col-12">
                        <mat-form-field class="w-100">
                          <mat-label>Description</mat-label>
                          <textarea 
                            matInput 
                            formControlName="description" 
                            rows="4"
                            placeholder="Describe what your code does, any specific areas you want feedback on, or challenges you're facing"
                          ></textarea>
                          <mat-error *ngIf="basicInfoForm.get('description')?.hasError('required')">
                            Description is required
                          </mat-error>
                        </mat-form-field>
                      </div>
                    </div>
                    
                    <div class="step-actions">
                      <button mat-raised-button matStepperNext [disabled]="!basicInfoForm.valid">
                        Next: Upload File
                        <mat-icon>navigate_next</mat-icon>
                      </button>
                    </div>
                  </form>
                </mat-step>

                <!-- Step 2: File Upload -->
                <mat-step label="File Upload">
                  <div class="mt-3">
                    <app-file-upload 
                      (fileSelected)="onFileSelected($event)"
                      (fileUploaded)="onFileUploaded($event)"
                    ></app-file-upload>
                    
                    <div class="step-actions mt-4">
                      <button mat-button matStepperPrevious>
                        <mat-icon>navigate_before</mat-icon>
                        Back
                      </button>
                      <button 
                        mat-raised-button 
                        matStepperNext 
                        [disabled]="!uploadedFile"
                      >
                        Next: Review & Submit
                        <mat-icon>navigate_next</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-step>

                <!-- Step 3: Review & Submit -->
                <mat-step label="Review & Submit">
                  <div class="mt-3">
                    <div class="review-summary">
                      <h3>Review Summary</h3>
                      
                      <div class="summary-section">
                        <h4>Basic Information</h4>
                        <div class="info-row">
                          <span class="label">Title:</span>
                          <span class="value">{{ basicInfoForm.get('title')?.value }}</span>
                        </div>
                        <div class="info-row">
                          <span class="label">Language:</span>
                          <mat-chip class="language-chip">
                            {{ basicInfoForm.get('programmingLanguage')?.value | titlecase }}
                          </mat-chip>
                        </div>
                        <div class="info-row">
                          <span class="label">Priority:</span>
                          <mat-chip [class]="'priority-' + basicInfoForm.get('priority')?.value">
                            {{ basicInfoForm.get('priority')?.value | titlecase }}
                          </mat-chip>
                        </div>
                        <div class="info-row">
                          <span class="label">Description:</span>
                          <span class="value">{{ basicInfoForm.get('description')?.value }}</span>
                        </div>
                      </div>

                      @if (uploadedFile) {
                        <div class="summary-section">
                          <h4>Uploaded File</h4>
                          <div class="file-summary">
                            <mat-icon>attachment</mat-icon>
                            <div class="file-details">
                              <div class="file-name">{{ uploadedFile.fileName }}</div>
                              <div class="file-size">{{ formatFileSize(uploadedFile.fileSize) }}</div>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                    
                    <div class="step-actions">
                      <button mat-button matStepperPrevious>
                        <mat-icon>navigate_before</mat-icon>
                        Back
                      </button>
                      @if (submitting) {
                        <button 
                          mat-raised-button 
                          disabled
                          (click)="submitReview()"
                        >
                          <mat-spinner diameter="20"></mat-spinner>
                          Submitting...
                        </button>
                      } @else {
                        <button 
                          mat-raised-button 
                          (click)="submitReview()"
                        >
                          <mat-icon>send</mat-icon>
                          Submit Review Request
                        </button>
                      }
                    </div>
                  </div>
                </mat-step>
              </mat-stepper>
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
      max-width: 900px;
      margin: 0 auto;
    }

    .content-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 2.5rem;
    }

    ::ng-deep .mat-stepper-horizontal {
      background: transparent;
    }

    ::ng-deep .mat-step-header {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      color: white;
      margin: 0 0.5rem;
    }

    ::ng-deep .mat-step-header.cdk-keyboard-focused {
      background: rgba(255,255,255,0.2);
    }

    ::ng-deep .mat-step-header:hover {
      background: rgba(255,255,255,0.15);
    }

    ::ng-deep .mat-step-label {
      color: white;
      font-weight: 500;
    }

    ::ng-deep .mat-step-icon {
      background-color: rgba(255,255,255,0.2);
      color: white;
    }

    ::ng-deep .mat-step-icon-selected {
      background-color: rgba(255,255,255,0.3);
      color: white;
    }

    ::ng-deep .mat-stepper-horizontal-line {
      border-top-color: rgba(255,255,255,0.3);
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -0.75rem;
    }

    .col-12, .col-md-6 {
      padding: 0 0.75rem;
    }

    .col-12 {
      flex: 0 0 100%;
      max-width: 100%;
    }

    .col-md-6 {
      flex: 0 0 50%;
      max-width: 50%;
    }

    .w-100 {
      width: 100%;
    }

    .mt-3 {
      margin-top: 1.5rem;
    }

    ::ng-deep mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
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

    ::ng-deep .mat-mdc-select-value {
      color: white !important;
    }

    ::ng-deep .mat-mdc-select-placeholder {
      color: rgba(255,255,255,0.6) !important;
    }

    ::ng-deep .mat-mdc-select-value-text {
      color: white !important;
    }

    ::ng-deep .mat-icon {
      color: rgba(255,255,255,0.8);
    }

    ::ng-deep .mat-mdc-select-panel {
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(20px);
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    }

    ::ng-deep .mat-mdc-option {
      color: #333 !important;
    }

    ::ng-deep .mat-mdc-option:hover {
      background: rgba(102, 126, 234, 0.1) !important;
    }

    ::ng-deep .mat-mdc-option.mdc-list-item--selected {
      background: rgba(102, 126, 234, 0.2) !important;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }

    .step-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    ::ng-deep .mat-mdc-raised-button {
      background: rgba(255,255,255,0.2);
      color: white;
      border-radius: 12px;
      padding: 0.75rem 1.5rem;
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
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    ::ng-deep .mat-mdc-outlined-button:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
    }

    .review-summary {
      .summary-section {
        margin-bottom: 24px;
        padding: 16px;
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.2);
        
        h4 {
          margin: 0 0 12px 0;
          color: white;
          font-weight: 600;
        }

        p {
          color: rgba(255,255,255,0.9);
          margin: 0;
        }
      }

      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        .label {
          font-weight: 500;
          width: 120px;
          color: #666;
        }
        
        .value {
          flex: 1;
        }
      }

      .file-summary {
        display: flex;
        align-items: center;
        gap: 12px;
        
        mat-icon {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .file-details {
          .file-name {
            font-weight: 500;
            margin-bottom: 4px;
          }
          
          .file-size {
            font-size: 0.9rem;
            color: #666;
          }
        }
      }
    }

    .language-chip {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .priority-high {
      background-color: #ffebee;
      color: #c62828;
    }

    .priority-medium {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .priority-low {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    mat-stepper {
      background: transparent;
    }
  `
})
export class ReviewFormComponent implements OnInit {
  basicInfoForm: FormGroup;
  uploadedFile: FileUploadResult | null = null;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private codeReviewService: CodeReviewService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      programmingLanguage: ['', Validators.required],
      priority: ['medium']
    });
  }

  ngOnInit(): void {}

  onFileSelected(fileResult: FileUploadResult): void {
  }

  onFileUploaded(fileResult: FileUploadResult): void {
    this.uploadedFile = fileResult;
    this.snackBar.open('File uploaded successfully!', 'Close', { duration: 3000 });
  }

  submitReview(): void {
    if (!this.basicInfoForm.valid || !this.uploadedFile) {
      this.snackBar.open('Please complete all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;

    const reviewData = {
      ...this.basicInfoForm.value,
      // Mock mentee ID - in real app, get from auth service
      menteeId: 'current-user-id'
    };

    this.codeReviewService.uploadFile(this.uploadedFile.file, reviewData).subscribe({
      next: (review: any) => {
        this.submitting = false;
        this.snackBar.open('Review request submitted successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/code-reviews']);
      },
      error: (error: any) => {
        this.submitting = false;
        console.error('Error submitting review:', error);
        this.snackBar.open('Error submitting review request', 'Close', { duration: 3000 });
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}