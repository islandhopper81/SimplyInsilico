import NavigationGuard from '@/components/togather/NavigationGuard';

export default function GroupsPage() {
  return (
    <NavigationGuard require="participants">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-muted-foreground text-sm">Group formation view — coming in SIM-55 / SIM-56.</p>
      </div>
    </NavigationGuard>
  );
}
