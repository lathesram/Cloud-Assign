export interface CodeReview {
  reviewId: string;
  menteeId: string;
  mentorId?: string;
  menteeName?: string;
  mentorName?: string;
  title: string;
  description: string;
  programmingLanguage: string;
  s3FileUrl: string;
  fileName: string;
  fileSize: number;
  priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-review' | 'completed' | 'reviewed';
  annotations: Annotation[];
  createdAt: string;
  updatedAt: string;
}

export interface Annotation {
  annotationId: string;
  fileId?: string;
  lineNumber: number;
  comment: string;
  severity: 'info' | 'warning' | 'error' | 'suggestion';
  mentorId: string;
  mentorName?: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  title: string;
  description: string;
  programmingLanguage: string;
  menteeId: string;
  priority?: 'low' | 'medium' | 'high';
  fileName?: string;
  fileSize?: number;
}

export interface UpdateReviewRequest {
  title?: string;
  description?: string;
  programmingLanguage?: string;
  mentorId?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in-review' | 'completed' | 'reviewed';
}

export interface CreateAnnotationRequest {
  lineNumber: number;
  comment: string;
  severity: 'info' | 'warning' | 'error' | 'suggestion';
  mentorId: string;
}

export interface ReviewFilter {
  status?: string;
  programmingLanguage?: string;
  mentorId?: string;
  menteeId?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ReviewStats {
  totalReviews: number;
  pendingReviews: number;
  inReviewReviews: number;
  completedReviews: number;
  reviewsByLanguage: { [key: string]: number };
  averageReviewTime?: number;
}