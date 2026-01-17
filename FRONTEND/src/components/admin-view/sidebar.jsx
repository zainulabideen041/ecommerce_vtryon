import {
  BadgeCheck,
  LayoutDashboard,
  ShoppingBasket,
  PersonStanding,
  Shirt,
  ShoppingBag,
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBasket />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <BadgeCheck />,
  },
  {
    id: "tryoncloth",
    label: "Tryon Cloths",
    path: "/admin/tryon-cloths",
    icon: <Shirt />,
  },
  {
    id: "tryonmodel",
    label: "Tryon Models",
    path: "/admin/tryon-models",
    icon: <PersonStanding />,
  },
];

function MenuItems({ setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {adminSidebarMenuItems.map((menuItem) => {
        const isActive = location.pathname === menuItem.path;

        return (
          <div
            key={menuItem.id}
            onClick={() => {
              navigate(menuItem.path);
              setOpen ? setOpen(false) : null;
            }}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-102"
            }`}
          >
            <div className={`${isActive ? "text-white" : ""}`}>
              {menuItem.icon}
            </div>
            <span>{menuItem.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b pb-4">
              <SheetTitle className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-primary flex items-center justify-center shadow-lg">
                  <img
                    src="/logo.png"
                    alt="Luxar Logo"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-full h-full hidden items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Luxar Admin
                  </h1>
                  <p className="text-xs text-muted-foreground font-normal">
                    Management Panel
                  </p>
                </div>
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-72 flex-col border-r bg-background/50 backdrop-blur-sm p-6 lg:flex">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <img
              src="/logo.png"
              alt="Luxar Logo"
              className="w-full h-full object-contain p-1.5"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
            <div className="w-full h-full hidden items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
              Luxar Admin
            </h1>
            <p className="text-xs text-muted-foreground">Management Panel</p>
          </div>
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
