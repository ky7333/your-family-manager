import { forwardRef } from 'react';
import { TextInput, type TextInputProps, useColorScheme } from 'react-native';

import { cn } from '../../lib/utils';

type InputProps = TextInputProps & { className?: string };

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { className, placeholderTextColor, ...props },
  ref,
) {
  const colorScheme = useColorScheme();

  return (
    <TextInput
      ref={ref}
      className={cn(
        'h-10 rounded-md border border-zinc-300 bg-white px-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
        className,
      )}
      placeholderTextColor={
        placeholderTextColor ?? (colorScheme === 'dark' ? '#a1a1aa' : '#71717a')
      }
      {...props}
    />
  );
});
