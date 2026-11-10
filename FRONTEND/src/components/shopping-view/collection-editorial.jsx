import { useRef } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { gsap, useGSAP } from "@/hooks/use-storefront-motion";
import { useReducedMotion } from "@/hooks/use-media-query";
import { imageDelivery } from "@/lib/image-delivery";
import { MotionRibbon } from "./editorial-sections";

export function CollectionCampaign({
  name,
  products,
  loading,
  onInspect,
  total,
}) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const selected =
    products.length > 1
      ? [products[0], products[Math.min(products.length - 1, 4)]]
      : products.slice(0, 1);
  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        ".collection-campaign-title > *",
        { y: 20, opacity: 0.2 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
      gsap.fromTo(
        ".collection-campaign-portrait",
        { y: 25, opacity: 0.2 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
      gsap.fromTo(
        ".collection-campaign-art path",
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          duration: 1.8,
          stagger: 0.1,
          ease: "power2.out",
        },
      );
    },
    {
      scope: root,
      dependencies: [name, selected[0]?._id, reduced],
      revertOnUpdate: true,
    },
  );
  return (
    <section ref={root} className="collection-campaign">
      <div className="collection-campaign-copy">
        <p className="eyebrow">THE LUXAR EDIT / A NEW PERSPECTIVE</p>
        <h1 className="collection-campaign-title">
          <span>{name}</span>
          <em>collection.</em>
        </h1>
        <p>
          Distinctive silhouettes. A little unexpected.
          <br />
          Find the piece that feels like you.
        </p>
        <span className="collection-campaign-count" role="status">
          <span />
          {loading
            ? "Curating your edit…"
            : `${(total ?? products.length).toLocaleString()} pieces. Endless possibilities.`}
        </span>
      </div>
      <div className="collection-campaign-portraits">
        {selected.map((product, index) => (
          <button
            className={`collection-campaign-portrait portrait-${index + 1}`}
            key={product._id}
            onClick={() => onInspect(product._id)}
            aria-label={`Preview ${product.title}`}
          >
            <img
              {...imageDelivery(product.image, [400, 700])}
              sizes="(max-width: 767px) 43vw, 23vw"
              alt={product.title}
              loading="eager"
            />
            <span>
              <ArrowUpRight size={19} />
            </span>
          </button>
        ))}
      </div>
      <span className="collection-campaign-stamp" aria-hidden="true">
        L.
      </span>
      <MotionRibbon className="collection-campaign-art" />
    </section>
  );
}

export function CollectionInterlude({ product, onInspect }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced || !root.current) return;
      gsap.fromTo(
        ".interlude-mark",
        { rotation: -20 },
        {
          rotation: 35,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );
  return (
    <aside ref={root} className="collection-interlude">
      <div>
        <p className="eyebrow">AN INTERLUDE IN YOUR EDIT</p>
        <h2>
          Find your
          <br />
          <em>main-character</em>
          <br />
          moment.
        </h2>
        <p>A piece that feels like a point of view.</p>
        {product && (
          <button className="text-link" onClick={() => onInspect(product._id)}>
            Explore this piece <ArrowUpRight size={18} />
          </button>
        )}
      </div>
      <span className="interlude-mark" aria-hidden="true">
        ✳
      </span>
      {product && (
        <button
          className="interlude-photo"
          onClick={() => onInspect(product._id)}
          aria-label={`Explore ${product.title}`}
        >
          <img
            {...imageDelivery(product.image, [400, 700])}
            sizes="(max-width: 767px) 40vw, 25vw"
            alt={product.title}
            loading="lazy"
          />
        </button>
      )}
    </aside>
  );
}

export function CollectionFittingNote({ product }) {
  if (!product) return null;
  return (
    <div className="collection-fitting-note">
      <span className="collection-fitting-icon">
        <Sparkles size={22} />
      </span>
      <div>
        <p className="eyebrow">THE VIRTUAL FITTING ROOM</p>
        <h2>Love the look? See it on you.</h2>
        <p>Take a piece into the fitting room and try a new perspective.</p>
      </div>
      <Link className="solid-link" to={`/shop/tryon/${product._id}`}>
        Try a piece <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
