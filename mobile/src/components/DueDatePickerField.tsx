import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, Text, View, useColorScheme } from 'react-native';

import { formatDateToApiValue, parseApiDateValue } from '../lib/date';
import { Button } from './ui/button';

interface DueDatePickerFieldProps {
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
}

export default function DueDatePickerField({
  value,
  onChange,
  disabled,
}: DueDatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const colorScheme = useColorScheme();

  const parsedValue = useMemo(() => parseApiDateValue(value), [value]);
  const pickerValue = parsedValue ?? new Date();

  const openPicker = () => {
    if (disabled) {
      return;
    }

    if (!parsedValue) {
      onChange(formatDateToApiValue(new Date()));
    }

    setShowPicker(true);
  };

  const handlePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    onChange(formatDateToApiValue(selectedDate));
  };

  return (
    <View className="gap-2">
      <Text className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Due date</Text>

      <View className="flex-row items-center gap-2">
        <Pressable
          className={`flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 ${
            disabled ? 'opacity-60' : ''
          }`}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Open due date picker"
          onPress={openPicker}
        >
          <Text className={value ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}>
            {value || 'No due date selected'}
          </Text>
        </Pressable>

        {value ? (
          <Button
            label="x"
            size="sm"
            variant="outline"
            className="h-10 w-10 px-0"
            disabled={disabled}
            accessibilityLabel="Clear due date"
            onPress={() => {
              onChange('');
              setShowPicker(false);
            }}
          />
        ) : null}
      </View>

      {showPicker ? (
        <View className="rounded-md border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
          <DateTimePicker
            value={pickerValue}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
            style={
              Platform.OS === 'ios'
                ? {
                    height: 180,
                    alignSelf: 'stretch',
                    backgroundColor: colorScheme === 'dark' ? '#27272a' : '#ffffff',
                  }
                : undefined
            }
            onChange={handlePickerChange}
          />
          {Platform.OS === 'ios' ? (
            <Button
              label="Done"
              size="sm"
              variant="outline"
              className="mt-2 self-end"
              onPress={() => setShowPicker(false)}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
