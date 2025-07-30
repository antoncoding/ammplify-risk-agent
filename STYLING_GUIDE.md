# Styling Guide

Quick guide to use components and styling patterns in your project.

## 📦 Install Components

Add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

**Common components:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tooltip
```

## 🎨 Use Components

### Basic Usage
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Buttons
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Cards
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Component Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

## 🎨 Color Classes

### Background Colors
```tsx
<div className="bg-background">     {/* Main background */}
<div className="bg-card">           {/* Card background */}
<div className="bg-muted">          {/* Subtle background */}
<div className="bg-secondary">      {/* Secondary background */}
<div className="bg-primary">        {/* Primary brand color */}
```

### Text Colors
```tsx
<p className="text-foreground">     {/* Main text */}
<p className="text-card-foreground"> {/* Text on cards */}
<p className="text-muted-foreground"> {/* Secondary text */}
<p className="text-primary-foreground"> {/* Text on primary */}
```

### Always Use Pairs
```tsx
<div className="bg-primary text-primary-foreground">
<div className="bg-card text-card-foreground">
<div className="bg-muted text-muted-foreground">
```

## 🎨 Layout Patterns

### Page Layout
```tsx
export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### Form Layout
```tsx
export function FormSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Label</label>
        <input className="
          flex h-10 w-full rounded-md border border-input 
          bg-background px-3 py-2 text-sm 
          focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2
        " />
      </div>
    </div>
  );
}
```

### Responsive Design
```tsx
<div className="
  p-4                    {/* Mobile: 16px */}
  md:p-6                 {/* Medium+: 24px */}
  lg:p-8                 {/* Large+: 32px */}
">
  <div className="
    grid grid-cols-1     {/* Mobile: 1 column */}
    md:grid-cols-2       {/* Medium+: 2 columns */}
    lg:grid-cols-3       {/* Large+: 3 columns */}
    gap-4
  ">
    {/* Content */}
  </div>
</div>
```

## 🎨 Custom Components

### Create Wrapper Components
```tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IconButtonProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function IconButton({ 
  icon, 
  children, 
  variant = "default",
  className 
}: IconButtonProps) {
  return (
    <Button 
      variant={variant}
      className={cn("flex items-center gap-2", className)}
    >
      {icon}
      {children}
    </Button>
  );
}
```

## 🎨 Common Patterns

### Action Bar
```tsx
export function ActionBar() {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg">Actions</h3>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Secondary</Button>
          <Button variant="default" size="sm">Primary</Button>
        </div>
      </div>
    </div>
  );
}
```

### Data Table
```tsx
export function DataTable() {
  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg">Data</h3>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {/* Table rows */}
          <div className="flex justify-between items-center p-2 hover:bg-muted rounded">
            <span>Item 1</span>
            <Button variant="ghost" size="sm">Action</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 📁 Component Locations

- `src/components/ui/` - shadcn/ui components
- `src/components/common/` - Custom shared components
- `src/components/layout/` - Layout components like Header

## 🧪 Test Your Styles

```tsx
import { ThemeTest } from './components/ThemeTest';
import { ColorHierarchyTest } from './components/ColorHierarchyTest';

// Add to any page to test
<ThemeTest />
<ColorHierarchyTest />
```

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Theme Guide](./THEME_GUIDE.md) - Customize colors and fonts 