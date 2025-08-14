import { logout } from '../api/todoApi';
import { Button } from './ui/button';

export default function LogoutButton({ onLogout }: { onLogout: () => void }) {
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <Button
      onClick={handleLogout}
      aria-label="Sign out"
      variant="outline"
      size="default"
    >
      Sign Out
    </Button>
  );
}
