import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { mount, NgxTestWrapper } from '../../../../../testing';
import { SharedModule } from '../../modules/shared/shared.module';

import { AccountDialogComponent } from './account-dialog.component';

describe('AccountDialogComponent', () => {
  let wrapper: NgxTestWrapper<AccountDialogComponent>;
  let component: AccountDialogComponent;
  let fixture: ComponentFixture<AccountDialogComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: AccountDialogComponent,
      declarations: [AccountDialogComponent],
      providers: [],
      imports: [SharedModule, TranslateModule.forRoot(),],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AccountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });

  it('should emit "handleLoginChange" when login is clicked', () => {
    const login = wrapper.find(".active-primary"); 

    login.emit('click');

    expect(wrapper.emitted('handleLoginChange')).toBeTruthy();
  });
});