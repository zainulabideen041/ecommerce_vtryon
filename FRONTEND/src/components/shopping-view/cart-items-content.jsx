import { Minus, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const [pending, setPending] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId,
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId,
        );
        const getTotalStock = productList[getCurrentProductIndex]?.totalStock;

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
              variant: "destructive",
            });

            return;
          }
        }
      }
    }

    setPending(true);
    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      }),
    ).then((data) => {
      setPending(false);
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    setPending(true);
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId }),
    ).then((data) => {
      setPending(false);
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  return (
    <article className="cart-line" aria-busy={pending}>
      <img src={cartItem?.image} alt={cartItem?.title} />
      <div>
        <h3>{cartItem?.title}</h3>
        <p className="cart-line-price">
          $
          {(
            (cartItem?.salePrice > 0 ? cartItem.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        <div className="cart-line-bottom">
          <div className="quantity-control">
            <button
              disabled={cartItem?.quantity === 1 || pending}
              onClick={() => handleUpdateQuantity(cartItem, "minus")}
              aria-label={`Decrease quantity of ${cartItem?.title}`}
            >
              <Minus size={14} />
            </button>
            <span aria-live="polite">{cartItem?.quantity}</span>
            <button
              disabled={pending}
              onClick={() => handleUpdateQuantity(cartItem, "plus")}
              aria-label={`Increase quantity of ${cartItem?.title}`}
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            disabled={pending}
            className="cart-remove"
            onClick={() => handleCartItemDelete(cartItem)}
            aria-label={`Remove ${cartItem?.title}`}
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
export default UserCartItemsContent;
