import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Scan,
  ZoomIn,
} from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, useGSAP } from "@/hooks/use-storefront-motion";
import { useMediaQuery, useReducedMotion } from "@/hooks/use-media-query";
import { imageDelivery } from "@/lib/image-delivery";

gsap.registerPlugin(ScrollTrigger);
import { editorialProduct as pick } from "@/lib/catalog-source";
export function useEditorialLayoutRefresh(dependency) {
  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => {
      if (active) ScrollTrigger.refresh();
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [dependency]);
}
const price = (product) =>
  `$${(product.salePrice > 0 ? product.salePrice : product.price).toLocaleString("en-US")}`;

function useSectionEntrance(scope, dependency) {
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced || !scope.current) return;
      gsap.fromTo(
        scope.current.querySelectorAll("[data-section-reveal]"),
        { y: 35, opacity: 0.2 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.09,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: scope.current,
            start: "top 82%",
            once: true,
          },
        },
      );
    },
    { scope, dependencies: [dependency, reduced], revertOnUpdate: true },
  );
}

export function MotionRibbon({ className = "" }) {
  return (
    <svg
      className={`motion-ribbon ${className}`}
      viewBox="0 0 600 400"
      fill="none"
      aria-hidden="true"
    >
      <path pathLength="1" d="M-50 310C60 30 175 40 280 205S485 405 650 35" />
      <path pathLength="1" d="M-50 335C70 55 180 65 285 230S500 430 650 60" />
      <path pathLength="1" d="M-50 360C80 80 185 90 290 255S515 455 650 85" />
    </svg>
  );
}

