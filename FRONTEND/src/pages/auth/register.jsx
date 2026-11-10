import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
    <div className="auth-content slide-up">
      <p className="eyebrow">A WARDROBE, CONSIDERED</p>
      <h1>
        A little space.
        <br />
        <em>All yours.</em>
      </h1>
      <p className="auth-introduction">
        Create your Luxar account. Keep your orders and delivery details in one
        place.
      </p>
      <CommonForm
        formControls={registerFormControls}
        buttonText={isLoading ? "Creating account..." : "Create account"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isBtnDisabled={isLoading}
        isSubmitting={isLoading}
        autoCompleteMap={{
          userName: "nickname",
          email: "email",
          password: "new-password",
        }}
      />
      <div className="auth-switch-row">
        <span>Already part of Luxar?</span>
        <Link className="auth-switch" to="/auth/login">
          Sign in <ArrowRight size={16} />
        </Link>
      </div>
      <p className="auth-footnote">
        Your style, your choices. Explore the collection and picture each piece
        on you in our virtual fitting room.
      </p>
    </div>
  );
}
export default AuthRegister;
