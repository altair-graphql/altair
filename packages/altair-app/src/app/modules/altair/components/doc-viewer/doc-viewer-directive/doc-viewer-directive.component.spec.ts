import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../modules/shared/shared.module';
import { DocViewerDirectiveComponent } from './doc-viewer-directive.component';
import { GraphQLDirective, GraphQLArgument, DirectiveLocation } from 'graphql';

describe('DocViewerDirectiveComponent', () => {
  let component: DocViewerDirectiveComponent;
  let fixture: ComponentFixture<DocViewerDirectiveComponent>;

  const mockArg = {
    name: 'testArg',
    defaultValue: 'defaultVal',
    type: { inspect: () => 'String' },
  } as unknown as GraphQLArgument;

  const mockDirective = new GraphQLDirective({
    name: 'testDirective',
    locations: [DirectiveLocation.FIELD, DirectiveLocation.QUERY],
    args: { testArg: { type: {} as any, defaultValue: 'defaultVal' } },
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DocViewerDirectiveComponent],
      imports: [TranslateModule.forRoot(), SharedModule],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocViewerDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goToType', () => {
    it('should emit the type name', () => {
      const spy = jest.fn();
      component.goToTypeChange.subscribe(spy);

      component.goToType('String');

      expect(spy).toHaveBeenCalledWith({ name: 'String' });
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('argTrackBy', () => {
    it('should return the arg name', () => {
      const result = component.argTrackBy(0, mockArg);
      expect(result).toBe('testArg');
    });
  });

  describe('getDefaultValue', () => {
    it('should return JSON stringified default value when defined', () => {
      const result = component.getDefaultValue(mockArg);
      expect(result).toBe('"defaultVal"');
    });

    it('should return undefined when defaultValue is undefined', () => {
      const argWithNoDefault = { ...mockArg, defaultValue: undefined } as unknown as GraphQLArgument;
      const result = component.getDefaultValue(argWithNoDefault);
      expect(result).toBeUndefined();
    });
  });

  describe('getLocations', () => {
    it('should return empty string when directive is undefined', () => {
      const result = component.getLocations(undefined);
      expect(result).toBe('');
    });

    it('should return joined locations string when directive is defined', () => {
      const result = component.getLocations(mockDirective);
      expect(result).toBe('FIELD | QUERY');
    });
  });
});