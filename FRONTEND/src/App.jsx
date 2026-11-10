import { Route, Routes, useLocation } from "react-router-dom";
import "./storefront.css";
import "./storefront-motion.css";
import "./editorial-sections.css";
import ScrollToTop from "@/components/common/scroll-to-top";
import AuthLayout from "@/components/auth/layout";
import AuthLogin from "@/pages/auth/login";
import AuthRegister from "@/pages/auth/register";
import AdminLayout from "@/components/admin-view/layout";
import AdminDashboard from "@/pages/admin-view/dashboard";
import TryonCloths from "@/pages/admin-view/tryon-cloths";
import TryonModel from "@/pages/admin-view/tryon-models";
import AdminProducts from "@/pages/admin-view/products";
import AdminOrders from "@/pages/admin-view/orders";
// import AdminFeatures from "./pages/admin-view/features";
import ShoppingLayout from "@/components/shopping-view/layout";
import NotFound from "@/pages/not-found";
import ShoppingHome from "@/pages/shopping-view/home";
import ShoppingListing from "@/pages/shopping-view/listing";
import ShoppingCheckout from "@/pages/shopping-view/checkout";
import ShoppingAccount from "@/pages/shopping-view/account";
import CheckAuth from "@/components/common/check-auth";
import UnauthPage from "@/pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { useStorefrontMotion } from "@/hooks/use-storefront-motion";
import { checkAuth } from "@/store/auth-slice";
import LoadingScreen from "@/components/common/loading-screen";
import PaypalReturnPage from "@/pages/shopping-view/paypal-return";
import PaymentSuccessPage from "@/pages/shopping-view/payment-success";
import SearchProducts from "@/pages/shopping-view/search";
const TryOnPage = lazy(() => import("@/pages/tryOnPage"));
const YouCamTryOn = lazy(() => import("@/pages/YouCamTryOn"));

function App() {
  const location = useLocation();
  const motionScope = useRef(null);
  useLayoutEffect(() => {
    document.documentElement.classList.toggle(
      "admin-theme",
      location.pathname.startsWith("/admin"),
    );
    document.documentElement.classList.toggle(
      "storefront-theme",
      !location.pathname.startsWith("/admin"),
    );
    return () =>
      document.documentElement.classList.remove(
        "storefront-theme",
        "admin-theme",
      );
  }, [location.pathname]);
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth,
  );
  const dispatch = useDispatch();
  useStorefrontMotion(
    motionScope,
    location.pathname,
    !location.pathname.startsWith("/admin") && !isLoading,
  );

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <LoadingScreen />;

  return (
    <div ref={motionScope} className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingHome />
            </CheckAuth>
          }
        />

        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>

        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tryon-cloths" element={<TryonCloths />} />
          <Route path="tryon-models" element={<TryonModel />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          {/* <Route path="features" element={<AdminFeatures />} /> */}
        </Route>

        <Route
          path="/shop"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route
            path="tryon/:id"
            element={
              <Suspense fallback={<FittingRoomLoading />}>
                <TryOnPage />
              </Suspense>
            }
          />
          <Route
            path="tryon-youcam/:id"
            element={
              <Suspense fallback={<FittingRoomLoading />}>
                <YouCamTryOn />
              </Suspense>
            }
          />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="search" element={<SearchProducts />} />
        </Route>

        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function FittingRoomLoading() {
  return (
    <div className="store-page fitting-room-loading" role="status">
      <p className="eyebrow">THE LUXAR FITTING ROOM</p>
      <h1>Getting your room ready.</h1>
      <div className="fitting-room-placeholders" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default App;
