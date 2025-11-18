interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Kraunama...",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`text-center py-8 text-muted-foreground ${className}`}>
      {message}
    </div>
  );
}

