import { useTheme } from '../lib/ThemeContext';
import { Button } from './ui/button';

export default function LightDarkButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      variant="outline"
      size="default"
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </Button>
  );
}

