import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <h1 class="h2 mb-4">SkillBridge Dashboard</h1>
          
          <!-- Stats Cards -->
          <div class="row mb-4">
            <div class="col-lg-3 col-md-6 col-sm-6">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon users">people</mat-icon>
                    <div class="stat-info">
                      <h3>1,234</h3>
                      <p>Total Users</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-6">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon bookings">event</mat-icon>
                    <div class="stat-info">
                      <h3>567</h3>
                      <p>Active Bookings</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-6">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon reviews">code</mat-icon>
                    <div class="stat-info">
                      <h3>89</h3>
                      <p>Code Reviews</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-6">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon sessions">videocam</mat-icon>
                    <div class="stat-info">
                      <h3>2,345</h3>
                      <p>Total Sessions</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="row">
            <div class="col-lg-4 col-md-6">
              <mat-card class="action-card">
                <mat-card-header>
                  <mat-card-title>User Management</mat-card-title>
                  <mat-card-subtitle>Manage mentors and mentees</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p>View all users, create new accounts, and manage user profiles. Monitor mentor-mentee relationships and user activity.</p>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" routerLink="/users">
                    <mat-icon>people</mat-icon>
                    View Users
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
            <div class="col-lg-4 col-md-6">
              <mat-card class="action-card">
                <mat-card-header>
                  <mat-card-title>Session Bookings</mat-card-title>
                  <mat-card-subtitle>Manage mentoring sessions</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p>Schedule new sessions, view upcoming bookings, and manage session details. Track session history and performance.</p>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" routerLink="/bookings">
                    <mat-icon>event</mat-icon>
                    View Bookings
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
            <div class="col-lg-4 col-md-12">
              <mat-card class="action-card">
                <mat-card-header>
                  <mat-card-title>Code Reviews</mat-card-title>
                  <mat-card-subtitle>Review and provide feedback</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p>Submit code for review, provide feedback on submissions, and track review progress. Help improve coding skills.</p>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" routerLink="/code-reviews">
                    <mat-icon>code</mat-icon>
                    View Reviews
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="row mt-4">
            <div class="col-12">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Recent Activity</mat-card-title>
                  <mat-card-subtitle>Latest platform activity</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="activity-list">
                    <div class="activity-item">
                      <mat-icon class="activity-icon">person_add</mat-icon>
                      <div class="activity-content">
                        <p><strong>New mentor joined:</strong> Sarah Johnson registered as a JavaScript mentor</p>
                        <small class="text-muted">2 minutes ago</small>
                      </div>
                    </div>
                    <div class="activity-item">
                      <mat-icon class="activity-icon">event</mat-icon>
                      <div class="activity-content">
                        <p><strong>Session booked:</strong> Python mentoring session scheduled for tomorrow at 2 PM</p>
                        <small class="text-muted">15 minutes ago</small>
                      </div>
                    </div>
                    <div class="activity-item">
                      <mat-icon class="activity-icon">code</mat-icon>
                      <div class="activity-content">
                        <p><strong>Code review completed:</strong> React component review finished with 3 suggestions</p>
                        <small class="text-muted">1 hour ago</small>
                      </div>
                    </div>
                    <div class="activity-item">
                      <mat-icon class="activity-icon">star</mat-icon>
                      <div class="activity-content">
                        <p><strong>Session completed:</strong> Machine Learning session completed successfully</p>
                        <small class="text-muted">3 hours ago</small>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      margin-bottom: 1rem;
      cursor: pointer;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.12);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stat-icon.users { color: #4caf50; }
    .stat-icon.bookings { color: #2196f3; }
    .stat-icon.reviews { color: #ff9800; }
    .stat-icon.sessions { color: #e91e63; }

    .stat-info h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: bold;
    }

    .stat-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .action-card {
      height: 100%;
      margin-bottom: 1rem;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.12);
    }

    .activity-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      color: #666;
      margin-top: 4px;
    }

    .activity-content {
      flex: 1;
    }

    .activity-content p {
      margin: 0 0 4px 0;
    }

    .text-muted {
      color: #999;
    }

    @media (max-width: 576px) {
      .stat-info h3 {
        font-size: 1.5rem;
      }
      
      .stat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
      
      .activity-item {
        flex-direction: column;
        gap: 8px;
      }
      
      .activity-icon {
        align-self: flex-start;
      }
    }
  `]
})
export class DashboardComponent {
}