import { Component, input } from '@angular/core';
import type { ChecklistItem } from '../../../shared/interfaces/checklist-item';

@Component({
  selector: 'app-checklist-item-list',
  standalone: true,
  imports: [],
  template: `
    <section>
      <ul>
        @for (item of checklistItems(); track item.id) {
        <li>
          <p>{{ item.name }}</p>
        </li>
        } @empty {
        <h2>Add an item</h2>
        <p>Click the add button to add your first item.</p>
        }
      </ul>
    </section>
  `,
  styles: ``,
})
export class ChecklistItemListComponent {
  checklistItems = input.required<ChecklistItem[]>();
}
