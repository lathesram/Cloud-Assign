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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../shared/services/user.service';
import { User, UserSearchResult } from '../../../../shared/models/user.model';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-users-list',
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
    MatInputModule,
    MatSelectModule,
    RouterLink
  ],
  template: `
    <div class="main-container">
      <div class="page-header">
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">Manage mentors and mentees in your platform</p>
      </div>
      
      <div class="content-card">
        <div class="filters-section">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="search-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Search users...</mat-label>
                  <input matInput 
                         [(ngModel)]="searchQuery" 
                         (input)="onSearchChange()"
                         placeholder="Search by name, email, or skills">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-3">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>User Type</mat-label>
                  <mat-select [(value)]="selectedType" (selectionChange)="onFilterChange()">
                    <mat-option value="">All Users</mat-option>
                    <mat-option value="mentor">Mentors</mat-option>
                    <mat-option value="mentee">Mentees</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-3">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Status</mat-label>
                  <mat-select [(value)]="selectedStatus" (selectionChange)="onFilterChange()">
                    <mat-option value="">All Status</mat-option>
                    <mat-option value="active">Active</mat-option>
                    <mat-option value="inactive">Inactive</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
          </div>
          
          <!-- Advanced Filters -->
          <div class="row g-3 mt-2">
            <div class="col-md-3">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Domain</mat-label>
                  <mat-select [(value)]="selectedDomain" (selectionChange)="onFilterChange()">
                    <mat-option value="">All Domains</mat-option>
                    <mat-option value="backend">Backend</mat-option>
                    <mat-option value="frontend">Frontend</mat-option>
                    <mat-option value="fullstack">Full Stack</mat-option>
                    <mat-option value="mobile">Mobile</mat-option>
                    <mat-option value="data">Data Science</mat-option>
                    <mat-option value="devops">DevOps</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-3">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Seniority</mat-label>
                  <mat-select [(value)]="selectedSeniority" (selectionChange)="onFilterChange()">
                    <mat-option value="">All Levels</mat-option>
                    <mat-option value="junior">Junior</mat-option>
                    <mat-option value="mid">Mid-level</mat-option>
                    <mat-option value="senior">Senior</mat-option>
                    <mat-option value="staff">Staff</mat-option>
                    <mat-option value="principal">Principal</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-3">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Min Rating</mat-label>
                  <mat-select [(value)]="selectedMinRating" (selectionChange)="onFilterChange()">
                    <mat-option value="">Any Rating</mat-option>
                    <mat-option [value]="4">4+ Stars</mat-option>
                    <mat-option [value]="3">3+ Stars</mat-option>
                    <mat-option [value]="2">2+ Stars</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
            <div class="col-md-3">
              <div class="filter-field">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Max Hourly Rate</mat-label>
                  <input matInput type="number" [(ngModel)]="selectedMaxHourlyRate" 
                         (input)="onFilterChange()" placeholder="Enter max rate">
                </mat-form-field>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="action-bar">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="mb-0">Users ({{ filteredUsers.length }})</h3>
            <button mat-raised-button routerLink="/users/form">
              <mat-icon>person_add</mat-icon>
              Create New User
            </button>
          </div>
        </div>

        <div class="table-container">
          @if (loading) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
              <div class="loading-text">Loading users...</div>
            </div>
          } @else if (filteredUsers.length === 0) {
            <div class="empty-state">
              <mat-icon>people_outline</mat-icon>
              <h3>No users found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table mat-table [dataSource]="filteredUsers" class="w-100">
                    <!-- Name Column -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Name</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="d-flex align-items-center">
                          <div class="avatar me-3">
                            {{ user.name.charAt(0).toUpperCase() }}
                          </div>
                          <div>
                            <div class="user-name">{{ user.name }}</div>
                            <div class="user-email">{{ user.email }}</div>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Type Column -->
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let user">
                        <span class="type-chip" [class]="user.type">
                          {{ user.type | titlecase }}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Domain Column -->
                    <ng-container matColumnDef="domain">
                      <th mat-header-cell *matHeaderCellDef>Domain</th>
                      <td mat-cell *matCellDef="let user">
                        @if (user.domain) {
                          <span class="domain-chip">{{ user.domain | titlecase }}</span>
                        } @else {
                          <span class="text-muted">Not specified</span>
                        }
                      </td>
                    </ng-container>

                    <!-- Seniority Column -->
                    <ng-container matColumnDef="seniority">
                      <th mat-header-cell *matHeaderCellDef>Level</th>
                      <td mat-cell *matCellDef="let user">
                        @if (user.seniority) {
                          <span class="seniority-chip" [class]="user.seniority">{{ user.seniority | titlecase }}</span>
                        } @else {
                          <span class="text-muted">Not specified</span>
                        }
                      </td>
                    </ng-container>

                    <!-- Rating Column -->
                    <ng-container matColumnDef="rating">
                      <th mat-header-cell *matHeaderCellDef>Rating</th>
                      <td mat-cell *matCellDef="let user">
                        @if (user.rating && user.rating > 0) {
                          <div class="rating-container">
                            <span class="rating-stars">
                              @for (star of getStars(user.rating); track star) {
                                <mat-icon class="star" [class.filled]="star">star</mat-icon>
                              }
                            </span>
                            <span class="rating-text">({{ user.rating.toFixed(1) }})</span>
                          </div>
                        } @else {
                          <span class="text-muted">No rating</span>
                        }
                      </td>
                    </ng-container>

                    <!-- Hourly Rate Column -->
                    <ng-container matColumnDef="hourlyRate">
                      <th mat-header-cell *matHeaderCellDef>Rate</th>
                      <td mat-cell *matCellDef="let user">
                        @if (user.type === 'mentor' && user.hourlyRate) {
                          <span class="rate-chip">\${{ user.hourlyRate }}/hr</span>
                        } @else if (user.type === 'mentor') {
                          <span class="text-muted">Free</span>
                        } @else {
                          <span class="text-muted">N/A</span>
                        }
                      </td>
                    </ng-container>

                    <!-- Skills Column -->
                    <ng-container matColumnDef="skills">
                      <th mat-header-cell *matHeaderCellDef>Skills</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="skills-container">
                          @if (user.skills && user.skills.length > 0) {
                            @for (skill of user.skills.slice(0, 3); track skill) {
                              <span class="skill-chip">{{ skill }}</span>
                            }
                            @if (user.skills.length > 3) {
                              <span class="skill-chip">+{{ user.skills.length - 3 }}</span>
                            }
                          } @else {
                            <span class="text-muted">No skills</span>
                          }
                        </div>
                      </td>
                    </ng-container>

                    <!-- Status Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let user">
                        <span class="status-chip" [class]="user.isActive ? 'active' : 'inactive'">
                          {{ user.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let user">
                        <button mat-icon-button [routerLink]="['/users/profile', user.userId]" 
                                matTooltip="View Profile" class="action-button">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button [routerLink]="['/users/form', user.userId]" 
                                matTooltip="Edit User" class="action-button">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="deleteUser(user.userId)" 
                                matTooltip="Delete User" class="action-button">
                          <mat-icon>delete</mat-icon>
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
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: #ffffff;
      min-height: calc(100vh - 64px);
      padding: 24px 0;
    }

    .main-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .page-header {
      background: #ffffff;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid #e0e0e0;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 600;
      color: #333333;
      margin: 0 0 8px 0;
    }

    .page-subtitle {
      color: #666666;
      font-size: 1rem;
      margin: 0;
    }

    .content-card {
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .filters-section {
      padding: 24px;
      background: linear-gradient(135deg, #f8faff 0%, #f1f4ff 100%);
      border-bottom: 1px solid rgba(103, 126, 234, 0.1);
    }

    .search-field {
      .mat-mdc-form-field {
        background: transparent;
        
        .mat-mdc-text-field-wrapper {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        
        .mat-mdc-notched-outline {
          display: none;
        }
        
        .mat-mdc-floating-label {
          color: rgba(255,255,255,0.8);
        }
        
        .mat-mdc-input-element {
          color: white;
        }
        
        &:hover .mat-mdc-text-field-wrapper {
          background: rgba(255,255,255,0.15);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        &.mat-focused {
          .mat-mdc-text-field-wrapper {
            background: rgba(255,255,255,0.15);
            border-color: rgba(255,255,255,0.4);
            box-shadow: 0 4px 16px rgba(103, 126, 234, 0.3);
          }
          
          .mat-mdc-floating-label {
            color: white;
          }
        }
      }
    }

    .filter-field {
      .mat-mdc-form-field {
        background: transparent;
        
        .mat-mdc-text-field-wrapper {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        
        .mat-mdc-notched-outline {
          display: none;
        }
        
        .mat-mdc-floating-label {
          color: rgba(255,255,255,0.8);
        }
        
        .mat-mdc-input-element {
          color: white;
        }
        
        &:hover .mat-mdc-text-field-wrapper {
          background: rgba(255,255,255,0.15);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        &.mat-focused {
          .mat-mdc-text-field-wrapper {
            background: rgba(255,255,255,0.15);
            border-color: rgba(255,255,255,0.4);
            box-shadow: 0 4px 16px rgba(103, 126, 234, 0.3);
          }
          
          .mat-mdc-floating-label {
            color: white;
          }
        }
        
        .mat-mdc-select-arrow {
          color: rgba(255,255,255,0.8);
        }
      }
    }

    .table-container {
      padding: 0;
      background: white;
    }

    .mat-mdc-table {
      background: transparent;
      border-radius: 0;
      box-shadow: none;
      
      .mat-mdc-header-row {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        
        .mat-mdc-header-cell {
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border: none;
          padding: 16px 12px;
        }
      }
      
      .mat-mdc-row {
        transition: all 0.3s ease;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        
        &:hover {
          background: linear-gradient(135deg, rgba(103, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .mat-mdc-cell {
          padding: 16px 12px;
          border: none;
        }
      }
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #f8f9fa;
      color: #333333;
      border: 2px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .user-name {
      font-weight: 600;
      color: #2d3748;
      font-size: 1rem;
    }

    .user-email {
      color: #718096;
      font-size: 0.875rem;
      margin-top: 2px;
    }

    .skills-container {
      max-width: 220px;
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .skill-chip {
      background: #f8f9fa;
      color: #333333;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(103, 126, 234, 0.4);
      }
    }

    .status-chip {
      font-weight: 600;
      font-size: 0.75rem;
      padding: 6px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &.active {
        background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
      }
      
      &.inactive {
        background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
        color: #c53030;
        box-shadow: 0 2px 8px rgba(197, 48, 48, 0.2);
      }
    }

    .type-chip {
      font-weight: 600;
      font-size: 0.75rem;
      padding: 6px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &.mentor {
        background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(128, 90, 213, 0.3);
      }
      
      &.mentee {
        background: linear-gradient(135deg, #38b2ac 0%, #319795 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(56, 178, 172, 0.3);
      }
    }

    .domain-chip {
      font-weight: 500;
      font-size: 0.7rem;
      padding: 4px 8px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-transform: capitalize;
    }

    .seniority-chip {
      font-weight: 600;
      font-size: 0.7rem;
      padding: 4px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &.junior {
        background: #e6fffa;
        color: #234e52;
        border: 1px solid #81e6d9;
      }
      
      &.mid {
        background: #fef5e7;
        color: #744210;
        border: 1px solid #f6ad55;
      }
      
      &.senior {
        background: #fed7d7;
        color: #742a2a;
        border: 1px solid #fc8181;
      }
      
      &.staff {
        background: #e9d8fd;
        color: #553c9a;
        border: 1px solid #b794f6;
      }
      
      &.principal {
        background: #bee3f8;
        color: #2a69ac;
        border: 1px solid #63b3ed;
      }
    }

    .rating-container {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .rating-stars {
      display: flex;
      gap: 2px;
    }

    .star {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #e2e8f0;
      
      &.filled {
        color: #fbbf24;
      }
    }

    .rating-text {
      font-size: 0.75rem;
      color: #666;
      margin-left: 4px;
    }

    .rate-chip {
      font-weight: 600;
      font-size: 0.75rem;
      padding: 4px 8px;
      border-radius: 12px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .action-button {
      transition: all 0.3s ease;
      border-radius: 8px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }

    .loading-container {
      padding: 48px;
      text-align: center;
      
      .mat-mdc-progress-spinner {
        margin: 0 auto 16px;
      }
      
      .loading-text {
        color: #718096;
        font-size: 1rem;
      }
    }

    .empty-state {
      padding: 48px;
      text-align: center;
      color: #718096;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      h3 {
        margin: 0 0 8px 0;
        font-weight: 500;
      }
      
      p {
        margin: 0;
        opacity: 0.7;
      }
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 1.5rem;
      }
      
      .filters-section {
        padding: 16px;
      }
      
      .avatar {
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }
      
      .skills-container {
        max-width: 150px;
      }
      
      .skill-chip {
        font-size: 0.7rem;
        padding: 2px 6px;
      }
    }
  `
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  displayedColumns: string[] = ['name', 'type', 'domain', 'seniority', 'rating', 'hourlyRate', 'skills', 'status', 'actions'];
  
  searchQuery = '';
  selectedType = '';
  selectedStatus = '';
  selectedDomain = '';
  selectedSeniority = '';
  selectedMinRating: number | '' = '';
  selectedMaxHourlyRate: number | '' = '';
  private searchTimeout: any;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    
    // Use advanced search with filters
    const searchParams = {
      query: this.searchQuery,
      type: this.selectedType as 'mentor' | 'mentee' | undefined,
      domain: this.selectedDomain,
      seniority: this.selectedSeniority,
      minRating: this.selectedMinRating as number | undefined,
      maxHourlyRate: this.selectedMaxHourlyRate as number | undefined,
      page: 1,
      limit: 100
    };

    this.userService.advancedSearch(searchParams).subscribe({
      next: (response: UserSearchResult) => {
        this.users = response.users as User[];
        this.filteredUsers = [...this.users];
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load users. Please try again.');
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
    // Reload users with current filters instead of client-side filtering
    this.loadUsers();
  }

  getStars(rating: number): boolean[] {
    const stars: boolean[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.round(rating));
    }
    return stars;
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.notificationService.showSuccess('User deleted successfully');
          this.loadUsers(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.notificationService.showError('Failed to delete user. Please try again.');
        }
      });
    }
  }
}