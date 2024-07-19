import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerContainerComponent } from './banner-container.component';

describe('BannerContainerComponent', () => {
  let component: BannerContainerComponent;
  let fixture: ComponentFixture<BannerContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BannerContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
