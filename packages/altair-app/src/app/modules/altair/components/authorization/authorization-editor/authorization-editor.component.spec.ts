import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationEditorComponent } from './authorization-editor.component';

describe('AuthorizationEditorComponent', () => {
  let component: AuthorizationEditorComponent;
  let fixture: ComponentFixture<AuthorizationEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizationEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthorizationEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
