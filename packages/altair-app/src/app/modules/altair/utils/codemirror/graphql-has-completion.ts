// https://github.com/graphql/graphiql/blob/272e2371fc7715217739efd7817ce6343cb4fbec/src/utility/onHasCompletion.js

import { GraphQLList, GraphQLNonNull, GraphQLType } from 'graphql';
import marked from 'marked';

const renderType = (type: GraphQLType): string => {
  if (type instanceof GraphQLNonNull) {
    return `${renderType(type.ofType)}!`;
  }
  if (type instanceof GraphQLList) {
    return `[${renderType(type.ofType)}]`;
  }
  return `<a class="typeName">${marked(type.name)}</a>`;
};

/**
 * Render a custom UI for CodeMirror's hint which includes additional info
 * about the type and description for the selected context.
 */
export const onHasCompletion = (cm: CodeMirror.Editor, data: any, opts: any = {}) => {
  const CodeMirror = require('codemirror');
  const onHintInformationRender = opts.onHintInformationRender;
  const onClickHintInformation = opts.onClickHintInformation;

  let information: HTMLElement | null;
  let deprecation: HTMLElement | null;
  let fillAllFieldsOption: HTMLElement | null;

  // When a hint result is selected, we augment the UI with information.
  CodeMirror.on(data, 'select', (ctx: any, el: HTMLElement) => {

    let onClickHintInformationCb: Function | undefined = undefined;
    if (onClickHintInformation) {
      onClickHintInformationCb = () => onClickHintInformation(ctx.type);
    }
    // Only the first time (usually when the hint UI is first displayed)
    // do we create the information nodes.
    if (!information) {
      const hintsUl = el.parentNode;

      if (hintsUl) {
        // This "information" node will contain the additional info about the
        // highlighted typeahead option.
        information = document.createElement('div');
        information.className = 'CodeMirror-hint-information';
        hintsUl.appendChild(information);

        // This "deprecation" node will contain info about deprecated usage.
        deprecation = document.createElement('div');
        deprecation.className = 'CodeMirror-hint-deprecation';
        hintsUl.appendChild(deprecation);

        // This "fillAllFieldsOption" node will contain the fill all fields option.
        fillAllFieldsOption = document.createElement('div');
        fillAllFieldsOption.className = 'CodeMirror-hint-fill-all-fields';
        fillAllFieldsOption.innerHTML = `
          <span class="query-editor__autocomplete-item__text">Fill all fields</span>
          <span class="query-editor__autocomplete-item__shortcut">Ctrl+Shift+Enter</span>
        `.trim().replace(/ +/g, ' ');
        hintsUl.appendChild(fillAllFieldsOption);

        // When CodeMirror attempts to remove the hint UI, we detect that it was
        // removed and in turn remove the information nodes.
        let onRemoveFn: Function | undefined;
        hintsUl.addEventListener(
          'DOMNodeRemoved',
          (onRemoveFn = (event: Event) => {
            if (event.target === hintsUl) {
              if (information && onClickHintInformationCb) {
                information.removeEventListener('click', onClickHintInformationCb as any);
              }
              hintsUl.removeEventListener('DOMNodeRemoved', onRemoveFn as any);
              information = null;
              deprecation = null;
              fillAllFieldsOption = null;
              onRemoveFn = undefined;
            }
          }),
        );
      }
    }

    // Now that the UI has been set up, add info to information.
    const description = getDescriptionFromContext(ctx);
    const type = getTypeFromContext(ctx);

    if (information) {
      information.innerHTML =
        '<div class="content">' +
        (description.slice(0, 3) === '<p>'
          ? '<p>' + type + description.slice(3)
          : type + description) +
        '</div>';
    }

    if (ctx.isDeprecated) {
      const reason = ctx.deprecationReason
        ? marked(ctx.deprecationReason)
        : '';
      if (deprecation) {
        deprecation.innerHTML =
          '<span class="deprecation-label">Deprecated</span>' + reason;
        deprecation.style.display = 'block';
      }
    } else {
      if (deprecation) {
        deprecation.style.display = 'none';
      }
    }

    if (onClickHintInformationCb && information) {
      information.addEventListener('click', onClickHintInformationCb as any);
    }

    // Additional rendering?
    if (onHintInformationRender) {
      onHintInformationRender(information);
    }
  });
};
function getDescriptionFromContext(ctx: any) {
  const maxDescriptionLength = 70;

  let description = 'Self descriptive.';
  let appendEllipsis = false;

  if (ctx.description) {
    description = ctx.description;
  }
  if (ctx.type && ctx.type.description) {
    description = ctx.type.description;
  }

  if (description.length > maxDescriptionLength) {
    appendEllipsis = true;
  }

  return marked((`${description}`).substring(0, maxDescriptionLength) + (appendEllipsis ? '...' : ''));
}

function getTypeFromContext(ctx: any) {
  return ctx.type
    ? '<span class="infoType">' + renderType(ctx.type) + '</span>'
    : '';
}

