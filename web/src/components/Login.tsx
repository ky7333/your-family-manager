import { useEffect, useState, type FormEvent } from 'react';
import { login } from '../api/todoApi';
import { fetchCurrentUser } from '../api/userApi';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '../lib/UserContext';
import { useNavigate } from '@tanstack/react-router';

export default function Login() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      void navigate({ to: '/' });
    }
  }, [navigate, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      setError('');
      // Refresh user state after login using userApi
      const userJson = await fetchCurrentUser();
      if (userJson) {
        setUser(userJson);
      } else {
        setError('Session not established after login.');
        return;
      }
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, redirect to home
  if (user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="h-4" /> {/* Add gap before button */}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
