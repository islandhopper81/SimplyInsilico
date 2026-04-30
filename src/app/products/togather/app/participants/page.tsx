import NavigationGuard from '@/components/togather/NavigationGuard';

export default function ParticipantsPage() {
  return (
    <NavigationGuard require="session">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-muted-foreground text-sm">Participant entry — coming in SIM-47.</p>
      </div>
    </NavigationGuard>
  );
}
