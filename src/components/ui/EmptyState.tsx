interface EmptyStateProps {
  message?: string;
  className?: string;
}

export function EmptyState({
  message = "Rezultatų nėra.",
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`h-24 text-center ${className}`}>
      {message}
    </div>
  );
}

