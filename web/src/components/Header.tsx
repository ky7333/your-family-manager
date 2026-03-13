import { Link } from '@tanstack/react-router'
import LogoutButton from './LogoutButton';
import LightDarkButton from './LightDarkButton';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useTheme } from '../lib/ThemeContext';

interface HeaderProps {
  authenticated: boolean;
  onLogout: () => void;
}

export default function Header({ authenticated, onLogout }: HeaderProps) {
  const { theme } = useTheme();
  const logoSrc = theme === 'dark'
    ? '/your-family-manager-logo-white.png'
    : '/your-family-manager-logo-black.png';
  return (
    <Card className="p-2 bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <Link to="/">
            <img
              src={logoSrc}
              alt="Your Family Manager Logo"
              className="h-8 w-auto cursor-pointer"
            />
          </Link>
          <nav className="flex flex-row gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/todos">Todos</Link>
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LightDarkButton />
          {authenticated && <LogoutButton onLogout={onLogout} />}
        </div>
      </div>
    </Card>
  );
}
