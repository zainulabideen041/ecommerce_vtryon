import { AlignJustify, LogOut, ShoppingBag, User } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import { Avatar, AvatarFallback } from "../ui/avatar";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm transition-all duration-300">
      {/* Left Section - Mobile Menu + Logo */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => setOpen(true)}
          className="lg:hidden"
          variant="outline"
          size="icon"
        >
          <AlignJustify className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>

      {/* Right Section - User Info + Logout */}
      <div className="flex items-center gap-3">
        {/* User Info */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50">
          <Avatar className="h-9 w-9 bg-gradient-primary">
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              {user?.userName ? user.userName[0].toUpperCase() : "A"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">{user?.userName || "Admin"}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          size="default"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
