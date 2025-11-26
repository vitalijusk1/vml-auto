import { User, LogOut, Menu } from "lucide-react";
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSidebarCollapsed } from "@/store/selectors";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { useIsMobile } from "@/hooks/useIsMobile";

export function Header() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appDispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(selectSidebarCollapsed);
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await logout();
    dispatch(clearUser());
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      {/* Mobile menu button - only show on mobile when sidebar is collapsed */}
      {isMobile && isSidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => appDispatch(toggleSidebar())}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* App title on mobile when sidebar is collapsed */}
      {isMobile && isSidebarCollapsed && (
        <h1 className="text-lg font-bold text-center flex-1 md:hidden">
          VML AUTO
        </h1>
      )}

      <div className="flex items-center gap-4 ml-auto">
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
