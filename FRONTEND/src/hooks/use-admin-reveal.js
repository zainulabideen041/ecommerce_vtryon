import { gsap, useGSAP } from "@/hooks/use-storefront-motion";
import { useReducedMotion } from "@/hooks/use-media-query";

export function useAdminReveal(scope, dependency) {
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced || !scope.current) return;
      const targets = [
        ...scope.current.querySelectorAll("[data-admin-reveal]"),
      ].slice(0, 10);
      if (!targets.length) return;
      gsap.fromTo(
        targets,
        { y: 16, opacity: 0.25 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: {
            each: 0.045,
            amount: Math.min(0.28, targets.length * 0.045),
          },
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    },
    { scope, dependencies: [dependency, reduced], revertOnUpdate: true },
  );
}
