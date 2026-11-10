import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { imageDelivery } from "@/lib/image-delivery";
import { gsap, useGSAP } from "@/hooks/use-storefront-motion";
import { useReducedMotion } from "@/hooks/use-media-query";
import { useProductRail } from "./product-rail";

export default function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const root = useRef(null);
  const photo = useRef(null);
  const rail = useProductRail();
  const [focused, setFocused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [alternateLoaded, setAlternateLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const timer = useRef(null);
  const reduced = useReducedMotion();
  const active = rail ? rail.activeId === product._id : focused;
  const sale = product.salePrice > 0;
  const soldOut =
    product.totalStock === 0 || product.availability === "sold-out";
  const alternate = product.images?.find(
    (image) => image.url !== product.image,
  );
  const activate = () => (rail ? rail.activate(product._id) : setFocused(true));
  const release = () => (rail ? rail.release(product._id) : setFocused(false));
  useGSAP(
    () => {
      gsap.to(photo.current, {
        y: reduced ? 0 : active ? -3 : 0,
        scale: reduced ? 1 : active ? 1.035 : 1,
        rotationY: reduced ? 0 : active ? 2 : 0,
        duration: reduced ? 0 : 0.7,
        ease: "power3.out",
        overwrite: "auto",
      });
    },
    { scope: root, dependencies: [active, reduced] },
  );
  useEffect(() => () => clearTimeout(timer.current), []);
  async function add() {
    if (pending) return;
    setPending(true);
    try {
      const success = await handleAddtoCart(product._id, product.totalStock);
      if (success) {
        setAdded(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1800);
      }
    } finally {
      setPending(false);
    }
  }
  return (
    <article
      ref={root}
      className={`garment-card ${active ? "is-forward" : ""}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") activate();
      }}
      onPointerLeave={(event) => {
        if (
          event.pointerType === "mouse" &&
          !root.current?.contains(document.activeElement)
        )
          release();
      }}
      onFocusCapture={activate}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) release();
      }}
    >
      <button
        className="garment-photo"
        onClick={() => handleGetProductDetails(product._id)}
        aria-label={`Explore ${product.title}`}
      >
        <span
          ref={photo}
          className={`garment-frame ${loaded ? "is-loaded" : ""}`}
        >
          {!failed ? (
            <>
              <img
                {...imageDelivery(product.image)}
                sizes="(max-width: 767px) 44vw, (max-width: 1100px) 42vw, 24vw"
                alt={product.title}
                loading="lazy"
                decoding="async"
                draggable={false}
                onLoad={() => setLoaded(true)}
                onError={(event) => {
                  if (
                    product.thumbnail &&
                    !event.currentTarget.dataset.fallback
                  ) {
                    event.currentTarget.dataset.fallback = "true";
                    event.currentTarget.removeAttribute("srcset");
                    event.currentTarget.src = product.thumbnail;
                    return;
                  }
                  setFailed(true);
                  setLoaded(true);
                }}
              />
              {alternate && (active || alternateLoaded) && (
                <img
                  onLoad={() => setAlternateLoaded(true)}
                  className={`garment-alternate-photo ${alternateLoaded ? "is-ready" : ""}`}
                  {...imageDelivery(alternate.url)}
                  sizes="(max-width: 767px) 44vw, 24vw"
                  alt=""
                  draggable={false}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
            </>
          ) : (
            <span className="garment-image-fallback">{product.title}</span>
          )}
        </span>
        {(sale || soldOut) && (
          <span className="garment-badge">
            {soldOut ? "SOLD OUT" : "SPECIAL PRICE"}
          </span>
        )}
        <span className="garment-inspect">
          EXPLORE THE PIECE <ArrowUpRight size={16} />
        </span>
        <span className="garment-photo-number" aria-hidden="true">
          L.
        </span>
      </button>
      <div className="garment-meta">
        <p className="garment-category">
          {product.categoryLabel ||
            categoryOptionsMap[product.category] ||
            product.category}{" "}
          /{" "}
          {product.brandLabel ||
            brandOptionsMap[product.brand] ||
            product.brand}
        </p>
        <h3>
          <button onClick={() => handleGetProductDetails(product._id)}>
            {product.title}
          </button>
        </h3>
        <div className="garment-bottom">
          <div className="garment-price">
            <span>
              $
              {(sale ? product.salePrice : product.price)?.toLocaleString(
                "en-US",
              )}
            </span>
            {sale && <del>${product.price?.toLocaleString("en-US")}</del>}
            {product.totalStock > 0 && product.totalStock < 10 && (
              <small>{product.totalStock} left</small>
            )}
          </div>
          <button
            className={`garment-add ${added ? "is-added" : ""}`}
            disabled={soldOut || pending}
            onClick={
              product.localPreview
                ? () => handleGetProductDetails(product._id)
                : add
            }
            aria-label={
              product.localPreview
                ? `Inspect ${product.title}, local catalog preview`
                : added
                  ? `${product.title} added to your bag`
                  : `Add ${product.title} to bag`
            }
          >
            <span className="sr-only" role="status">
              {product.localPreview
                ? "Inspect local preview"
                : pending
                  ? "Adding…"
                  : added
                    ? "Added to bag"
                    : "Add to bag"}
            </span>
            {product.localPreview ? (
              <ArrowUpRight size={18} />
            ) : added ? (
              <Check size={18} />
            ) : (
              <Plus size={18} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
