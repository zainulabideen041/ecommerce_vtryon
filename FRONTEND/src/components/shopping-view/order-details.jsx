import { useRef } from "react";
import { useSelector } from "react-redux";
import {
  ArrowUpRight,
  Check,
  MapPin,
  CreditCard,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import {
  orderState,
  orderDate,
  orderMoney,
  orderLineTotal,
  orderReference,
  orderQuantity,
} from "@/lib/order-presentation";
import { useAccountReveal } from "@/hooks/use-account-reveal";
import OrderPhoto from "./order-photo";

export default function ShoppingOrderDetailsView({
  orderDetails: order,
  loading,
  error,
  onRetry,
  opener,
}) {
  const { user } = useSelector((state) => state.auth);
  const root = useRef(null);
  useAccountReveal(root, `${loading}-${error}-${order?._id}`);
  const status = orderState(order?.orderStatus);
  const steps = ["Order placed", "Preparing", "On the way", "Delivered"];
  const items = order?.cartItems || [];
  return (
    <DialogContent
      ref={root}
      className="order-receipt"
      aria-describedby="receipt-description"
      onCloseAutoFocus={(event) => {
        if (opener?.current?.isConnected) {
          event.preventDefault();
          opener.current.focus();
        }
      }}
    >
      <header className="receipt-masthead">
        <p className="eyebrow">LUXAR / YOUR ORDER</p>
        <DialogTitle>
          The pieces.
          <br />
          <em>The details.</em>
        </DialogTitle>
        <DialogDescription id="receipt-description">
          {loading
            ? "Opening your order receipt."
            : error
              ? "We couldn't load this order."
              : `Your receipt for order ${orderReference(order?._id)}.`}
        </DialogDescription>
        <span className="receipt-masthead-mark" aria-hidden="true">
          &#10035;
        </span>
      </header>
      {loading ? (
        <div className="receipt-loading" role="status">
          <span className="sr-only">Loading your order details</span>
          <div />
          <div />
          <div />
        </div>
      ) : error || !order ? (
        <div className="account-state account-error" role="alert">
          <AlertCircle size={32} strokeWidth={1} />
          <h3>A brief interruption.</h3>
          <p>This receipt couldn't be loaded. Please try again.</p>
          <button className="account-primary-action" onClick={onRetry}>
            Try again <RefreshCw size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="receipt-status-strip" data-account-reveal>
            <div>
              <span className="eyebrow">
                ORDER / {orderReference(order._id)}
              </span>
              <span>Placed {orderDate(order.orderDate)}</span>
            </div>
            <span className={`wardrobe-status tone-${status.tone}`}>
              <span />
              {status.label}
            </span>
          </div>
          {status.step !== null ? (
            <div className="receipt-progress" data-account-reveal>
              <ol aria-label="Order progress">
                {steps.map((step, index) => (
                  <li
                    key={step}
                    className={
                      index < status.step
                        ? "is-complete"
                        : index === status.step
                          ? "is-current"
                          : ""
                    }
                    aria-current={index === status.step ? "step" : undefined}
                  >
                    <span>
                      {index < status.step ? (
                        <Check size={13} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                    <strong>{step}</strong>
                  </li>
                ))}
              </ol>
              <p>Progress reflects the latest status provided by the store.</p>
            </div>
          ) : (
            <div className="receipt-status-explanation">
              <p>
                {status.label}. Contact our team if you have a question about
                this order.
              </p>
            </div>
          )}
          <div className="receipt-layout">
            <section className="receipt-pieces" data-account-reveal>
              <div className="receipt-section-heading">
                <h3>Chosen by you.</h3>
                <span>
                  {orderQuantity(order)}{" "}
                  {orderQuantity(order) === 1 ? "piece" : "pieces"}
                </span>
              </div>
              <ul>
                {items.map((item, index) => (
                  <li key={`${item.productId}-${index}`}>
                    <OrderPhoto item={item} size="90px" />
                    <div>
                      <h4>{item.title || "Your chosen piece"}</h4>
                      {item.variantTitle && <p>{item.variantTitle}</p>}
                      <p>
                        Quantity {item.quantity}{" "}
                        <span aria-hidden="true">/</span>{" "}
                        {orderMoney(item.price)} each
                      </p>
                    </div>
                    <div className="receipt-line-total">
                      <span>LINE TOTAL</span>
                      <strong>{orderMoney(orderLineTotal(item))}</strong>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="receipt-official-total">
                <span>
                  Order total<small>As recorded on your order</small>
                </span>
                <strong>{orderMoney(order.totalAmount)}</strong>
              </div>
              <p className="receipt-full-reference">
                ORDER REFERENCE <span>{order._id}</span>
              </p>
            </section>
            <aside className="receipt-information" data-account-reveal>
              <section>
                <div className="receipt-information-heading">
                  <MapPin size={18} strokeWidth={1.5} />
                  <h3>The destination.</h3>
                </div>
                {order.addressInfo?.address ? (
                  <address>
                    <strong>{order.addressInfo.name || user?.userName}</strong>
                    <span>{order.addressInfo.address}</span>
                    <span>
                      {[order.addressInfo.city, order.addressInfo.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                    {order.addressInfo.phone && (
                      <span>{order.addressInfo.phone}</span>
                    )}
                  </address>
                ) : (
                  <p>Delivery details aren't available for this order.</p>
                )}
                {order.addressInfo?.notes && (
                  <div className="receipt-delivery-note">
                    <span className="eyebrow">DELIVERY NOTE</span>
                    <p>{order.addressInfo.notes}</p>
                  </div>
                )}
              </section>
              <section>
                <div className="receipt-information-heading">
                  <CreditCard size={18} strokeWidth={1.5} />
                  <h3>The payment.</h3>
                </div>
                <dl>
                  <div>
                    <dt>Method</dt>
                    <dd>{order.paymentMethod || "Not supplied"}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{order.paymentStatus || "Not supplied"}</dd>
                  </div>
                </dl>
              </section>
              <div className="receipt-help">
                <p>
                  We're here for
                  <br />
                  <em>the little details.</em>
                </p>
                <a
                  href={`mailto:admin@myntrixers.com?subject=${encodeURIComponent(`Order ${order._id}`)}`}
                >
                  Ask about this order <ArrowUpRight size={15} />
                </a>
              </div>
            </aside>
          </div>
          <footer className="receipt-footer">
            <span>THANK YOU FOR MAKING IT LUXAR.</span>
            <span>Your style. Your story.</span>
          </footer>
        </>
      )}
    </DialogContent>
  );
}
