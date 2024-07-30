import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChecklistService } from '../shared/data-access/checklist.service';
import type { ChecklistItem } from '../shared/interfaces/checklist-item';
import { FormModalComponent } from '../shared/ui/form-modal/form-modal.component';
import { ModalComponent } from '../shared/ui/modal/modal.component';
import { ChecklistItemService } from './data-access/checklist-item.service';
import { ChecklistHeaderComponent } from './ui/checklist-header/checklist-header.component';
import { ChecklistItemListComponent } from './ui/checklist-item-list/checklist-item-list.component';

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [
    ChecklistHeaderComponent,
    ModalComponent,
    FormModalComponent,
    ChecklistItemListComponent,
  ],
  template: `
    @if (checklist(); as checklist) {
    <app-checklist-header
      [checklist]="checklist"
      (addItem)="checklistItemBeingEdited.set({})"
      (resetChecklist)="checklistItemService.reset$.next($event)"
    />

    <app-checklist-item-list
      [checklistItems]="checklistItems()"
      (toggle)="checklistItemService.toggle$.next($event)"
    />
    }

    <app-modal [isOpen]="!!checklistItemBeingEdited()">
      <ng-template>
        <app-form-modal
          title="Create checklist item"
          [formGroup]="checklistItemForm"
          (save)="
            checklistItemService.add$.next({
              item: checklistItemForm.getRawValue(),
              checklistId: checklist()?.id!
            })
          "
          (close)="checklistItemBeingEdited.set(null)"
        />
      </ng-template>
    </app-modal>
  `,
  styles: ``,
})
export default class ChecklistComponent {
  checklistService = inject(ChecklistService);
  checklistItemService = inject(ChecklistItemService);
  route = inject(ActivatedRoute);
  formBuilder = inject(FormBuilder);

  checklistItemBeingEdited = signal<Partial<ChecklistItem> | null>(null);

  params = toSignal(this.route.paramMap);

  checklist = computed(() =>
    this.checklistService
      .checklists()
      .find((checklist) => checklist.id === this.params()?.get('id')!)
  );

  checklistItemForm = this.formBuilder.nonNullable.group({
    name: [''],
  });

  checklistItems = computed(() =>
    this.checklistItemService
      .checklistItems()
      .filter((item) => item.checklistId === this.params()?.get('id'))
  );

  constructor() {
    effect(() => {
      const checklistItem = this.checklistItemBeingEdited();

      if (!checklistItem) {
        this.checklistItemForm.reset();
      }
    });
  }
}
