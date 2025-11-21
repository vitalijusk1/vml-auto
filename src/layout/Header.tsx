import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/store";
import { clearUser } from "@/store/slices/authSlice";
import { logout } from "@/api/auth";

export function Header() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    dispatch(clearUser());
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-end border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="end">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium">{user?.name || "User"}</p>
            </div>
            <button
              className="w-full flex items-center justify-start px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-b-md"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Atsijungti
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
