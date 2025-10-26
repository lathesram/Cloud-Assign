import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { UserService } from '../../../../shared/services/user.service';
import { User, CreateUserRequest, UpdateUserRequest, Availability } from '../../../../shared/models/user.model';
import { AvailabilitySchedulerComponent } from '../../../../shared/components/availability-scheduler/availability-scheduler.component';

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
    RouterLink,
    AvailabilitySchedulerComponent
  ],
  template: `
    <div class="main-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? 'Edit User' : 'Create New User' }}</h1>
        <p class="page-subtitle">{{ isEditMode ? 'Update user information and profile details' : 'Add a new mentor or mentee to the platform' }}</p>
      </div>
      
      <div class="form-container">
        <div class="content-card">
              
              @if (loading) {
                <div class="text-center py-4">
                  <mat-spinner></mat-spinner>
                </div>
              } @else {
                <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
                  <!-- Basic Information -->
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
                        <input matInput type="email" formControlName="email" placeholder="Enter email address" [readonly]="isEditMode">
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
                    <div class="col-md-4 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>User Type</mat-label>
                        <mat-select formControlName="type" (selectionChange)="onTypeChange()">
                          <mat-option value="mentor">Mentor</mat-option>
                          <mat-option value="mentee">Mentee</mat-option>
                        </mat-select>
                        @if (userForm.get('type')?.hasError('required') && userForm.get('type')?.touched) {
                          <mat-error>User type is required</mat-error>
                        }
                      </mat-form-field>
                    </div>
                    <div class="col-md-4 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Domain</mat-label>
                        <mat-select formControlName="domain">
                          <mat-option value="">Select Domain</mat-option>
                          <mat-option value="backend">Backend Development</mat-option>
                          <mat-option value="frontend">Frontend Development</mat-option>
                          <mat-option value="fullstack">Full Stack Development</mat-option>
                          <mat-option value="mobile">Mobile Development</mat-option>
                          <mat-option value="data">Data Science & Analytics</mat-option>
                          <mat-option value="devops">DevOps & Cloud</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                    <div class="col-md-4 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Seniority Level</mat-label>
                        <mat-select formControlName="seniority">
                          <mat-option value="">Select Level</mat-option>
                          <mat-option value="junior">Junior</mat-option>
                          <mat-option value="mid">Mid-level</mat-option>
                          <mat-option value="senior">Senior</mat-option>
                          <mat-option value="staff">Staff</mat-option>
                          <mat-option value="principal">Principal</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                    @if (isEditMode) {
                      <div class="col-md-12 mb-3 d-flex align-items-center">
                        <mat-checkbox formControlName="isActive">
                          Active User
                        </mat-checkbox>
                      </div>
                    }
                  </div>

                  <!-- Professional Information -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>Years of Experience</mat-label>
                        <input matInput type="number" formControlName="experience" placeholder="Enter years of experience" min="0" max="50">
                      </mat-form-field>
                    </div>
                    @if (userForm.get('type')?.value === 'mentor') {
                      <div class="col-md-6 mb-3">
                        <mat-form-field class="w-100">
                          <mat-label>Hourly Rate (USD)</mat-label>
                          <input matInput type="number" formControlName="hourlyRate" placeholder="Enter hourly rate" min="0" max="1000">
                          <mat-hint>Optional - leave empty if not charging</mat-hint>
                        </mat-form-field>
                      </div>
                    }
                  </div>

                  <!-- Social Profiles -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>LinkedIn Profile</mat-label>
                        <input matInput formControlName="linkedinProfile" placeholder="https://linkedin.com/in/yourprofile">
                      </mat-form-field>
                    </div>
                    <div class="col-md-6 mb-3">
                      <mat-form-field class="w-100">
                        <mat-label>GitHub Profile</mat-label>
                        <input matInput formControlName="githubProfile" placeholder="https://github.com/yourusername">
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="mb-3">
                    <mat-form-field class="w-100">
                      <mat-label>Bio</mat-label>
                      <textarea matInput formControlName="bio" rows="6" placeholder="Tell us about yourself and your experience..."></textarea>
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

                  <!-- Availability Scheduler for Mentors -->
                  @if (userForm.get('type')?.value === 'mentor') {
                    <div class="mb-4">
                      <app-availability-scheduler 
                        [availability]="currentAvailability"
                        (availabilityChange)="onAvailabilityChange($event)">
                      </app-availability-scheduler>
                    </div>
                  }

                  <div class="d-flex gap-2">
                    <button mat-raised-button type="submit" [disabled]="userForm.invalid || submitting">
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
        </div>
      </div>
    </div>
  `,
  styles: `
    .main-container {
      min-height: 100vh;
      background-color: #ffffff;
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 600;
      color: #333333;
      margin-bottom: 0.5rem;
    }

    .page-subtitle {
      font-size: 1rem;
      color: #666666;
      margin: 0;
    }

    .form-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .content-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 2.5rem;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -0.75rem;
    }

    .col-md-6 {
      flex: 0 0 50%;
      max-width: 50%;
      padding: 0 0.75rem;
    }

    .mb-3 {
      margin-bottom: 1.5rem;
    }

    .mb-4 {
      margin-bottom: 2rem;
    }

    .w-100 {
      width: 100%;
    }

    ::ng-deep mat-form-field {
      width: 100%;
      margin-bottom: 0;
    }

    ::ng-deep .mat-mdc-form-field {
      background: transparent;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-floating-label {
      color: rgba(255,255,255,0.8);
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-input-element {
      color: white;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-input-element::placeholder {
      color: rgba(255,255,255,0.6);
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-floating-label {
      color: white;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-text-field-wrapper {
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.4);
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline {
      display: none;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline-leading,
    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline-trailing,
    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline-notch {
      border: none;
    }

    ::ng-deep .mat-mdc-select-arrow {
      color: rgba(255,255,255,0.8);
    }

    ::ng-deep .mat-mdc-checkbox {
      color: white;
    }

    ::ng-deep .mat-mdc-checkbox .mdc-checkbox__native-control:enabled:checked~.mdc-checkbox__background {
      background-color: rgba(255,255,255,0.2);
      border-color: white;
    }

    .skills-input-container {
      position: relative;
    }
    
    .skills-list {
      min-height: 50px;
      padding: 1rem;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      margin-top: 0.5rem;
    }

    ::ng-deep .skills-list mat-chip {
      background: rgba(255,255,255,0.2);
      color: white;
      border-radius: 20px;
      margin: 0.25rem;
    }

    ::ng-deep .skills-list mat-chip mat-icon {
      color: rgba(255,255,255,0.8);
    }

    .form-label {
      color: rgba(255,255,255,0.9);
      font-weight: 500;
      margin-bottom: 0.5rem;
      display: block;
    }

    .d-flex {
      display: flex;
    }

    .gap-2 {
      gap: 1rem;
    }

    .align-items-center {
      align-items: center;
    }

    ::ng-deep .mat-mdc-raised-button {
      background: rgba(255,255,255,0.2);
      color: white;
      border-radius: 12px;
      padding: 0.75rem 2rem;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }

    ::ng-deep .mat-mdc-raised-button:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }

    ::ng-deep .mat-mdc-outlined-button {
      color: white;
      border-color: rgba(255,255,255,0.3);
      border-radius: 12px;
      padding: 0.75rem 2rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    ::ng-deep .mat-mdc-outlined-button:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
    }

    ::ng-deep .mat-mdc-progress-spinner circle {
      stroke: white;
    }

    .text-center {
      text-align: center;
    }

    .py-4 {
      padding: 2rem 0;
    }

    .me-2 {
      margin-right: 0.5rem;
    }

    .mt-2 {
      margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
      .main-container {
        padding: 1rem;
      }

      .page-title {
        font-size: 2rem;
      }

      .content-card {
        padding: 1.5rem;
      }

      .col-md-6 {
        flex: 0 0 100%;
        max-width: 100%;
      }

      .d-flex {
        flex-direction: column;
      }

      .gap-2 {
        gap: 0.5rem;
      }
    }
  `
})
export class UserFormComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  isEditMode = false;
  loading = false;
  submitting = false;
  userId: string | null = null;
  skills: string[] = [];
  currentSkill = '';
  currentAvailability: Availability | null = null;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  private subscription: Subscription = new Subscription();

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
      domain: [''],
      seniority: [''],
      bio: ['', Validators.maxLength(1000)],
      experience: [null, [Validators.min(0), Validators.max(50)]],
      hourlyRate: [null, [Validators.min(0), Validators.max(1000)]],
      linkedinProfile: ['', Validators.pattern('https?://.+')],
      githubProfile: ['', Validators.pattern('https?://.+')],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    console.log('🚀 UserFormComponent ngOnInit called');
    
    // Get initial route params
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;
    
    console.log('📍 Route debug:', {
      url: this.router.url,
      userId: this.userId,
      isEditMode: this.isEditMode,
      params: this.route.snapshot.params
    });
    
    if (this.userId) {
      console.log('✅ Found userId, calling loadUser');
      this.loadUser(this.userId);
    } else {
      console.log('❌ No userId found in route');
    }
    
    // TEMPORARY TEST: Set some test data to see if form fields work
    setTimeout(() => {
      console.log('🧪 Setting test data...');
      this.userForm.patchValue({
        name: 'Test Name',
        email: 'test@example.com',
        type: 'mentor',
        bio: 'Test bio content'
      });
      console.log('🧪 Test data set. Form value:', this.userForm.value);
    }, 2000);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private resetForm(): void {
    this.userForm.reset();
    this.skills = [];
    this.currentAvailability = null;
    this.loading = false;
    this.submitting = false;
  }

  loadUser(userId: string): void {
    if (!userId) {
      console.error('No userId provided to loadUser');
      return;
    }
    
    console.log('=== LOAD USER DEBUG ===');
    console.log('Loading user with ID:', userId);
    this.loading = true;
    
    // Test the API call directly
    console.log('Making API call to:', `${this.userService['baseUrl']}/${userId}`);
    
    this.subscription.add(
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          console.log('=== USER DATA RECEIVED ===');
          console.log('Raw user data:', JSON.stringify(user, null, 2));
          
          if (!user) {
            console.error('No user data received from API');
            this.loading = false;
            return;
          }
          
          // Simple patchValue approach
          console.log('Before patching - form value:', this.userForm.value);
          
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            type: user.type,
            domain: user.domain,
            seniority: user.seniority,
            bio: user.bio,
            experience: user.experience,
            hourlyRate: user.hourlyRate,
            linkedinProfile: user.linkedinProfile,
            githubProfile: user.githubProfile,
            isActive: user.isActive
          });
          
          this.skills = user.skills || [];
          this.currentAvailability = user.availability || null;
          
          console.log('After patching - form value:', this.userForm.value);
          console.log('Form controls state:');
          Object.keys(this.userForm.controls).forEach(key => {
            const control = this.userForm.get(key);
            console.log(`${key}: value="${control?.value}", valid=${control?.valid}`);
          });
          
          this.loading = false;
          console.log('=== LOAD USER COMPLETE ===');
        },
        error: (error) => {
          console.error('=== API ERROR ===');
          console.error('Full error object:', error);
          console.error('Error message:', error.message);
          console.error('Error status:', error.status);
          this.loading = false;
        }
      })
    );
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

  onTypeChange(): void {
    const type = this.userForm.get('type')?.value;
    
    // Clear hourly rate if changing to mentee
    if (type === 'mentee') {
      this.userForm.patchValue({ hourlyRate: null });
      this.currentAvailability = null;
    }
  }

  onAvailabilityChange(availability: Availability): void {
    this.currentAvailability = availability;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.submitting = true;
      const formData = { ...this.userForm.value, skills: this.skills };

      if (this.isEditMode && this.userId) {
        const updateData: UpdateUserRequest = {
          name: formData.name,
          domain: formData.domain || undefined,
          seniority: formData.seniority || undefined,
          bio: formData.bio,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          linkedinProfile: formData.linkedinProfile || undefined,
          githubProfile: formData.githubProfile || undefined,
          skills: formData.skills,
          availability: this.currentAvailability || undefined,
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
          domain: formData.domain || undefined,
          seniority: formData.seniority || undefined,
          bio: formData.bio,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          linkedinProfile: formData.linkedinProfile || undefined,
          githubProfile: formData.githubProfile || undefined,
          skills: formData.skills,
          timezone: this.currentAvailability?.timezone
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