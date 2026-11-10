import { Link } from "react-router-dom";
import { Check, ArrowUpRight } from "lucide-react";
export default function PaymentSuccessPage() {
  return (
    <section className="status-page">
      <Check className="status-icon" strokeWidth={1} />
      <p className="eyebrow mt-6">A NEW CHAPTER FOR YOUR WARDROBE</p>
      <h1>It's yours.</h1>
      <p>
        Your payment was successful. Find your order details and follow its
        status in your account.
      </p>
      <Link className="solid-link" to="/shop/account">
        View your orders <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
