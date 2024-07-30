import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Checklist } from '../../../shared/interfaces/checklist';

@Component({
  selector: 'app-checklist-header',
  standalone: true,
  imports: [RouterLink],
  template: ` <header>
    <a routerLink="/home">Back</a>
    <h1>{{ checklist().name }}</h1>
    <div>
      <button (click)="addItem.emit()">Add item</button>
    </div>
  </header>`,
  styles: ``,
})
export class ChecklistHeaderComponent {
  checklist = input.required<Checklist>();

  addItem = output();
}
