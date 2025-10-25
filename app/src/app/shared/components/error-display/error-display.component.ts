import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="error-card">
      <mat-card-content class="text-center">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        @if (showRetry) {
          <button mat-raised-button color="primary" (click)="onRetry()">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .error-card {
      margin: 16px 0;
      background-color: #ffebee;
      border: 1px solid #f44336;
    }

    .error-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
      margin-bottom: 16px;
    }

    h3 {
      color: #d32f2f;
      margin-bottom: 8px;
    }

    p {
      color: #666;
      margin-bottom: 16px;
    }
  `
})
export class ErrorDisplayComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'An unexpected error occurred. Please try again.';
  @Input() showRetry = true;
  @Input() retryCallback?: () => void;

  onRetry(): void {
    if (this.retryCallback) {
      this.retryCallback();
    }
  }
}