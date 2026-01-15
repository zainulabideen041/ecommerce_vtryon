import { Outlet } from "react-router-dom";
import { Sparkles, Shield, Zap, ShoppingBag } from "lucide-react";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 animated-gradient"></div>
      <div className="absolute inset-0 mesh-gradient"></div>

      {/* Left Side - Branding & Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 z-10">
        <div className="max-w-md space-y-8 text-white">
          {/* Logo/Brand */}
          <div className="space-y-4 slide-in-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-display font-bold">Luxar</h1>
            </div>
            <p className="text-xl text-white/90 font-light">
              Virtual Try-On Shopping Experience
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-6 slide-up">
            <div className="flex items-start gap-4 glass p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  AI-Powered Try-On
                </h3>
                <p className="text-white/80 text-sm">
                  See how clothes look on you before buying with our advanced AI
                  technology
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 glass p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure Payments</h3>
                <p className="text-white/80 text-sm">
                  Shop with confidence using our secure PayPal integration
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 glass p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Fast Delivery</h3>
                <p className="text-white/80 text-sm">
                  Get your favorite items delivered quickly to your doorstep
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl pulse-slow"></div>
          <div
            className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex flex-1 items-center justify-center bg-background/95 backdrop-blur-xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
