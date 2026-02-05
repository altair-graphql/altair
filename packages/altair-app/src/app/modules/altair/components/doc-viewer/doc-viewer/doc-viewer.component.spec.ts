import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { DocViewerComponent } from './doc-viewer.component';
import { DocViewerModule } from '../doc-viewer.module';
import { Mock } from 'ts-mocks';
import { GqlService } from '../../../services';
import { AltairConfig } from 'altair-graphql-core/build/config';

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