import React from 'react';
import { CodeSyntax } from '../code-syntax/code-syntax';
import { JSONViewer } from '../json-viewer/json-viewer';
import { parseJson } from '../../helpers/json';
import { Button } from '../button/button';
import copy from 'copy-to-clipboard';
import './response-content.css';

interface ResponseContentProps {
  response: unknown;
}
export const ResponseContentDetails: React.FC<ResponseContentProps> = ({
  response,
}) => {
  const json = parseJson(response as string);

  return (
    <div className="p-3">
      <div className="response-content-actions">
        <Button onPress={() => copy(response as string)}>Copy</Button>
      </div>
      {!json ? (
        <CodeSyntax code={response as string} language={`json`} />
      ) : (
        <JSONViewer json={json} />
      )}
    </div>
  );
};
