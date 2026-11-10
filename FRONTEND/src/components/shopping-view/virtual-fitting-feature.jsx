import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Shirt,
} from "lucide-react";
import { gsap, useGSAP } from "@/hooks/use-storefront-motion";
import { useReducedMotion } from "@/hooks/use-media-query";
import { editorialProduct } from "@/lib/catalog-source";
import { imageDelivery } from "@/lib/image-delivery";
import "@/virtual-fitting-feature.css";

const edits = [
  { phrase: "Grand Maroon", label: "The statement", color: "#80233e" },
  { phrase: "Sage", label: "The soft side", color: "#9caa8a" },
  { phrase: "Royal Teal", label: "The jewel", color: "#286970" },
];

function PhotoIllustration() {
  return (
    <svg viewBox="0 0 120 150" fill="none" aria-hidden="true">
      <path d="M15 34V15h19M86 15h19v19M105 116v19H86M34 135H15v-19" />
      <ellipse cx="60" cy="51" rx="17" ry="22" />
      <path d="M43 42c-1-20 34-21 34 0M45 69l-4 14-17 12-5 34h82l-5-34-17-12-4-14M41 83l19 17 19-17M60 100v29" />
      <path d="M12 76h96" strokeDasharray="2 5" opacity=".35" />
    </svg>
  );
}

