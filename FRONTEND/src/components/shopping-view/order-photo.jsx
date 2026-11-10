import { useState } from "react";
import { Shirt } from "lucide-react";
import { imageDelivery } from "@/lib/image-delivery";

export default function OrderPhoto({ item, size = "120px" }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="account-order-photo">
      {item.image && !failed ? (
        <img
          {...imageDelivery(item.image, [160, 320])}
          sizes={size}
          alt={item.title || "Ordered piece"}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="account-photo-fallback"
          role="img"
          aria-label="Product photograph unavailable"
        >
          <Shirt size={24} strokeWidth={1} />
        </span>
      )}
    </span>
  );
}
