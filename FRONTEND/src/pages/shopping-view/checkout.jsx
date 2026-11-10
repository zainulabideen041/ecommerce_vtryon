import Address from "@/components/shopping-view/address";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, CreditCard, Check } from "lucide-react";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0,
        )
      : 0;

  function handleInitiatePaypalPayment() {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Address required",
        description: "Please select a delivery address to proceed",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    setIsPaymemntStart(true);
    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
        navigate(`/shop/paypal-return`);
      } else {
        toast({
          title: "We could not start your checkout",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
        setIsPaymemntStart(false);
      }
    });
  }

  return (
    <div className="store-page checkout-page">
      <div className="page-intro">
        <p className="eyebrow">THE FINAL DETAILS</p>
        <h1>Make it yours.</h1>
        <p>A few details, then your pieces are one step closer.</p>
      </div>
      <div className="checkout-steps" aria-label="Checkout progress">
        <span>
          <Check size={14} /> 01 Bag
        </span>
        <span className="current">
          <MapPin size={14} /> 02 Delivery address
        </span>
        <span>
          <CreditCard size={14} /> 03 Payment
        </span>
      </div>
      <div className="checkout-grid">
        <section>
          <h2>Where shall we send it?</h2>
          <Address
            selectedId={currentSelectedAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />
        </section>
        <aside className="checkout-summary">
          <p className="eyebrow mb-3">CHOSEN BY YOU</p>
          <h2>Your order.</h2>
          {cartItems?.items?.length ? (
            cartItems.items.map((item) => (
              <UserCartItemsContent key={item.productId} cartItem={item} />
            ))
          ) : (
            <div className="py-6">
              <p>Your bag is empty.</p>
              <button
                className="text-link"
                onClick={() => navigate("/shop/listing")}
              >
                Explore the collection
              </button>
            </div>
          )}
          <dl>
            <dt>Subtotal</dt>
            <dd>${totalCartAmount.toFixed(2)}</dd>
            <dt>Shipping</dt>
            <dd>Free</dd>
            <dt>Tax</dt>
            <dd>$0.00</dd>
          </dl>
          <div className="checkout-total">
            <span>Total</span>
            <span>${totalCartAmount.toFixed(2)}</span>
          </div>
          <Button
            onClick={handleInitiatePaypalPayment}
            loading={isPaymentStart}
            disabled={
              !cartItems?.items?.length ||
              !currentSelectedAddress ||
              isPaymentStart
            }
          >
            <CreditCard size={17} />
            {isPaymentStart ? "Processing..." : "Checkout with PayPal"}
          </Button>
          <p>
            {currentSelectedAddress
              ? "Payment powered by PayPal"
              : "Select a delivery address to continue."}
          </p>
        </aside>
      </div>
    </div>
  );
}
export default ShoppingCheckout;
