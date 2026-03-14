import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable, type PressableProps, Text } from 'react-native';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-zinc-900 dark:bg-zinc-700',
        secondary: 'bg-zinc-200 dark:bg-zinc-800',
        outline: 'border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900',
        destructive: 'bg-red-600',
        ghost: 'bg-transparent',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3',
        lg: 'h-12 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const buttonTextVariants = cva('text-sm font-semibold', {
  variants: {
    variant: {
      default: 'text-white dark:text-zinc-100',
      secondary: 'text-zinc-900 dark:text-zinc-100',
      outline: 'text-zinc-900 dark:text-zinc-100',
      destructive: 'text-white',
      ghost: 'text-zinc-900 dark:text-zinc-100',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    textClassName?: string;
    className?: string;
    label: string;
  };

export function Button({
  className,
  textClassName,
  variant,
  size,
  disabled,
  label,
  accessibilityLabel,
  accessibilityRole,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size }),
        disabled && 'opacity-50',
        className,
      )}
      disabled={disabled}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityLabel={accessibilityLabel ?? label}
      {...props}
    >
      <Text className={cn(buttonTextVariants({ variant }), textClassName)}>{label}</Text>
    </Pressable>
  );
}
