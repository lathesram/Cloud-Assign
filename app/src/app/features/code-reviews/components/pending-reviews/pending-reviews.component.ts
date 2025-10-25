import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { CodeReviewService } from '../../../../shared/services/code-review.service';
import { CodeReview } from '../../../../shared/models/code-review.model';

@Component({
  selector: 'app-pending-reviews',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
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
              <mat-card-title>Pending Code Reviews</mat-card-title>
              <mat-card-subtitle>Code reviews awaiting mentor assignment and feedback</mat-card-subtitle>
              <div class="ms-auto d-flex gap-2">
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
                <mat-form-field class="filter-field">
                  <mat-label>Filter by Priority</mat-label>
                  <mat-select [(value)]="selectedPriority" (selectionChange)="onPriorityFilter()">
                    <mat-option value="">All Priorities</mat-option>
                    <mat-option value="high">High</mat-option>
                    <mat-option value="medium">Medium</mat-option>
                    <mat-option value="low">Low</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-card-header>
            <mat-card-content>
              @if (loading) {
                <div class="text-center py-4">
                  <mat-spinner></mat-spinner>
                </div>
              } @else {
                @if (pendingReviews.length === 0) {
                  <div class="empty-state">
                    <mat-icon>assignment</mat-icon>
                    <h3>No pending reviews</h3>
                    <p>There are currently no code reviews waiting for mentors.</p>
                  </div>
                } @else {
                  <div class="stats-summary mb-4">
                    <div class="stat-card">
                      <mat-icon>hourglass_empty</mat-icon>
                      <div class="stat-info">
                        <div class="stat-number">{{ pendingReviews.length }}</div>
                        <div class="stat-label">Pending Reviews</div>
                      </div>
                    </div>
                    <div class="stat-card">
                      <mat-icon>trending_up</mat-icon>
                      <div class="stat-info">
                        <div class="stat-number">{{ getHighPriorityCount() }}</div>
                        <div class="stat-label">High Priority</div>
                      </div>
                    </div>
                    <div class="stat-card">
                      <mat-icon>schedule</mat-icon>
                      <div class="stat-info">
                        <div class="stat-number">{{ getOldestDays() }}</div>
                        <div class="stat-label">Days Oldest</div>
                      </div>
                    </div>
                  </div>

                  <div class="table-responsive">
                    <table mat-table [dataSource]="pendingReviews" class="w-100">
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

                      <!-- Mentee Column -->
                      <ng-container matColumnDef="mentee">
                        <th mat-header-cell *matHeaderCellDef>Mentee</th>
                        <td mat-cell *matCellDef="let review">
                          <div class="mentee-info">
                            <mat-icon>person</mat-icon>
                            <span>{{ review.menteeName || 'Anonymous' }}</span>
                          </div>
                        </td>
                      </ng-container>

                      <!-- Priority Column -->
                      <ng-container matColumnDef="priority">
                        <th mat-header-cell *matHeaderCellDef>Priority</th>
                        <td mat-cell *matCellDef="let review">
                          @if (review.priority) {
                            <mat-chip [class]="'priority-' + review.priority">
                              {{ review.priority | titlecase }}
                            </mat-chip>
                          } @else {
                            <span class="text-muted">Normal</span>
                          }
                        </td>
                      </ng-container>

                      <!-- Waiting Time Column -->
                      <ng-container matColumnDef="waitingTime">
                        <th mat-header-cell *matHeaderCellDef>Waiting Time</th>
                        <td mat-cell *matCellDef="let review">
                          <div class="waiting-info">
                            <mat-icon [class]="getWaitingTimeClass(review.createdAt)">schedule</mat-icon>
                            <span>{{ getWaitingTime(review.createdAt) }}</span>
                          </div>
                        </td>
                      </ng-container>

                      <!-- Date Column -->
                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>Submitted</th>
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
                          <button 
                            mat-raised-button 
                            (click)="takeReview(review.reviewId)"
                            matTooltip="Accept this review assignment"
                            [disabled]="takingReview === review.reviewId"
                          >
                            @if (takingReview === review.reviewId) {
                              <mat-spinner diameter="16"></mat-spinner>
                            } @else {
                              <mat-icon>assignment_ind</mat-icon>
                            }
                            Take Review
                          </button>
                          <button 
                            mat-icon-button 
                            [routerLink]="['/code-reviews/details', review.reviewId]" 
                            matTooltip="View Details"
                          >
                            <mat-icon>visibility</mat-icon>
                          </button>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>
                  </div>
                }
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

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.6;
      }

      h3 {
        margin: 0 0 8px 0;
        color: #333;
      }

      p {
        margin: 0;
        font-size: 1.1rem;
      }
    }

    .stats-summary {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 8px;
        flex: 1;
        min-width: 150px;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
          color: #3f51b5;
        }

        .stat-info {
          .stat-number {
            font-size: 1.5rem;
            font-weight: 600;
            color: #333;
            line-height: 1;
          }

          .stat-label {
            font-size: 0.85rem;
            color: #666;
            margin-top: 2px;
          }
        }
      }
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      color: #666;

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
    }

    .language-chip {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .mentee-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
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

    .waiting-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;

        &.urgent {
          color: #f44336;
        }

        &.warning {
          color: #ff9800;
        }

        &.normal {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    mat-card-header {
      display: flex;
      align-items: center;
    }

    .table-responsive {
      overflow-x: auto;
    }

    button[mat-raised-button] {
      display: flex;
      align-items: center;
      gap: 8px;
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
  `
})
export class PendingReviewsComponent implements OnInit {
  pendingReviews: CodeReview[] = [];
  loading = false;
  selectedLanguage = '';
  selectedPriority = '';
  takingReview: string | null = null;
  displayedColumns: string[] = ['title', 'language', 'mentee', 'priority', 'waitingTime', 'date', 'actions'];
  currentUserId = 'current-user-id'; // Mock - get from auth service

  constructor(private codeReviewService: CodeReviewService) {}

  ngOnInit(): void {
    this.loadPendingReviews();
  }

  loadPendingReviews(): void {
    this.loading = true;
    const filters: any = { status: 'pending' };
    if (this.selectedLanguage) filters.programmingLanguage = this.selectedLanguage;
    if (this.selectedPriority) filters.priority = this.selectedPriority;

    this.codeReviewService.getCodeReviews(undefined, filters).subscribe({
      next: (response: any) => {
        this.pendingReviews = response.data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading pending reviews:', error);
        this.loading = false;
      }
    });
  }

  onLanguageFilter(): void {
    this.loadPendingReviews();
  }

  onPriorityFilter(): void {
    this.loadPendingReviews();
  }

  getHighPriorityCount(): number {
    return this.pendingReviews.filter(review => review.priority === 'high').length;
  }

  getOldestDays(): number {
    if (this.pendingReviews.length === 0) return 0;
    
    const now = new Date().getTime();
    const oldest = Math.min(...this.pendingReviews.map(review => new Date(review.createdAt).getTime()));
    return Math.floor((now - oldest) / (1000 * 60 * 60 * 24));
  }

  getWaitingTime(createdAt: string): string {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  getWaitingTimeClass(createdAt: string): string {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const diffInDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    
    if (diffInDays >= 3) return 'urgent';
    if (diffInDays >= 1) return 'warning';
    return 'normal';
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

  takeReview(reviewId: string): void {
    this.takingReview = reviewId;
    
    this.codeReviewService.assignMentor(reviewId, this.currentUserId).subscribe({
      next: () => {
        // Remove the review from the pending list
        this.pendingReviews = this.pendingReviews.filter(review => review.reviewId !== reviewId);
        this.takingReview = null;
      },
      error: (error: any) => {
        console.error('Error taking review:', error);
        this.takingReview = null;
      }
    });
  }
}