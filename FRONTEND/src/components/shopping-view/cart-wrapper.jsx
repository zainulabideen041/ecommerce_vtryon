import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { ShoppingBag, ArrowRight, Package } from "lucide-react";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  return (
    <SheetContent className="sm:max-w-md flex flex-col h-full">
      <SheetHeader className="space-y-2 pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <SheetTitle className="text-xl font-display">Your Cart</SheetTitle>
            <p className="text-sm text-muted-foreground">
              {cartItems?.length || 0}{" "}
              {cartItems?.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </SheetHeader>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <UserCartItemsContent key={item?._id || index} cartItem={item} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Looks like you haven't added anything to your cart yet
              </p>
            </div>
            <Button
              onClick={() => {
                navigate("/shop/listing");
                setOpenCartSheet(false);
              }}
              variant="outline"
            >
              Start Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {cartItems && cartItems.length > 0 && (
        <div className="border-t pt-4 space-y-4">
          {/* Subtotal */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${totalCartAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-success">Free</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-3 px-4 bg-muted rounded-xl">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-xl text-primary">
              ${totalCartAmount.toFixed(2)}
            </span>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={() => {
              navigate("/shop/checkout");
              setOpenCartSheet(false);
            }}
            className="w-full group"
            size="lg"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            onClick={() => setOpenCartSheet(false)}
            variant="outline"
            className="w-full"
          >
            Continue Shopping
          </Button>
        </div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;
