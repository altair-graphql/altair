import clsx from 'clsx';
import React from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}
interface TabsProps {
  tabs: Tab[];
  selectedTabId?: string;
}
export const Tabs: React.FC<TabsProps> = ({ tabs, selectedTabId }) => {
  const [selectedTab, setSelectedTab] = React.useState(selectedTabId ?? tabs[0]?.id);
  return (
    <div className="devtools-tabs-wrapper">
      <div className="devtools-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={clsx('devtools-tab', { selected: tab.id === selectedTab })}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="devtools-tab-content">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={clsx('devtools-tab-content-inner', {
              hidden: tab.id !== selectedTab,
            })}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};
