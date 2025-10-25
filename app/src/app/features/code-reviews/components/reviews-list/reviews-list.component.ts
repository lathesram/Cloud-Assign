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
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { CodeReviewService } from '../../../../shared/services/code-review.service';
import { CodeReview } from '../../../../shared/models/code-review.model';

@Component({
  selector: 'app-reviews-list',
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
    MatBadgeModule,
    RouterLink
  ],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Code Reviews</mat-card-title>
              <mat-card-subtitle>Manage code review requests and feedback</mat-card-subtitle>
              <div class="ms-auto d-flex gap-2">
                <mat-form-field class="filter-field">
                  <mat-label>Filter by Status</mat-label>
                  <mat-select [(value)]="selectedStatus" (selectionChange)="onStatusFilter()">
                    <mat-option value="">All Status</mat-option>
                    <mat-option value="pending">Pending</mat-option>
                    <mat-option value="in-review">In Review</mat-option>
                    <mat-option value="completed">Completed</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field class="filter-field">
                  <mat-label>Filter by Language</mat-label>
                  <mat-select [(value)]="selectedLanguage" (selectionChange)="onLanguageFilter()">
                    <mat-option value="">All Languages</mat-option>
                    <mat-option value="javascript">JavaScript</mat-option>
                    <mat-option value="typescript">TypeScript</mat-option>
                    <mat-option value="python">Python</mat-option>
                    <mat-option value="java">Java</mat-option>
                    <mat-option value="csharp">C#</mat-option>
                    <mat-option value="cpp">C++</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="primary" routerLink="/code-reviews/form">
                  <mat-icon>add</mat-icon>
                  Request Review
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
                  <table mat-table [dataSource]="reviews" class="w-100">
                    <!-- Title Column -->
                    <ng-container matColumnDef="title">
                      <th mat-header-cell *matHeaderCellDef>Review Request</th>
                      <td mat-cell *matCellDef="let review">
                        <div>
                          <div class="fw-bold">{{ review.title }}</div>
                          <small class="text-muted">{{ review.description }}</small>
                          <div class="file-info mt-1">
                            <mat-icon class="file-icon">attachment</mat-icon>
                            <span class="filename">{{ review.fileName }}</span>
                            <span class="file-size">({{ formatFileSize(review.fileSize) }})</span>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Language Column -->
                    <ng-container matColumnDef="language">
                      <th mat-header-cell *matHeaderCellDef>Language</th>
                      <td mat-cell *matCellDef="let review">
                        <mat-chip class="language-chip">
                          {{ review.programmingLanguage | titlecase }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <!-- Participants Column -->
                    <ng-container matColumnDef="participants">
                      <th mat-header-cell *matHeaderCellDef>Participants</th>
                      <td mat-cell *matCellDef="let review">
                        <div class="participants">
                          <div class="participant">
                            <mat-icon class="participant-icon">person</mat-icon>
                            <span>{{ review.menteeName || 'Mentee' }}</span>
                          </div>
                          @if (review.mentorName) {
                            <div class="participant">
                              <mat-icon class="participant-icon">school</mat-icon>
                              <span>{{ review.mentorName }}</span>
                            </div>
                          } @else {
                            <div class="participant text-muted">
                              <mat-icon class="participant-icon">school</mat-icon>
                              <span>Awaiting mentor</span>
                            </div>
                          }
                        </div>
                      </td>
                    </ng-container>

                    <!-- Status Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let review">
                        <mat-chip [color]="getStatusColor(review.status)">
                          {{ review.status | titlecase }}
                        </mat-chip>
                        @if (review.priority) {
                          <div class="priority-badge" [class]="'priority-' + review.priority">
                            {{ review.priority | titlecase }}
                          </div>
                        }
                      </td>
                    </ng-container>

                    <!-- Annotations Column -->
                    <ng-container matColumnDef="annotations">
                      <th mat-header-cell *matHeaderCellDef>Feedback</th>
                      <td mat-cell *matCellDef="let review">
                        @if (review.annotations && review.annotations.length > 0) {
                          <div class="annotations-summary">
                            <mat-icon [matBadge]="review.annotations.length" matBadgeColor="accent">comment</mat-icon>
                            <span class="annotation-count">{{ review.annotations.length }} comments</span>
                          </div>
                        } @else {
                          <span class="text-muted">No feedback yet</span>
                        }
                      </td>
                    </ng-container>

                    <!-- Date Column -->
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let review">
                        <div>
                          <div class="fw-bold">{{ formatDate(review.createdAt) }}</div>
                          <small class="text-muted">{{ formatTime(review.createdAt) }}</small>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let review">
                        <button mat-icon-button [routerLink]="['/code-reviews/details', review.reviewId]" matTooltip="View Details">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        @if (review.status === 'pending') {
                          <button mat-icon-button color="primary" (click)="assignToMe(review.reviewId)" matTooltip="Take Review">
                            <mat-icon>assignment_ind</mat-icon>
                          </button>
                        }
                        @if (review.status === 'in-review') {
                          <button mat-icon-button color="accent" (click)="completeReview(review.reviewId)" matTooltip="Mark Complete">
                            <mat-icon>done</mat-icon>
                          </button>
                        }
                        <button mat-icon-button (click)="downloadFile(review.s3FileUrl, review.fileName)" matTooltip="Download File">
                          <mat-icon>download</mat-icon>
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
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      color: #666;
    }
    
    .file-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .filename {
      font-weight: 500;
    }
    
    .file-size {
      color: #999;
    }
    
    .language-chip {
      background: #e8f5e8;
      color: #2e7d32;
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
    
    .priority-badge {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 8px;
      margin-top: 4px;
      display: inline-block;
      
      &.priority-high {
        background: #ffebee;
        color: #c62828;
      }
      
      &.priority-medium {
        background: #fff3e0;
        color: #ef6c00;
      }
      
      &.priority-low {
        background: #e8f5e8;
        color: #2e7d32;
      }
    }
    
    .annotations-summary {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .annotation-count {
      font-size: 0.9rem;
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
export class ReviewsListComponent implements OnInit {
  reviews: CodeReview[] = [];
  loading = false;
  selectedStatus = '';
  selectedLanguage = '';
  displayedColumns: string[] = ['title', 'language', 'participants', 'status', 'annotations', 'date', 'actions'];

  constructor(private codeReviewService: CodeReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    const filters: any = {};
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.selectedLanguage) filters.programmingLanguage = this.selectedLanguage;
    
    this.codeReviewService.getCodeReviews(undefined, filters).subscribe({
      next: (response: any) => {
        this.reviews = response.data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading reviews:', error);
        this.loading = false;
      }
    });
  }

  onStatusFilter(): void {
    this.loadReviews();
  }

  onLanguageFilter(): void {
    this.loadReviews();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'in-review': return 'primary';
      case 'completed': return 'accent';
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

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  assignToMe(reviewId: string): void {
    // Mock current user ID - in real app, get from auth service
    const currentUserId = 'current-user-id';
    this.codeReviewService.updateCodeReview(reviewId, { 
      status: 'in-review', 
      mentorId: currentUserId 
    }).subscribe({
      next: () => {
        this.loadReviews(); // Reload the list
      },
      error: (error: any) => {
        console.error('Error assigning review:', error);
      }
    });
  }

  completeReview(reviewId: string): void {
    this.codeReviewService.updateCodeReview(reviewId, { status: 'completed' }).subscribe({
      next: () => {
        this.loadReviews(); // Reload the list
      },
      error: (error: any) => {
        console.error('Error completing review:', error);
      }
    });
  }

  downloadFile(fileUrl: string, fileName: string): void {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}