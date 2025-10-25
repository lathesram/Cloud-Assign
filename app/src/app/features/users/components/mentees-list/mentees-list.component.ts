import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mentees-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <h1 class="h2 mb-4">Mentees List</h1>
          <p>Mentees list component will be implemented here.</p>
        </div>
      </div>
    </div>
  `
})
export class MenteesListComponent {
}