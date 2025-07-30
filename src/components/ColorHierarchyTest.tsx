import React from 'react';
import { Button } from './ui/button';

export function ColorHierarchyTest() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Color Hierarchy Test</h1>
      
      {/* Background Hierarchy */}
      <div className="space-y-4">
        <h2 className="text-xl">Background Color Hierarchy</h2>
        <div className="space-y-4">
          <div className="p-6 bg-background border border-border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Background (bg-background)</h3>
            <p className="text-foreground">This is the main background color - pure white in light mode</p>
          </div>
          
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Card (bg-card)</h3>
            <p className="text-card-foreground">This is the card background - very light grey in light mode for subtle elevation</p>
          </div>
          
          <div className="p-6 bg-muted border border-border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Muted (bg-muted)</h3>
            <p className="text-muted-foreground">This is the muted background - even lighter grey for subtle backgrounds</p>
          </div>
          
          <div className="p-6 bg-secondary border border-border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Secondary (bg-secondary)</h3>
            <p className="text-secondary-foreground">This is the secondary background - light grey</p>
          </div>
        </div>
      </div>

      {/* Component Examples */}
      <div className="space-y-4">
        <h2 className="text-xl">Component Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-card rounded-lg border border-border">
            <h3 className="font-medium mb-2">Card Component</h3>
            <p className="text-sm text-muted-foreground mb-4">This demonstrates how cards should look with proper elevation</p>
            <Button variant="default">Primary Action</Button>
          </div>
          
          <div className="p-4 bg-muted rounded-lg border border-border">
            <h3 className="font-medium mb-2">Muted Component</h3>
            <p className="text-sm text-muted-foreground mb-4">This shows muted backgrounds for subtle sections</p>
            <Button variant="secondary">Secondary Action</Button>
          </div>
        </div>
      </div>

      {/* Button Variants */}
      <div className="space-y-4">
        <h2 className="text-xl ">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>

      {/* Text Colors */}
      <div className="space-y-4">
        <h2 className="text-xl ">Text Color Hierarchy</h2>
        <div className="space-y-2">
          <p className="text-foreground">Foreground text - main text color</p>
          <p className="text-muted-foreground">Muted foreground - secondary text color</p>
          <p className="text-card-foreground">Card foreground - text on cards</p>
          <p className="text-primary">Primary text - for emphasis</p>
        </div>
      </div>

      {/* Border Examples */}
      <div className="space-y-4">
        <h2 className="text-xl ">Border Examples</h2>
        <div className="space-y-2">
          <div className="p-4 border border-border rounded">Border example</div>
          <div className="p-4 border-2 border-primary rounded">Primary border</div>
          <div className="p-4 border border-destructive rounded">Destructive border</div>
        </div>
      </div>
    </div>
  );
}; 