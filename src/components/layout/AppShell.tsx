import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomBar } from './MobileBottomBar';
import { isMobile } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileView, setIsMobileView] = useState(isMobile());

  useEffect(() => {
    const handleResize = () => setIsMobileView(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      {!isMobileView && <DesktopSidebar />}
      
      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        {/* Header will go here */}
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-20 md:pb-4">
          {children}
        </main>

        {isMobileView && <MobileBottomBar />}
      </div>
    </div>
  );
}
