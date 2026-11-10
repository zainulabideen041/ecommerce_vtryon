import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Shirt,
  PersonStanding,
  ArrowUpRight,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "../ui/sheet";
export const adminNavigation = [
  {
    path: "/admin/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    section: "The studio",
  },
  {
    path: "/admin/products",
    label: "Products",
    icon: Shirt,
    section: "Your collection",
  },
  {
    path: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
    section: "The customer edit",
  },
  {
    path: "/admin/tryon-cloths",
    label: "Try-on garments",
    icon: Package,
    section: "The fitting room",
  },
  {
    path: "/admin/tryon-models",
    label: "Try-on models",
    icon: PersonStanding,
    section: "The fitting room",
  },
];
function StudioNavigation({ onClose }) {
  return (
    <>
      <Link
        className="admin-brand"
        to="/admin/dashboard"
        onClick={onClose}
        aria-label="Luxar Studio overview"
      >
        LUXAR<span>.</span>
        <small>THE MANAGEMENT STUDIO</small>
      </Link>
      <p className="admin-sidebar-label">YOUR WORKSPACE</p>
      <nav aria-label="Admin navigation">
        {adminNavigation.map((item, index) => (
          <NavLink to={item.path} key={item.path} end onClick={onClose}>
            <item.icon size={18} strokeWidth={1.5} />
            <span>{item.label}</span>
            <small>{String(index + 1).padStart(2, "0")}</small>
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-story">
        <span aria-hidden="true">&#10035;</span>
        <p>
          The other side
          <br />
          <em>of good style.</em>
        </p>
        <span>CURATE. CREATE. CONNECT.</span>
        <ArrowUpRight size={24} strokeWidth={1} />
      </div>
      <div className="admin-sidebar-bottom">
        <span />
        <span>LUXAR STUDIO / ADMIN</span>
      </div>
    </>
  );
}
export default function AdminSideBar({ open, setOpen }) {
  return (
    <>
      <aside className="admin-sidebar">
        <StudioNavigation />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="admin-mobile-sidebar">
          <SheetTitle className="sr-only">Luxar Studio navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Manage your products, orders and virtual fitting room.
          </SheetDescription>
          <StudioNavigation onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
