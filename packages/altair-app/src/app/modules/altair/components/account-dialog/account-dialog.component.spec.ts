import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { mock, mount, NgxTestWrapper } from '../../../../../testing';
import { SharedModule } from '../../modules/shared/shared.module';

import { AccountDialogComponent } from './account-dialog.component';
import { apiClient } from '../../services/api/api.service';
import * as externalUtils from '../../utils';

describe('AccountDialogComponent', () => {
  let wrapper: NgxTestWrapper<AccountDialogComponent>;
  let component: AccountDialogComponent;
  let fixture: ComponentFixture<AccountDialogComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: AccountDialogComponent,
      declarations: [AccountDialogComponent],
      providers: [],
      imports: [SharedModule, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AccountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => jest.clearAllMocks());

  it('should create', () => {
    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });

  it ('should have default showDialog as true', () => {
    expect(component.showDialog).toBe(true);
  });

  it('should have undefined account by default', () => {
    expect(component.account).toBeUndefined();
  });

  it('should emit "handleLoginChange" when login is clicked', () => {
    const login = wrapper.find('.btn');

    login.emit('click');

    expect(wrapper.emitted('handleLoginChange')).toBeTruthy();
  });

  it('should emit handleLoginChange on submitLogin', () => {
    jest.spyOn(component.handleLoginChange, 'emit');
    component.submitLogin();
    expect(component.handleLoginChange.emit).toHaveBeenCalled();
  });

  it ('should open billing page with correct URL', async () => {
    const mockUrl = 'https://billing.example.com';
    jest.spyOn(apiClient, 'getBillingUrl').mockResolvedValue({ url: mockUrl });
    const mockEvent = new MouseEvent('click');
    const externalSpy = jest.spyOn(externalUtils, 'externalLink').mockImplementation(() => {});

    await component.openBillingPage(mockEvent);

    expect(apiClient.getBillingUrl).toHaveBeenCalledWith();
    expect(externalSpy).toHaveBeenCalledWith(mockUrl, mockEvent);
  });

  it ('should call getUpgradeProUrl and open external link', async () => {
    const mockUrl = 'https://upgrade.example.com';
    jest.spyOn(apiClient, 'getUpgradeProUrl').mockResolvedValue({ url: mockUrl });
    const mockEvent = new MouseEvent('click');
    const externalSpy = jest.spyOn(externalUtils, 'externalLink').mockImplementation(() => {});

    await component.openUpgradeProUrl(mockEvent);

    expect(apiClient.getUpgradeProUrl).toHaveBeenCalledWith();
    expect(externalSpy).toHaveBeenCalledWith(mockUrl, mockEvent);
  });

  it ('should call buyCredits and open external link if url exists', async () => {
    const mockUrl = 'https://credits.example.com';
    jest.spyOn(apiClient, 'buyCredits').mockResolvedValue({ url: mockUrl });
    const mockEvent = new MouseEvent('click');
    const externalSpy = jest.spyOn(externalUtils, 'externalLink').mockImplementation(() => {});

    await component.buyCredits(mockEvent);

    expect(apiClient.buyCredits).toHaveBeenCalledWith();
    expect(externalSpy).toHaveBeenCalledWith(mockUrl, mockEvent);
  });

  it('should not call externalLink if buyCredits returns no url', async () => {
    jest.spyOn(apiClient, 'buyCredits').mockResolvedValue({ url: '' });
    const mockEvent = new MouseEvent('click');
    const externalSpy = jest.spyOn(externalUtils, 'externalLink').mockImplementation(() => {});

    await component.buyCredits(mockEvent);

    expect(apiClient.buyCredits).toHaveBeenCalledWith();
    expect(externalSpy).not.toHaveBeenCalled();
  });
});
