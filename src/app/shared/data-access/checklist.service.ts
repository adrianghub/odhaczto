import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { ChecklistItemService } from '../../checklist/data-access/checklist-item.service';
import type {
  AddChecklist,
  Checklist,
  EditChecklist,
} from '../interfaces/checklist';
import { reducer } from '../utils/reducer';
import { StorageService } from './storage.service';

export interface ChecklistsState {
  checklists: Checklist[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistService {
  storageService = inject(StorageService);
  checklistItemService = inject(ChecklistItemService);

  // state
  private state = signal<ChecklistsState>({
    checklists: [],
    loaded: false,
    error: null,
  });

  // selectors
  checklists = computed(() => this.state().checklists);
  loaded = computed(() => this.state().loaded);

  // sources/actions
  add$ = new Subject<AddChecklist>();
  edit$ = new Subject<EditChecklist>();
  remove$ = this.checklistItemService.checklistRemoved$;
  private checklistLoaded$ = this.storageService.loadChecklists();

  constructor() {
    // reducers
    reducer(
      this.checklistLoaded$,
      (checklists) => {
        this.state.update((state) => ({
          ...state,
          checklists,
          loaded: true,
          error: null,
        }));
      },
      (error) => {
        this.state.update((state) => ({
          ...state,
          loaded: false,
          error,
        }));
      }
    );

    reducer(this.add$, (checklist) =>
      this.state.update((state) => ({
        ...state,
        checklists: [...state.checklists, this.addIdToChecklist(checklist)],
      }))
    );

    reducer(this.edit$, (update) =>
      this.state.update((state) => ({
        ...state,
        checklists: state.checklists.map((checklist) =>
          checklist.id === update.id
            ? { ...checklist, name: update.data.name }
            : checklist
        ),
      }))
    );

    reducer(this.remove$, (id) =>
      this.state.update((state) => ({
        ...state,
        checklists: state.checklists.filter((checklist) => checklist.id !== id),
      }))
    );

    // effects

    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklists(this.checklists());
      }
    });
  }

  private addIdToChecklist(checklist: AddChecklist): Checklist {
    return {
      ...checklist,
      id: this.generateSlug(checklist.name),
    };
  }

  private generateSlug(title: string) {
    // NOTE: This is a simplistic slug generator and will not handle things like special characters.
    let slug = title.toLowerCase().replace(/\s+/g, '-');

    // Check if the slug already exists
    const matchingSlugs = this.checklists().find(
      (checklist) => checklist.id === slug
    );

    // If the title is already being used, add a string to make the slug unique
    if (matchingSlugs) {
      slug = slug + Date.now().toString();
    }

    return slug;
  }
}
