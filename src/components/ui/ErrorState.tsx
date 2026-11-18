interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Wystąpił błąd",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">⚠️</span>
      <h3 className="text-lg font-medium text-error mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-sm">
          Spróbuj ponownie
        </button>
      )}
    </div>
  );
}
