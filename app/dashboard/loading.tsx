import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3 animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
      <p className="text-sm text-surface-500">Loading...</p>
    </div>
  );
}
