import { StarIcon, ShoppingCart, Sparkles, X } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { useNavigate } from "react-router-dom";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { cartItems } = useSelector((s) => s.shopCart);
  const { reviews } = useSelector((s) => s.shopReview);
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleRatingChange(r) {
    setRating(r);
  }

  function handleAddToCart(productId, totalStock) {
    const existing = (cartItems.items || []).find(
      (i) => i.productId === productId,
    );
    if (existing && existing.quantity + 1 > totalStock) {
      toast({
        title: `Only ${existing.quantity} can be added`,
        variant: "destructive",
      });
      return;
    }
    dispatch(addToCart({ userId: user?.id, productId, quantity: 1 })).then(
      (d) => {
        if (d?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast({ title: "Added to cart" });
        }
      },
    );
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      }),
    ).then((d) => {
      if (d.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({ title: "Review submitted!" });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  const averageReview =
    reviews?.length > 0
      ? reviews.reduce((s, r) => s + r.reviewValue, 0) / reviews.length
      : 0;

  const discount =
    productDetails?.salePrice > 0
      ? Math.round(
          ((productDetails.price - productDetails.salePrice) /
            productDetails.price) *
            100,
        )
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[88vw] lg:max-w-[1100px] h-[88vh] p-0 overflow-hidden border border-border/60 shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">
          {productDetails?.title || "Product Details"}
        </DialogTitle>

        <div className="grid md:grid-cols-2 h-full overflow-hidden">
          {/* Left — Image */}
          <div className="relative bg-muted/20 flex items-center justify-center overflow-hidden">
            {/* Subtle gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5" />

            <img
              src={productDetails?.image}
              alt={productDetails?.title}
              className="relative max-w-full max-h-full object-contain p-8 drop-shadow-xl"
            />

            {/* Badges */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 min-w-[52px] h-[52px] rounded-full bg-gradient-primary flex flex-col items-center justify-center shadow-lg">
                <span className="text-white text-[11px] font-bold leading-none">
                  {discount}%
                </span>
                <span className="text-white/80 text-[9px]">OFF</span>
              </div>
            )}
            {productDetails?.totalStock === 0 && (
              <div className="absolute top-4 left-4 bg-foreground/80 text-background text-[11px] font-semibold px-3 py-1 rounded-sm tracking-wide">
                SOLD OUT
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Header sticky */}
            <div className="px-7 pt-6 pb-4 border-b border-border/50">
              <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-foreground mb-2">
                {productDetails?.title}
              </h1>

              {/* Rating row */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  <StarRatingComponent rating={averageReview} />
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageReview.toFixed(1)} · {reviews?.length || 0} reviews
                </span>
              </div>
            </div>

            <div className="px-7 py-4 space-y-5 flex-1">
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {productDetails?.description}
              </p>

              {/* Price panel */}
              <div className="flex items-center gap-6 px-5 py-4 rounded-xl bg-muted/30 border border-border/50">
                {productDetails?.salePrice > 0 ? (
                  <>
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        Was
                      </span>
                      <p className="text-lg text-muted-foreground line-through font-display">
                        ${productDetails.price}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-gold-dark uppercase tracking-wide font-semibold">
                        Now
                      </span>
                      <p className="text-3xl font-bold text-primary font-display">
                        ${productDetails.salePrice}
                      </p>
                    </div>
                    <div className="ml-auto px-3 py-1.5 bg-gold/15 border border-gold/30 rounded-lg text-center">
                      <span className="text-gold-dark text-xs font-bold block">
                        Save
                      </span>
                      <span className="text-gold-dark font-bold text-sm">
                        $
                        {(
                          productDetails.price - productDetails.salePrice
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      Price
                    </span>
                    <p className="text-3xl font-bold text-primary font-display">
                      ${productDetails?.price}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                {productDetails?.totalStock === 0 ? (
                  <Button className="w-full h-11" disabled>
                    Out of Stock
                  </Button>
                ) : (
                  <Button
                    className="w-full h-11 bg-gradient-primary hover:opacity-90 shadow-md transition-all gap-2"
                    onClick={() =>
                      handleAddToCart(
                        productDetails?._id,
                        productDetails?.totalStock,
                      )
                    }
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
                <Button
                  className="w-full h-11 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:opacity-90 text-white shadow-md transition-all gap-2"
                  onClick={() => navigate(`/shop/tryon/${productDetails?._id}`)}
                >
                  ✦ Virtual Try-On
                </Button>
                <Button
                  className="w-full h-11 bg-gradient-to-r from-violet-700 to-rose-600 hover:opacity-90 text-white shadow-md transition-all gap-2"
                  onClick={() =>
                    navigate(`/shop/tryon-youcam/${productDetails?._id}`)
                  }
                >
                  <Sparkles className="h-4 w-4" />
                  Virtual Try-On PRO (90% Accurate)
                </Button>
              </div>

              <Separator className="opacity-50" />

              {/* Reviews */}
              <div>
                <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                  <StarIcon className="h-5 w-5 fill-gold text-gold" />
                  Customer Reviews
                </h2>

                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 mb-4">
                  {reviews?.length > 0 ? (
                    reviews.map((r, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 bg-muted/20 rounded-lg"
                      >
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {r.userName?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold truncate">
                              {r.userName}
                            </span>
                            <StarRatingComponent rating={r.reviewValue} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {r.reviewMessage}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No reviews yet — be the first!
                    </p>
                  )}
                </div>

                {/* Add review */}
                <div className="p-4 bg-muted/20 rounded-xl space-y-3 border border-border/40">
                  <Label className="text-sm font-semibold">
                    Write a Review
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Rating:
                    </span>
                    <StarRatingComponent
                      rating={rating}
                      handleRatingChange={handleRatingChange}
                    />
                  </div>
                  <Input
                    value={reviewMsg}
                    onChange={(e) => setReviewMsg(e.target.value)}
                    placeholder="Share your experience…"
                    className="h-10 text-sm"
                  />
                  <Button
                    onClick={handleAddReview}
                    disabled={!reviewMsg.trim() || rating === 0}
                    className="w-full h-9 text-sm"
                  >
                    Submit Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
