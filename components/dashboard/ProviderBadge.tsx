interface ProviderBadgeProps {
  provider: string;
  show?: boolean;
}

export default function ProviderBadge({ provider, show = true }: ProviderBadgeProps) {
  if (!show || !provider) return null;
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-surface-500 whitespace-nowrap">
      Powered by {provider}
    </span>
  );
}
