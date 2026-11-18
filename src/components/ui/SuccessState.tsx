interface SuccessStateProps {
  title?: string;
  message: string;
  actions?: React.ReactNode;
}

export function SuccessState({
  title = "Gotowe",
  message,
  actions,
}: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">✅</span>
      <h3 className="text-lg font-medium text-success mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-4">{message}</p>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
