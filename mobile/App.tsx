import './global.css';

import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UserProvider, useUser } from './src/context/UserContext';
import LoginScreen from './src/screens/LoginScreen';
import TodosScreen from './src/screens/TodosScreen';

function AppNavigator() {
  const { bootstrapping, user } = useUser();
  const colorScheme = useColorScheme();

  if (bootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#f4f4f5' : '#18181b'} />
        <Text className="mt-3 text-zinc-600 dark:text-zinc-300">Loading session...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <TodosScreen />;
}

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <UserProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AppNavigator />
      </UserProvider>
    </SafeAreaProvider>
  );
}
