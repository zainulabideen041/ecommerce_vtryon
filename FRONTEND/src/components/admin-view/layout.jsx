import { Outlet } from "react-router-dom";
import AdminSideBar from "./sidebar";
import AdminHeader from "./header";
import { useState } from "react";

function AdminLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-pink-50/50">
      {/* admin sidebar - fixed */}
      <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* admin header - fixed */}
        <AdminHeader setOpen={setOpenSidebar} />
        {/* main content - scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background/50 to-muted/30 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
