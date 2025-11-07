import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppSelector } from '@/store/hooks';
import { selectSidebarCollapsed } from '@/store/selectors';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isSidebarCollapsed = useAppSelector(selectSidebarCollapsed);
  
  return (
    <div className="flex h-screen overflow-y-hidden overflow-x-auto md:overflow-hidden">
      <Sidebar />
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden",
        !isSidebarCollapsed ? "md:min-w-0 min-w-[512px]" : "min-w-0"
      )}>
        <Header />
        <main className={cn(
          "flex-1 overflow-y-auto p-6",
          !isSidebarCollapsed ? "md:min-w-0 min-w-[512px]" : "min-w-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}





