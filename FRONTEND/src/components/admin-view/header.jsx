import { Menu, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { logoutUser } from "@/store/auth-slice";
import { adminNavigation } from "./sidebar";
export default function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const page = adminNavigation.find((item) => item.path === location.pathname);
  return (
    <header className="admin-topbar">
      <div>
        <button
          className="admin-icon-button admin-menu-toggle"
          onClick={() => setOpen(true)}
          aria-label="Open admin navigation"
        >
          <Menu size={20} />
        </button>
        <p>
          <span>LUXAR STUDIO</span>
          <span aria-hidden="true">/</span>
          <strong>{page?.label || "Workspace"}</strong>
        </p>
      </div>
      <div>
        <span className="admin-user-monogram" aria-hidden="true">
          {user?.userName?.[0]?.toUpperCase() || "A"}
        </span>
        <span className="admin-user">
          <strong>{user?.userName || "Administrator"}</strong>
          <small>Store administrator</small>
        </span>
        <button className="admin-logout" onClick={() => dispatch(logoutUser())}>
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}
