/**
 * Mock shadcn UI components that use Radix UI primitives.
 * Avoids React 18/19 version conflicts in the monorepo test env.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

// Dialog mock — renders children when open
export const Dialog = ({ open, onOpenChange, children }: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) => (open ? <div role="dialog" data-state="open">{children}</div> : null);

export const DialogContent = ({ children, ...props }: React.ComponentProps<'div'>) => (
  <div {...props}>{children}</div>
);

export const DialogHeader = ({ children, ...props }: React.ComponentProps<'div'>) => (
  <div {...props}>{children}</div>
);

export const DialogTitle = ({ children, ...props }: React.ComponentProps<'h2'>) => (
  <h2 {...props}>{children}</h2>
);

export const DialogFooter = ({ children, ...props }: React.ComponentProps<'div'>) => (
  <div {...props}>{children}</div>
);

export const DialogDescription = ({ children, ...props }: React.ComponentProps<'p'>) => (
  <p {...props}>{children}</p>
);

export const DialogTrigger = ({ children, ...props }: React.ComponentProps<'button'>) => (
  <button {...props}>{children}</button>
);

export const DialogClose = ({ children, ...props }: React.ComponentProps<'button'>) => (
  <button {...props}>{children}</button>
);

export const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DialogOverlay = () => null;

// Select mock — simplified
export const Select = ({ children, value, onValueChange }: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) => <div data-value={value}>{children}</div>;

export const SelectTrigger = ({ children, ...props }: React.ComponentProps<'button'>) => (
  <button {...props}>{children}</button>
);
export const SelectValue = ({ children, placeholder }: {
  children?: React.ReactNode;
  placeholder?: string;
}) => <span>{children || placeholder}</span>;

export const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);
export const SelectItem = ({ children, value }: {
  children: React.ReactNode;
  value: string;
}) => <div data-value={value}>{children}</div>;

// Popover mock
export const Popover = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const PopoverTrigger = ({ children, asChild, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) => (
  asChild ? <>{children}</> : <button {...props}>{children}</button>
);
export const PopoverContent = ({ children }: React.ComponentProps<'div'>) => (
  <div>{children}</div>
);

// Calendar mock
export const Calendar = () => <div data-testid="calendar" />;

// Switch mock
export const Switch = ({ id, checked, onCheckedChange, ...props }: {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & React.ComponentProps<'button'>) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange?.(!checked)}
    {...props}
  />
);

// Checkbox mock
export const Checkbox = ({ checked, onCheckedChange, ...props }: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & React.ComponentProps<'button'>) => (
  <button
    role="checkbox"
    aria-checked={checked}
    onClick={() => onCheckedChange?.(!checked)}
    {...props}
  />
);

// Button mock — avoids @radix-ui/react-slot (React 18/19 conflict)
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean; variant?: string; size?: string }
>(({ asChild, variant, size, ...props }, ref) => (
  <button ref={ref} data-variant={variant} data-size={size} {...props} />
));
Button.displayName = 'Button';

export const buttonVariants = () => '';

// Label mock — avoids @radix-ui/react-label
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<'label'>
>(({ ...props }, ref) => (
  <label ref={ref} {...props} />
));
Label.displayName = 'Label';

// Input mock
export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ ...props }, ref) => (
  <input ref={ref} {...props} />
));
Input.displayName = 'Input';

// Textarea mock
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ ...props }, ref) => (
  <textarea ref={ref} {...props} />
));
Textarea.displayName = 'Textarea';
