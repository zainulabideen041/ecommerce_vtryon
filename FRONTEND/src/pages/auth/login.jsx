import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { LogIn, ArrowRight } from "lucide-react";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    dispatch(loginUser(formData)).then((data) => {
      setIsLoading(false);
      if (data?.payload?.success) {
        toast({
          title: "Welcome back!",
          description: data?.payload?.message,
        });
      } else {
        toast({
          title: "Login failed",
          description: data?.payload?.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="w-full space-y-8 slide-up">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="text-muted-foreground text-lg">
          Sign in to continue your shopping journey
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-lg space-y-6">
        <CommonForm
          formControls={loginFormControls}
          buttonText={isLoading ? "Signing in..." : "Sign In"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          isBtnDisabled={isLoading}
        />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-muted-foreground">
              New to Luxar?
            </span>
          </div>
        </div>

        {/* Register Link */}
        <Link
          to="/auth/register"
          className="group flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 font-medium"
        >
          Create an account
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Footer Links */}
      <div className="text-center space-y-2">
        <Link
          to="/shop/home"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          Continue as guest
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default AuthLogin;
