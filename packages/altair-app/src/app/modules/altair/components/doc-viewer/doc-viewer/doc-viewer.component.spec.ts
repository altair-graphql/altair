import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { DocViewerComponent } from './doc-viewer.component';
import { DocViewerModule } from '../doc-viewer.module';
import { Mock } from 'ts-mocks';
import { GqlService } from '../../../services';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { DocView } from 'altair-graphql-core/build/types/state/docs.interfaces';

let mockGqlService: Mock<GqlService>;

describe('DocViewerComponent', () => {
  let component: DocViewerComponent;
  let fixture: ComponentFixture<DocViewerComponent>;

  beforeEach(waitForAsync(() => {
    mockGqlService = new Mock();
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        // Just import DocViewerModule since it contains all doc viewer component and dependencies
        DocViewerModule,
      ],
      providers: [
        {
          provide: GqlService,
          useFactory: () => mockGqlService.Object,
        },
        {
          provide: AltairConfig,
          useValue: new AltairConfig(),
        },
      ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Breadcrumb navigation', () => {
    it('should navigate to home when breadcrumb index is -1', () => {
      const setDocViewSpy = jest.spyOn(component, 'setDocView');
      component.docHistory.set([
        { view: 'type', name: 'User' },
        { view: 'field', name: 'name', parentType: 'User' }
      ]);

      component.navigateToBreadcrumb(-1);

      expect(setDocViewSpy).toHaveBeenCalledWith({ view: 'root' });
      expect(component.docHistory()).toEqual([]);
    });

    it('should navigate to specific history point and update history', () => {
      const setDocViewSpy = jest.spyOn(component, 'setDocView');
      const history: DocView[] = [
        { view: 'type', name: 'User' },
        { view: 'field', name: 'name', parentType: 'User' },
        { view: 'type', name: 'Post' }
      ];
      component.docHistory.set([...history]);

      // Navigate to index 1 (field view)
      component.navigateToBreadcrumb(1);

      expect(setDocViewSpy).toHaveBeenCalledWith({ view: 'field', name: 'name', parentType: 'User' });
      // History should only include items before index 1
      expect(component.docHistory()).toEqual([{ view: 'type', name: 'User' }]);
    });

    it('should not navigate if index is out of bounds', () => {
      const setDocViewSpy = jest.spyOn(component, 'setDocView');
      const history: DocView[] = [
        { view: 'type', name: 'User' }
      ];
      component.docHistory.set([...history]);

      // Try to navigate to invalid index
      component.navigateToBreadcrumb(5);

      expect(setDocViewSpy).not.toHaveBeenCalled();
      expect(component.docHistory()).toEqual(history);
    });
  });

  describe('getBreadcrumbLabel', () => {
    it('should return "Home" for root view', () => {
      const docView: DocView = { view: 'root' };
      expect(component.getBreadcrumbLabel(docView)).toBe('Home');
    });

    it('should return type name for type view', () => {
      const docView: DocView = { view: 'type', name: 'User' };
      expect(component.getBreadcrumbLabel(docView)).toBe('User');
    });

    it('should return parent.field for field view', () => {
      const docView: DocView = { view: 'field', name: 'name', parentType: 'User' };
      expect(component.getBreadcrumbLabel(docView)).toBe('User.name');
    });

    it('should return @directiveName for directive view', () => {
      const docView: DocView = { view: 'directive', name: 'deprecated' };
      expect(component.getBreadcrumbLabel(docView)).toBe('@deprecated');
    });

    it('should return "Search Results" for search view', () => {
      const docView: DocView = { view: 'search' };
      expect(component.getBreadcrumbLabel(docView)).toBe('Search Results');
    });
  });
});
