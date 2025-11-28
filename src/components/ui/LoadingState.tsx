interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Kraunama...",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-8 ${className}`}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
