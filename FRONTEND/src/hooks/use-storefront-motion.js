import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "./use-media-query";

gsap.registerPlugin(useGSAP);

// Observe actual content, including API results and account tabs. Nothing is
// hidden while waiting for JavaScript, images, or an intersection callback.
export function useStorefrontMotion(scope, routeKey, enabled = true) {
  const reduceMotion = useReducedMotion();
  const frame = useRef(0);
  useGSAP(
    (context, contextSafe) => {
      if (!enabled || reduceMotion || !scope.current) return;
      const seen = new WeakSet();
      const selectors = [
        ".page-intro",
        ".section-heading",
        ".garment-card",
        ".fitting-feature-copy",
        ".fitting-feature-wardrobe",
        ".fashion-directory nav > a",
        ".footer-top > div",
        ".auth-art-copy",
        ".auth-form-panel > .slide-up",
        ".status-page",
        ".fitting-heading",
        ".fitting-room > .grid > div",
        ".checkout-steps",
        ".checkout-grid > section",
        ".checkout-summary",
      ].join(",");
      const reveal = contextSafe((entries) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target);
        if (!entering.length) return;
        entering.forEach((element) => observer.unobserve(element));
        gsap.fromTo(
          entering,
          { y: 24, opacity: 0.2 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: {
              each: 0.055,
              amount: Math.min(0.22, entering.length * 0.055),
            },
            clearProps: "transform,opacity",
            overwrite: "auto",
          },
        );
      });
      const observer = new IntersectionObserver(reveal, {
        threshold: 0.07,
        rootMargin: "0px 0px -25px 0px",
      });
      const scan = () => {
        scope.current?.querySelectorAll(selectors).forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          observer.observe(element);
        });
      };
      const mutations = new MutationObserver(() => {
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(scan);
      });
      scan();
      mutations.observe(scope.current, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
        mutations.disconnect();
        cancelAnimationFrame(frame.current);
      };
    },
    {
      scope,
      dependencies: [routeKey, enabled, reduceMotion],
      revertOnUpdate: true,
    },
  );
}

export { gsap, useGSAP };
