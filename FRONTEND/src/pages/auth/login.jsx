import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
    <div className="auth-content slide-up">
      <p className="eyebrow">YOUR LUXAR</p>
      <h1>
        Good to see
        <br />
        <em>you again.</em>
      </h1>
      <p className="auth-introduction">
        Sign in to follow your orders and make your next piece yours.
      </p>
      <CommonForm
        formControls={loginFormControls}
        buttonText={isLoading ? "Signing in..." : "Sign in"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isBtnDisabled={isLoading}
        isSubmitting={isLoading}
        autoCompleteMap={{ email: "email", password: "current-password" }}
      />
      <div className="auth-switch-row">
        <span>New to Luxar?</span>
        <Link className="auth-switch" to="/auth/register">
          Create an account <ArrowRight size={16} />
        </Link>
      </div>
      <Link className="auth-guest text-link" to="/shop/home">
        Continue exploring <ArrowRight size={15} />
      </Link>
    </div>
  );
}
export default AuthLogin;
