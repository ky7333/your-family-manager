import { ScrollView, Text, View } from 'react-native';

import { Button } from './ui/button';
import { Input } from './ui/input';
import type { UserSearchResult } from '../types/user';

interface MemberPickerProps {
  title: string;
  placeholder: string;
  query: string;
  selectedUsernames: string[];
  searchResults: UserSearchResult[];
  searching: boolean;
  disabled?: boolean;
  onQueryChange: (value: string) => void;
  onAdd: (username: string) => void;
  onRemove: (username: string) => void;
}

export default function MemberPicker({
  title,
  placeholder,
  query,
  selectedUsernames,
  searchResults,
  searching,
  disabled,
  onQueryChange,
  onAdd,
  onRemove,
}: MemberPickerProps) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</Text>

      {selectedUsernames.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {selectedUsernames.map(username => (
              <View
                key={username}
                className="flex-row items-center gap-2 rounded-full bg-zinc-200 px-3 py-1 dark:bg-zinc-700"
              >
                <Text className="text-xs text-zinc-900 dark:text-zinc-100">{username}</Text>
                <Button
                  label="x"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  textClassName="text-xs"
                  accessibilityLabel={`Remove member ${username}`}
                  onPress={() => onRemove(username)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <Input
        placeholder={placeholder}
        value={query}
        editable={!disabled}
        onChangeText={onQueryChange}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {searching ? <Text className="text-xs text-zinc-500 dark:text-zinc-400">Searching users...</Text> : null}

      {!searching && searchResults.length > 0 && (
        <View className="gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
          {searchResults.map(result => (
            <Button
              key={result.id}
              label={result.username}
              variant="ghost"
              className="justify-start px-2"
              textClassName="text-sm"
              onPress={() => onAdd(result.username)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
