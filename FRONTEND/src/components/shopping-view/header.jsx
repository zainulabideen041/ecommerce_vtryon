import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { logoutUser } from "@/store/auth-slice";
import { fetchCartItems } from "@/store/shop/cart-slice";
import UserCartWrapper from "./cart-wrapper";
import { LOCAL_CATALOG } from "@/lib/catalog-source";
const links = LOCAL_CATALOG
  ? [
      ["The collection", ""],
      ["Dresses", "dresses"],
      ["Tops", "tops"],
      ["Bottoms", "bottoms"],
      ["Sets", "sets"],
      ["Accessories", "accessories"],
    ]
  : [
      ["The collection", ""],
      ["Women", "women"],
      ["Men", "men"],
      ["Kids", "kids"],
      ["Accessories", "accessories"],
      ["Footwear", "footwear"],
    ];
export function CollectionLinks({ onClose }) {
  const location = useLocation();
  const category = new URLSearchParams(location.search).get("category") || "";
  return links.map(([label, value]) => (
    <Link
      key={label}
      to={`/shop/listing${value ? `?category=${value}` : ""}`}
      onClick={() => {
        sessionStorage.removeItem("filters");
        onClose?.();
      }}
      aria-current={
        location.pathname === "/shop/listing" && category === value
          ? "page"
          : undefined
      }
    >
      {label}
    </Link>
  ));
}
export default function ShoppingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const { cartItems } = useSelector((s) => s.shopCart);
  const dispatch = useDispatch();
  const count = user
    ? (cartItems?.items || []).reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems(user.id));
  }, [dispatch, user?.id]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="announcement">
        <span>STYLE IS PERSONAL.</span>
        <span>MAKE IT YOURS.</span>
        <Link to="/shop/listing">
          Explore the collection <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="store-header">
        <div className="masthead">
          <div className="masthead-left">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="icon-button mobile-menu"
                  aria-label="Open menu"
                >
                  <Menu size={21} />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="store-sheet menu-sheet"
                aria-describedby="menu-description"
              >
                <SheetTitle className="wordmark">LUXAR</SheetTitle>
                <SheetDescription id="menu-description">
                  Your style. Your rules.
                </SheetDescription>
                <nav aria-label="Mobile navigation">
                  <Link to="/shop/home" onClick={() => setMobileOpen(false)}>
                    Home
                  </Link>
                  <CollectionLinks onClose={() => setMobileOpen(false)} />
                  <Link to="/shop/search" onClick={() => setMobileOpen(false)}>
                    Search
                  </Link>
                  <Link
                    to={user ? "/shop/account" : "/auth/login"}
                    onClick={() => setMobileOpen(false)}
                  >
                    Your account
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <span className="masthead-note">Your style. Your rules.</span>
          </div>
          <Link to="/shop/home" className="wordmark" aria-label="Luxar home">
            LUXAR
            <span className="brand-dot" aria-hidden="true">
              .
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <CollectionLinks />
          </nav>
          <div className="header-actions">
            <Link className="icon-button" to="/shop/search" aria-label="Search">
              <Search size={20} />
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="icon-button" aria-label="Your account">
                    <UserRound size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.userName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/shop/account">Account & orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => dispatch(logoutUser())}>
                    <LogOut size={16} /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                className="icon-button"
                to="/auth/login"
                aria-label="Sign in"
              >
                <UserRound size={20} />
              </Link>
            )}
            <Sheet open={bagOpen} onOpenChange={setBagOpen}>
              <SheetTrigger asChild>
                <button
                  className="icon-button bag-button"
                  aria-label={`Shopping bag, ${count} items`}
                >
                  <ShoppingBag size={20} />
                  <span
                    className="header-bag-count"
                    key={count}
                    aria-hidden="true"
                  >
                    {count}
                  </span>
                </button>
              </SheetTrigger>
              <UserCartWrapper
                setOpenCartSheet={setBagOpen}
                cartItems={user ? cartItems?.items || [] : []}
              />
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
