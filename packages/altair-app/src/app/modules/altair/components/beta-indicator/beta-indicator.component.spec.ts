import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Store } from '@ngrx/store';
import { mockStoreFactory } from '../../../../../testing';
import { BetaIndicatorComponent } from './beta-indicator.component';
import * as settingsActions from '../../store/settings/settings.action';

describe('BetaIndicatorComponent', () => {
  let component: BetaIndicatorComponent;
  let fixture: ComponentFixture<BetaIndicatorComponent>;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = mockStoreFactory();
    await TestBed.configureTestingModule({
      declarations: [BetaIndicatorComponent],
      providers: [
        {
          provide: Store,
          useValue: mockStore,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BetaIndicatorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the correct setting key', () => {
    fixture.componentRef.setInput('featureKey', 'newEditor');
    fixture.detectChanges();
    expect(component.getSettingKey()).toBe('beta.disable.newEditor');
  });

  it('should return different keys for different featureKeys', () => {
    fixture.componentRef.setInput('featureKey', 'darkMode');
    fixture.detectChanges();
    expect(component.getSettingKey()).toBe('beta.disable.darkMode');
  });

  it('should dispatch UpdateSettingsAction with inverted value on setValue', () => {
    fixture.componentRef.setInput('featureKey', 'newEditor');
    fixture.detectChanges();

    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    component.setValue(true);

    expect(dispatchSpy).toHaveBeenCalledWith(
      new settingsActions.UpdateSettingsAction({
        'beta.disable.newEditor': false, 
      })
    );
  });

  it('should dispatch UpdateSettingsAction with true when setValue is called with false', () => {
    fixture.componentRef.setInput('featureKey', 'newEditor');
    fixture.detectChanges();

    const dispatchSpy = vi.spyOn(mockStore, 'dispatch');
    component.setValue(false);

    expect(dispatchSpy).toHaveBeenCalledWith(
      new settingsActions.UpdateSettingsAction({
        'beta.disable.newEditor': true, 
      })
    );
  });

  it('should have value$ as an Observable', () => {
    fixture.componentRef.setInput('featureKey', 'newEditor');
    fixture.detectChanges();
    expect(component.value$).toBeDefined();
  });
});