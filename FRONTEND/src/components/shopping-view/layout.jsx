import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import { LocalCatalogNotice } from "./local-catalog";
import ShoppingFooter from "./footer";

function ShoppingLayout() {
  return (
    <div className="storefront flex flex-col min-h-screen">
      {/* common header */}
      <ShoppingHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-col w-full flex-1"
      >
        <LocalCatalogNotice />
        <Outlet />
      </main>
      {/* footer */}
      <ShoppingFooter />
    </div>
  );
}

export default ShoppingLayout;
