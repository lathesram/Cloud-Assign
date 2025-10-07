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
  status: 'pending' | 'reviewed';
  annotations: Annotation[];
  createdAt: string;
  updatedAt: string;
}

export interface Annotation {
  annotationId: string;
  fileId: string;
  lineNumber: number;
  comment: string;
  severity: 'info' | 'warning' | 'error' | 'suggestion';
  mentorId: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  title: string;
  description: string;
  programmingLanguage: string;
  menteeId: string;
}