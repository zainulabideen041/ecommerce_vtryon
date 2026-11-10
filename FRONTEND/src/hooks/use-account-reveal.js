import { gsap, useGSAP } from "@/hooks/use-storefront-motion";
import { useReducedMotion } from "@/hooks/use-media-query";

export function useAccountReveal(scope, dependency) {
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced || !scope.current) return;
      const elements = [
        ...scope.current.querySelectorAll("[data-account-reveal]"),
      ].slice(0, 8);
      if (!elements.length) return;
      gsap.fromTo(
        elements,
        { y: 18, opacity: 0.2 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: {
            each: 0.055,
            amount: Math.min(0.28, elements.length * 0.055),
          },
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    },
    { scope, dependencies: [reduced, dependency], revertOnUpdate: true },
  );
}
