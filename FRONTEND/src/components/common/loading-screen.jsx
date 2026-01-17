import { ShoppingBag, Sparkles } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo Container with Animation */}
        <div className="relative">
          {/* Rotating Ring */}
          <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-transparent border-t-purple-600 border-r-blue-600 animate-spin"></div>

          {/* Logo */}
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl animate-pulse">
            <img
              src="/logo.png"
              alt="Luxar Logo"
              className="w-20 h-20 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
            <div className="w-20 h-20 hidden items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Sparkle Effects */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
          <Sparkles
            className="absolute -bottom-2 -left-2 w-5 h-5 text-purple-400 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* Brand Name */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Luxar
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            Loading your shopping experience...
          </p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-loading-bar"></div>
        </div>

        {/* Loading Dots */}
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-pink-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