export default function VirtualFittingFeature({ products = [] }) {
  const root = useRef(null);
  const stage = useRef(null);
  const timeline = useRef(null);
  const visible = useRef(false);
  const pausePreference = useRef(false);
  const choices = useRef([]);
  const headingId = useId();
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [readyId, setReadyId] = useState(null);
  const [failedId, setFailedId] = useState(null);
  const looks = edits
    .map((edit, index) => ({
      ...edit,
      product: editorialProduct(products, edit.phrase) || products[index],
    }))
    .filter(
      (edit, index, all) =>
        edit.product?.image &&
        all.findIndex((item) => item.product?._id === edit.product._id) ===
          index,
    );
  const look = looks[selected % Math.max(1, looks.length)];
  const product = look?.product;
  const photoReady = !!product && readyId === product._id;
  const photoFailed = !!product && failedId === product._id;
  const fittingRoom = product ? `/shop/tryon/${product._id}` : "/shop/listing";

  useEffect(() => {
    pausePreference.current = paused;
    timeline.current?.paused(paused || !visible.current);
  }, [paused]);

  useGSAP(
    () => {
      if (reduced || !photoReady) return;
      const find = gsap.utils.selector(root);
      const steps = find(".fitting-flow li");
      const sequence = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 0.7,
        defaults: { duration: 0.85, ease: "power3.inOut" },
      });
      timeline.current = sequence;
      sequence
        .set(steps, { opacity: 0.4 }, 0)
        .set(steps[0], { opacity: 1 }, 0)
        .set(".fitting-progress span", { scaleX: 0 }, 0)
        .set(".fitting-photo-mono", { opacity: 0.95 }, 0)
        .set(".fitting-scan-sheet", { yPercent: -100, opacity: 0 }, 0)
        .set(
          ".fitting-finish-spark",
          { scale: 0.7, rotation: -35, opacity: 0 },
          0,
        )
        .to(".fitting-garment-card", { x: 22, y: -12, rotation: 0 }, 0.3)
        .set(steps[0], { opacity: 0.4 }, 1.65)
        .set(steps[1], { opacity: 1 }, 1.65)
        .to(".fitting-person-card", { x: 12, y: -14, rotation: 0 }, 1.65)
        .to(
          ".fitting-connector",
          { strokeDashoffset: -40, duration: 2.6, ease: "none" },
          1.65,
        )
        .to(".fitting-scan-sheet", { opacity: 1, duration: 0.2 }, 2.2)
        .to(
          ".fitting-scan-sheet",
          { yPercent: 0, duration: 2.2, ease: "power1.inOut" },
          2.2,
        )
        .fromTo(
          ".fitting-portrait-photo, .fitting-photo-mono",
          { scale: 1.045 },
          { scale: 1, duration: 2.5 },
          2.2,
        )
        .to(".fitting-photo-mono", { opacity: 0, duration: 2.2 }, 2.2)
        .to(".fitting-scan-sheet", { opacity: 0, duration: 0.3 }, 4.4)
        .set(steps[1], { opacity: 0.4 }, 4.4)
        .set(steps[2], { opacity: 1 }, 4.4)
        .to(
          ".fitting-finish-spark",
          { scale: 1, rotation: 0, opacity: 1, ease: "back.out(1.4)" },
          4.4,
        )
        .to(
          ".fitting-progress span",
          { scaleX: 1, duration: 7.8, ease: "none" },
          0,
        )
        .to(".fitting-garment-card", { x: 0, y: 0, rotation: -8 }, 7)
        .to(".fitting-person-card", { x: 0, y: 0, rotation: 6 }, 7)
        .to(".fitting-photo-mono", { opacity: 0.95, duration: 0.8 }, 7)
        .to(
          ".fitting-finish-spark",
          { opacity: 0, scale: 0.7, rotation: -35 },
          7,
        );

      const observer = new IntersectionObserver(
        ([entry]) => {
          visible.current = entry.isIntersecting;
          sequence.paused(!entry.isIntersecting || pausePreference.current);
        },
        { threshold: 0.15 },
      );
      observer.observe(stage.current);
      return () => {
        observer.disconnect();
        timeline.current = null;
      };
    },
    {
      scope: root,
      dependencies: [reduced, product?._id, photoReady],
      revertOnUpdate: true,
    },
  );

  function choose(index, focus = false) {
    setSelected(index);
    if (focus) choices.current[index]?.focus();
  }

  function handleChoiceKey(event, index) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % looks.length
        : event.key === "ArrowLeft"
          ? (index + looks.length - 1) % looks.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? looks.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    choose(next, true);
  }

  function replay() {
    setPaused(false);
    timeline.current?.restart();
    if (!visible.current) timeline.current?.pause();
  }

  return (
    <section
      ref={root}
      className="virtual-fitting-feature"
      id="virtual-fitting-room"
      aria-labelledby={headingId}
    >
      <div className="fitting-feature-masthead">
        <span>LUXAR / THE FITTING ROOM</span>
        <span>YOUR STYLE. A NEW PERSPECTIVE.</span>
        <ScanLine size={18} aria-hidden="true" />
      </div>
      <div className="fitting-feature-layout">
        <div className="fitting-feature-copy">
          <p className="eyebrow">
            <span /> MEET VIRTUAL TRY-ON
          </p>
          <h2 id={headingId}>
            Try it
            <br />
            on <em>me.</em>
            <span aria-hidden="true">✳</span>
          </h2>
          <p className="fitting-feature-description">
            That piece you keep coming back to?
            <br />
            Picture it on you.
          </p>
          <ol className="fitting-feature-instructions">
            <li>
              <span>01</span>
              <div>
                <strong>Find your piece.</strong>
                <p>Start with a look you love.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Make it personal.</strong>
                <p>Add your photo in the fitting room.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>See a new possibility.</strong>
                <p>Create your virtual try-on preview.</p>
              </div>
            </li>
          </ol>
          <Link className="fitting-feature-cta" to={fittingRoom}>
            {product ? "Try it on me" : "Find your piece"}
            <ArrowUpRight size={22} />
          </Link>
          <p className="fitting-feature-disclaimer">
            A styling preview. Results may vary; this isn’t a size or fit
            assessment.
          </p>
        </div>
        <div className="fitting-feature-studio">
          <div
            ref={stage}
            className="fitting-motion-stage"
            aria-label="Animated illustration of choosing a garment and adding a photo. The featured look is a catalog photograph, not a generated try-on."
          >
            <span className="fitting-studio-word" aria-hidden="true">
              YOU.
            </span>
            <svg
              className="fitting-connection-graphic"
              viewBox="0 0 640 620"
              fill="none"
              aria-hidden="true"
            >
              <ellipse
                cx="350"
                cy="300"
                rx="278"
                ry="235"
                transform="rotate(-20 350 300)"
              />
              <path
                className="fitting-connector"
                d="M120 130C245 50 210 280 375 265M140 455C235 540 220 340 375 350"
                strokeDasharray="4 8"
              />
              <path d="M550 70v32m-16-16h32M70 302v18m-9-9h18" />
            </svg>
            <figure className="fitting-portrait">
              <div className="fitting-portrait-heading">
                <span>THE COLLECTION LOOK</span>
                <span>↗</span>
              </div>
              <div className="fitting-portrait-window">
                {product && !photoFailed ? (
                  <>
                    <img
                      key={product._id}
                      className="fitting-portrait-photo"
                      {...imageDelivery(product.image, [400, 700, 1000])}
                      sizes="(max-width: 600px) 64vw, (max-width: 1000px) 46vw, 29vw"
                      alt={product.title}
                      loading="lazy"
                      onLoad={() => setReadyId(product._id)}
                      onError={() => setFailedId(product._id)}
                    />
                    {photoReady && (
                      <img
                        className="fitting-photo-mono"
                        {...imageDelivery(product.image, [400, 700, 1000])}
                        sizes="(max-width: 600px) 64vw, (max-width: 1000px) 46vw, 29vw"
                        alt=""
                        aria-hidden="true"
                      />
                    )}
                  </>
                ) : (
                  <div className="fitting-photo-placeholder">
                    <Shirt size={52} />
                    <span>
                      {photoFailed
                        ? "Your next look awaits"
                        : "Discover your next look"}
                    </span>
                  </div>
                )}
                <div className="fitting-scan-sheet" aria-hidden="true">
                  <span>EXPLORING THE POSSIBILITIES</span>
                </div>
                <span
                  className="fitting-photo-corner fitting-photo-corner-top"
                  aria-hidden="true"
                />
                <span
                  className="fitting-photo-corner fitting-photo-corner-bottom"
                  aria-hidden="true"
                />
              </div>
              <figcaption>
                PRODUCT PHOTOGRAPH <span>01 / THE POSSIBILITIES</span>
              </figcaption>
            </figure>
            <div className="fitting-garment-card" aria-hidden="true">
              <span className="fitting-mini-label">01 / THE PIECE</span>
              {product ? (
                <img
                  {...imageDelivery(product.image, [200, 400])}
                  sizes="160px"
                  loading="lazy"
                  alt=""
                />
              ) : (
                <Shirt size={44} />
              )}
              <span className="fitting-garment-title">
                {look?.label || "A look you love"}
              </span>
            </div>
            <div className="fitting-person-card" aria-hidden="true">
              <span className="fitting-mini-label">02 / YOUR PHOTO</span>
              <PhotoIllustration />
              <span>Added in the fitting room</span>
            </div>
            <span className="fitting-finish-spark" aria-hidden="true">
              ✳
            </span>
            <span className="fitting-studio-annotation" aria-hidden="true">
              A LITTLE
              <br />
              <em>more you.</em>
            </span>
          </div>
          <div className="fitting-demonstration-controls">
            <ol className="fitting-flow" aria-label="Virtual try-on steps">
              <li>
                01 <span>Choose</span>
              </li>
              <li>
                02 <span>Your photo</span>
              </li>
              <li>
                03 <span>Preview</span>
              </li>
            </ol>
            <div className="fitting-playback">
              <button
                type="button"
                onClick={replay}
                disabled={reduced || !photoReady}
                aria-label="Replay fitting-room illustration"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                disabled={reduced || !photoReady}
                aria-label={
                  paused
                    ? "Play fitting-room illustration"
                    : "Pause fitting-room illustration"
                }
              >
                {paused || reduced ? <Play size={15} /> : <Pause size={15} />}
              </button>
            </div>
          </div>
          <div className="fitting-progress" aria-hidden="true">
            <span />
          </div>
          <p className="fitting-motion-caption">
            Motion illustration using collection photography. Create a try-on
            with your own photo in the fitting room.
          </p>
        </div>
      </div>
      <div className="fitting-feature-wardrobe">
        <div className="fitting-wardrobe-intro">
          <span className="eyebrow">START WITH A FEELING</span>
          <span>Choose your first look.</span>
        </div>
        <div
          className="fitting-look-choices"
          role="group"
          aria-label="Choose a garment for your virtual try-on"
        >
          {looks.map((item, index) => (
            <button
              key={item.product._id}
              type="button"
              ref={(node) => {
                choices.current[index] = node;
              }}
              aria-pressed={look.product._id === item.product._id}
              onClick={() => choose(index)}
              onKeyDown={(event) => handleChoiceKey(event, index)}
              style={{ "--look-color": item.color }}
            >
              <span className="fitting-choice-index">0{index + 1}</span>
              <span className="fitting-choice-swatch" />
              <span>{item.label}</span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
        {product && (
          <div className="fitting-selected-piece">
            <span>{product.title}</span>
            <strong>
              $
              {Number(
                product.salePrice > 0 ? product.salePrice : product.price,
              ).toLocaleString("en-US")}
            </strong>
          </div>
        )}
      </div>
    </section>
  );
}
