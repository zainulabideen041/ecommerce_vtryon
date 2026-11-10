import { Outlet, useLocation } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import AdminSideBar from "./sidebar";
import AdminHeader from "./header";
import "@/admin-studio.css";
export default function AdminLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);
  const main = useRef(null);
  const location = useLocation();
  useEffect(() => {
    main.current?.scrollTo({ top: 0 });
  }, [location.pathname]);
  return (
    <div className="admin-studio">
      <a href="#admin-main" className="admin-skip">
        Skip to workspace
      </a>
      <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="admin-main-column">
        <AdminHeader setOpen={setOpenSidebar} />
        <main ref={main} id="admin-main" tabIndex={-1}>
          <div className="admin-page-content">
            <Outlet />
          </div>
          <footer className="admin-workspace-footer">
            <span>LUXAR / STUDIO</span>
            <span>Good style. Thoughtfully managed.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
