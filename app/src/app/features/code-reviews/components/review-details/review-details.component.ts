import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CodeReviewService } from '../../../../shared/services/code-review.service';
import { CodeReview, Annotation } from '../../../../shared/models/code-review.model';

@Component({
  selector: 'app-review-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatDialogModule
  ],
  template: `
    <div class="container-fluid py-4">
      @if (loading) {
        <div class="text-center py-5">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (review) {
        <div class="row">
          <!-- Main Content -->
          <div class="col-lg-8">
            <mat-card class="review-card">
              <mat-card-header>
                <mat-card-title>{{ review.title }}</mat-card-title>
                <mat-card-subtitle>
                  <div class="review-meta">
                    <mat-chip [color]="getStatusColor(review.status)">
                      {{ review.status | titlecase }}
                    </mat-chip>
                    <mat-chip class="language-chip">
                      {{ review.programmingLanguage | titlecase }}
                    </mat-chip>
                    @if (review.priority) {
                      <mat-chip [class]="'priority-' + review.priority">
                        {{ review.priority | titlecase }} Priority
                      </mat-chip>
                    }
                  </div>
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="review-description">
                  <h3>Description</h3>
                  <p>{{ review.description }}</p>
                </div>

                <div class="file-section">
                  <h3>Code File</h3>
                  <div class="file-info">
                    <mat-icon class="file-icon">attachment</mat-icon>
                    <div class="file-details">
                      <div class="file-name">{{ review.fileName }}</div>
                      <div class="file-size">{{ formatFileSize(review.fileSize) }}</div>
                    </div>
                    <button mat-icon-button (click)="downloadFile()" class="download-btn">
                      <mat-icon>download</mat-icon>
                    </button>
                  </div>
                </div>

                <mat-tab-group class="mt-4">
                  <mat-tab label="Annotations ({{ annotations.length }})">
                    <div class="annotations-content">
                      @if (annotations.length === 0) {
                        <div class="no-annotations">
                          <mat-icon>comment</mat-icon>
                          <p>No feedback yet. @if (canAddAnnotation()) {
                            <a (click)="addAnnotation()">Add the first comment</a>
                          }</p>
                        </div>
                      } @else {
                        <div class="annotations-list">
                          @for (annotation of annotations; track annotation.annotationId) {
                            <mat-expansion-panel class="annotation-panel">
                              <mat-expansion-panel-header>
                                <mat-panel-title>
                                  <div class="annotation-header">
                                    <span class="line-info">Line {{ annotation.lineNumber }}</span>
                                    <mat-chip [color]="getAnnotationTypeColor(annotation.severity)">
                                      {{ annotation.severity | titlecase }}
                                    </mat-chip>
                                  </div>
                                </mat-panel-title>
                                <mat-panel-description>
                                  {{ annotation.comment.substring(0, 100) }}{{ annotation.comment.length > 100 ? '...' : '' }}
                                </mat-panel-description>
                              </mat-expansion-panel-header>
                              <div class="annotation-content">
                                <div class="annotation-details">
                                  <strong>Line {{ annotation.lineNumber }}</strong>
                                </div>
                                <div class="annotation-comment">
                                  <strong>{{ annotation.severity | titlecase }} Feedback:</strong>
                                  <p>{{ annotation.comment }}</p>
                                </div>
                                <div class="annotation-meta">
                                  <small class="text-muted">
                                    Added {{ formatDate(annotation.createdAt) }} by {{ annotation.mentorName || 'Mentor' }}
                                  </small>
                                </div>
                              </div>
                            </mat-expansion-panel>
                          }
                        </div>
                      }

                      @if (canAddAnnotation()) {
                        <div class="add-annotation-section">
                          <button mat-raised-button color="primary" (click)="toggleAnnotationForm()">
                            <mat-icon>add_comment</mat-icon>
                            Add Feedback
                          </button>
                        </div>
                      }

                      @if (showAnnotationForm) {
                        <mat-card class="annotation-form">
                          <mat-card-header>
                            <mat-card-title>Add Feedback</mat-card-title>
                          </mat-card-header>
                          <mat-card-content>
                            <form [formGroup]="annotationForm">
                              <div class="row">
                                <div class="col-md-6">
                                  <mat-form-field class="w-100">
                                    <mat-label>Line Number</mat-label>
                                    <input matInput type="number" formControlName="lineNumber" min="1">
                                  </mat-form-field>
                                </div>
                                <div class="col-md-6">
                                  <mat-form-field class="w-100">
                                    <mat-label>Feedback Severity</mat-label>
                                    <mat-select formControlName="severity">
                                      <mat-option value="info">Info</mat-option>
                                      <mat-option value="suggestion">Suggestion</mat-option>
                                      <mat-option value="warning">Warning</mat-option>
                                      <mat-option value="error">Error</mat-option>
                                    </mat-select>
                                  </mat-form-field>
                                </div>
                              </div>
                              <div class="row">
                                <div class="col-12">
                                  <mat-form-field class="w-100">
                                    <mat-label>Comment</mat-label>
                                    <textarea matInput formControlName="comment" rows="4"></textarea>
                                  </mat-form-field>
                                </div>
                              </div>
                            </form>
                          </mat-card-content>
                          <mat-card-actions>
                            <button mat-button (click)="cancelAnnotation()">Cancel</button>
                            <button mat-raised-button color="primary" (click)="submitAnnotation()">
                              Add Feedback
                            </button>
                          </mat-card-actions>
                        </mat-card>
                      }
                    </div>
                  </mat-tab>

                  <mat-tab label="Review History">
                    <div class="history-content">
                      <div class="timeline">
                        <div class="timeline-item">
                          <mat-icon class="timeline-icon created">add_circle</mat-icon>
                          <div class="timeline-content">
                            <strong>Review requested</strong>
                            <p>{{ review.menteeName || 'Mentee' }} requested code review</p>
                            <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                          </div>
                        </div>
                        @if (review.mentorId) {
                          <div class="timeline-item">
                            <mat-icon class="timeline-icon assigned">assignment_ind</mat-icon>
                            <div class="timeline-content">
                              <strong>Mentor assigned</strong>
                              <p>{{ review.mentorName || 'Mentor' }} was assigned to this review</p>
                            </div>
                          </div>
                        }
                        @if (review.status === 'completed') {
                          <div class="timeline-item">
                            <mat-icon class="timeline-icon completed">check_circle</mat-icon>
                            <div class="timeline-content">
                              <strong>Review completed</strong>
                              <p>Code review has been completed with feedback</p>
                              <small class="text-muted">{{ formatDate(review.updatedAt || review.createdAt) }}</small>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  </mat-tab>
                </mat-tab-group>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>Review Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-section">
                  <h4>Participants</h4>
                  <div class="participant">
                    <mat-icon>person</mat-icon>
                    <div>
                      <div class="name">{{ review.menteeName || 'Mentee' }}</div>
                      <div class="role">Code Author</div>
                    </div>
                  </div>
                  @if (review.mentorId) {
                    <div class="participant">
                      <mat-icon>school</mat-icon>
                      <div>
                        <div class="name">{{ review.mentorName || 'Mentor' }}</div>
                        <div class="role">Code Reviewer</div>
                      </div>
                    </div>
                  } @else {
                    <div class="participant awaiting">
                      <mat-icon>school</mat-icon>
                      <div>
                        <div class="name">Awaiting mentor assignment</div>
                        <div class="role">Code Reviewer</div>
                      </div>
                    </div>
                  }
                </div>

                <div class="info-section">
                  <h4>Stats</h4>
                  <div class="stats">
                    <div class="stat">
                      <mat-icon>comment</mat-icon>
                      <span>{{ annotations.length }} feedback comments</span>
                    </div>
                    <div class="stat">
                      <mat-icon>attachment</mat-icon>
                      <span>{{ formatFileSize(review.fileSize) }} file size</span>
                    </div>
                  </div>
                </div>

                @if (canTakeReview() || canCompleteReview()) {
                  <div class="actions-section">
                    <h4>Actions</h4>
                    @if (canTakeReview()) {
                      <button mat-raised-button color="primary" (click)="takeReview()" class="w-100 mb-2">
                        <mat-icon>assignment_ind</mat-icon>
                        Take This Review
                      </button>
                    }
                    @if (canCompleteReview()) {
                      <button mat-raised-button color="accent" (click)="completeReview()" class="w-100">
                        <mat-icon>check</mat-icon>
                        Mark as Complete
                      </button>
                    }
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      } @else {
        <div class="text-center py-5">
          <mat-icon class="error-icon">error</mat-icon>
          <h3>Review not found</h3>
          <p>The requested code review could not be found.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Go Back
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .review-card {
      margin-bottom: 24px;
    }

    .review-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
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

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
      margin-top: 8px;

      .file-icon {
        color: #4caf50;
      }

      .file-details {
        flex: 1;

        .file-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .file-size {
          color: #666;
          font-size: 0.9rem;
        }
      }
    }

    .no-annotations {
      text-align: center;
      padding: 40px 20px;
      color: #666;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      a {
        color: #3f51b5;
        cursor: pointer;
        text-decoration: underline;
      }
    }

    .annotation-panel {
      margin-bottom: 16px;
    }

    .annotation-header {
      display: flex;
      align-items: center;
      gap: 12px;

      .line-info {
        font-weight: 500;
      }
    }

    .annotation-content {
      padding: 16px 0;

      .annotation-details,
      .annotation-comment,
      .annotation-suggestion {
        margin-bottom: 16px;

        strong {
          display: block;
          margin-bottom: 8px;
          color: #333;
        }

        code {
          display: block;
          padding: 8px 12px;
          background-color: #f5f5f5;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          margin-top: 4px;
        }

        .suggestion {
          background-color: #e8f5e8;
          border-left: 3px solid #4caf50;
        }
      }

      .annotation-meta {
        padding-top: 8px;
        border-top: 1px solid #eee;
      }
    }

    .add-annotation-section {
      padding: 16px 0;
      text-align: center;
      border-top: 1px solid #eee;
      margin-top: 16px;
    }

    .annotation-form {
      margin-top: 16px;
    }

    .timeline {
      padding: 16px 0;

      .timeline-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 24px;

        .timeline-icon {
          margin-top: 4px;

          &.created {
            color: #4caf50;
          }

          &.assigned {
            color: #2196f3;
          }

          &.completed {
            color: #ff9800;
          }
        }

        .timeline-content {
          flex: 1;

          strong {
            display: block;
            margin-bottom: 4px;
          }

          p {
            margin: 0 0 4px 0;
            color: #666;
          }
        }
      }
    }

    .info-card {
      position: sticky;
      top: 24px;
    }

    .info-section {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 12px 0;
        font-weight: 500;
        color: #333;
      }
    }

    .participant {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      &.awaiting {
        opacity: 0.6;
      }

      mat-icon {
        color: #666;
      }

      .name {
        font-weight: 500;
        margin-bottom: 2px;
      }

      .role {
        font-size: 0.9rem;
        color: #666;
      }
    }

    .stats {
      .stat {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #666;
        }

        span {
          font-size: 0.9rem;
        }
      }
    }

    .actions-section {
      h4 {
        margin-bottom: 16px;
      }
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }
  `
})
export class ReviewDetailsComponent implements OnInit {
  review: CodeReview | null = null;
  annotations: Annotation[] = [];
  loading = true;
  showAnnotationForm = false;
  annotationForm: FormGroup;
  currentUserId = 'current-user-id'; // Mock - get from auth service

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private codeReviewService: CodeReviewService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.annotationForm = this.fb.group({
      lineNumber: [1, [Validators.required, Validators.min(1)]],
      severity: ['suggestion', Validators.required],
      comment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const reviewId = this.route.snapshot.paramMap.get('id');
    if (reviewId) {
      this.loadReview(reviewId);
      this.loadAnnotations(reviewId);
    }
  }

  loadReview(reviewId: string): void {
    this.codeReviewService.getCodeReviewById(reviewId).subscribe({
      next: (review: CodeReview) => {
        this.review = review;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading review:', error);
        this.loading = false;
      }
    });
  }

  loadAnnotations(reviewId: string): void {
    this.codeReviewService.getAnnotations(reviewId).subscribe({
      next: (annotations: Annotation[]) => {
        this.annotations = annotations;
      },
      error: (error: any) => {
        console.error('Error loading annotations:', error);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'in-review': return 'primary';
      case 'completed': return 'accent';
      default: return 'primary';
    }
  }

  getAnnotationTypeColor(severity: string): string {
    switch (severity) {
      case 'error': return 'warn';
      case 'warning': return 'accent';
      case 'suggestion': return 'primary';
      case 'info': return 'primary';
      default: return 'primary';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  downloadFile(): void {
    if (this.review?.s3FileUrl) {
      const link = document.createElement('a');
      link.href = this.review.s3FileUrl;
      link.download = this.review.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  canAddAnnotation(): boolean {
    return this.review?.status === 'in-review' && this.review.mentorId === this.currentUserId;
  }

  canTakeReview(): boolean {
    return this.review?.status === 'pending' && !this.review.mentorId;
  }

  canCompleteReview(): boolean {
    return this.review?.status === 'in-review' && this.review.mentorId === this.currentUserId;
  }

  toggleAnnotationForm(): void {
    this.showAnnotationForm = !this.showAnnotationForm;
  }

  addAnnotation(): void {
    this.toggleAnnotationForm();
  }

  submitAnnotation(): void {
    if (!this.annotationForm.valid || !this.review) return;

    const annotationData = {
      ...this.annotationForm.value,
      mentorId: this.currentUserId
    };

    this.codeReviewService.createAnnotation(this.review.reviewId, annotationData).subscribe({
      next: (annotation: Annotation) => {
        this.annotations.push(annotation);
        this.annotationForm.reset({
          lineNumber: 1,
          severity: 'suggestion',
          comment: ''
        });
        this.showAnnotationForm = false;
        this.snackBar.open('Feedback added successfully!', 'Close', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error adding annotation:', error);
        this.snackBar.open('Error adding feedback', 'Close', { duration: 3000 });
      }
    });
  }

  cancelAnnotation(): void {
    this.showAnnotationForm = false;
    this.annotationForm.reset();
  }

  takeReview(): void {
    if (!this.review) return;

    this.codeReviewService.assignMentor(this.review.reviewId, this.currentUserId).subscribe({
      next: (updatedReview: CodeReview) => {
        this.review = updatedReview;
        this.snackBar.open('Review assigned to you!', 'Close', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error taking review:', error);
        this.snackBar.open('Error assigning review', 'Close', { duration: 3000 });
      }
    });
  }

  completeReview(): void {
    if (!this.review) return;

    this.codeReviewService.completeCodeReview(this.review.reviewId).subscribe({
      next: (updatedReview: CodeReview) => {
        this.review = updatedReview;
        this.snackBar.open('Review marked as complete!', 'Close', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error completing review:', error);
        this.snackBar.open('Error completing review', 'Close', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/code-reviews']);
  }
}