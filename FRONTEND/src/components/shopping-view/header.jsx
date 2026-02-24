import {
  LogOut,
  Menu,
  ShoppingCart,
  UserCog,
  ShoppingBag,
  Gem,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";

function MenuItems({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(item) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      item.id !== "home" && item.id !== "products" && item.id !== "search"
        ? { category: [item.id] }
        : null;
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(new URLSearchParams(`?category=${item.id}`))
      : navigate(item.path);

    onClose?.();
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-1 lg:gap-0 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path.includes("listing") &&
            location.pathname.includes("listing") &&
            new URLSearchParams(location.search).get("category") === item.id);
        return (
          <button
            key={item.id}
            onClick={() => handleNavigate(item)}
            className={`
              relative px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-all duration-200
              group lg:text-[12.5px]
              ${isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"}
            `}
          >
            {item.label}
            {/* Gold underline bar */}
            <span
              className={`
                absolute bottom-0 left-4 right-4 h-[1.5px] rounded-full transition-all duration-300
                bg-gradient-gold
                ${isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100"}
              `}
            />
          </button>
        );
      })}
    </nav>
  );
}

function HeaderRightContent() {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { cartItems } = useSelector((s) => s.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems(user.id));
  }, [dispatch, user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/auth/login")}
          className="text-[13px] font-medium tracking-wide px-5 h-9 hover:text-primary"
        >
          Sign In
        </Button>
        <Button
          size="sm"
          onClick={() => navigate("/auth/register")}
          className="text-[13px] font-medium tracking-wide px-5 h-9 bg-gradient-primary hover:opacity-90 shadow-md"
        >
          Register
        </Button>
      </div>
    );
  }

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-3">
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 hover:text-primary transition-colors"
        >
          <ShoppingCart className="w-[18px] h-[18px]" />
          {cartItems?.items?.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow">
              {cartItems.items.length}
            </span>
          )}
          <span className="sr-only">Cart</span>
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={cartItems?.items?.length > 0 ? cartItems.items : []}
        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer h-8 w-8 ring-2 ring-primary/20 hover:ring-gold/60 transition-all">
            <AvatarFallback className="bg-gradient-primary text-white text-xs font-bold font-cinzel">
              {user?.userName?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-52 mt-2">
          <DropdownMenuLabel className="font-semibold text-sm py-2">
            <span className="text-muted-foreground text-xs font-normal block">
              Signed in as
            </span>
            {user?.userName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate("/shop/account")}
            className="cursor-pointer text-sm gap-2"
          >
            <UserCog className="h-3.5 w-3.5" /> Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive text-sm gap-2"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-2xl shadow-sm border-b border-border/40"
          : "bg-background/70 backdrop-blur-lg border-b border-border/20"
      }`}
    >
      {/* Top gold accent line */}
      <div className="h-[2px] w-full bg-gradient-gold" />

      <div
        className="flex h-15 items-center justify-between px-4 md:px-8 container mx-auto"
        style={{ height: "60px" }}
      >
        {/* Logo / Brand */}
        <Link
          to="/shop/home"
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Luxar"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
            <div className="w-8 h-8 rounded-lg bg-gradient-primary hidden items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-cinzel font-bold text-[18px] tracking-[0.12em] bg-gradient-primary bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              LUXAR
            </span>
            <span className="text-[8px] tracking-[0.3em] text-muted-foreground uppercase font-light hidden sm:block">
              Premium Fashion
            </span>
          </div>
        </Link>

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              {/* Mobile header */}
              <div className="px-6 py-5 border-b border-border/50 bg-muted/30">
                <span className="font-cinzel font-bold text-xl tracking-[0.12em] bg-gradient-primary bg-clip-text text-transparent">
                  LUXAR
                </span>
              </div>
              <div className="flex flex-col gap-1 px-3 py-4 flex-1">
                <MenuItems onClose={() => setMobileOpen(false)} />
              </div>
              <div className="px-4 py-4 border-t border-border/50">
                <HeaderRightContent />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center">
          <MenuItems />
        </div>

        {/* Desktop right */}
        <div className="hidden lg:flex items-center gap-1">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
