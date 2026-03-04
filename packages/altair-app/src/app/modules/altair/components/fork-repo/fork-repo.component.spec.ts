import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ForkRepoComponent } from './fork-repo.component';

describe('ForkRepoComponent', () => {
  let component: ForkRepoComponent;
  let fixture: ComponentFixture<ForkRepoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ForkRepoComponent],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForkRepoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('externalLink', () => {
    const testUrl = 'https://github.com/altair-graphql/altair';
    let mockEvent: Event;
    let preventDefaultSpy: jest.SpyInstance;
    let windowOpenSpy: jest.SpyInstance;

    beforeEach(() => {
      mockEvent = new Event('click');
      preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault');
      windowOpenSpy = jest.spyOn(window, 'open');
    });

    afterEach(() => {
      windowOpenSpy.mockRestore();
    });

    it('should call preventDefault on the event', () => {
      windowOpenSpy.mockReturnValue(null);
      component.externalLink(mockEvent, testUrl);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should open the url in a new tab', () => {
      windowOpenSpy.mockReturnValue(null);
      component.externalLink(mockEvent, testUrl);
      expect(windowOpenSpy).toHaveBeenCalledWith(testUrl, '_blank');
    });

    it('should focus the new window if it was opened successfully', () => {
      const mockWindow = { focus: jest.fn() } as unknown as Window;
      windowOpenSpy.mockReturnValue(mockWindow);
      component.externalLink(mockEvent, testUrl);
      expect(mockWindow.focus).toHaveBeenCalled();
    });

    it('should not throw if window.open returns null', () => {
      windowOpenSpy.mockReturnValue(null);
      expect(() => {
        component.externalLink(mockEvent, testUrl);
      }).not.toThrow();
    });
  });
});