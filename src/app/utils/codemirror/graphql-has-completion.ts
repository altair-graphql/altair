// https://github.com/graphql/graphiql/blob/272e2371fc7715217739efd7817ce6343cb4fbec/src/utility/onHasCompletion.js

import { GraphQLList, GraphQLNonNull } from 'graphql';
import * as marked from 'marked';

const renderType = (type) => {
  if (type instanceof GraphQLNonNull) {
    return `${renderType(type.ofType)}!`;
  }
  if (type instanceof GraphQLList) {
    return `[${renderType(type.ofType)}]`;
  }
  return `<a class="typeName">${type.name}</a>`;
};

/**
 * Render a custom UI for CodeMirror's hint which includes additional info
 * about the type and description for the selected context.
 */
export const onHasCompletion = (cm, data, { onHintInformationRender = null, onClickHintInformation = null } = {}) => {
  const CodeMirror = require('codemirror');

  let information: HTMLElement;
  let deprecation: HTMLElement;
  let fillAllFieldsOption: HTMLElement;

  // When a hint result is selected, we augment the UI with information.
  CodeMirror.on(data, 'select', (ctx, el) => {

    let onClickHintInformationCb;
    if (onClickHintInformation) {
      onClickHintInformationCb = () => onClickHintInformation(ctx.type);
    }
    // Only the first time (usually when the hint UI is first displayed)
    // do we create the information nodes.
    if (!information) {
      const hintsUl = el.parentNode;

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
      let onRemoveFn;
      hintsUl.addEventListener(
        'DOMNodeRemoved',
        (onRemoveFn = event => {
          if (event.target === hintsUl) {
            if (information && onClickHintInformationCb) {
              information.removeEventListener('click', onClickHintInformationCb);
            }
            hintsUl.removeEventListener('DOMNodeRemoved', onRemoveFn);
            information = null;
            deprecation = null;
            fillAllFieldsOption = null;
            onRemoveFn = null;
          }
        }),
      );
    }

    // Now that the UI has been set up, add info to information.
    const description = ctx.description
      ? marked(ctx.description)
      : ctx.type && ctx.type.description
        ? marked(ctx.type.description) : 'Self descriptive.';
    const type = ctx.type
      ? '<span class="infoType">' + renderType(ctx.type) + '</span>'
      : '';

    information.innerHTML =
      '<div class="content">' +
      (description.slice(0, 3) === '<p>'
        ? '<p>' + type + description.slice(3)
        : type + description) +
      '</div>';

    if (ctx.isDeprecated) {
      const reason = ctx.deprecationReason
        ? marked(ctx.deprecationReason)
        : '';
      deprecation.innerHTML =
        '<span class="deprecation-label">Deprecated</span>' + reason;
      deprecation.style.display = 'block';
    } else {
      deprecation.style.display = 'none';
    }

    if (onClickHintInformationCb) {
      information.addEventListener('click', onClickHintInformationCb);
    }

    // Additional rendering?
    if (onHintInformationRender) {
      onHintInformationRender(information);
    }
  });
};
