import React, { createContext, useContext } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className, children }) => {
  return <div className={`bg-gray-100 p-1 rounded-lg ${className}`}>{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
  const tabs = useContext(TabsContext);
  
  if (!tabs) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const isActive = tabs.value === value;
  
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
        isActive
          ? 'bg-white text-blue-600 shadow-sm'
          : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
      }`}
      onClick={() => tabs.onValueChange(value)}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children }) => {
  const tabs = useContext(TabsContext);
  
  if (!tabs) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  if (tabs.value !== value) {
    return null;
  }
  
  return <div className="animate-fadeIn">{children}</div>;
};

Tabs.displayName = 'Tabs';
TabsList.displayName = 'TabsList';
TabsTrigger.displayName = 'TabsTrigger';
TabsContent.displayName = 'TabsContent';

export { TabsContext };
