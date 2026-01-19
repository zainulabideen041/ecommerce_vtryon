import { StarIcon, X, ShoppingCart, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
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
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId,
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
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
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  function handleNavigateTryOn(id) {
    navigate(`/shop/tryon/${id}`);
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[1200px] h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <div className="grid md:grid-cols-2 gap-0 h-full max-h-full overflow-hidden">
          {/* Image Section - Left Side */}
          <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center p-6 md:p-8 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={productDetails?.image}
                alt={productDetails?.title}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
              {productDetails?.salePrice > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  SALE
                </div>
              )}
              {productDetails?.totalStock === 0 && (
                <div className="absolute top-4 left-4 bg-gray-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  OUT OF STOCK
                </div>
              )}
            </div>
          </div>

          {/* Details Section - Right Side */}
          <div className="flex flex-col h-full overflow-y-auto p-6 md:p-8 lg:p-10 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight">
                    {productDetails?.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1">
                      <StarRatingComponent rating={averageReview} />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {averageReview.toFixed(1)} ({reviews?.length || 0}{" "}
                      reviews)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-base leading-relaxed">
                {productDetails?.description}
              </p>
            </div>

            {/* Price Section */}
            <div className="mb-6 p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-4">
                {productDetails?.salePrice > 0 ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Original Price
                      </span>
                      <p className="text-xl font-semibold text-muted-foreground line-through">
                        ${productDetails?.price}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-green-600 font-medium">
                        Sale Price
                      </span>
                      <p className="text-3xl font-bold text-green-600">
                        ${productDetails?.salePrice}
                      </p>
                    </div>
                    <div className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      Save $
                      {(
                        productDetails?.price - productDetails?.salePrice
                      ).toFixed(2)}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <p className="text-3xl font-bold text-primary">
                      ${productDetails?.price}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-6 space-y-3">
              {productDetails?.totalStock === 0 ? (
                <Button
                  className="w-full h-12 text-base font-semibold opacity-60 cursor-not-allowed"
                  disabled
                >
                  Out of Stock
                </Button>
              ) : (
                <Button
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                  onClick={() =>
                    handleAddToCart(
                      productDetails?._id,
                      productDetails?.totalStock,
                    )
                  }
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              )}
              <Button
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all shadow-lg hover:shadow-xl"
                onClick={() => handleNavigateTryOn(productDetails?._id)}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Try On Virtually
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Reviews Section */}
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <StarIcon className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                Customer Reviews
              </h2>

              {/* Reviews List */}
              <div className="space-y-4 mb-6 max-h-[200px] overflow-y-auto pr-2">
                {reviews && reviews.length > 0 ? (
                  reviews.map((reviewItem, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {reviewItem?.userName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">
                            {reviewItem?.userName}
                          </h3>
                          <div className="flex items-center gap-1">
                            <StarRatingComponent
                              rating={reviewItem?.reviewValue}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {reviewItem.reviewMessage}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      No reviews yet. Be the first to review!
                    </p>
                  </div>
                )}
              </div>

              {/* Add Review Form */}
              <div className="mt-6 p-4 bg-muted/20 rounded-xl space-y-3">
                <Label className="text-base font-semibold">
                  Write a Review
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Your Rating:
                  </span>
                  <StarRatingComponent
                    rating={rating}
                    handleRatingChange={handleRatingChange}
                  />
                </div>
                <Input
                  name="reviewMsg"
                  value={reviewMsg}
                  onChange={(event) => setReviewMsg(event.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="h-12"
                />
                <Button
                  onClick={handleAddReview}
                  disabled={reviewMsg.trim() === "" || rating === 0}
                  className="w-full h-10"
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
