import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../shared/services/user.service';
import { User } from '../../../../shared/models/user.model';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-users-list',
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
    RouterLink
  ],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <mat-card>
            <mat-card-header>
              <mat-card-title>User Management</mat-card-title>
              <mat-card-subtitle>Manage mentors and mentees</mat-card-subtitle>
              <div class="ms-auto">
                <button mat-raised-button color="primary" routerLink="/users/form">
                  <mat-icon>add</mat-icon>
                  Add User
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
                  <table mat-table [dataSource]="users" class="w-100">
                    <!-- Name Column -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Name</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="d-flex align-items-center">
                          <div class="avatar me-3">
                            {{ user.name.charAt(0).toUpperCase() }}
                          </div>
                          <div>
                            <div class="fw-bold">{{ user.name }}</div>
                            <small class="text-muted">{{ user.email }}</small>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Type Column -->
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let user">
                        <mat-chip [color]="user.type === 'mentor' ? 'primary' : 'accent'">
                          {{ user.type | titlecase }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <!-- Skills Column -->
                    <ng-container matColumnDef="skills">
                      <th mat-header-cell *matHeaderCellDef>Skills</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="skills-container">
                          @if (user.skills && user.skills.length > 0) {
                            @for (skill of user.skills.slice(0, 3); track skill) {
                              <mat-chip class="me-1 mb-1">{{ skill }}</mat-chip>
                            }
                            @if (user.skills.length > 3) {
                              <mat-chip class="me-1 mb-1">+{{ user.skills.length - 3 }}</mat-chip>
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
                        <mat-chip [color]="user.isActive ? 'primary' : 'warn'">
                          {{ user.isActive ? 'Active' : 'Inactive' }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let user">
                        <button mat-icon-button [routerLink]="['/users/profile', user.userId]" matTooltip="View Profile">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button [routerLink]="['/users/form', user.userId]" matTooltip="Edit User">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="deleteUser(user.userId)" matTooltip="Delete User">
                          <mat-icon>delete</mat-icon>
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
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--mat-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
    
    .skills-container {
      max-width: 200px;
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
export class UsersListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  displayedColumns: string[] = ['name', 'type', 'skills', 'status', 'actions'];

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.notificationService.showError('Failed to load users. Please try again.');
        this.loading = false;
      }
    });
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