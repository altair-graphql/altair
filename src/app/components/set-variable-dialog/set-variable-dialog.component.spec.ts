import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from 'ng2-codemirror';

import * as services from '../../services';
import { SetVariableDialogComponent } from './set-variable-dialog.component';

describe('SetVariableDialogComponent', () => {
  let component: SetVariableDialogComponent;
  let fixture: ComponentFixture<SetVariableDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetVariableDialogComponent ],
      imports: [
        FormsModule,
        CodemirrorModule
      ],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetVariableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
