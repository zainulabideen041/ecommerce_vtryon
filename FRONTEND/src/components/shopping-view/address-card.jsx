import { useState } from "react";
import { Check, MapPin, Pencil, Trash2 } from "lucide-react";
export default function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
  index = 0,
  deleting = false,
  busy = false,
}) {
  const [confirming, setConfirming] = useState(false);
  const selected = selectedId?._id === addressInfo?._id;
  return (
    <article
      className={`address-card address-postcard ${selected ? "is-selected" : ""}`}
      data-account-reveal
    >
      <div className="address-postcard-top">
        <span className="eyebrow">
          DELIVERY / {String(index + 1).padStart(2, "0")}
        </span>
        <MapPin size={19} strokeWidth={1} />
      </div>
      {setCurrentSelectedAddress && (
        <button
          className="address-select"
          aria-pressed={selected}
          onClick={() => setCurrentSelectedAddress(addressInfo)}
          disabled={deleting}
        >
          <span aria-hidden="true">{selected && <Check size={10} />}</span>
          {selected ? "Selected for delivery" : "Deliver to this address"}
        </button>
      )}
      <h3>
        {addressInfo.city || "Delivery address"}
        <span aria-hidden="true">.</span>
      </h3>
      <p>{addressInfo.address}</p>
      <p className="address-postcode">{addressInfo.pincode}</p>
      <p className="address-phone">{addressInfo.phone}</p>
      {addressInfo.notes && (
        <p className="address-notes">{addressInfo.notes}</p>
      )}
      {confirming ? (
        <div
          className="address-remove-confirm"
          role="group"
          aria-label="Confirm address removal"
        >
          <p>Remove this address?</p>
          <div>
            <button
              disabled={deleting}
              onClick={() => handleDeleteAddress(addressInfo)}
            >
              {deleting ? "Removing..." : "Yes, remove"}
            </button>
            <button disabled={deleting} onClick={() => setConfirming(false)}>
              Keep address
            </button>
          </div>
        </div>
      ) : (
        <div className="address-actions">
          <button
            disabled={busy}
            onClick={(event) => handleEditAddress(addressInfo, event)}
          >
            <Pencil size={13} />
            Edit details
          </button>
          <button
            disabled={busy}
            onClick={() => setConfirming(true)}
            aria-label={`Remove delivery address in ${addressInfo.city}`}
          >
            <Trash2 size={13} />
            <span>Remove</span>
          </button>
        </div>
      )}
    </article>
  );
}
