import { Component, input, output } from '@angular/core';
import type {
  ChecklistItem,
  RemoveChecklistItem,
  ToggleChecklistItem,
} from '../../../shared/interfaces/checklist-item';

@Component({
  selector: 'app-checklist-item-list',
  standalone: true,
  imports: [],
  template: `
    <section>
      <ul>
        @for (item of checklistItems(); track item.id) {
        <li>
          <div>
            @if (item.checked) {
            <span>✅</span>
            }
            <span>{{ item.name }}</span>
          </div>
          <div>
            <button (click)="toggle.emit(item.id)">Toggle</button>
            <button (click)="edit.emit(item)">Edit</button>
            <button (click)="delete.emit(item.id)">Delete</button>
          </div>
        </li>
        } @empty {
        <h2>Add an item</h2>
        <p>Click the add button to add your first item.</p>
        }
      </ul>
    </section>
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
      }
  `,
})
export class ChecklistItemListComponent {
  checklistItems = input.required<ChecklistItem[]>();

  toggle = output<ToggleChecklistItem>();
  edit = output<ChecklistItem>();
  delete = output<RemoveChecklistItem>();
}
