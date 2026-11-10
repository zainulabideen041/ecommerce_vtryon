import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { ArrowRight, ShoppingBag } from "lucide-react";
export default function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const total = (cartItems || []).reduce(
    (sum, item) =>
      sum + (item.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
    0,
  );
  return (
    <SheetContent className="store-sheet flex flex-col h-full">
      <SheetHeader className="text-left border-b pb-5">
        <p className="eyebrow">YOUR NEXT FAVOURITES</p>
        <SheetTitle className="bag-title">The shopping bag.</SheetTitle>
        <SheetDescription>
          {cartItems.length} {cartItems.length === 1 ? "piece" : "pieces"},
          chosen by you.
        </SheetDescription>
      </SheetHeader>
      {cartItems.length ? (
        <>
          <div className="bag-items">
            {cartItems.map((item) => (
              <UserCartItemsContent key={item.productId} cartItem={item} />
            ))}
          </div>
          <div className="bag-footer">
            <div className="bag-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <p>Shipping: Free · Review your delivery details at checkout.</p>
            <Button
              onClick={() => {
                setOpenCartSheet(false);
                navigate("/shop/checkout");
              }}
            >
              Continue to checkout <ArrowRight size={16} />
            </Button>
            <Button variant="outline" onClick={() => setOpenCartSheet(false)}>
              Keep exploring
            </Button>
          </div>
        </>
      ) : (
        <div className="bag-empty">
          <ShoppingBag size={35} strokeWidth={1} />
          <h3>
            Room for something
            <br />
            <em>you love.</em>
          </h3>
          <p>
            Your bag is waiting for its first piece. Start with the collection.
          </p>
          <button
            className="solid-link"
            onClick={() => {
              setOpenCartSheet(false);
              navigate("/shop/listing");
            }}
          >
            Explore the collection <ArrowRight size={16} />
          </button>
        </div>
      )}
    </SheetContent>
  );
}
