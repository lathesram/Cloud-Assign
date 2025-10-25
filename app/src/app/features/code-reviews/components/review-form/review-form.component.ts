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
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Request Code Review</mat-card-title>
              <mat-card-subtitle>Submit your code for expert feedback and improvement suggestions</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
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
                      <button mat-raised-button color="primary" matStepperNext [disabled]="!basicInfoForm.valid">
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
                        color="primary" 
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
                          color="primary" 
                          disabled
                          (click)="submitReview()"
                        >
                          <mat-spinner diameter="20"></mat-spinner>
                          Submitting...
                        </button>
                      } @else {
                        <button 
                          mat-raised-button 
                          color="primary" 
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
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .step-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .review-summary {
      .summary-section {
        margin-bottom: 24px;
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 8px;
        
        h4 {
          margin: 0 0 12px 0;
          color: #333;
          font-weight: 500;
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
          color: #4caf50;
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
      fileName: this.uploadedFile.fileName,
      fileSize: this.uploadedFile.fileSize,
      // Mock mentee ID - in real app, get from auth service
      menteeId: 'current-user-id',
      s3FileUrl: '', // This would be set after actual file upload to S3
      status: 'pending'
    };

    this.codeReviewService.createCodeReview(reviewData).subscribe({
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