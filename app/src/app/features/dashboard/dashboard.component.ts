import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { CodeReviewService } from '../../shared/services/code-review.service';
import { ReviewStats } from '../../shared/models/code-review.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="main-container">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome to SkillBridge - Your Learning & Mentorship Platform</p>
      </div>
      
      <div class="dashboard-grid">
        <!-- Quick Stats Cards -->
        <div class="stats-section">
          <div class="stat-card users-card">
            <div class="stat-icon">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-content">
              <h3>Users</h3>
              <p class="stat-number">150+</p>
              <p class="stat-description">Active mentors & mentees</p>
            </div>
          </div>
          
          <div class="stat-card bookings-card">
            <div class="stat-icon">
              <mat-icon>event</mat-icon>
            </div>
            <div class="stat-content">
              <h3>Sessions</h3>
              <p class="stat-number">320+</p>
              <p class="stat-description">Mentoring sessions booked</p>
            </div>
          </div>
          
          <div class="stat-card reviews-card">
            <div class="stat-icon">
              <mat-icon>code</mat-icon>
            </div>
            <div class="stat-content">
              <h3>Code Reviews</h3>
              @if (loadingStats) {
                <mat-spinner diameter="30"></mat-spinner>
              } @else {
                <p class="stat-number">{{ reviewStats?.totalReviews || 0 }}</p>
                <p class="stat-description">
                  {{ reviewStats?.completedReviews || 0 }} completed, 
                  {{ reviewStats?.pendingReviews || 0 }} pending
                </p>
              }
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="actions-section">
          <div class="content-card">
            <h2 class="section-title">Quick Actions</h2>
            <div class="action-buttons">
              <button mat-raised-button class="action-btn users-btn" routerLink="/users">
                <mat-icon>person_add</mat-icon>
                Manage Users
              </button>
              <button mat-raised-button class="action-btn bookings-btn" routerLink="/bookings">
                <mat-icon>event_available</mat-icon>
                Book Session
              </button>
              <button mat-raised-button class="action-btn reviews-btn" routerLink="/code-reviews">
                <mat-icon>rate_review</mat-icon>
                Request Review
              </button>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="activity-section">
          <div class="content-card">
            <h2 class="section-title">Recent Activity</h2>
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon users-icon">
                  <mat-icon>person</mat-icon>
                </div>
                <div class="activity-content">
                  <p class="activity-title">New mentor registered</p>
                  <p class="activity-time">2 hours ago</p>
                </div>
              </div>
              
              <div class="activity-item">
                <div class="activity-icon bookings-icon">
                  <mat-icon>event</mat-icon>
                </div>
                <div class="activity-content">
                  <p class="activity-title">Session completed</p>
                  <p class="activity-time">4 hours ago</p>
                </div>
              </div>
              
              <div class="activity-item">
                <div class="activity-icon reviews-icon">
                  <mat-icon>code</mat-icon>
                </div>
                <div class="activity-content">
                  <p class="activity-title">Code review submitted</p>
                  <p class="activity-time">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-container {
      min-height: 100vh;
      background-color: #ffffff;
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 600;
      color: #333333;
      margin-bottom: 0.5rem;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #666666;
      margin: 0;
    }

    .dashboard-grid {
      display: grid;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      border-color: #333333;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      background: rgba(255,255,255,0.15);
    }

    .stat-icon {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon mat-icon {
      font-size: 28px;
      color: #666666;
    }

    .stat-content h3 {
      font-size: 1.1rem;
      color: #333333;
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333333;
      margin: 0;
      line-height: 1;
    }

    .stat-description {
      font-size: 0.9rem;
      color: #666666;
      margin: 0.5rem 0 0 0;
    }

    .content-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333333;
      margin: 0 0 1.5rem 0;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      padding: 1rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      border: 1px solid #e0e0e0;
      color: #333333;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .users-btn {
      background: linear-gradient(135deg, #9c27b0, #e91e63);
    }

    .bookings-btn {
      background: linear-gradient(135deg, #2196f3, #21cbf3);
    }

    .reviews-btn {
      background: linear-gradient(135deg, #4caf50, #8bc34a);
    }

    .action-btn:hover {
      border-color: #333333;
      background-color: #f8f9fa;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .activity-item:hover {
      background: #f0f0f0;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
    }

    .activity-icon mat-icon {
      font-size: 20px;
      color: #666666;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 500;
      color: #333333;
      margin: 0 0 0.25rem 0;
    }

    .activity-time {
      font-size: 0.9rem;
      color: #666666;
      margin: 0;
    }

    @media (max-width: 768px) {
      .main-container {
        padding: 1rem;
      }

      .page-title {
        font-size: 2rem;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        grid-template-columns: 1fr;
      }

      .stat-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  reviewStats: ReviewStats | null = null;
  loadingStats = false;

  constructor(private codeReviewService: CodeReviewService) {}

  ngOnInit(): void {
    this.loadReviewStats();
  }

  loadReviewStats(): void {
    this.loadingStats = true;
    this.codeReviewService.getCodeReviewStats().subscribe({
      next: (stats: ReviewStats) => {
        this.reviewStats = stats;
        this.loadingStats = false;
      },
      error: (error: any) => {
        console.error('Error loading review stats:', error);
        this.loadingStats = false;
      }
    });
  }
}