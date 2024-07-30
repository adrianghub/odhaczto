import { KeyValuePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule, type FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, KeyValuePipe],
  template: `
    <header>
      <h2>{{ title() }}</h2>
      <button (click)="close.emit()">Close</button>
    </header>
    <section>
      <form [formGroup]="formGroup()" (ngSubmit)="save.emit(); close.emit()">
        @for (control of formGroup().controls | keyvalue; track control.key) {
        <div>
          <label [for]="control.key">{{ control.key }}</label>
          <input [formControlName]="control.key" [id]="control.key" />
        </div>
        }
        <button type="submit">Save</button>
      </form>
    </section>
  `,
  styles: ``,
})
export class FormModalComponent {
  formGroup = input.required<FormGroup>();
  title = input.required<string>();

  save = output();
  close = output();
}
