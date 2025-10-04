import { mount } from '../../../../../testing';
import { DocViewerDirectiveComponent } from './doc-viewer-directive.component';
import { GraphQLDirective, DirectiveLocation, GraphQLString, GraphQLInt } from 'graphql';

describe('DocViewerDirectiveComponent', () => {
  let wrapper: ReturnType<typeof mount<DocViewerDirectiveComponent>>;

  const mockDirective = new GraphQLDirective({
    name: 'testDirective',
    description: 'A test directive',
    locations: [DirectiveLocation.FIELD, DirectiveLocation.FRAGMENT_SPREAD],
    args: {
      arg1: {
        type: GraphQLString,
        description: 'First argument',
      },
      arg2: {
        type: GraphQLInt,
        defaultValue: 42,
        description: 'Second argument with default',
      },
    },
    isRepeatable: false,
  });

  beforeEach(() => {
    wrapper = mount(DocViewerDirectiveComponent, {
      props: {
        data: mockDirective,
      },
    });
  });

  it('should display directive name', () => {
    expect(wrapper.html()).toContain('@testDirective');
  });

  it('should display directive description', () => {
    expect(wrapper.html()).toContain('A test directive');
  });

  it('should display directive locations', () => {
    const html = wrapper.html();
    expect(html).toContain('FIELD | FRAGMENT_SPREAD');
  });

  it('should display arguments', () => {
    const html = wrapper.html();
    expect(html).toContain('arg1');
    expect(html).toContain('arg2');
  });

  it('should display default values for arguments', () => {
    const html = wrapper.html();
    expect(html).toContain('42');
  });

  it('should emit goToTypeChange when clicking on argument type', () => {
    const component = wrapper.componentInstance;
    component.goToType('String');
    
    expect(wrapper.emitted().goToTypeChange).toBeTruthy();
    expect(wrapper.emitted().goToTypeChange[0]).toEqual([{ name: 'String' }]);
  });

  it('should display repeatable indicator for repeatable directives', () => {
    const repeatableDirective = new GraphQLDirective({
      name: 'repeatableDirective',
      description: 'A repeatable directive',
      locations: [DirectiveLocation.FIELD],
      isRepeatable: true,
    });

    wrapper = mount(DocViewerDirectiveComponent, {
      props: {
        data: repeatableDirective,
      },
    });

    expect(wrapper.html()).toContain('Repeatable');
  });

  it('should not display repeatable indicator for non-repeatable directives', () => {
    expect(wrapper.html()).not.toContain('Repeatable');
  });

  it('should handle directive with no arguments', () => {
    const noArgsDirective = new GraphQLDirective({
      name: 'noArgsDirective',
      description: 'A directive with no arguments',
      locations: [DirectiveLocation.FIELD],
      isRepeatable: false,
    });

    wrapper = mount(DocViewerDirectiveComponent, {
      props: {
        data: noArgsDirective,
      },
    });

    const html = wrapper.html();
    expect(html).toContain('@noArgsDirective');
    expect(html).not.toContain('Arguments');
  });
});
