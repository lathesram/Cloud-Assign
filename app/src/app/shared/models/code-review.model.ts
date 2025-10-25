export interface CodeReview {
  reviewId: string;
  menteeId: string;
  mentorId?: string;
  title: string;
  description: string;
  programmingLanguage: string;
  s3FileUrl: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'in-review' | 'completed';
  annotations: Annotation[];
  createdAt: string;
  updatedAt: string;
  // Additional UI fields
  menteeName?: string;
  mentorName?: string;
  totalAnnotations?: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface Annotation {
  annotationId: string;
  fileId: string;
  lineNumber: number;
  comment: string;
  severity: 'info' | 'warning' | 'error' | 'suggestion';
  mentorId: string;
  createdAt: string;
  // Additional UI fields
  mentorName?: string;
  isResolved?: boolean;
}

export interface CreateReviewRequest {
  title: string;
  description: string;
  programmingLanguage: string;
  menteeId: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateReviewRequest {
  status?: 'pending' | 'in-review' | 'completed';
  mentorId?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CreateAnnotationRequest {
  lineNumber: number;
  comment: string;
  severity: 'info' | 'warning' | 'error' | 'suggestion';
}

export interface ReviewFilter {
  status?: string;
  programmingLanguage?: string;
  menteeId?: string;
  mentorId?: string;
  priority?: string;
}

export interface ReviewStats {
  totalReviews: number;
  pendingReviews: number;
  completedReviews: number;
  inProgressReviews: number;
}