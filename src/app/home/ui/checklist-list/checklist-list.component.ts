import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type {
  Checklist,
  RemoveChecklist,
} from '../../../shared/interfaces/checklist';

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
        <div>
          <button (click)="edit.emit(checklist)">Edit</button>
          <button (click)="delete.emit(checklist.id)">Delete</button>
        </div>
      </li>
      } @empty {
      <p>No checklists found.</p>
      }
    </ul>
  `,
  styles: `
      ul {
        padding: 0;
        margin: 0;
      }

      li {
        font-size: 1.5em;
        display: flex;
        justify-content: space-between;
        background: var(--color-light);
        list-style-type: none;
        margin-bottom: 1rem;
        padding: 1rem;

      button {
        margin-left: 1rem;
      }
    }`,
})
export class ChecklistListComponent {
  checklists = input.required<Checklist[]>();

  edit = output<Checklist>();
  delete = output<RemoveChecklist>();
}
