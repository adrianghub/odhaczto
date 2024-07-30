import type { RemoveChecklist } from './checklist';

export interface ChecklistItem {
  id: string;
  checklistId: string;
  name: string;
  checked: boolean;
}

export type AddChecklistItem = {
  item: Omit<ChecklistItem, 'id' | 'checklistId' | 'checked'>;
  checklistId: RemoveChecklist;
};
export type EditChecklistItem = {
  id: ChecklistItem['id'];
  data: AddChecklistItem['item'];
};
export type RemoveChecklistItem = ChecklistItem['id'];

export type ToggleChecklistItem = ChecklistItem['id'];
