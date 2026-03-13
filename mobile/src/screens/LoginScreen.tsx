import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableWithoutFeedback,
  View,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUser } from '../context/UserContext';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function LoginScreen() {
  const { signIn } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signIn({ username, password });
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 items-center justify-center px-4"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Card className="w-full max-w-md gap-4">
            <CardHeader className="mb-0 gap-1">
              <CardTitle>Your Family Manager</CardTitle>
              <CardDescription>Sign in to manage lists and todos.</CardDescription>
            </CardHeader>

            <View className="gap-3">
              <Input
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {error ? <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text> : null}

            <Button
              label={loading ? 'Signing in...' : 'Sign In'}
              disabled={loading}
              onPress={() => {
                void handleLogin();
              }}
            />

            <Text className="text-xs text-zinc-500 dark:text-zinc-400">Dev seed users: `admin/admin` or `user/user`.</Text>
          </Card>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
