import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { connect } from 'ngxtension/connect';
import { map, Subject } from 'rxjs';
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
  error$ = new Subject<string>();
  add$ = new Subject<AddChecklistItem>();
  toggle$ = new Subject<ToggleChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();
  edit$ = new Subject<EditChecklistItem>();
  remove$ = new Subject<RemoveChecklistItem>();
  checklistRemoved$ = new Subject<RemoveChecklist>();
  private checklistItemsLoaded$ = this.storageService.loadChecklistItems();

  constructor() {
    // reducers
    connect(this.state)
      .with(this.error$, (state, error) => ({
        ...state,
        loaded: false,
        error,
      }))
      .with(
        this.checklistItemsLoaded$.pipe(
          map((checklistItems) => ({ checklistItems, loaded: true }))
        )
      )
      .with(this.toggle$, (state, checklistItemId) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId
            ? { ...item, checked: !item.checked }
            : item
        ),
      }))
      .with(this.reset$, (state, checklistItemId) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistItemId
            ? { ...item, checked: false }
            : item
        ),
      }))
      .with(this.add$, (state, checklistItem) => ({
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
      .with(this.edit$, (state, update) => ({
        ...state,
        checklists: state.checklistItems.map((item) =>
          item.id === update.id ? { ...item, name: update.data.name } : item
        ),
      }))
      .with(this.remove$, (state, id) => ({
        ...state,
        checklists: state.checklistItems.filter((item) => item.id !== id),
      }))
      .with(this.checklistRemoved$, (state, id) => ({
        ...state,
        checklists: state.checklistItems.filter(
          (item) => item.checklistId !== id
        ),
      }));

    // effects
    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItems());
      }
    });
  }
}
