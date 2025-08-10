import { Address } from 'viem';

type AvatarProps = {
  address?: Address;
  size?: number;
  className?: string;
};

export function Avatar({ address, size = 32, className = '' }: AvatarProps) {
  if (!address) {
    return (
      <div 
        className={`rounded-full bg-muted flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-muted-foreground text-xs">?</span>
      </div>
    );
  }

  // Simple avatar using first and last 2 characters of address
  const initials = `${address.slice(2, 4)}${address.slice(-2)}`.toUpperCase();
  
  return (
    <div 
      className={`rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-primary text-xs font-mono">
        {initials}
      </span>
    </div>
  );
}