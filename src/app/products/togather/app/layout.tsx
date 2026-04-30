import type { Metadata } from 'next';
import AppTopBar from '@/components/togather/AppTopBar';
import AppStepper from '@/components/togather/AppStepper';

export const metadata: Metadata = {
  title: 'Togather — Group Formation Tool',
};

export default function TogatherAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <AppTopBar />
      <AppStepper />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
