import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnvironmentManagerComponent } from './environment-manager.component';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../modules/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EnvironmentManagerComponent', () => {
  let component: EnvironmentManagerComponent;
  let fixture: ComponentFixture<EnvironmentManagerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EnvironmentManagerComponent ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        CodemirrorModule,
        SharedModule,
        TranslateModule.forRoot()
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
