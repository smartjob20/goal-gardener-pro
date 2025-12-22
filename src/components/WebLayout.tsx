import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WebLayoutProps {
  children: ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <main 
      className={`min-h-screen bg-background ${
        isMobile 
          ? 'pt-16 pb-20' // Mobile: space for header and bottom nav
          : 'pt-20 pb-8'  // Desktop: space for header only
      }`}
    >
      <div className={isMobile ? 'px-4' : 'web-container'}>
        {children}
      </div>
    </main>
  );
}
