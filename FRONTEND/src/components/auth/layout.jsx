import { Outlet } from "react-router-dom";
import {
  Sparkles,
  Shield,
  Zap,
  ShoppingBag,
  Users,
  Star,
  CheckCircle,
} from "lucide-react";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 animated-gradient"></div>
      <div className="absolute inset-0 mesh-gradient"></div>

      {/* Left Side - Branding & Features (Fixed Position, Hidden on mobile) */}
      <div className="hidden lg:block lg:w-[60%] relative z-10">
        <div className="fixed top-0 left-0 w-[60%] h-screen flex items-center justify-around">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=1200&q=80"
              alt="Virtual Reality Technology"
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-purple-900/65 to-blue-900/75"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
          </div>

          <div className="max-w-2xl space-y-8 text-white relative z-10 w-full">
            {/* Logo/Brand */}
            <div className="space-y-4 slide-in-left">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-xl flex items-center justify-center p-1.5 shadow-2xl">
                  <img
                    src="/logo.png"
                    alt="Luxar Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-full h-full hidden items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h1 className="text-6xl font-display font-bold drop-shadow-2xl">
                  Luxar
                </h1>
              </div>
              <p className="text-2xl text-white/95 font-medium leading-relaxed drop-shadow-lg">
                Virtual Try-On Shopping Experience
              </p>
              <p className="text-base text-white/80 leading-relaxed">
                Experience the future of online shopping with AI-powered virtual
                try-on technology.
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 slide-up">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-purple-300" />
                  <p className="text-2xl font-bold">50K+</p>
                </div>
                <p className="text-sm text-white/80">Users</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <p className="text-2xl font-bold">4.9</p>
                </div>
                <p className="text-sm text-white/80">Rating</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <p className="text-2xl font-bold">98%</p>
                </div>
                <p className="text-sm text-white/80">Satisfaction</p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4 slide-up">
              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg mb-1">
                    AI Virtual Try-On
                  </h4>
                  <p className="text-white/85 text-sm leading-relaxed">
                    See how clothes look on you instantly with advanced AI
                    technology.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg mb-1">
                    Secure & Private
                  </h4>
                  <p className="text-white/85 text-sm leading-relaxed">
                    Your data is encrypted and protected with secure payment
                    gateway.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg mb-1">
                    Fast Delivery
                  </h4>
                  <p className="text-white/85 text-sm leading-relaxed">
                    Premium brands delivered to your doorstep with real-time
                    tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pulse-slow"></div>
            <div
              className="absolute bottom-10 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pulse-slow"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms (Scrollable) */}
      <div className="w-full lg:w-[40%] lg:ml-auto flex items-center justify-center bg-background/95 backdrop-blur-xl relative z-10 min-h-screen overflow-y-auto">
        <div className="w-full max-w-lg py-6 fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
