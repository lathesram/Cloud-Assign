# Code Review Service API Endpoints

## Base URL
`http://localhost:3003/api/v1/reviews`

## Available Endpoints

### 1. **GET** `/` - Get All Reviews
- **Description**: Get all code reviews with pagination and optional filters
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `status` (optional): Filter by status (`pending`, `in-review`, `completed`)
  - `programmingLanguage` (optional): Filter by programming language
- **Response**: Paginated list of code reviews

### 2. **POST** `/` - Create New Review
- **Description**: Create a new code review
- **Request Body**:
```json
{
  "title": "Review my authentication module",
  "description": "Please review this code for security vulnerabilities",
  "programmingLanguage": "javascript",
  "menteeId": "user-123",
  "priority": "high"
}
```

### 3. **GET** `/{id}` - Get Review Details
- **Description**: Get specific review by ID
- **Response**: Complete review details with annotations

### 4. **PUT** `/{id}` - Update Review
- **Description**: Update review details
- **Request Body**: Partial review object with fields to update

### 5. **DELETE** `/{id}` - Delete Review
- **Description**: Delete a code review

### 6. **POST** `/upload` - Upload File
- **Description**: Upload file and create review
- **Content-Type**: `multipart/form-data`
- **Form Data**: 
  - `file`: The code file to upload
  - Additional review metadata

### 7. **GET** `/pending` - Get Pending Reviews
- **Description**: Get all pending reviews
- **Query Parameters**:
  - `mentorId` (optional): Filter by specific mentor

### 8. **GET** `/stats` - Get Review Statistics
- **Description**: Get review statistics
- **Query Parameters**:
  - `userId` (optional): Get stats for specific user
- **Response**:
```json
{
  "totalReviews": 25,
  "pendingReviews": 5,
  "inReviewReviews": 8,
  "completedReviews": 12,
  "reviewsByLanguage": {
    "javascript": 10,
    "python": 8,
    "java": 7
  }
}
```

### 9. **GET** `/mentee/{menteeId}` - Get Reviews by Mentee
- **Description**: Get all reviews submitted by a specific mentee

### 10. **GET** `/mentor/{mentorId}` - Get Reviews by Mentor
- **Description**: Get all reviews assigned to a specific mentor

## Annotation Endpoints

### 11. **GET** `/{reviewId}/annotations` - Get Annotations
- **Description**: Get all annotations for a review

### 12. **POST** `/{reviewId}/annotations` - Create Annotation
- **Description**: Add feedback annotation to a review
- **Request Body**:
```json
{
  "lineNumber": 15,
  "comment": "Consider using async/await instead of callbacks",
  "severity": "suggestion",
  "mentorId": "mentor-123"
}
```

### 13. **PUT** `/{reviewId}/annotations/{annotationId}` - Update Annotation
- **Description**: Update existing annotation

### 14. **DELETE** `/{reviewId}/annotations/{annotationId}` - Delete Annotation
- **Description**: Delete an annotation

## Status Values
- `pending`: Review is waiting for mentor assignment
- `in-review`: Review is being actively reviewed by a mentor
- `completed`: Review has been completed with feedback

## Severity Values (for annotations)
- `info`: Informational comment
- `suggestion`: Suggested improvement
- `warning`: Potential issue that should be addressed
- `error`: Critical issue that must be fixed

## Response Format
All responses follow this format:
```json
{
  "success": true,
  "message": "Description of the operation",
  "data": { /* Response data */ },
  "pagination": { /* Only for paginated responses */ }
}
```

## Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```