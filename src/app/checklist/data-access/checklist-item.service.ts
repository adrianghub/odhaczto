import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { StorageService } from '../../shared/data-access/storage.service';
import type { RemoveChecklist } from '../../shared/interfaces/checklist';
import type {
  AddChecklistItem,
  ChecklistItem,
  EditChecklistItem,
  RemoveChecklistItem,
  ToggleChecklistItem,
} from '../../shared/interfaces/checklist-item';

export interface ChecklistItemState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  storageService = inject(StorageService);

  // state
  private state = signal<ChecklistItemState>({
    checklistItems: [],
    loaded: false,
    error: null,
  });

  // selectors
  checklistItems = computed(() => this.state().checklistItems);
  loaded = computed(() => this.state().loaded);

  // sources/actions
  add$ = new Subject<AddChecklistItem>();
  toggle$ = new Subject<ToggleChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();
  edit$ = new Subject<EditChecklistItem>();
  remove$ = new Subject<RemoveChecklistItem>();
  checklistRemoved$ = new Subject<RemoveChecklist>();
  private checklistItemsLoaded$ = this.storageService.loadChecklistItems();

  constructor() {
    // reducers
    this.checklistItemsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (checklistItems) => {
        this.state.update((state) => ({
          ...state,
          checklistItems,
          loaded: true,
          error: null,
        }));
      },
      error: (error) => {
        this.state.update((state) => ({
          ...state,
          loaded: false,
          error,
        }));
      },
    });

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

    this.edit$.pipe(takeUntilDestroyed()).subscribe((update) => {
      this.state.update((state) => ({
        ...state,
        checklists: state.checklistItems.map((item) =>
          item.id === update.id ? { ...item, name: update.data.name } : item
        ),
      }));
    });

    this.remove$.pipe(takeUntilDestroyed()).subscribe((id) => {
      this.state.update((state) => ({
        ...state,
        checklists: state.checklistItems.filter((item) => item.id !== id),
      }));
    });

    this.checklistRemoved$.pipe(takeUntilDestroyed()).subscribe((id) => {
      this.state.update((state) => ({
        ...state,
        checklists: state.checklistItems.filter(
          (item) => item.checklistId !== id
        ),
      }));
    });

    // effects
    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItems());
      }
    });
  }
}
