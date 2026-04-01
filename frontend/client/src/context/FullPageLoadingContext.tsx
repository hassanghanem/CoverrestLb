

import StaticFullPageSpinner from '@/components/StaticFullPageSpinner';
import  { createContext, useContext, useState, ReactNode } from 'react';

interface FullPageLoadingContextType {
  FullPageloading: boolean;
  setFullPageLoading: (value: boolean) => void;
}

const FullPageLoadingContext = createContext<FullPageLoadingContextType | undefined>(undefined);

export const FullPageLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [FullPageloading, setFullPageLoading] = useState(false);

  return (
    <FullPageLoadingContext.Provider value={{ FullPageloading, setFullPageLoading }}>
      {children}
      {FullPageloading &&  <StaticFullPageSpinner />} 
    </FullPageLoadingContext.Provider>
  );
};

export const useFullPageLoading = () => {
  const context = useContext(FullPageLoadingContext);
  if (!context) throw new Error('useFullPageLoading must be used within a FullPageLoadingProvider');
  return context;
};
