import { JSONTree } from 'react-json-tree';
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import theme from 'react-base16-styling//lib/themes/google';

interface JSONViewerProps {
  json: unknown;
}
export const JSONViewer: React.FC<JSONViewerProps> = ({ json }) => {
  return (
    <>
      {/* <JSONTree
        data={json}
        theme={{ extend: theme }}
        hideRoot={false}
        shouldExpandNodeInitially={() => true}
      /> */}
      <JsonView
        data={json as object}
        shouldExpandNode={allExpanded}
        style={{ ...darkStyles, container: 'var(--background)' }}
      />
    </>
  );
};
