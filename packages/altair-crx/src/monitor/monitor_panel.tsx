import React from 'react';
import ReactDOM from 'react-dom/client';
import './ui.css';
import { TableList } from '../components/table-list/table-list';
import { useGraphQLRequests } from '../hooks/requests/use-requests';
import { Shell } from '../components/shell/shell';

const MonitorPanel: React.FC = () => {
  const { requests } = useGraphQLRequests();

  return (
    <Shell>
      {/* Filter */}
      <TableList requests={requests} />
    </Shell>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MonitorPanel />
  </React.StrictMode>
);
