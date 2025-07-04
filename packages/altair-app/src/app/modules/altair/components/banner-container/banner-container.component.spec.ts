import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerContainerComponent } from './banner-container.component';
import { MockProvider } from 'ng-mocks';
import { Store } from '@ngrx/store';

describe('BannerContainerComponent', () => {
  let component: BannerContainerComponent;
  let fixture: ComponentFixture<BannerContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BannerContainerComponent],
      providers: [MockProvider(Store)],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
