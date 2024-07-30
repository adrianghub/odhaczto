import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChecklistService } from '../shared/data-access/checklist.service';
import { FormModalComponent } from '../shared/ui/form-modal/form-modal.component';
import { ModalComponent } from '../shared/ui/modal/modal.component';
import { Checklist } from './../shared/interfaces/checklist';
import { ChecklistListComponent } from './ui/checklist-list/checklist-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ModalComponent, FormModalComponent, ChecklistListComponent],
  template: `
    <header>
      <h1>Odhaczto</h1>
      <button (click)="checklistBeingEdited.set({})">Add Checklist</button>
    </header>

    <section>
      <h2>Checklists</h2>
      <app-checklist-list [checklists]="checklistService.checklists()" />
    </section>

    <app-modal [isOpen]="!!checklistBeingEdited()">
      <ng-template>
        <app-form-modal
          [title]="
            checklistBeingEdited()?.name
              ? checklistBeingEdited()!.name!
              : 'Add Checklist'
          "
          [formGroup]="checklistForm"
          (close)="checklistBeingEdited.set(null)"
          (save)="checklistService.add$.next(checklistForm.getRawValue())"
        />
      </ng-template>
    </app-modal>
  `,
  styles: ``,
})
export default class HomeComponent {
  formBuilder = inject(FormBuilder);
  checklistService = inject(ChecklistService);
  checklistBeingEdited = signal<Partial<Checklist> | null>(null);

  checklistForm = this.formBuilder.nonNullable.group({
    name: [''],
  });

  constructor() {
    effect(() => {
      const checklist = this.checklistBeingEdited();
      if (!checklist) {
        this.checklistForm.reset();
      }
    });
  }
}
