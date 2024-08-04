import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { connect } from 'ngxtension/connect';
import { catchError, EMPTY, map, Subject } from 'rxjs';
import { ChecklistItemService } from '../../checklist/data-access/checklist-item.service';
import type {
  AddChecklist,
  Checklist,
  EditChecklist,
} from '../interfaces/checklist';
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
  error$ = new Subject<string>();
  remove$ = this.checklistItemService.checklistRemoved$;
  private checklistLoaded$ = this.storageService.loadChecklists().pipe(
    catchError((error) => {
      this.error$.next(error);
      return EMPTY;
    })
  );

  constructor() {
    // reducers
    connect(this.state)
      .with(this.error$, (state, error) => ({
        ...state,
        loaded: false,
        error,
      }))
      .with(
        this.checklistLoaded$.pipe(
          map((checklists) => ({ checklists, loaded: true }))
        )
      )
      .with(this.add$, (state, checklist) => ({
        checklists: [...state.checklists, this.addIdToChecklist(checklist)],
      }))
      .with(this.edit$, (state, update) => ({
        checklists: state.checklists.map((checklist) =>
          checklist.id === update.id
            ? { ...checklist, name: update.data.name }
            : checklist
        ),
      }))
      .with(this.remove$, (state, id) => ({
        checklists: state.checklists.filter((checklist) => checklist.id !== id),
      }));

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
