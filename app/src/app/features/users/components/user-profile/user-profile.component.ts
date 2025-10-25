import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../../shared/services/user.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          @if (loading) {
            <div class="text-center py-5">
              <mat-spinner></mat-spinner>
            </div>
          } @else if (user) {
            <div class="row">
              <!-- Profile Card -->
              <div class="col-md-4 mb-4">
                <mat-card>
                  <mat-card-content class="text-center">
                    <div class="profile-avatar mb-3">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <h3 class="mb-2">{{ user.name }}</h3>
                    <p class="text-muted mb-3">{{ user.email }}</p>
                    <mat-chip [color]="user.type === 'mentor' ? 'primary' : 'accent'" class="mb-3">
                      {{ user.type | titlecase }}
                    </mat-chip>
                    <div class="d-grid gap-2">
                      <button mat-raised-button color="primary" [routerLink]="['/users/form', user.userId]">
                        <mat-icon>edit</mat-icon>
                        Edit Profile
                      </button>
                      <button mat-stroked-button routerLink="/users">
                        <mat-icon>arrow_back</mat-icon>
                        Back to Users
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Details Card -->
              <div class="col-md-8">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Profile Details</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="row">
                      <div class="col-sm-6 mb-3">
                        <h6 class="text-muted mb-1">Full Name</h6>
                        <p class="mb-0">{{ user.name }}</p>
                      </div>
                      <div class="col-sm-6 mb-3">
                        <h6 class="text-muted mb-1">Email</h6>
                        <p class="mb-0">{{ user.email }}</p>
                      </div>
                      <div class="col-sm-6 mb-3">
                        <h6 class="text-muted mb-1">Role</h6>
                        <p class="mb-0">{{ user.type | titlecase }}</p>
                      </div>
                      <div class="col-sm-6 mb-3">
                        <h6 class="text-muted mb-1">Status</h6>
                        <mat-chip [color]="user.isActive ? 'primary' : 'warn'">
                          {{ user.isActive ? 'Active' : 'Inactive' }}
                        </mat-chip>
                      </div>
                    </div>

                    <mat-divider class="my-4"></mat-divider>

                    <div class="mb-4">
                      <h6 class="text-muted mb-3">Skills & Expertise</h6>
                      <div class="skills-list">
                        @for (skill of user.skills; track skill) {
                          <mat-chip class="me-2 mb-2">{{ skill }}</mat-chip>
                        }
                        @if (!user.skills || user.skills.length === 0) {
                          <p class="text-muted">No skills listed</p>
                        }
                      </div>
                    </div>

                    @if (user.bio) {
                      <mat-divider class="my-4"></mat-divider>
                      <div class="mb-4">
                        <h6 class="text-muted mb-3">Biography</h6>
                        <p>{{ user.bio }}</p>
                      </div>
                    }

                    <mat-divider class="my-4"></mat-divider>

                    <div class="row">
                      <div class="col-sm-6 mb-3">
                        <h6 class="text-muted mb-1">Member Since</h6>
                        <p class="mb-0">{{ user.createdAt | date:'mediumDate' }}</p>
                      </div>
                      <div class="col-sm-6 mb-3">
                        <h6 class="text-muted mb-1">Last Updated</h6>
                        <p class="mb-0">{{ user.updatedAt | date:'mediumDate' }}</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          } @else {
            <mat-card>
              <mat-card-content class="text-center py-5">
                <mat-icon class="large-icon text-muted mb-3">person_off</mat-icon>
                <h4>User Not Found</h4>
                <p class="text-muted">The requested user could not be found.</p>
                <button mat-raised-button color="primary" routerLink="/users">
                  Back to Users
                </button>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--mat-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 600;
      margin: 0 auto;
    }
    
    .skills-list {
      max-height: 200px;
      overflow-y: auto;
    }
    
    .large-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
    }
  `
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    } else {
      this.router.navigate(['/users']);
    }
  }

  loadUser(userId: string): void {
    this.loading = true;
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.user = null;
        this.loading = false;
      }
    });
  }
}