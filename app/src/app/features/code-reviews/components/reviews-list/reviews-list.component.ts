import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { CodeReviewService } from '../../../../shared/services/code-review.service';
import { CodeReview } from '../../../../shared/models/code-review.model';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatBadgeModule,
    RouterLink
  ],
  template: `
    <div class="main-container">
      <div class="page-header">
        <h1 class="page-title">Code Reviews</h1>
        <p class="page-subtitle">Manage code review requests and feedback</p>
        
        <div class="action-buttons">
          <button mat-raised-button routerLink="/code-reviews/form" color="primary">
            <mat-icon>add</mat-icon>
            Submit Code for Review
          </button>
          <button mat-button routerLink="/code-reviews/my-reviews">
            <mat-icon>person</mat-icon>
            My Reviews
          </button>
          <button mat-button routerLink="/code-reviews/pending">
            <mat-icon>hourglass_empty</mat-icon>
            Pending Reviews
          </button>
        </div>
      </div>
      
      <div class="content-card">
        <div class="filters-section">
          <div class="row">
            <div class="col-md-5">
              <div class="search-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Search reviews...</mat-label>
                  <input matInput 
                         [(ngModel)]="searchQuery" 
                         (input)="onSearchChange()"
                         placeholder="Search by title, description, or technology">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-2">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Status</mat-label>
                  <mat-select [(value)]="selectedStatus" (selectionChange)="onFilterChange()">
                    <mat-option value="">All Status</mat-option>
                    <mat-option value="pending">Pending</mat-option>
                    <mat-option value="in-review">In Review</mat-option>
                    <mat-option value="completed">Completed</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-2">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Priority</mat-label>
                  <mat-select [(value)]="selectedPriority" (selectionChange)="onFilterChange()">
                    <mat-option value="">All Priority</mat-option>
                    <mat-option value="low">Low</mat-option>
                    <mat-option value="medium">Medium</mat-option>
                    <mat-option value="high">High</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-3">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Assigned To</mat-label>
                  <mat-select [(value)]="selectedMentor" (selectionChange)="onFilterChange()">
                    <mat-option value="">All Mentors</mat-option>
                    <mat-option value="assigned">Assigned</mat-option>
                    <mat-option value="unassigned">Unassigned</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
          </div>
        </div>

        <div class="table-container">
          @if (loading) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
              <div class="loading-text">Loading reviews...</div>
            </div>
          } @else if (filteredReviews.length === 0) {
            <div class="empty-state">
              <mat-icon>code_off</mat-icon>
              <h3>No reviews found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table mat-table [dataSource]="filteredReviews" class="w-100">
                <!-- Title Column -->
                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Review Request</th>
                  <td mat-cell *matCellDef="let review">
                    <div class="review-info">
                      <div class="review-title">{{ review.title }}</div>
                      <div class="review-description">{{ review.description }}</div>
                      <div class="file-info">
                        <mat-icon class="file-icon">attachment</mat-icon>
                        <span class="filename">{{ review.fileName }}</span>
                        <span class="file-size">({{ review.fileSize ? (review.fileSize + ' bytes') : 'Unknown size' }})</span>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Language Column -->
                <ng-container matColumnDef="language">
                  <th mat-header-cell *matHeaderCellDef>Language</th>
                  <td mat-cell *matCellDef="let review">
                    <span class="language-chip">
                      {{ review.programmingLanguage | titlecase }}
                    </span>
                  </td>
                </ng-container>

                <!-- Participants Column -->
                <ng-container matColumnDef="participants">
                  <th mat-header-cell *matHeaderCellDef>Participants</th>
                  <td mat-cell *matCellDef="let review">
                    <div class="mentor-info">
                      <div class="mentor-name">👤 {{ review.menteeName || 'Mentee' }}</div>
                      @if (review.mentorName) {
                        <div class="mentor-name">👨‍🏫 {{ review.mentorName }}</div>
                      } @else {
                        <div class="mentor-status">Awaiting mentor assignment</div>
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let review">
                    <span class="status-chip" [class]="review.status">
                      {{ review.status | titlecase }}
                    </span>
                    @if (review.priority) {
                      <div style="margin-top: 8px;">
                        <span class="priority-chip" [class]="review.priority">
                          {{ review.priority | titlecase }}
                        </span>
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
                        <button mat-icon-button [routerLink]="['/code-reviews/details', review.reviewId]" 
                                matTooltip="View Details" class="action-button">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        @if (review.status === 'pending') {
                          <button mat-icon-button (click)="assignToMe(review.reviewId)" 
                                  matTooltip="Take Review" class="action-button">
                            <mat-icon>assignment_ind</mat-icon>
                          </button>
                        }
                        @if (review.status === 'in-review') {
                          <button mat-icon-button (click)="completeReview(review.reviewId)" 
                                  matTooltip="Mark Complete" class="action-button">
                            <mat-icon>done</mat-icon>
                          </button>
                        }
                        <button mat-icon-button (click)="downloadFile(review.s3FileUrl, review.fileName)" 
                                matTooltip="Download File" class="action-button">
                          <mat-icon>download</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          }
        </div>
      </div>
  `,
  styles: `
    .main-container {
      min-height: 100vh;
      background: white;
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #666;
      margin: 0 0 1rem 0;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .content-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      max-width: 1400px;
      margin: 0 auto;
    }

    .filters-section {
      margin-bottom: 2rem;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -0.75rem;
    }

    .col-md-2, .col-md-3, .col-md-5 {
      padding: 0 0.75rem;
      margin-bottom: 1rem;
    }

    .col-md-2 {
      flex: 0 0 16.666667%;
      max-width: 16.666667%;
    }

    .col-md-3 {
      flex: 0 0 25%;
      max-width: 25%;
    }

    .col-md-5 {
      flex: 0 0 41.666667%;
      max-width: 41.666667%;
    }

    .search-field, .filter-field {
      width: 100%;
    }

    .w-100 {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-floating-label {
      color: #666;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-input-element {
      color: #333;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-input-element::placeholder {
      color: #999;
    }

    ::ng-deep .mat-mdc-select-arrow {
      color: #666;
    }

    ::ng-deep .mat-mdc-select-value {
      color: #333 !important;
    }

    ::ng-deep .mat-mdc-select-placeholder {
      color: #999 !important;
    }

    ::ng-deep .mat-mdc-select-value-text {
      color: #333 !important;
    }

    ::ng-deep .mat-icon {
      color: #666;
    }

    ::ng-deep .mat-mdc-select-panel {
      background: white !important;
      border-radius: 4px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
    }

    ::ng-deep .mat-mdc-option {
      color: #333 !important;
    }

    ::ng-deep .mat-mdc-option:hover {
      background: #f5f5f5 !important;
    }

    ::ng-deep .mat-mdc-option.mdc-list-item--selected {
      background: #e3f2fd !important;
    }

    .table-container {
      background: white;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
    }

    .table-responsive {
      overflow-x: auto;
    }

    ::ng-deep .mat-mdc-table {
      background: white;
      color: #333;
    }

    ::ng-deep .mat-mdc-header-cell {
      background: #f5f5f5;
      color: #333;
      font-weight: 600;
      border-bottom: 1px solid #e0e0e0;
      padding: 1rem;
    }

    ::ng-deep .mat-mdc-cell {
      color: #333;
      border-bottom: 1px solid #f0f0f0;
      padding: 1rem;
    }

    ::ng-deep .mat-mdc-row:hover {
      background: #f9f9f9;
    }

    .review-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .review-title {
      font-weight: 600;
      font-size: 1rem;
      color: #333;
    }

    .review-description {
      font-size: 0.9rem;
      color: #666;
      line-height: 1.4;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #999;
      margin-top: 0.25rem;
    }

    .file-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .filename {
      font-weight: 500;
      color: #555;
    }

    .file-size {
      color: #999;
    }

    .language-chip {
      background: #f5f5f5;
      color: #333;
      padding: 0.3rem 0.8rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
      border: 1px solid #e0e0e0;
      display: inline-block;
    }

    .mentor-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mentor-name {
      font-size: 0.9rem;
      color: #333;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .mentor-status {
      font-size: 0.85rem;
      color: #999;
      font-style: italic;
    }

    .status-chip {
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 500;
      display: inline-block;
      text-transform: capitalize;
    }

    .status-chip.pending {
      background: #fff3e0;
      color: #e65100;
      border: 1px solid #ffcc02;
    }

    .status-chip.in-review {
      background: #e3f2fd;
      color: #1565c0;
      border: 1px solid #42a5f5;
    }

    .status-chip.completed {
      background: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #66bb6a;
    }

    .priority-chip {
      padding: 0.3rem 0.8rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
      display: inline-block;
      text-transform: capitalize;
    }

    .priority-chip.low {
      background: #f5f5f5;
      color: #666;
      border: 1px solid #e0e0e0;
    }

    .priority-chip.medium {
      background: #fff3e0;
      color: #e65100;
      border: 1px solid #ffcc02;
    }

    .priority-chip.high {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ef5350;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      color: #666;
    }

    .loading-text {
      margin-top: 1rem;
      font-size: 1.1rem;
      color: #666;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .empty-state p {
      font-size: 1rem;
      color: #666;
      margin: 0;
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

      .col-md-2, .col-md-3, .col-md-5 {
        flex: 0 0 100%;
        max-width: 100%;
      }

      .action-buttons {
        justify-content: center;
      }

      .table-responsive {
        font-size: 0.85rem;
      }
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
        background: rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.8);
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
  filteredReviews: CodeReview[] = [];
  loading = false;
  selectedStatus = '';
  selectedPriority = '';
  selectedMentor = '';
  searchQuery = '';
  displayedColumns: string[] = ['title', 'language', 'participants', 'status', 'annotations', 'date', 'actions'];
  private searchTimeout: any;

  constructor(private codeReviewService: CodeReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.codeReviewService.getCodeReviews().subscribe({
      next: (response: any) => {
        console.log('API Response:', response); // Debug log
        // Handle both direct array and wrapped response formats
        if (Array.isArray(response)) {
          this.reviews = response;
        } else if (response && Array.isArray(response.data)) {
          this.reviews = response.data;
        } else {
          console.error('Unexpected response format:', response);
          this.reviews = [];
        }
        this.filteredReviews = [...this.reviews];
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading reviews:', error);
        this.reviews = [];
        this.filteredReviews = [];
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.reviews];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.title.toLowerCase().includes(query) ||
        (review.description && review.description.toLowerCase().includes(query)) ||
        (review.programmingLanguage && review.programmingLanguage.toLowerCase().includes(query))
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(review => review.status === this.selectedStatus);
    }

    if (this.selectedPriority) {
      filtered = filtered.filter(review => review.priority === this.selectedPriority);
    }

    if (this.selectedMentor) {
      if (this.selectedMentor === 'assigned') {
        filtered = filtered.filter(review => review.mentorId);
      } else if (this.selectedMentor === 'unassigned') {
        filtered = filtered.filter(review => !review.mentorId);
      }
    }

    this.filteredReviews = filtered;
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