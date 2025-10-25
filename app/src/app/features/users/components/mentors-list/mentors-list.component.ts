import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mentors-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <h1 class="h2 mb-4">Mentors List</h1>
          <p>Mentors list component will be implemented here.</p>
        </div>
      </div>
    </div>
  `
})
export class MentorsListComponent {
}