import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { UserService } from '../../../../shared/services/user.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    RouterLink
  ],
  template: `
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ isEditMode ? 'Edit User' : 'Create New User' }}</mat-card-title>
              <mat-card-subtitle>{{ isEditMode ? 'Update user information' : 'Add a new mentor or mentee' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (loading) {
                <div class="text-center py-4">
                  <mat-spinner></mat-spinner>
                </div>
              } @else {
                <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Full Name</mat-label>
                        <input matInput formControlName="name" placeholder="Enter full name">
                        @if (userForm.get('name')?.hasError('required') && userForm.get('name')?.touched) {
                          <mat-error>Name is required</mat-error>
                        }
                        @if (userForm.get('name')?.hasError('minlength') && userForm.get('name')?.touched) {
                          <mat-error>Name must be at least 2 characters</mat-error>
                        }
                        @if (userForm.get('name')?.hasError('maxlength') && userForm.get('name')?.touched) {
                          <mat-error>Name cannot exceed 100 characters</mat-error>
                        }
                      </mat-form-field>
                    </div>
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Email</mat-label>
                        <input matInput type="email" formControlName="email" placeholder="Enter email address">
                        @if (userForm.get('email')?.hasError('required') && userForm.get('email')?.touched) {
                          <mat-error>Email is required</mat-error>
                        }
                        @if (userForm.get('email')?.hasError('email') && userForm.get('email')?.touched) {
                          <mat-error>Please enter a valid email</mat-error>
                        }
                        @if (userForm.get('email')?.hasError('maxlength') && userForm.get('email')?.touched) {
                          <mat-error>Email cannot exceed 255 characters</mat-error>
                        }
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>User Type</mat-label>
                        <mat-select formControlName="type">
                          <mat-option value="mentor">Mentor</mat-option>
                          <mat-option value="mentee">Mentee</mat-option>
                        </mat-select>
                        @if (userForm.get('type')?.hasError('required') && userForm.get('type')?.touched) {
                          <mat-error>User type is required</mat-error>
                        }
                      </mat-form-field>
                    </div>
                    @if (isEditMode) {
                      <div class="col-md-6 mb-3 d-flex align-items-center">
                        <mat-checkbox formControlName="isActive">
                          Active User
                        </mat-checkbox>
                      </div>
                    }
                  </div>

                  <div class="mb-3">
                    <mat-form-field class="w-100">
                      <mat-label>Bio</mat-label>
                      <textarea matInput formControlName="bio" rows="4" placeholder="Tell us about yourself..."></textarea>
                    </mat-form-field>
                  </div>

                  <div class="mb-3">
                    <mat-form-field class="w-100">
                      <mat-label>Experience</mat-label>
                      <textarea matInput formControlName="experience" rows="3" placeholder="Describe your experience..."></textarea>
                    </mat-form-field>
                  </div>

                  <div class="mb-4">
                    <label class="form-label text-muted">Skills</label>
                    <div class="skills-input-container">
                      <mat-form-field class="w-100">
                        <mat-label>Add skills</mat-label>
                        <input matInput 
                               #skillInput
                               [value]="currentSkill"
                               (input)="onSkillInput($event)"
                               (keydown)="addSkill($event)"
                               placeholder="Type a skill and press Enter">
                      </mat-form-field>
                    </div>
                    <div class="skills-list mt-2">
                      @for (skill of skills; track skill; let i = $index) {
                        <mat-chip class="me-2 mb-2" (removed)="removeSkill(i)">
                          {{ skill }}
                          <mat-icon matChipRemove>cancel</mat-icon>
                        </mat-chip>
                      }
                    </div>
                  </div>

                  <div class="d-flex gap-2">
                    <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid || submitting">
                      @if (submitting) {
                        <mat-spinner diameter="20" class="me-2"></mat-spinner>
                      }
                      {{ isEditMode ? 'Update User' : 'Create User' }}
                    </button>
                    <button mat-stroked-button type="button" routerLink="/users">
                      Cancel
                    </button>
                  </div>
                </form>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    .skills-input-container {
      position: relative;
    }
    
    .skills-list {
      min-height: 40px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #fafafa;
    }
    
    mat-form-field {
      margin-bottom: 0;
    }
  `
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  loading = false;
  submitting = false;
  userId: string | null = null;
  skills: string[] = [];
  currentSkill = '';
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      type: ['', Validators.required],
      bio: ['', Validators.maxLength(500)],
      experience: ['', Validators.maxLength(1000)],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;
    
    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
    }
  }

  loadUser(userId: string): void {
    this.loading = true;
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          type: user.type,
          bio: user.bio || '',
          experience: user.experience || '',
          isActive: user.isActive
        });
        this.skills = user.skills || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.loading = false;
        this.router.navigate(['/users']);
      }
    });
  }

  onSkillInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentSkill = input.value;
  }

  addSkill(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    if (event.key === 'Enter' && value && !this.skills.includes(value)) {
      this.skills.push(value);
      this.currentSkill = '';
      input.value = '';
      event.preventDefault();
    }
  }

  removeSkill(index: number): void {
    this.skills.splice(index, 1);
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.submitting = true;
      const formData = { ...this.userForm.value, skills: this.skills };

      if (this.isEditMode && this.userId) {
        const updateData: UpdateUserRequest = {
          name: formData.name,
          bio: formData.bio,
          experience: formData.experience,
          skills: formData.skills,
          isActive: formData.isActive
        };
        
        this.userService.updateUser(this.userId, updateData).subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/users']);
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.submitting = false;
          }
        });
      } else {
        const createData: CreateUserRequest = {
          email: formData.email,
          name: formData.name,
          type: formData.type,
          bio: formData.bio,
          experience: formData.experience,
          skills: formData.skills
        };
        
        this.userService.createUser(createData).subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/users']);
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.submitting = false;
          }
        });
      }
    }
  }
}