import { useState } from "react";
import { Image } from "lucide-react";
import { imageDelivery } from "@/lib/image-delivery";
export default function StudioPhoto({ src, alt = "", sizes = "240px" }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="studio-photo">
      {src && !failed ? (
        <img
          {...imageDelivery(src, [240, 480, 800])}
          alt={alt}
          sizes={sizes}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span role="img" aria-label="Photograph unavailable">
          <Image size={28} strokeWidth={1} />
        </span>
      )}
    </span>
  );
}