export function MoodPortraits({ products, onInspect }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 900px)");
  const portraits = [
    {
      product: pick(products, "Peachy"),
      title: "Soft spotlight.",
      note: "A quieter kind of statement.",
      tone: "soft",
    },
    {
      product: pick(products, "Midnight"),
      title: "After dark.",
      note: "A silhouette that holds the room.",
      tone: "dark",
    },
    {
      product: pick(products, "Grand Maroon"),
      title: "All eyes on you.",
      note: "For your unforgettable entrance.",
      tone: "bold",
    },
  ].filter((item) => item.product);
  useSectionEntrance(root, products.length);
  useGSAP(
    () => {
      if (reduced || !desktop || !root.current) return;
      root.current.querySelectorAll(".mood-photo img").forEach((image, index) =>
        gsap.fromTo(
          image,
          { yPercent: index === 1 ? 3 : -3, scale: 1.08 },
          {
            yPercent: index === 1 ? -3 : 3,
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          },
        ),
      );
    },
    {
      scope: root,
      dependencies: [products.length, reduced, desktop],
      revertOnUpdate: true,
    },
  );
  if (!portraits.length) return null;
  return (
    <section ref={root} className="mood-section store-section">
      <div className="mood-heading" data-section-reveal>
        <p className="eyebrow">01 / FOLLOW THE FEELING</p>
        <h2>
          Not a dress code.
          <br />
          <em>A state of mind.</em>
        </h2>
        <p>Different moods. The same unmistakable you.</p>
      </div>
      <div className="mood-portraits">
        {portraits.map(({ product, title, note, tone }, index) => (
          <article
            className={`mood-portrait mood-${tone}`}
            key={product._id}
            data-section-reveal
          >
            <button
              className="mood-photo"
              onClick={() => onInspect(product._id)}
              aria-label={`Explore ${title} ${product.title}`}
            >
              <span className="mood-photo-surface">
                <img
                  {...imageDelivery(product.image)}
                  sizes="(max-width: 767px) 82vw, 30vw"
                  alt={product.title}
                  loading="lazy"
                />
              </span>
              <span className="mood-number">0{index + 1}</span>
              <span className="mood-photo-arrow">
                <ArrowUpRight size={22} />
              </span>
              <span className="mood-photo-word" aria-hidden="true">
                {tone === "soft" ? "SOFT" : tone === "dark" ? "BOLD" : "YOU"}
              </span>
            </button>
            <div className="mood-caption">
              <h3>{title}</h3>
              <p>{note}</p>
              <span>{price(product)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ColorStories({ products, onInspect }) {
  const root = useRef(null);
  const controls = useRef([]);
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const stories = [
    {
      product: pick(products, "Royal Teal"),
      name: "TEAL",
      label: "The art of standing out.",
      color: "#27676a",
      tone: "teal",
      copy: "A rich hue. A flowing silhouette. The kind of colour that makes an entrance.",
    },
    {
      product: pick(products, "Dusty Rose"),
      name: "ROSE",
      label: "Soft, with a point of view.",
      color: "#c38a98",
      tone: "rose",
      copy: "An expressive shade that brings a softer perspective to your occasion wardrobe.",
    },
    {
      product: pick(products, "Powder Blue"),
      name: "BLUE",
      label: "A little unexpected.",
      color: "#8eaebb",
      tone: "blue",
      copy: "A cool-toned statement for the moments you want to make entirely your own.",
    },
    {
      product: pick(products, "Midnight"),
      name: "NOIR",
      label: "An enduring presence.",
      color: "#242127",
      tone: "noir",
      copy: "A dark silhouette. A distinctive shape. A different way to own the room.",
    },
  ].filter((story) => story.product);
  const current = stories[selected % Math.max(stories.length, 1)];
  useSectionEntrance(root, products.length);
  useGSAP(
    () => {
      if (reduced || !current) return;
      gsap.fromTo(
        ".color-story-photo img",
        { x: 35, opacity: 0.25, scale: 1.025 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
      gsap.fromTo(
        ".color-story-word",
        { xPercent: 3, opacity: 0 },
        {
          xPercent: 0,
          opacity: 0.12,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "transform",
        },
      );
      gsap.fromTo(
        ".color-story-product",
        { y: 10, opacity: 0.2 },
        { y: 0, opacity: 1, duration: 0.5, clearProps: "transform,opacity" },
      );
    },
    {
      scope: root,
      dependencies: [current?.product._id, reduced],
      revertOnUpdate: true,
    },
  );
  if (!current) return null;
  function navigate(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? stories.length - 1
          : (selected +
              (event.key === "ArrowRight" ? 1 : -1) +
              stories.length) %
            stories.length;
    setSelected(index);
    controls.current[index]?.focus();
  }
  return (
    <section
      ref={root}
      className={`color-story color-${current.tone}`}
      aria-label="Explore colour stories"
    >
      <div className="color-story-word" aria-hidden="true">
        {current.name}
      </div>
      <div className="color-story-copy" data-section-reveal>
        <p className="eyebrow">02 / COLOUR OUTSIDE THE LINES</p>
        <h2>
          A feeling.
          <br />
          <em>In full colour.</em>
        </h2>
        <p className="color-story-intro">Pick a shade. Change the mood.</p>
        <div
          className="color-palette"
          role="group"
          aria-label="Choose a colour story"
          onKeyDown={navigate}
        >
          {stories.map((story, index) => (
            <button
              key={story.name}
              ref={(element) => {
                controls.current[index] = element;
              }}
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
              aria-label={`${story.name} colour story`}
            >
              <span style={{ background: story.color }} />
              <span>{story.name}</span>
            </button>
          ))}
        </div>
        <div className="color-story-product" aria-live="polite">
          <h3>{current.label}</h3>
          <p>{current.copy}</p>
          <button
            onClick={() => onInspect(current.product._id)}
            className="text-link"
          >
            Explore {current.product.title} <ArrowUpRight size={18} />
          </button>
          <span className="color-story-price">{price(current.product)}</span>
        </div>
      </div>
      <button
        className="color-story-photo"
        onClick={() => onInspect(current.product._id)}
        aria-label={`Inspect ${current.product.title}`}
      >
        <img
          key={current.product._id}
          {...imageDelivery(current.product.image, [600, 1000, 1400])}
          sizes="(max-width: 767px) 85vw, 44vw"
          alt={current.product.title}
          loading="lazy"
        />
        <span className="color-story-photo-tag">
          THE COLOUR STUDY / 0{selected + 1}
        </span>
        <ArrowUpRight className="color-photo-arrow" size={25} />
      </button>
      <MotionRibbon className="color-story-ribbon" />
    </section>
  );
}

export function DetailStudio({ products, onInspect }) {
  const root = useRef(null);
  const panel = useRef(null);
  const photograph = useRef(null);
  const lens = useRef(null);
  const move = useRef(null);
  const bounds = useRef(null);
  const lensPoint = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const reduced = useReducedMotion();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const product = pick(products, "Regal Powder", 0);
  useSectionEntrance(root, product?._id);
  useGSAP(
    () => {
      if (!lens.current) return;
      move.current = {
        x: gsap.quickTo(lens.current, "x", {
          duration: reduced ? 0 : 0.18,
          ease: "power2.out",
        }),
        y: gsap.quickTo(lens.current, "y", {
          duration: reduced ? 0 : 0.18,
          ease: "power2.out",
        }),
      };
      return () => {
        move.current = null;
      };
    },
    {
      scope: root,
      dependencies: [product?._id, reduced],
      revertOnUpdate: true,
    },
  );
  useGSAP(
    () => {
      if (reduced || !root.current) return;
      gsap.fromTo(
        ".detail-stitch path",
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
        },
      );
    },
    {
      scope: root,
      dependencies: [product?._id, reduced],
      revertOnUpdate: true,
    },
  );
  if (!product) return null;
  function position(x, y) {
    const rect = bounds.current || panel.current.getBoundingClientRect();
    const radius = lens.current.offsetWidth / 2;
    const localX = Math.max(radius, Math.min(rect.width - radius, x));
    const localY = Math.max(radius, Math.min(rect.height - radius, y));
    const naturalWidth = photograph.current?.naturalWidth || rect.width;
    const naturalHeight = photograph.current?.naturalHeight || rect.height;
    const scale = Math.max(
      rect.width / naturalWidth,
      rect.height / naturalHeight,
    );
    const imageWidth = naturalWidth * scale;
    const imageHeight = naturalHeight * scale;
    const imageOffsetX = (rect.width - imageWidth) * 0.5;
    const imageOffsetY = (rect.height - imageHeight) * 0.25;
    lensPoint.current = { x: localX, y: localY };
    move.current?.x(localX - radius);
    move.current?.y(localY - radius);
    lens.current.style.backgroundSize = `${imageWidth * 2.5}px ${imageHeight * 2.5}px`;
    lens.current.style.backgroundPosition = `${radius - (localX - imageOffsetX) * 2.5}px ${radius - (localY - imageOffsetY) * 2.5}px`;
  }
  return (
    <section ref={root} className="detail-studio store-section">
      <div className="detail-studio-copy" data-section-reveal>
        <p className="eyebrow">03 / THE BEAUTY IS UP CLOSE</p>
        <h2>
          Small details.
          <br />
          <em>Big energy.</em>
        </h2>
        <p>
          A closer look changes everything. Explore the details of this piece
          through the original photograph.
        </p>
        <div className="detail-studio-actions">
          <button
            className="detail-lens-toggle"
            aria-pressed={pinned}
            onClick={() => {
              bounds.current = panel.current.getBoundingClientRect();
              position(bounds.current.width / 2, bounds.current.height / 2);
              setPinned((value) => !value);
            }}
          >
            <ZoomIn size={17} />
            {pinned ? "Full photograph" : "Magnify the details"}
          </button>
          <button className="text-link" onClick={() => onInspect(product._id)}>
            Meet the piece <ArrowUpRight size={18} />
          </button>
        </div>
        <div className="detail-product-note">
          <span>IN FOCUS</span>
          <h3>{product.title}</h3>
          <p>{price(product)}</p>
        </div>
        <svg
          className="detail-stitch"
          viewBox="0 0 350 150"
          fill="none"
          aria-hidden="true"
        >
          <path pathLength="1" d="M10 105C75 5 140 5 175 85S285 180 340 45" />
          <path
            pathLength="1"
            d="M10 120C75 20 140 20 175 100S285 195 340 60"
          />
        </svg>
      </div>
      <figure className="detail-studio-figure" data-section-reveal>
        <div
          ref={panel}
          className={`detail-studio-photo ${pinned || hovered ? "has-lens" : ""}`}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") {
              bounds.current = panel.current.getBoundingClientRect();
              position(
                event.clientX - bounds.current.left,
                event.clientY - bounds.current.top,
              );
              setHovered(true);
            }
          }}
          tabIndex={pinned ? 0 : -1}
          role="group"
          aria-label="Garment magnifier. When enabled, drag or use arrow keys to inspect details."
          style={{ touchAction: pinned ? "none" : "pan-y" }}
          onKeyDown={(event) => {
            if (
              pinned &&
              [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
              ].includes(event.key)
            ) {
              event.preventDefault();
              bounds.current = panel.current.getBoundingClientRect();
              const x =
                event.key === "Home"
                  ? bounds.current.width / 2
                  : lensPoint.current.x +
                    (event.key === "ArrowRight"
                      ? 25
                      : event.key === "ArrowLeft"
                        ? -25
                        : 0);
              const y =
                event.key === "Home"
                  ? bounds.current.height / 2
                  : lensPoint.current.y +
                    (event.key === "ArrowDown"
                      ? 25
                      : event.key === "ArrowUp"
                        ? -25
                        : 0);
              position(x, y);
            }
          }}
          onPointerDown={(event) => {
            if (pinned && event.pointerType !== "mouse") {
              bounds.current = panel.current.getBoundingClientRect();
              dragging.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              position(
                event.clientX - bounds.current.left,
                event.clientY - bounds.current.top,
              );
            }
          }}
          onPointerMove={(event) => {
            if (event.pointerType === "mouse" || dragging.current) {
              bounds.current = panel.current.getBoundingClientRect();
              position(
                event.clientX - bounds.current.left,
                event.clientY - bounds.current.top,
              );
            }
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          onPointerLeave={() => setHovered(false)}
        >
          <img
            ref={photograph}
            {...imageDelivery(product.image, [600, 1000, 1400])}
            sizes="(max-width: 767px) 90vw, 47vw"
            alt={product.title}
            loading="lazy"
            draggable={false}
          />
          <span
            ref={lens}
            className="detail-loupe"
            style={{
              backgroundImage:
                pinned || hovered ? `url("${product.image}")` : "none",
            }}
            aria-hidden="true"
          >
            <span>2.5×</span>
          </span>
          <span className="detail-corner detail-corner-tl" aria-hidden="true" />
          <span className="detail-corner detail-corner-br" aria-hidden="true" />
          <span className="detail-photo-label">
            <Scan size={14} /> THE DETAIL STUDIO
          </span>
        </div>
        <figcaption>
          Original photograph. Turn on the magnifier, then drag or use arrow
          keys to explore.
        </figcaption>
      </figure>
    </section>
  );
}

export function FashionLookbook({ products, onInspect }) {
  const root = useRef(null);
  const track = useRef(null);
  const progress = useRef(null);
  const reduced = useReducedMotion();
  const [edges, setEdges] = useState({ left: false, right: true });
  const selected = [
    "Mauve Organza",
    "Ethereal Mauve",
    "Dusty Rose",
    "Powder Blue Heavily",
  ]
    .map((phrase) => pick(products, phrase))
    .filter(Boolean);
  useSectionEntrance(root, products.length);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = element.scrollWidth - element.clientWidth;
        const next = {
          left: element.scrollLeft > 2,
          right: element.scrollLeft < max - 2,
        };
        setEdges((previous) =>
          previous.left === next.left && previous.right === next.right
            ? previous
            : next,
        );
        if (progress.current)
          progress.current.style.transform = `scaleX(${max > 0 ? 0.15 + (0.85 * element.scrollLeft) / max : 1})`;
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [products.length]);
  if (!selected.length) return null;
  function scroll(direction) {
    track.current.scrollBy({
      left: direction * track.current.clientWidth * 0.75,
      behavior: reduced ? "auto" : "smooth",
    });
  }
  return (
    <section ref={root} className="fashion-lookbook">
      <div className="lookbook-heading" data-section-reveal>
        <div>
          <p className="eyebrow">04 / THE MOMENT FILES</p>
          <h2>
            Looks to
            <br />
            <em>live in.</em>
          </h2>
        </div>
        <div className="lookbook-heading-right">
          <p>A few new perspectives for your next occasion.</p>
          <div className="lookbook-controls">
            <button
              onClick={() => scroll(-1)}
              disabled={!edges.left}
              aria-label="Previous lookbook pieces"
            >
              <ArrowLeft size={19} />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!edges.right}
              aria-label="Next lookbook pieces"
            >
              <ArrowRight size={19} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={track}
        className="lookbook-track"
        role="list"
        aria-label="The occasion lookbook"
      >
        {selected.map((product, index) => (
          <article key={product._id} className="lookbook-card" role="listitem">
            <button
              onClick={() => onInspect(product._id)}
              aria-label={`Explore lookbook piece ${product.title}`}
            >
              <span className="lookbook-card-number" aria-hidden="true">
                0{index + 1}
              </span>
              <img
                {...imageDelivery(product.image)}
                sizes="(max-width: 767px) 76vw, 33vw"
                alt={product.title}
                loading="lazy"
              />
              <span className="lookbook-card-arrow">
                <ArrowUpRight size={23} />
              </span>
            </button>
            <div>
              <span className="eyebrow">LOOK / 0{index + 1}</span>
              <h3>{product.title}</h3>
              <span className="lookbook-price">{price(product)}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="lookbook-progress" aria-hidden="true">
        <span ref={progress} />
      </div>
      <p className="lookbook-hint">
        A lookbook, at your pace. Swipe, scroll, or use the arrows.
      </p>
    </section>
  );
}

export function FashionManifesto() {
  const root = useRef(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced) return;
      const lines = root.current.querySelectorAll(".manifesto-line");
      lines.forEach((line, index) =>
        gsap.fromTo(
          line,
          { xPercent: index ? 3 : -3 },
          {
            xPercent: index ? -3 : 3,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        ),
      );
      gsap.fromTo(
        ".manifesto-mark",
        { rotation: -25, scale: 0.7 },
        {
          rotation: 35,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );
  return (
    <section ref={root} className="fashion-manifesto">
      <p className="eyebrow">THE LUXAR POINT OF VIEW</p>
      <span className="manifesto-mark" aria-hidden="true">
        ✳
      </span>
      <h2>
        <span className="manifesto-line">NOT JUST AN OUTFIT.</span>
        <span className="manifesto-line">
          <em>A point of view.</em>
        </span>
      </h2>
      <p>Dress for the feeling. Keep the confidence. Make the moment yours.</p>
      <MotionRibbon />
    </section>
  );
}
