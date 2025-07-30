import React from 'react';
import { Button } from './ui/button';
import { Badge } from './common/Badge';

export function ThemeTest() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Theme System Test</h1>
      
      {/* shadcn/ui Components */}
      <div className="w-full max-w-md p-6 bg-card border border-border rounded-lg">
        <h2 className="text-xl  text-card-foreground mb-2">shadcn/ui Components</h2>
        <p className="text-muted-foreground mb-4">This card uses shadcn/ui styling</p>
        <div className="space-y-2">
          <Button variant="default">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </div>

      {/* Custom utility classes */}
      <div className="space-y-4">
        <h2 className="text-xl ">Custom Utility Classes</h2>
        <div className="p-4 bg-card rounded-lg">
          <p className="text-primary">This uses .bg-card and .text-primary</p>
        </div>
        <div className="p-4 bg-main rounded-lg">
          <p className="text-secondary">This uses .bg-main and .text-secondary</p>
        </div>
        <div className="p-4 bg-hovered rounded-lg">
          <p>This uses .bg-hovered</p>
        </div>
      </div>

      {/* Tailwind classes */}
      <div className="space-y-4">
        <h2 className="text-xl ">Direct Tailwind Classes</h2>
        <div className="p-4 bg-background border border-border rounded-lg">
          <p className="text-foreground">Background + Border + Foreground</p>
        </div>
        <div className="p-4 bg-card rounded-lg">
          <p className="text-card-foreground">Card background + Card foreground</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-muted-foreground">Muted background + Muted foreground</p>
        </div>
      </div>

      {/* Custom components */}
      <div className="space-y-4">
        <h2 className="text-xl ">Custom Components</h2>
        <Badge>Custom Badge Component</Badge>
      </div>

      {/* Color palette test */}
      <div className="space-y-4">
        <h2 className="text-xl ">Color Palette Test</h2>
        <div className="grid grid-cols-5 gap-2">
          <div className="h-12 bg-chart-1 rounded"></div>
          <div className="h-12 bg-chart-2 rounded"></div>
          <div className="h-12 bg-chart-3 rounded"></div>
          <div className="h-12 bg-chart-4 rounded"></div>
          <div className="h-12 bg-chart-5 rounded"></div>
        </div>
      </div>
    </div>
  );
}; 