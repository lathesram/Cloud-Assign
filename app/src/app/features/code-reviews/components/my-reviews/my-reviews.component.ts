import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { CodeReviewService } from '../../../../shared/services/code-review.service';
import { CodeReview } from '../../../../shared/models/code-review.model';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    RouterLink
  ],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <mat-card>
            <mat-card-header>
              <mat-card-title>My Code Reviews</mat-card-title>
              <mat-card-subtitle>Track your submitted and assigned reviews</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <mat-tab-group>
                <!-- My Submissions Tab -->
                <mat-tab [label]="'My Submissions (' + mySubmissions.length + ')'">
                  @if (loadingSubmissions) {
                    <div class="text-center py-4">
                      <mat-spinner></mat-spinner>
                    </div>
                  } @else {
                    <div class="tab-content">
                      @if (mySubmissions.length === 0) {
                        <div class="empty-state">
                          <mat-icon>assignment</mat-icon>
                          <h3>No code reviews submitted</h3>
                          <p>You haven't submitted any code for review yet.</p>
                          <button mat-raised-button routerLink="/code-reviews/form">
                            Submit Code for Review
                          </button>
                        </div>
                      } @else {
                        <div class="table-responsive">
                          <table mat-table [dataSource]="mySubmissions" class="w-100">
                            <ng-container matColumnDef="title">
                              <th mat-header-cell *matHeaderCellDef>Review</th>
                              <td mat-cell *matCellDef="let review">
                                <div>
                                  <div class="fw-bold">{{ review.title }}</div>
                                  <small class="text-muted">{{ review.description }}</small>
                                </div>
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="language">
                              <th mat-header-cell *matHeaderCellDef>Language</th>
                              <td mat-cell *matCellDef="let review">
                                <mat-chip class="language-chip">
                                  {{ review.programmingLanguage | titlecase }}
                                </mat-chip>
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="mentor">
                              <th mat-header-cell *matHeaderCellDef>Mentor</th>
                              <td mat-cell *matCellDef="let review">
                                @if (review.mentorName) {
                                  <div class="mentor-info">
                                    <mat-icon>school</mat-icon>
                                    {{ review.mentorName }}
                                  </div>
                                } @else {
                                  <span class="text-muted">Awaiting assignment</span>
                                }
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="status">
                              <th mat-header-cell *matHeaderCellDef>Status</th>
                              <td mat-cell *matCellDef="let review">
                                <mat-chip [color]="getStatusColor(review.status)">
                                  {{ review.status | titlecase }}
                                </mat-chip>
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="feedback">
                              <th mat-header-cell *matHeaderCellDef>Feedback</th>
                              <td mat-cell *matCellDef="let review">
                                @if (review.annotations && review.annotations.length > 0) {
                                  <mat-icon [matBadge]="review.annotations.length">comment</mat-icon>
                                } @else {
                                  <span class="text-muted">No feedback yet</span>
                                }
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="date">
                              <th mat-header-cell *matHeaderCellDef>Submitted</th>
                              <td mat-cell *matCellDef="let review">
                                {{ formatDate(review.createdAt) }}
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="actions">
                              <th mat-header-cell *matHeaderCellDef>Actions</th>
                              <td mat-cell *matCellDef="let review">
                                <button mat-icon-button [routerLink]="['/code-reviews/details', review.reviewId]">
                                  <mat-icon>visibility</mat-icon>
                                </button>
                              </td>
                            </ng-container>

                            <tr mat-header-row *matHeaderRowDef="submissionColumns"></tr>
                            <tr mat-row *matRowDef="let row; columns: submissionColumns;"></tr>
                          </table>
                        </div>
                      }
                    </div>
                  }
                </mat-tab>

                <!-- Assigned to Me Tab -->
                <mat-tab [label]="'Assigned to Me (' + assignedToMe.length + ')'">
                  @if (loadingAssigned) {
                    <div class="text-center py-4">
                      <mat-spinner></mat-spinner>
                    </div>
                  } @else {
                    <div class="tab-content">
                      @if (assignedToMe.length === 0) {
                        <div class="empty-state">
                          <mat-icon>assignment_ind</mat-icon>
                          <h3>No reviews assigned</h3>
                          <p>You don't have any code reviews assigned to you for mentoring.</p>
                          <button mat-raised-button routerLink="/code-reviews">
                            Browse Available Reviews
                          </button>
                        </div>
                      } @else {
                        <div class="table-responsive">
                          <table mat-table [dataSource]="assignedToMe" class="w-100">
                            <ng-container matColumnDef="title">
                              <th mat-header-cell *matHeaderCellDef>Review</th>
                              <td mat-cell *matCellDef="let review">
                                <div>
                                  <div class="fw-bold">{{ review.title }}</div>
                                  <small class="text-muted">{{ review.description }}</small>
                                </div>
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="language">
                              <th mat-header-cell *matHeaderCellDef>Language</th>
                              <td mat-cell *matCellDef="let review">
                                <mat-chip class="language-chip">
                                  {{ review.programmingLanguage | titlecase }}
                                </mat-chip>
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="mentee">
                              <th mat-header-cell *matHeaderCellDef>Mentee</th>
                              <td mat-cell *matCellDef="let review">
                                <div class="mentee-info">
                                  <mat-icon>person</mat-icon>
                                  {{ review.menteeName || 'Mentee' }}
                                </div>
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="status">
                              <th mat-header-cell *matHeaderCellDef>Status</th>
                              <td mat-cell *matCellDef="let review">
                                <mat-chip [color]="getStatusColor(review.status)">
                                  {{ review.status | titlecase }}
                                </mat-chip>
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="progress">
                              <th mat-header-cell *matHeaderCellDef>Progress</th>
                              <td mat-cell *matCellDef="let review">
                                <div class="progress-info">
                                  @if (review.annotations && review.annotations.length > 0) {
                                    <mat-icon [matBadge]="review.annotations.length">comment</mat-icon>
                                    <span>{{ review.annotations.length }} feedback added</span>
                                  } @else {
                                    <span class="text-warning">No feedback yet</span>
                                  }
                                </div>
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="date">
                              <th mat-header-cell *matHeaderCellDef>Assigned</th>
                              <td mat-cell *matCellDef="let review">
                                {{ formatDate(review.createdAt) }}
                              </td>
                            </ng-container>

                            <ng-container matColumnDef="actions">
                              <th mat-header-cell *matHeaderCellDef>Actions</th>
                              <td mat-cell *matCellDef="let review">
                                <button mat-icon-button [routerLink]="['/code-reviews/details', review.reviewId]">
                                  <mat-icon>visibility</mat-icon>
                                </button>
                                @if (review.status === 'in-review') {
                                  <button mat-icon-button (click)="completeReview(review.reviewId)">
                                    <mat-icon>check</mat-icon>
                                  </button>
                                }
                              </td>
                            </ng-container>

                            <tr mat-header-row *matHeaderRowDef="assignedColumns"></tr>
                            <tr mat-row *matRowDef="let row; columns: assignedColumns;"></tr>
                          </table>
                        </div>
                      }
                    </div>
                  }
                </mat-tab>
              </mat-tab-group>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    .tab-content {
      padding: 16px 0;
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
        margin: 0 0 24px 0;
        font-size: 1.1rem;
      }
    }

    .language-chip {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .mentor-info,
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

    .progress-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;

      .text-warning {
        color: #ff9800;
        font-weight: 500;
      }
    }

    .table-responsive {
      overflow-x: auto;
    }

    mat-tab-group {
      background: transparent;
    }
  `
})
export class MyReviewsComponent implements OnInit {
  mySubmissions: CodeReview[] = [];
  assignedToMe: CodeReview[] = [];
  loadingSubmissions = false;
  loadingAssigned = false;
  currentUserId = 'current-user-id'; // Mock - get from auth service

  submissionColumns: string[] = ['title', 'language', 'mentor', 'status', 'feedback', 'date', 'actions'];
  assignedColumns: string[] = ['title', 'language', 'mentee', 'status', 'progress', 'date', 'actions'];

  constructor(private codeReviewService: CodeReviewService) {}

  ngOnInit(): void {
    this.loadMySubmissions();
    this.loadAssignedReviews();
  }

  loadMySubmissions(): void {
    this.loadingSubmissions = true;
    this.codeReviewService.getCodeReviewsByMentee(this.currentUserId).subscribe({
      next: (response: any) => {
        this.mySubmissions = response.data;
        this.loadingSubmissions = false;
      },
      error: (error: any) => {
        console.error('Error loading my submissions:', error);
        this.loadingSubmissions = false;
      }
    });
  }

  loadAssignedReviews(): void {
    this.loadingAssigned = true;
    this.codeReviewService.getCodeReviewsByMentor(this.currentUserId).subscribe({
      next: (response: any) => {
        this.assignedToMe = response.data;
        this.loadingAssigned = false;
      },
      error: (error: any) => {
        console.error('Error loading assigned reviews:', error);
        this.loadingAssigned = false;
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  completeReview(reviewId: string): void {
    this.codeReviewService.completeCodeReview(reviewId).subscribe({
      next: () => {
        // Reload the assigned reviews to update the status
        this.loadAssignedReviews();
      },
      error: (error: any) => {
        console.error('Error completing review:', error);
      }
    });
  }
}