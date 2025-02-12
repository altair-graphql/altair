import React, { PropsWithChildren } from 'react';

export const Shell: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="devtools-wrapper">
      <div className="devtools-content">{children}</div>
    </div>
  );
};
