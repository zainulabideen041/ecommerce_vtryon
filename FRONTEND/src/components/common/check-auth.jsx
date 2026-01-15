import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  // Root path - redirect to shop home for guests, admin dashboard for admins
  if (location.pathname === "/") {
    if (isAuthenticated && user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Navigate to="/shop/home" />;
  }

  // Auth pages - redirect if already authenticated
  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/register"))
  ) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/shop/home" />;
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    "/shop/checkout",
    "/shop/account",
    "/shop/paypal-return",
    "/shop/payment-success",
    "/admin",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    location.pathname.includes(route)
  );

  // Redirect to login if accessing protected route without authentication
  if (!isAuthenticated && isProtectedRoute) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} />;
  }

  // Admin-only routes
  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    location.pathname.includes("admin")
  ) {
    return <Navigate to="/unauth-page" />;
  }

  // Prevent admin from accessing shop routes
  if (
    isAuthenticated &&
    user?.role === "admin" &&
    location.pathname.includes("shop")
  ) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
