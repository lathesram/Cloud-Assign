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
    <div class="main-container">
      <div class="page-header">
        <h1 class="page-title">User Profile</h1>
        <p class="page-subtitle">View and manage user information</p>
      </div>
      
      <div class="profile-container">
        @if (loading) {
          <div class="loading-container">
            <mat-spinner></mat-spinner>
          </div>
        } @else if (user) {
          <div class="profile-grid">
            <div class="profile-card">
              <div class="content-card profile-main">
                <div class="profile-avatar">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <h2 class="profile-name">{{ user.name }}</h2>
                <p class="profile-email">{{ user.email }}</p>
                <div class="role-chip">
                  {{ user.type | titlecase }}
                </div>
                <div class="profile-actions">
                  <button mat-raised-button [routerLink]="['/users/form', user.userId]">
                    <mat-icon>edit</mat-icon>
                    Edit Profile
                  </button>
                  <button mat-outlined-button routerLink="/users">
                    <mat-icon>arrow_back</mat-icon>
                    Back to Users
                  </button>
                </div>
              </div>
            </div>

            <div class="details-card">
              <div class="content-card">
                <h3 class="section-title">Profile Details</h3>
                
                <div class="detail-grid">
                  <div class="detail-item">
                    <h6 class="detail-label">Full Name</h6>
                    <p class="detail-value">{{ user.name }}</p>
                  </div>
                  <div class="detail-item">
                    <h6 class="detail-label">Email</h6>
                    <p class="detail-value">{{ user.email }}</p>
                  </div>
                  <div class="detail-item">
                    <h6 class="detail-label">Role</h6>
                    <p class="detail-value">{{ user.type | titlecase }}</p>
                  </div>
                  <div class="detail-item">
                    <h6 class="detail-label">Status</h6>
                    <div class="status-chip" [class.active]="user.isActive" [class.inactive]="!user.isActive">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </div>
                  </div>
                </div>

                <!-- Professional Information -->
                <div class="divider"></div>
                <h6 class="section-subtitle">Professional Information</h6>
                <div class="detail-grid">
                  @if (user.domain) {
                    <div class="detail-item">
                      <h6 class="detail-label">Domain</h6>
                      <p class="detail-value">{{ user.domain | titlecase }}</p>
                    </div>
                  }
                  @if (user.seniority) {
                    <div class="detail-item">
                      <h6 class="detail-label">Seniority Level</h6>
                      <p class="detail-value">{{ user.seniority | titlecase }}</p>
                    </div>
                  }
                  @if (user.experience) {
                    <div class="detail-item">
                      <h6 class="detail-label">Experience</h6>
                      <p class="detail-value">{{ user.experience }} years</p>
                    </div>
                  }
                  @if (user.type === 'mentor' && user.hourlyRate) {
                    <div class="detail-item">
                      <h6 class="detail-label">Hourly Rate</h6>
                      <p class="detail-value">\${{ user.hourlyRate }}/hour</p>
                    </div>
                  }
                </div>

                <!-- Rating and Statistics -->
                @if (user.rating || user.totalSessions) {
                  <div class="divider"></div>
                  <h6 class="section-subtitle">Performance & Statistics</h6>
                  <div class="detail-grid">
                    @if (user.rating && user.rating > 0) {
                      <div class="detail-item">
                        <h6 class="detail-label">Rating</h6>
                        <div class="rating-display">
                          <div class="stars">
                            @for (star of getStars(user.rating); track star) {
                              <mat-icon class="star" [class.filled]="star">star</mat-icon>
                            }
                          </div>
                          <span class="rating-number">{{ user.rating.toFixed(1) }}/5</span>
                        </div>
                      </div>
                    }
                    @if (user.totalSessions) {
                      <div class="detail-item">
                        <h6 class="detail-label">Total Sessions</h6>
                        <p class="detail-value">{{ user.totalSessions }} sessions</p>
                      </div>
                    }
                  </div>
                }

                <!-- Social Profiles -->
                @if (user.linkedinProfile || user.githubProfile) {
                  <div class="divider"></div>
                  <h6 class="section-subtitle">Social Profiles</h6>
                  <div class="social-links">
                    @if (user.linkedinProfile) {
                      <a [href]="user.linkedinProfile" target="_blank" class="social-link linkedin">
                        <mat-icon>link</mat-icon>
                        LinkedIn Profile
                      </a>
                    }
                    @if (user.githubProfile) {
                      <a [href]="user.githubProfile" target="_blank" class="social-link github">
                        <mat-icon>code</mat-icon>
                        GitHub Profile
                      </a>
                    }
                  </div>
                }

                <!-- Skills -->
                <div class="divider"></div>
                <div class="skills-section">
                  <h6 class="section-subtitle">Skills & Expertise</h6>
                  <div class="skills-list">
                    @for (skill of user.skills; track skill) {
                      <div class="skill-chip">{{ skill }}</div>
                    }
                    @if (!user.skills || user.skills.length === 0) {
                      <p class="no-data">No skills listed</p>
                    }
                  </div>
                </div>

                <!-- Biography -->
                @if (user.bio) {
                  <div class="divider"></div>
                  <div class="bio-section">
                    <h6 class="section-subtitle">Biography</h6>
                    <p class="bio-text">{{ user.bio }}</p>
                  </div>
                }

                <!-- Availability (for mentors) -->
                @if (user.type === 'mentor' && user.availability && user.availability.slots.length > 0) {
                  <div class="divider"></div>
                  <div class="availability-section">
                    <h6 class="section-subtitle">Availability Schedule</h6>
                    <p class="timezone-info">Timezone: {{ user.availability.timezone }}</p>
                    <div class="availability-slots">
                      @for (slot of user.availability.slots; track slot) {
                        <div class="availability-slot">
                          <span class="day">{{ getDayName(slot.dayOfWeek) }}</span>
                          <span class="time">{{ slot.startTime }} - {{ slot.endTime }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Metadata -->
                <div class="divider"></div>
                <div class="metadata-section">
                  <div class="detail-item">
                    <h6 class="detail-label">Member Since</h6>
                    <p class="detail-value">{{ user.createdAt | date:'mediumDate' }}</p>
                  </div>
                  <div class="detail-item">
                    <h6 class="detail-label">Last Updated</h6>
                    <p class="detail-value">{{ user.updatedAt | date:'mediumDate' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <div class="error-card">
            <div class="content-card error-content">
              <mat-icon class="error-icon">person_off</mat-icon>
              <h4 class="error-title">User Not Found</h4>
              <p class="error-message">The requested user could not be found.</p>
              <button mat-raised-button routerLink="/users">
                Back to Users
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .main-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%);
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.9);
      margin: 0;
    }

    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 2rem;
    }

    .content-card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .profile-main {
      text-align: center;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 auto 1.5rem auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .profile-name {
      color: white;
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .profile-email {
      color: rgba(255,255,255,0.8);
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
    }

    .role-chip {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 500;
      margin-bottom: 2rem;
      backdrop-filter: blur(10px);
    }

    .profile-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .section-title {
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 1.5rem 0;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .detail-item {
      background: rgba(255,255,255,0.05);
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .detail-label {
      color: rgba(255,255,255,0.7);
      font-size: 0.9rem;
      font-weight: 500;
      margin: 0 0 0.5rem 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      color: white;
      font-size: 1rem;
      font-weight: 500;
      margin: 0;
    }

    .status-chip {
      display: inline-block;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .status-chip.active {
      background: rgba(76,175,80,0.3);
      color: #4caf50;
      border: 1px solid rgba(76,175,80,0.5);
    }

    .status-chip.inactive {
      background: rgba(244,67,54,0.3);
      color: #f44336;
      border: 1px solid rgba(244,67,54,0.5);
    }

    .divider {
      height: 1px;
      background: rgba(255,255,255,0.2);
      margin: 2rem 0;
    }

    .section-subtitle {
      color: rgba(255,255,255,0.9);
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-chip {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .bio-text {
      color: rgba(255,255,255,0.9);
      line-height: 1.6;
      margin: 0;
    }

    .no-data {
      color: rgba(255,255,255,0.6);
      font-style: italic;
      margin: 0;
    }

    .rating-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .star {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(255,255,255,0.3);
      
      &.filled {
        color: #fbbf24;
      }
    }

    .rating-number {
      color: rgba(255,255,255,0.9);
      font-weight: 500;
    }

    .social-links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .social-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      padding: 0.75rem 1rem;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.2);
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255,255,255,0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      }
      
      &.linkedin {
        border-color: rgba(0,119,181,0.5);
        
        &:hover {
          background: rgba(0,119,181,0.2);
        }
      }
      
      &.github {
        border-color: rgba(36,41,46,0.5);
        
        &:hover {
          background: rgba(36,41,46,0.2);
        }
      }
    }

    .availability-section {
      .timezone-info {
        color: rgba(255,255,255,0.8);
        font-size: 0.9rem;
        margin: 0 0 1rem 0;
        font-style: italic;
      }
    }

    .availability-slots {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .availability-slot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.1);
      padding: 0.75rem 1rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.2);
      
      .day {
        color: rgba(255,255,255,0.9);
        font-weight: 500;
      }
      
      .time {
        color: rgba(255,255,255,0.8);
        font-size: 0.9rem;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .error-card {
      grid-column: 1 / -1;
    }

    .error-content {
      text-align: center;
      padding: 3rem;
    }

    .error-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: rgba(255,255,255,0.6);
      margin-bottom: 1rem;
    }

    .error-title {
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .error-message {
      color: rgba(255,255,255,0.8);
      margin: 0 0 2rem 0;
    }

    ::ng-deep .mat-mdc-raised-button {
      background: rgba(255,255,255,0.2);
      color: white;
      border-radius: 12px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      width: 100%;
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
      width: 100%;
    }

    ::ng-deep .mat-mdc-outlined-button:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
    }

    ::ng-deep .mat-mdc-progress-spinner circle {
      stroke: white;
    }

    @media (max-width: 768px) {
      .main-container {
        padding: 1rem;
      }

      .page-title {
        font-size: 2rem;
      }

      .profile-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .detail-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .content-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  loading = false;
  userId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.userId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    this.loading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.loading = false;
      }
    });
  }

  getStars(rating: number): boolean[] {
    const stars: boolean[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.round(rating));
    }
    return stars;
  }

  getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
  }
}