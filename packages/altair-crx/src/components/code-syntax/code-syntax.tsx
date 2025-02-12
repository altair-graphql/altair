import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeSyntaxProps {
  code: string;
  language: string;
  style?: React.CSSProperties;
}
export const CodeSyntax: React.FC<CodeSyntaxProps> = ({ code, language, style }) => {
  return (
    <SyntaxHighlighter
      PreTag="div"
      customStyle={{ margin: 0, ...style }}
      children={code}
      language={language}
      style={darcula}
    />
  );
};
