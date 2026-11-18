interface BadgeProps {
  variant: "success" | "warning" | "error" | "info" | "neutral";
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`badge-${variant}`}>
      {children}
    </span>
  );
}
