import React from 'react';
import './request-content.css';
import { Accordion } from '../accordion/accordion';
import { CodeSyntax } from '../code-syntax/code-syntax';
import { JSONViewer } from '../json-viewer/json-viewer';
import { Button } from '../button/button';
import { RequestContent } from '../../types';

interface RequestContentProps {
  content: RequestContent;
  onOpenInAltair: () => void;
}
export const RequestContentDetails: React.FC<RequestContentProps> = ({
  content,
  onOpenInAltair,
}) => {
  return (
    <div className="request-content-wrapper">
      <div className="request-content-actions">
        <Button onPress={() => onOpenInAltair()}>
          <img src="/icon.png" width={15} /> Open in Altair
        </Button>
      </div>
      <CodeSyntax
        code={content.query}
        language={`graphql`}
        style={{ borderRadius: '5px' }}
      />
      <Accordion
        sections={[
          {
            id: 'variables',
            title: 'Variables',
            content: <JSONViewer json={content.variables} />,
          },
        ]}
      />
    </div>
  );
};
