import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerComponent } from './banner.component';
import { Banner } from '../../services/banner/banner.service';

describe('BannerComponent', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;

  const mockBanner: Banner = {
    id: 'test-banner-id',
    enabled: true,
    dismissible: true,
    message: 'Test banner message',
    icon: 'info',
    type: 'info',
    actions: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onDismiss', () => {
    it('should emit the banner id when banner has an id', () => {
      fixture.componentRef.setInput('banner', mockBanner);
      fixture.detectChanges();

      const dismissSpy = jest.fn();
      component.dismiss.subscribe(dismissSpy);

      component.onDismiss();

      expect(dismissSpy).toHaveBeenCalledWith('test-banner-id');
    });

    it('should not emit if banner is undefined', () => {
      fixture.componentRef.setInput('banner', undefined);
      fixture.detectChanges();

      const dismissSpy = jest.fn();
      component.dismiss.subscribe(dismissSpy);

      component.onDismiss();

      expect(dismissSpy).not.toHaveBeenCalled();
    });

    it('should not emit if banner has no id', () => {
      fixture.componentRef.setInput('banner', { ...mockBanner, id: undefined });
      fixture.detectChanges();

      const dismissSpy = jest.fn();
      component.dismiss.subscribe(dismissSpy);

      component.onDismiss();

      expect(dismissSpy).not.toHaveBeenCalled();
    });
  });
});