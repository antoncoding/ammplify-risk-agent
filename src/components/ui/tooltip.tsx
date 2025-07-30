import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { GoQuestion } from 'react-icons/go';

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  className?: string;
};

type TooltipTriggerProps = {
  children: ReactNode;
  asChild?: boolean;
};

type TooltipContentProps = {
  children: ReactNode;
  className?: string;
};

// Custom tooltip component using CSS hover states with smart positioning
function Tooltip({ children, content, icon, className = '' }: TooltipProps) {
  const defaultIcon = <GoQuestion className="h-4 w-4" />;
  const tooltipIcon = icon ?? defaultIcon;
  const triggerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');

  useEffect(() => {
    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementTop = rect.top;
        
        // If element is in the top half of the viewport, show tooltip below
        // If element is in the bottom half, show tooltip above
        if (elementTop < viewportHeight / 2) {
          setPosition('bottom');
        } else {
          setPosition('top');
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  return (
    <div ref={triggerRef} className={`relative group ${className}`}>
      {children}
      <div className={`absolute left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      }`}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">
              {tooltipIcon}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {content}
            </div>
          </div>
          {/* Arrow pointing in the correct direction */}
          <div className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
            position === 'top' 
              ? 'top-full border-t-4 border-t-white dark:border-t-gray-800' 
              : 'bottom-full border-b-4 border-b-white dark:border-b-gray-800'
          }`}></div>
        </div>
      </div>
    </div>
  );
}

// TooltipTrigger is just a wrapper for the trigger element
function TooltipTrigger({ children, asChild }: TooltipTriggerProps) {
  if (asChild) {
    return <>{children}</>;
  }
  return <span>{children}</span>;
}

// TooltipContent is just a wrapper for the content
function TooltipContent({ children, className = '' }: TooltipContentProps) {
  return <div className={className}>{children}</div>;
}

// TooltipProvider is no longer needed but kept for compatibility
function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
