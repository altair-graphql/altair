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

  describe('shouldShowEllipsis', () => {
    it('should return false when history has 2 or fewer non-root items', () => {
      component.docHistory.set([
        { view: 'type', name: 'User' },
        { view: 'field', name: 'name', parentType: 'User' }
      ]);
      expect(component.shouldShowEllipsis()).toBe(false);
    });

    it('should return true when history has more than 2 non-root items', () => {
      component.docHistory.set([
        { view: 'type', name: 'Query' },
        { view: 'type', name: 'User' },
        { view: 'field', name: 'name', parentType: 'User' }
      ]);
      expect(component.shouldShowEllipsis()).toBe(true);
    });

    it('should ignore root views in the count', () => {
      component.docHistory.set([
        { view: 'root' },
        { view: 'type', name: 'User' },
        { view: 'field', name: 'name', parentType: 'User' }
      ]);
      expect(component.shouldShowEllipsis()).toBe(false);
    });
  });

  describe('getVisibleBreadcrumbs', () => {
    it('should return all items when there are 2 or fewer', () => {
      component.docHistory.set([
        { view: 'type', name: 'User' },
        { view: 'field', name: 'name', parentType: 'User' }
      ]);
      const visible = component.getVisibleBreadcrumbs();
      expect(visible.length).toBe(2);
      expect(visible[0].view.name).toBe('User');
      expect(visible[1].view.name).toBe('name');
    });

    it('should return last 2 items when there are more than 2', () => {
      component.docHistory.set([
        { view: 'type', name: 'Query' },
        { view: 'type', name: 'Organization' },
        { view: 'type', name: 'User' },
        { view: 'field', name: 'name', parentType: 'User' }
      ]);
      const visible = component.getVisibleBreadcrumbs();
      expect(visible.length).toBe(2);
      expect(visible[0].view.name).toBe('User');
      expect(visible[1].view.name).toBe('name');
    });

    it('should return items with correct original indices', () => {
      component.docHistory.set([
        { view: 'type', name: 'Query' },
        { view: 'type', name: 'Organization' },
        { view: 'type', name: 'User' }
      ]);
      const visible = component.getVisibleBreadcrumbs();
      expect(visible.length).toBe(2);
      expect(visible[0].index).toBe(1); // Organization at index 1
      expect(visible[1].index).toBe(2); // User at index 2
    });

    it('should filter out root views', () => {
      component.docHistory.set([
        { view: 'root' },
        { view: 'type', name: 'User' },
        { view: 'field', name: 'name', parentType: 'User' }
      ]);
      const visible = component.getVisibleBreadcrumbs();
      expect(visible.length).toBe(2);
      expect(visible[0].view.view).toBe('type');
      expect(visible[1].view.view).toBe('field');
    });
  });
  describe('search filter methods', () => {
    it('should initialize with all filters active', () => {
      const filters = component.searchFilters();
      expect(filters.has('types')).toBe(true);
      expect(filters.has('fields')).toBe(true);
      expect(filters.has('queries')).toBe(true);
      expect(filters.has('mutations')).toBe(true);
      expect(filters.has('subscriptions')).toBe(true);
      expect(filters.has('directives')).toBe(true);
    });

    it('should toggle filter off when active', () => {
      component.toggleSearchFilter('types');
      expect(component.isSearchFilterActive('types')).toBe(false);
    });

    it('should toggle filter on when inactive', () => {
      component.toggleSearchFilter('types');
      expect(component.isSearchFilterActive('types')).toBe(false);
      component.toggleSearchFilter('types');
      expect(component.isSearchFilterActive('types')).toBe(true);
    });

    it('should check if filter is active correctly', () => {
      expect(component.isSearchFilterActive('types')).toBe(true);
      component.toggleSearchFilter('types');
      expect(component.isSearchFilterActive('types')).toBe(false);
    });

    it('should handle multiple filter toggles independently', () => {
      component.toggleSearchFilter('types');
      component.toggleSearchFilter('fields');
      
      expect(component.isSearchFilterActive('types')).toBe(false);
      expect(component.isSearchFilterActive('fields')).toBe(false);
      expect(component.isSearchFilterActive('queries')).toBe(true);
      expect(component.isSearchFilterActive('mutations')).toBe(true);
    });
  });
});
