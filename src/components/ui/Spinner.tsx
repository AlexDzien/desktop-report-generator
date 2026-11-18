interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Spinner({ size = "md", text }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} border-2 border-border border-t-accent rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-text-secondary mt-3">{text}</p>
      )}
    </div>
  );
}
