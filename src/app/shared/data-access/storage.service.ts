import { inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import type { Checklist } from '../interfaces/checklist';
import type { ChecklistItem } from '../interfaces/checklist-item';

export const LOCAL_STORAGE = new InjectionToken<Storage>(
  'window localStorage object',
  {
    providedIn: 'root',
    factory: () =>
      inject(PLATFORM_ID) === 'browser' ? window.localStorage : ({} as Storage),
  }
);

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  storage = inject(LOCAL_STORAGE);

  loadChecklists() {
    const checklists = this.storage.getItem('checklists');
    return of(checklists ? (JSON.parse(checklists) as Checklist[]) : []);
  }

  loadChecklistItems() {
    const checklistItems = this.storage.getItem('checklistItems');
    return of(
      checklistItems ? (JSON.parse(checklistItems) as ChecklistItem[]) : []
    );
  }

  saveChecklists(checklists: Checklist[]) {
    this.storage.setItem('checklists', JSON.stringify(checklists));
  }

  saveChecklistItems(checklistItems: ChecklistItem[]) {
    this.storage.setItem('checklistItems', JSON.stringify(checklistItems));
  }
}
