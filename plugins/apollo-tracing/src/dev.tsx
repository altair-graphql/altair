import React from 'react';
import ReactDOM from 'react-dom/client';
import Tracing, { TracingProps } from './components/Tracing/Tracing';

const tracingProps: TracingProps = {
  tracing: {
    version: 1,
    startTime: '2025-05-26T14:51:01.758Z',
    endTime: '2025-05-26T14:51:02.304Z',
    duration: 545602375,
    execution: {
      resolvers: [
        {
          path: ['bye'],
          parentType: 'Query',
          fieldName: 'bye',
          returnType: 'Boolean',
          startOffset: 1403792,
          duration: 133625,
        },
        {
          path: ['GOTBooks'],
          parentType: 'Query',
          fieldName: 'GOTBooks',
          returnType: '[GOTBook]',
          startOffset: 1785875,
          duration: 543203834,
        },
      ],
    },
  },
  startTime: 1748271061758, // in ms
  endTime: 1748271062304, // in ms
};
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Tracing {...tracingProps} />
  </React.StrictMode>
);
