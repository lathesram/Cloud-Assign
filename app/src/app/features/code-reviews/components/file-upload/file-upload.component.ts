import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

export interface FileUploadResult {
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="file-upload-card">
      <mat-card-header>
        <mat-card-title>Upload Code File</mat-card-title>
        <mat-card-subtitle>Drag and drop your file or click to browse</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div 
          class="drop-zone"
          [class.drag-over]="isDragOver"
          [class.has-file]="selectedFile"
          (drop)="onDrop($event)"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (click)="fileInput.click()"
        >
          @if (!selectedFile) {
            <div class="drop-zone-content">
              <mat-icon class="upload-icon">cloud_upload</mat-icon>
              <h3>Drop your file here</h3>
              <p>or click to browse files</p>
              <div class="supported-formats">
                <mat-chip class="format-chip">JavaScript</mat-chip>
                <mat-chip class="format-chip">TypeScript</mat-chip>
                <mat-chip class="format-chip">Python</mat-chip>
                <mat-chip class="format-chip">Java</mat-chip>
                <mat-chip class="format-chip">C#</mat-chip>
                <mat-chip class="format-chip">C++</mat-chip>
              </div>
            </div>
          } @else {
            <div class="file-preview">
              <mat-icon class="file-icon">{{ getFileIcon(selectedFile.type) }}</mat-icon>
              <div class="file-details">
                <h4>{{ selectedFile.name }}</h4>
                <p>{{ formatFileSize(selectedFile.size) }}</p>
                <div class="file-type">
                  <mat-chip [color]="'primary'">{{ getFileLanguage(selectedFile.name) }}</mat-chip>
                </div>
              </div>
              <button mat-icon-button (click)="removeFile($event)" class="remove-btn">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
        </div>

        @if (uploadProgress > 0 && uploadProgress < 100) {
          <div class="upload-progress">
            <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
            <span class="progress-text">{{ uploadProgress }}%</span>
          </div>
        }

        <input 
          #fileInput 
          type="file" 
          class="file-input" 
          (change)="onFileSelected($event)"
          [accept]="acceptedFileTypes"
          hidden
        >

        <div class="upload-info">
          <p><strong>Supported files:</strong> .js, .ts, .py, .java, .cs, .cpp, .c, .h, .html, .css, .scss</p>
          <p><strong>Maximum file size:</strong> 10 MB</p>
        </div>
      </mat-card-content>
      <mat-card-actions>
        @if (uploading) {
          <button 
            mat-raised-button 
            color="primary" 
            disabled
            (click)="uploadFile()"
          >
            <mat-icon>hourglass_empty</mat-icon>
            Uploading...
          </button>
        } @else {
          <button 
            mat-raised-button 
            color="primary" 
            [disabled]="!selectedFile"
            (click)="uploadFile()"
          >
            <mat-icon>upload</mat-icon>
            Upload File
          </button>
        }
        @if (selectedFile) {
          <button mat-button (click)="removeFile($event)">
            <mat-icon>delete</mat-icon>
            Remove
          </button>
        }
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .file-upload-card {
      max-width: 600px;
      margin: 0 auto;
    }

    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        border-color: #3f51b5;
        background-color: #f5f5f5;
      }

      &.drag-over {
        border-color: #3f51b5;
        background-color: #e8eaf6;
      }

      &.has-file {
        border-color: rgba(255, 255, 255, 0.6);
        background-color: rgba(255, 255, 255, 0.1);
      }
    }

    .drop-zone-content {
      .upload-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #666;
      }

      h3 {
        margin: 0 0 8px 0;
        color: #333;
      }

      p {
        margin: 0 0 16px 0;
        color: #666;
      }
    }

    .supported-formats {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }

    .format-chip {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .file-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
      position: relative;

      .file-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: rgba(255, 255, 255, 0.8);
      }

      .file-details {
        flex: 1;
        text-align: left;

        h4 {
          margin: 0 0 4px 0;
          font-weight: 500;
        }

        p {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 0.9rem;
        }
      }

      .remove-btn {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: #f44336;
        color: white;

        &:hover {
          background-color: #d32f2f;
        }
      }
    }

    .upload-progress {
      margin-top: 16px;
      position: relative;

      .progress-text {
        position: absolute;
        top: -20px;
        right: 0;
        font-size: 0.8rem;
        color: #666;
      }
    }

    .upload-info {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;

      p {
        margin: 4px 0;
        font-size: 0.85rem;
        color: #666;
      }
    }

    .file-input {
      display: none;
    }
  `
})
export class FileUploadComponent {
  @Input() acceptedFileTypes = '.js,.ts,.py,.java,.cs,.cpp,.c,.h,.html,.css,.scss';
  @Input() maxFileSize = 10 * 1024 * 1024; // 10MB
  @Output() fileSelected = new EventEmitter<FileUploadResult>();
  @Output() fileUploaded = new EventEmitter<FileUploadResult>();

  selectedFile: File | null = null;
  isDragOver = false;
  uploading = false;
  uploadProgress = 0;

  constructor(private snackBar: MatSnackBar) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    if (!this.isValidFile(file)) {
      return;
    }

    this.selectedFile = file;
    
    const fileResult: FileUploadResult = {
      file: file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };

    this.fileSelected.emit(fileResult);
  }

  private isValidFile(file: File): boolean {
    // Check file size
    if (file.size > this.maxFileSize) {
      this.snackBar.open(
        `File size exceeds ${this.formatFileSize(this.maxFileSize)} limit`,
        'Close',
        { duration: 3000 }
      );
      return false;
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.js', '.ts', '.py', '.java', '.cs', '.cpp', '.c', '.h', '.html', '.css', '.scss'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      this.snackBar.open(
        'File type not supported. Please upload a code file.',
        'Close',
        { duration: 3000 }
      );
      return false;
    }

    return true;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadProgress = 0;

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(progressInterval);
        this.uploading = false;
        
        const fileResult: FileUploadResult = {
          file: this.selectedFile!,
          fileName: this.selectedFile!.name,
          fileSize: this.selectedFile!.size,
          fileType: this.selectedFile!.type
        };

        this.fileUploaded.emit(fileResult);
        this.snackBar.open('File uploaded successfully!', 'Close', { duration: 3000 });
      }
    }, 200);
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.uploading = false;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileType: string): string {
    // Return appropriate icon based on file type
    return 'description'; // Default icon
  }

  getFileLanguage(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'java': 'Java',
      'cs': 'C#',
      'cpp': 'C++',
      'c': 'C',
      'h': 'C/C++',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS'
    };
    return languageMap[extension || ''] || 'Unknown';
  }
}