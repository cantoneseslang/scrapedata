import React, { useState } from 'react';

type TabItem = {
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  className?: string;
};

export const Tabs: React.FC<TabsProps> = ({ tabs, className = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                index === activeIndex
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-2">{tabs[activeIndex].content}</div>
    </div>
  );
};