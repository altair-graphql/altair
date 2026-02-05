import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { DocViewerSearchResultsComponent } from './doc-viewer-search-results.component';
import { DocumentIndexEntry, DocSearchFilterKey } from '../models';

describe('DocViewerSearchResultsComponent', () => {
  let component: DocViewerSearchResultsComponent;
  let fixture: ComponentFixture<DocViewerSearchResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DocViewerSearchResultsComponent],
      imports: [TranslateModule.forRoot()],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewerSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filteredResults', () => {
    const mockResults: DocumentIndexEntry[] = [
      {
        search: 'User',
        name: 'User',
        description: 'User type',
        cat: 'type',
        highlight: 'type',
      },
      {
        search: 'id',
        name: 'id',
        description: 'User ID',
        cat: 'field',
        type: 'User',
        highlight: 'field',
      },
      {
        search: 'getUser',
        name: 'getUser',
        description: 'Get a user',
        cat: 'field',
        type: 'Query',
        isQuery: true,
        highlight: 'field',
      },
      {
        search: 'createUser',
        name: 'createUser',
        description: 'Create a user',
        cat: 'field',
        type: 'Mutation',
        isQuery: true,
        highlight: 'field',
      },
      {
        search: 'userUpdated',
        name: 'userUpdated',
        description: 'User update subscription',
        cat: 'field',
        type: 'Subscription',
        isQuery: true,
        highlight: 'field',
      },
      {
        search: 'deprecated',
        name: '@deprecated',
        description: 'Deprecated directive',
        cat: 'directive',
        highlight: 'directive',
      },
    ];

    it('should return all results when all filters are active', () => {
      fixture.componentRef.setInput('results', mockResults);
      fixture.componentRef.setInput(
        'filters',
        new Set<DocSearchFilterKey>(['types', 'fields', 'queries', 'mutations', 'subscriptions', 'directives'])
      );
      fixture.detectChanges();

      const filtered = component.filteredResults();
      expect(filtered.length).toBe(6);
    });

    it('should return all results when no filters are set', () => {
      fixture.componentRef.setInput('results', mockResults);
      fixture.componentRef.setInput('filters', new Set<DocSearchFilterKey>());
      fixture.detectChanges();

      const filtered = component.filteredResults();
      expect(filtered.length).toBe(6);
    });

    it('should filter to show only types', () => {
      fixture.componentRef.setInput('results', mockResults);
      fixture.componentRef.setInput('filters', new Set<DocSearchFilterKey>(['types']));
      fixture.detectChanges();

      const filtered = component.filteredResults();
      expect(filtered.length).toBe(1);
      expect(filtered[0]!.cat).toBe('type');
      expect(filtered[0]!.name).toBe('User');
    });

    it('should filter to show only regular fields', () => {
      fixture.componentRef.setInput('results', mockResults);
      fixture.componentRef.setInput('filters', new Set<DocSearchFilterKey>(['fields']));
      fixture.detectChanges();

      const filtered = component.filteredResults();
      expect(filtered.length).toBe(1);
      expect(filtered[0]!.cat).toBe('field');
      expect(filtered[0]!.name).toBe('id');
    });

    it('should filter to show only queries', () => {
      fixture.componentRef.setInput('results', mockResults);
      fixture.componentRef.setInput('filters', new Set<DocSearchFilterKey>(['queries']));
      fixture.detectChanges();

      const filtered = component.filteredResults();
      expect(filtered.length).toBe(1);
      expect(filtered[0]!.name).toBe('getUser');
    });

    it('should filter to show only mutations', () => {
      fixture.componentRef.setInput('results', mockResults);
      fixture.componentRef.setInput('filters', new Set<DocSearchFilterKey>(['mutations']));
      fixture.detectChanges();

      const filtered = component.filteredResults();
      expect(filtered.length).toBe(1);
      expect(filtered[0]!.name).toBe('createUser');
    });

    it('should filter to show only subscriptions', () => {
      fixture.componentRef.setInput('results', mockResults);
      fixture.componentRef.setInput('filters', new Set<DocSearchFilterKey>(['subscriptions']));
      fixture.detectChanges();

      const filtered = component.filteredResults();
      expect(filtered.length).toBe(1);
      expect(filtered[0]!.name).toBe('userUpdated');
    });

    it('should filter to show only directives', () => {
      fixture.componentRef.setInput('results', mockResults);
      fixture.componentRef.setInput('filters', new Set<DocSearchFilterKey>(['directives']));
      fixture.detectChanges();

      const filtered = component.filteredResults();
      expect(filtered.length).toBe(1);
      expect(filtered[0]!.cat).toBe('directive');
      expect(filtered[0]!.name).toBe('@deprecated');
    });

    it('should filter to show multiple categories', () => {
      fixture.componentRef.setInput('results', mockResults);
      fixture.componentRef.setInput('filters', new Set<DocSearchFilterKey>(['types', 'directives']));
      fixture.detectChanges();

      const filtered = component.filteredResults();
      expect(filtered.length).toBe(2);
      expect(filtered.some(r => r.cat === 'type')).toBe(true);
      expect(filtered.some(r => r.cat === 'directive')).toBe(true);
    });

    it('should return empty array when results are empty', () => {
      fixture.componentRef.setInput('results', []);
      fixture.componentRef.setInput('filters', new Set<DocSearchFilterKey>(['types']));
      fixture.detectChanges();

      const filtered = component.filteredResults();
      expect(filtered.length).toBe(0);
    });
  });
});
