import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ShoppingBag,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { setProductDetails } from "@/store/shop/products-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { useToast } from "../ui/use-toast";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { gsap, useGSAP } from "@/hooks/use-storefront-motion";
import { useReducedMotion } from "@/hooks/use-media-query";
import GarmentGallery from "./garment-gallery";

export default function ProductDetailsDialog({
  open,
  setOpen,
  productDetails: product,
}) {
  const [selection, setSelection] = useState({ productId: null, values: {} });
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const root = useRef(null);
  const opener = useRef(null);
  const addedTimer = useRef(null);
  const reduceMotion = useReducedMotion();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews, isLoading: reviewsLoading } = useSelector(
    (state) => state.shopReview,
  );

  useEffect(() => {
    if (product?._id && open) dispatch(getReviews(product._id));
    setAdded(false);
    return () => clearTimeout(addedTimer.current);
  }, [product?._id, open, dispatch]);

  useGSAP(
    () => {
      if (!open || !root.current || reduceMotion) return;
      gsap.fromTo(
        root.current.querySelectorAll(
          ".product-heading > *, .product-purchase-panel, .product-description",
        ),
        { y: 18, opacity: 0.25 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.045,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    },
    {
      scope: root,
      dependencies: [open, product?._id, reduceMotion],
      revertOnUpdate: true,
    },
  );

  function close() {
    setOpen(false);
    dispatch(setProductDetails());
    setReviewMsg("");
    setRating(0);
  }

  function add() {
    if (product?.localPreview) return;
    if (!user) {
      close();
      toast({ title: "Sign in to save this piece to your bag" });
      navigate("/auth/login");
      return;
    }
    const existing = (cartItems?.items || []).find(
      (item) => item.productId === product._id,
    );
    if (existing && existing.quantity + 1 > product.totalStock) {
      toast({
        title: `Only ${existing.quantity} can be added`,
        variant: "destructive",
      });
      return;
    }
    setAdding(true);
    dispatch(
      addToCart({ userId: user.id, productId: product._id, quantity: 1 }),
    ).then((result) => {
      setAdding(false);
      if (result?.payload?.success) {
        dispatch(fetchCartItems(user.id));
        setAdded(true);
        addedTimer.current = setTimeout(() => setAdded(false), 2000);
        toast({
          title: "Added to your bag",
          description: "A new piece for your wardrobe.",
        });
      } else
        toast({
          title: "Couldn't add this piece. Please try again.",
          variant: "destructive",
        });
    });
  }

  function review(event) {
    event.preventDefault();
    setSubmitting(true);
    dispatch(
      addReview({
        productId: product._id,
        userId: user.id,
        userName: user.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      }),
    ).then((result) => {
      setSubmitting(false);
      if (result?.payload?.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(product._id));
        toast({ title: "Review submitted" });
      } else
        toast({
          title: result?.payload?.message || "Couldn't submit your review",
          variant: "destructive",
        });
    });
  }

  const average = reviews?.length
    ? reviews.reduce((sum, item) => sum + item.reviewValue, 0) / reviews.length
    : 0;
  const variants = product?.variants || [];
  const defaultVariant =
    variants.find((variant) => variant.available) || variants[0];
  const optionNames = [
    ...new Set(
      variants.flatMap((variant) => Object.keys(variant.options || {})),
    ),
  ];
  const activeOptions =
    selection.productId === product?._id
      ? selection.values
      : defaultVariant?.options || {};
  const selectedVariant = variants.find((variant) =>
    optionNames.every((name) => variant.options[name] === activeOptions[name]),
  );
  const price = (
    selectedVariant?.price ??
    (product?.salePrice > 0 ? product.salePrice : product?.price)
  )?.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const compareAt = selectedVariant?.compareAtPrice;
  const soldOut = variants.length
    ? !selectedVariant?.available
    : product?.totalStock === 0 || product?.availability === "sold-out";
  const buttonText = product?.localPreview
    ? "Local catalog preview"
    : soldOut
      ? "Out of stock"
      : adding
        ? "Adding\u2026"
        : added
          ? "In your bag"
          : "Add to bag";
  const ActionIcon = added ? Check : ShoppingBag;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) close();
      }}
    >
      <DialogContent
        ref={root}
        className="product-dialog"
        aria-describedby="product-description"
        onOpenAutoFocus={() => {
          opener.current = document.activeElement;
        }}
        onCloseAutoFocus={(event) => {
          if (opener.current?.isConnected) {
            event.preventDefault();
            opener.current.focus();
          }
        }}
      >
        <DialogTitle className="sr-only">
          {product?.title || "Product details"}
        </DialogTitle>
        <DialogDescription className="sr-only" id="product-description">
          Explore the garment photographs, inspect the price and availability,
          or add the piece to your bag.
        </DialogDescription>
        {product && (
          <>
            <div className="product-detail-layout">
              <GarmentGallery key={product._id} product={product} />
              <div className="product-info">
                <div className="product-heading">
                  <p className="eyebrow">
                    {product.taxonomy?.name ||
                      product.categoryLabel ||
                      categoryOptionsMap[product.category]}{" "}
                    / {product.brandLabel || brandOptionsMap[product.brand]}
                  </p>
                  <h1>{product.title}</h1>
                  <p className="review-count">
                    {product.localPreview
                      ? `${product.reviewSummary?.rating || 0} / 5 \u00b7 ${product.reviewSummary?.count || 0} source ratings`
                      : reviewsLoading
                        ? "Loading the conversation…"
                        : reviews?.length
                          ? `${average.toFixed(1)} / 5 · ${reviews.length} reviews`
                          : "A new piece to make your own"}
                  </p>
                </div>
                <div className="product-purchase-panel">
                  <div className="detail-price">
                    <span>${price}</span>
                    {product.salePrice > 0 && (
                      <del>${product.price?.toLocaleString("en-US")}</del>
                    )}
                  </div>
                  {compareAt > (selectedVariant?.price || 0) && (
                    <p className="catalog-source-note">
                      Source comparison price:{" "}
                      <del>${compareAt.toFixed(2)}</del>
                    </p>
                  )}
                  {!!optionNames.length && (
                    <div className="product-variant-selectors">
                      {optionNames.map((name) => (
                        <label key={name}>
                          {name}
                          <select
                            value={activeOptions[name] || ""}
                            onChange={(event) =>
                              setSelection({
                                productId: product._id,
                                values: {
                                  ...activeOptions,
                                  [name]: event.target.value,
                                },
                              })
                            }
                          >
                            {[
                              ...new Set(
                                variants
                                  .map((variant) => variant.options[name])
                                  .filter(Boolean),
                              ),
                            ].map((value) => (
                              <option value={value} key={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  )}
                  {selectedVariant?.sku && (
                    <p className="catalog-source-note">
                      SKU {selectedVariant.sku}
                    </p>
                  )}
                  <p className={`stock-note ${soldOut ? "is-sold-out" : ""}`}>
                    <span aria-hidden="true" />
                    {soldOut
                      ? variants.length && !selectedVariant
                        ? "This combination is unavailable"
                        : "Currently out of stock"
                      : product.totalStock < 10
                        ? `A limited find — ${product.totalStock} remaining`
                        : "Available for your wardrobe"}
                  </p>
                  <button
                    className="product-add-primary"
                    onClick={add}
                    disabled={product.localPreview || soldOut || adding}
                  >
                    <ActionIcon size={17} />
                    <span role="status">{buttonText}</span>
                    <span className="purchase-arrow" aria-hidden="true">
                      <ArrowUpRight size={17} />
                    </span>
                  </button>
                  {product.localPreview && (
                    <p className="catalog-preview-product-note">
                      Local dataset preview. These items are not imported into
                      the store database and cannot be purchased here.
                      Availability and prices reflect the supplied snapshot.
                    </p>
                  )}
                  <p className="product-sizing-note">
                    For sizing guidance,{" "}
                    <a href="mailto:admin@myntrixers.com">ask our team</a>.
                  </p>
                </div>
                <p className="product-description">{product.description}</p>
                <div className="fitting-room-invitation">
                  <span className="fitting-invite-mark" aria-hidden="true">
                    L.
                  </span>
                  <div>
                    <p className="eyebrow">THE VIRTUAL FITTING ROOM</p>
                    <p>Picture it on you.</p>
                    <Link onClick={close} to={`/shop/tryon/${product._id}`}>
                      Try this piece <ArrowUpRight size={15} />
                    </Link>
                  </div>
                  <Link
                    className="secondary-tryon"
                    onClick={close}
                    to={`/shop/tryon-youcam/${product._id}`}
                  >
                    Pro
                  </Link>
                </div>
                <details className="detail-disclosure" open>
                  <summary>
                    Fit & garment information <ChevronDown size={15} />
                  </summary>
                  <div>
                    {product.localPreview ? (
                      <>
                        <dl className="catalog-attributes">
                          {[
                            "fabric",
                            "material",
                            "fit",
                            "length",
                            "pattern",
                            "neckline",
                            "care",
                            "care_instructions",
                            "sizing_notes",
                          ]
                            .filter((key) => product.attributes?.[key])
                            .map((key) => (
                              <div key={key}>
                                <dt>{key.replaceAll("_", " ")}</dt>
                                <dd>{product.attributes[key]}</dd>
                              </div>
                            ))}
                        </dl>
                        <p className="catalog-source-note">
                          Taxonomy: {product.taxonomy?.fullPath}
                        </p>
                        <p className="catalog-source-note">
                          Supplier details may differ from the description.
                          Verify care and fit before purchasing from the source.
                        </p>
                      </>
                    ) : (
                      <p>
                        Explore the full silhouette, then bring the detail views
                        forward for a closer look. For the right fit, contact
                        our team about this piece before you order.
                      </p>
                    )}
                    <a className="text-link" href="mailto:admin@myntrixers.com">
                      Ask about this piece <ArrowUpRight size={14} />
                    </a>
                  </div>
                </details>
                <section className="reviews-section">
                  <div className="review-heading">
                    <p className="eyebrow">THE CONVERSATION</p>
                    <h2>Worn your way.</h2>
                  </div>
                  {product.localPreview ? (
                    <p className="review-count">
                      Only aggregate ratings are supplied by the source catalog.
                      Individual customer reviews are not included.
                    </p>
                  ) : reviews?.length ? (
                    reviews.map((item) => (
                      <article className="review-item" key={item._id}>
                        <div>
                          <strong>{item.userName}</strong>
                          <span>
                            <Star size={11} fill="currentColor" />{" "}
                            {item.reviewValue} / 5
                          </span>
                        </div>
                        <p>{item.reviewMessage}</p>
                      </article>
                    ))
                  ) : (
                    <p className="review-count">
                      No reviews yet. Share your thoughts after your purchase.
                    </p>
                  )}
                  {product.localPreview ? (
                    <p className="catalog-source-note">
                      Source: Livostyle open data. Updated{" "}
                      {new Date(product.source.updatedAt).toLocaleDateString(
                        "en-US",
                        { timeZone: "UTC" },
                      )}
                      .
                    </p>
                  ) : user ? (
                    <details className="review-compose">
                      <summary>
                        Write a review <PlusMark />
                      </summary>
                      <form className="review-form" onSubmit={review}>
                        <label htmlFor="garment-review">Your review</label>
                        <div
                          className="rating-buttons"
                          role="group"
                          aria-label="Your rating"
                        >
                          {[1, 2, 3, 4, 5].map((number) => (
                            <button
                              type="button"
                              key={number}
                              onClick={() => setRating(number)}
                              aria-label={`${number} star${number > 1 ? "s" : ""}`}
                              aria-pressed={rating === number}
                            >
                              <Star
                                size={20}
                                fill={
                                  rating >= number ? "currentColor" : "none"
                                }
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          id="garment-review"
                          value={reviewMsg}
                          onChange={(event) => setReviewMsg(event.target.value)}
                          placeholder="How did you wear it?"
                          rows={3}
                        />
                        <button
                          type="submit"
                          disabled={!reviewMsg.trim() || !rating || submitting}
                        >
                          {submitting ? "Submitting…" : "Submit review"}
                        </button>
                      </form>
                    </details>
                  ) : (
                    <Link
                      onClick={close}
                      className="text-link"
                      to="/auth/login"
                    >
                      Sign in to write a review <ArrowUpRight size={15} />
                    </Link>
                  )}
                </section>
              </div>
            </div>
            <div className="product-purchase-dock">
              <div>
                <span className="eyebrow">YOUR NEXT FAVOURITE</span>
                <strong>${price}</strong>
              </div>
              <button
                onClick={add}
                disabled={product.localPreview || soldOut || adding}
              >
                <ActionIcon size={17} />
                {buttonText}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PlusMark() {
  return <span aria-hidden="true">+</span>;
}
