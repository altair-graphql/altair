import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationEditorComponent } from './authorization-editor.component';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AuthorizationEditorComponent', () => {
  let component: AuthorizationEditorComponent;
  let fixture: ComponentFixture<AuthorizationEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthorizationEditorComponent],
      imports: [SharedModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
