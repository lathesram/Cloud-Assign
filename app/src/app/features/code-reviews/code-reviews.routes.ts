import { Routes } from '@angular/router';

export const codeReviewsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/reviews-list/reviews-list.component').then(m => m.ReviewsListComponent)
  },
  {
    path: 'form',
    loadComponent: () => import('./components/review-form/review-form.component').then(m => m.ReviewFormComponent)
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./components/review-details/review-details.component').then(m => m.ReviewDetailsComponent)
  },
  {
    path: 'my-reviews',
    loadComponent: () => import('./components/my-reviews/my-reviews.component').then(m => m.MyReviewsComponent)
  },
  {
    path: 'pending',
    loadComponent: () => import('./components/pending-reviews/pending-reviews.component').then(m => m.PendingReviewsComponent)
  },
  {
    path: 'upload',
    loadComponent: () => import('./components/file-upload/file-upload.component').then(m => m.FileUploadComponent)
  }
];