import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import ShoppingFooter from "./footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full flex-1">
        <Outlet />
      </main>
      {/* footer */}
      <ShoppingFooter />
    </div>
  );
}

export default ShoppingLayout;
