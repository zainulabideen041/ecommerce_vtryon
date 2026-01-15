import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    dispatch(registerUser(formData)).then((data) => {
      setIsLoading(false);
      if (data?.payload?.success) {
        toast({
          title: "Account created!",
          description: "Welcome to Luxar. Please sign in to continue.",
        });
        navigate("/auth/login");
      } else {
        toast({
          title: "Registration failed",
          description: data?.payload?.message || "Please try again",
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
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
          Create Account
        </h1>
        <p className="text-muted-foreground text-lg">
          Join Luxar and start your virtual shopping experience
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-lg space-y-6">
        <CommonForm
          formControls={registerFormControls}
          buttonText={isLoading ? "Creating account..." : "Create Account"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          isBtnDisabled={isLoading}
        />

        {/* Benefits */}
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            What you'll get:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">
                AI-powered virtual try-on
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">
                Personalized recommendations
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">
                Exclusive deals and offers
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-muted-foreground">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Login Link */}
        <Link
          to="/auth/login"
          className="group flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 font-medium"
        >
          Sign in instead
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <a href="#" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}

export default AuthRegister;
