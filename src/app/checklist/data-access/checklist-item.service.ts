import { computed, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import type {
  AddChecklistItem,
  ChecklistItem,
} from '../../shared/interfaces/checklist-item';

export interface ChecklistItemState {
  checklistItems: ChecklistItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  // state
  private state = signal<ChecklistItemState>({ checklistItems: [] });

  // selectors
  checklistItems = computed(() => this.state().checklistItems);

  // sources/actions
  add$ = new Subject<AddChecklistItem>();

  constructor() {
    this.add$.pipe(takeUntilDestroyed()).subscribe((checklistItem) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: [
          ...state.checklistItems,
          {
            ...checklistItem.item,
            id: Date.now().toString(),
            checklistId: checklistItem.checklistId,
            checked: false,
          },
        ],
      }))
    );
  }
}
