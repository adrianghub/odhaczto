import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Checklist } from '../../../shared/interfaces/checklist';

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <ul>
      @for (checklist of checklists(); track checklist.id) {
      <li>
        <a [routerLink]="'/checklists/' + checklist.id">
          {{ checklist.name }}
        </a>
      </li>
      } @empty {
      <p>No checklists found.</p>
      }
    </ul>
  `,
  styles: ``,
})
export class ChecklistListComponent {
  checklists = input.required<Checklist[]>();
}
