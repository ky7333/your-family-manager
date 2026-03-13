import type { PropsWithChildren } from 'react';
import { Text, View, type TextProps, type ViewProps } from 'react-native';

import { cn } from '../../lib/utils';

type CardProps = ViewProps & { className?: string };
type CardTextProps = TextProps & { className?: string };

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900', className)}
      {...props}
    />
  );
}

export function CardHeader({ children, className, ...props }: PropsWithChildren<CardProps>) {
  return (
    <View className={cn('mb-3', className)} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ className, ...props }: CardTextProps) {
  return <Text className={cn('text-lg font-semibold text-zinc-900 dark:text-zinc-100', className)} {...props} />;
}

export function CardDescription({ className, ...props }: CardTextProps) {
  return <Text className={cn('text-sm text-zinc-600 dark:text-zinc-300', className)} {...props} />;
}
