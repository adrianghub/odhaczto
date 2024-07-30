import { computed, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import type { RemoveChecklist } from '../../shared/interfaces/checklist';
import type {
  AddChecklistItem,
  ChecklistItem,
  ToggleChecklistItem,
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
  toggle$ = new Subject<ToggleChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();

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

    this.toggle$.pipe(takeUntilDestroyed()).subscribe((checklistItemId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId
            ? { ...item, checked: !item.checked }
            : item
        ),
      }))
    );

    this.reset$.pipe(takeUntilDestroyed()).subscribe((checklistItemId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistItemId
            ? { ...item, checked: false }
            : item
        ),
      }))
    );
  }
}
