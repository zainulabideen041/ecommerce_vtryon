import { imageDelivery } from "@/lib/image-delivery";
import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Scan, ZoomIn, ZoomOut } from "lucide-react";
import { gsap, useGSAP } from "@/hooks/use-storefront-motion";
import { useReducedMotion } from "@/hooks/use-media-query";

// These are explicitly crops of the single catalog photograph, never invented
// front/back images. The full silhouette always remains the default view.
const singlePhotoViews = [
  {
    name: "The silhouette",
    short: "Full view",
    crop: "full",
    note: "The original photograph",
  },
  {
    name: "A closer look",
    short: "Upper detail",
    crop: "upper",
    note: "Upper detail · cropped from the original",
  },
  {
    name: "The drape",
    short: "Lower detail",
    crop: "lower",
    note: "Lower detail · cropped from the original",
  },
];

export default function GarmentGallery({ product }) {
  const photographs = [
    ...new Map(
      (product.images || []).map((image) => [image.url, image]),
    ).values(),
  ];
  const views =
    photographs.length > 1
      ? photographs.map((image, index) => ({
          name: image.alt || `Photograph ${index + 1}`,
          short: `Photo ${index + 1}`,
          crop: "full",
          note: "Original catalog photograph",
          url: image.url,
        }))
      : singlePhotoViews;
  const root = useRef(null);
  const stage = useRef(null);
  const panels = useRef([]);
  const thumbs = useRef([]);
  const swipe = useRef(null);
  const drag = useRef(null);
  const initialized = useRef(false);
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const reduceMotion = useReducedMotion();
  const id = useId();
  const current = views[selected];

  useGSAP(
    () => {
      const duration = initialized.current && !reduceMotion ? 0.65 : 0;
      initialized.current = true;
      panels.current.forEach((panel, index) => {
        if (!panel) return;
        const offset = (index - selected + views.length) % views.length;
        const side = offset === 1 ? 1 : -1;
        const active = index === selected;
        gsap.set(panel, { zIndex: active ? 3 : offset === 1 ? 2 : 1 });
        gsap.to(panel, {
          xPercent: active || reduceMotion ? 0 : side * 108,
          y: 0,
          z: reduceMotion || active ? 0 : -35,
          rotation: 0,
          rotationY: active || reduceMotion ? 0 : side * -10,
          scale: active || reduceMotion ? 1 : 0.96,
          opacity: active ? 1 : 0,
          duration,
          ease: "power3.inOut",
          overwrite: "auto",
        });
      });
    },
    { scope: root, dependencies: [selected, reduceMotion] },
  );

  function choose(index, focus = false) {
    setSelected((index + views.length) % views.length);
    setZoom(false);
    if (stage.current) stage.current.scrollTo({ top: 0, left: 0 });
    const thumbnail = thumbs.current[(index + views.length) % views.length];
    thumbnail?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
    if (focus) thumbnail?.focus({ preventScroll: true });
  }

  function keyNavigation(event) {
    if (zoom || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key))
      return;
    event.preventDefault();
    choose(
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? views.length - 1
          : selected + (event.key === "ArrowRight" ? 1 : -1),
      true,
    );
  }

  function startSwipe(event) {
    if (zoom) {
      if (event.pointerType === "mouse") {
        event.preventDefault();
        drag.current = {
          x: event.clientX,
          y: event.clientY,
          left: stage.current.scrollLeft,
          top: stage.current.scrollTop,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (event.pointerType === "mouse") return;
    swipe.current = { x: event.clientX, y: event.clientY };
  }
  function endSwipe(event) {
    drag.current = null;
    if (!swipe.current || zoom) return;
    const dx = event.clientX - swipe.current.x;
    const dy = event.clientY - swipe.current.y;
    swipe.current = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4)
      choose(selected + (dx < 0 ? 1 : -1));
  }

  return (
    <section
      ref={root}
      className={`garment-gallery ${zoom ? "is-inspecting" : ""}`}
      aria-label="Explore the garment photograph"
      onKeyDown={keyNavigation}
    >
      <div className="gallery-topline">
        <span>A CLOSER LOOK</span>
        <span>
          {String(selected + 1).padStart(2, "0")} /{" "}
          {String(views.length).padStart(2, "0")}
        </span>
      </div>
      <div className="gallery-deck-wrap">
        <div
          ref={stage}
          id={`${id}-stage`}
          className={`gallery-deck ${zoom ? "is-zoomed" : ""}`}
          tabIndex={zoom ? 0 : -1}
          aria-label={
            zoom
              ? "Enlarged photograph. Scroll in any direction to inspect."
              : current.name
          }
          onPointerDown={startSwipe}
          onPointerUp={endSwipe}
          onPointerMove={(event) => {
            if (drag.current) {
              stage.current.scrollLeft =
                drag.current.left - (event.clientX - drag.current.x);
              stage.current.scrollTop =
                drag.current.top - (event.clientY - drag.current.y);
            }
          }}
          onPointerCancel={() => {
            swipe.current = null;
            drag.current = null;
          }}
        >
          {views.map((view, index) => (
            <div
              ref={(element) => {
                panels.current[index] = element;
              }}
              className={`gallery-panel crop-${view.crop} ${index === selected ? "is-current" : ""}`}
              key={`${view.crop}-${index}`}
              aria-hidden={index !== selected}
            >
              {!failedImages[view.url || product.image] &&
              (index === selected || Math.abs(index - selected) === 1) ? (
                <img
                  src={view.url || product.image}
                  draggable={false}
                  loading={index === selected ? "eager" : "lazy"}
                  alt={`${product.title} — ${view.name}${index && !view.url ? " (detail crop)" : ""}`}
                  onError={() =>
                    setFailedImages((failed) => ({
                      ...failed,
                      [view.url || product.image]: true,
                    }))
                  }
                />
              ) : failedImages[view.url || product.image] ? (
                <div className="gallery-image-fallback">
                  <Scan size={32} />
                  <p>The photograph isn't available right now.</p>
                </div>
              ) : null}
              <span className="gallery-panel-label" aria-hidden="true">
                {view.short}
              </span>
            </div>
          ))}
        </div>
        {!zoom && (
          <div className="gallery-arrows">
            <button
              onClick={() => choose(selected - 1)}
              aria-label="Previous photographic view"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => choose(selected + 1)}
              aria-label="Next photographic view"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
        <button
          className="gallery-zoom"
          onClick={() => {
            setZoom((value) => !value);
            stage.current?.scrollTo({ top: 0, left: 0 });
          }}
          aria-label={zoom ? "Return to gallery" : "Inspect photograph"}
          aria-pressed={zoom}
          aria-controls={`${id}-stage`}
        >
          {zoom ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          <span>{zoom ? "Return to gallery" : "Inspect photograph"}</span>
        </button>
      </div>
      <div className="gallery-caption" aria-live="polite">
        <span>{current.name}</span>
        <span>{zoom ? "Scroll or drag to explore" : current.note}</span>
      </div>
      <div
        className="gallery-thumbnails"
        role="group"
        aria-label="Choose a photographic view"
      >
        {views.map((view, index) => (
          <button
            ref={(element) => {
              thumbs.current[index] = element;
            }}
            key={`${view.crop}-${index}`}
            onClick={() => choose(index)}
            aria-pressed={selected === index}
            aria-label={`${view.name}${index && !view.url ? ", detail crop from the original photograph" : ", original photograph"}`}
          >
            <span
              className={`gallery-thumb-photo crop-${view.crop}`}
              aria-hidden="true"
            >
              <img
                {...imageDelivery(view.url || product.image, [200, 400])}
                sizes="120px"
                alt=""
                loading="lazy"
                draggable={false}
              />
            </span>
            <span className="gallery-thumb-label">
              <span>0{index + 1}</span>
              {view.short}
            </span>
          </button>
        ))}
      </div>
      <p className="gallery-footnote">
        Explore the silhouette. Discover the details.
      </p>
    </section>
  );
}
