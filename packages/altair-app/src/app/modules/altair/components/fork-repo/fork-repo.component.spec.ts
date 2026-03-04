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
    let mockEvent: Event;
    let preventDefaultSpy: jest.SpyInstance;
    let windowOpenSpy: jest.SpyInstance;

    beforeEach(() => {
      mockEvent = new Event('click');
      preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault');
      windowOpenSpy = jest.spyOn(window, 'open');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call preventDefault on the event', () => {
      windowOpenSpy.mockReturnValue(null);
      component.externalLink(mockEvent, 'https://github.com/altair-graphql/altair');
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should open the url in a new tab', () => {
      windowOpenSpy.mockReturnValue(null);
      const url = 'https://github.com/altair-graphql/altair';
      component.externalLink(mockEvent, url);
      expect(windowOpenSpy).toHaveBeenCalledWith(url, '_blank');
    });

    it('should focus the new window if it was opened successfully', () => {
      const mockWindow = { focus: jest.fn() } as unknown as Window;
      windowOpenSpy.mockReturnValue(mockWindow);
      component.externalLink(mockEvent, 'https://github.com/altair-graphql/altair');
      expect(mockWindow.focus).toHaveBeenCalled();
    });

    it('should not throw if window.open returns null', () => {
      windowOpenSpy.mockReturnValue(null);
      expect(() => {
        component.externalLink(mockEvent, 'https://github.com/altair-graphql/altair');
      }).not.toThrow();
    });
  });

  describe('template', () => {
    it('should render the github corner link', () => {
      const link = fixture.nativeElement.querySelector('a.github-corner');
      expect(link).toBeTruthy();
    });

    it('should have the correct href', () => {
      const link = fixture.nativeElement.querySelector('a.github-corner');
      expect(link.getAttribute('href')).toBe('https://github.com/altair-graphql/altair');
    });

    it('should have the correct aria-label', () => {
      const link = fixture.nativeElement.querySelector('a.github-corner');
      expect(link.getAttribute('aria-label')).toBe('View source on Github');
    });
  });
});