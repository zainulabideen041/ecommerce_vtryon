import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { MapPin, CreditCard, UserRound, ArrowRight, Check } from "lucide-react";
import {
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AdminStatus, AdminState, AdminLoading } from "./studio-ui";
import StudioPhoto from "./studio-photo";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import {
  orderMoney,
  orderLineTotal,
  orderDate,
  orderReference,
} from "@/lib/order-presentation";
import { useToast } from "@/components/ui/use-toast";
import { useAdminReveal } from "@/hooks/use-admin-reveal";
const statuses = [
  ["pending", "Order placed"],
  ["confirmed", "Confirmed"],
  ["inProcess", "Preparing"],
  ["inShipping", "On the way"],
  ["delivered", "Delivered"],
  ["rejected", "Rejected"],
];
export default function AdminOrderDetailsView({
  orderDetails: order,
  loading,
  error,
  onRetry,
  onSavingChange,
  opener,
}) {
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const root = useRef(null);
  const dispatch = useDispatch();
  const { toast } = useToast();
  useAdminReveal(root, `${loading}-${error}-${order?._id}`);
  useEffect(() => {
    setStatus(order?.orderStatus || "");
    setMessage("");
  }, [order?._id, order?.orderStatus]);
  async function submit(event) {
    event.preventDefault();
    if (saving || !order?._id || !status || status === order.orderStatus)
      return;
    setSaving(true);
    onSavingChange?.(true);
    setMessage("");
    const result = await dispatch(
      updateOrderStatus({ id: order._id, orderStatus: status }),
    );
    if (result.payload?.success) {
      await Promise.all([
        dispatch(getOrderDetailsForAdmin(order._id)),
        dispatch(getAllOrdersForAdmin()),
      ]);
      setMessage("Order status updated.");
      toast({ title: "Order status updated" });
    } else
      toast({
        title: "The status couldn't be updated. Please try again.",
        variant: "destructive",
      });
    setSaving(false);
    onSavingChange?.(false);
  }
  return (
    <DialogContent
      className="admin-order-dialog"
      ref={root}
      aria-describedby="admin-order-description"
      onCloseAutoFocus={(event) => {
        if (opener?.current?.isConnected) {
          event.preventDefault();
          opener.current.focus();
        }
      }}
      onEscapeKeyDown={(event) => {
        if (saving) event.preventDefault();
      }}
      onInteractOutside={(event) => {
        if (saving) event.preventDefault();
      }}
    >
      <header className="admin-dialog-heading">
        <p className="admin-eyebrow">THE CUSTOMER EDIT / ORDER DETAILS</p>
        <DialogTitle>
          The order.
          <br />
          <em>The next step.</em>
        </DialogTitle>
        <DialogDescription id="admin-order-description">
          {loading
            ? "Opening this order..."
            : order
              ? `Order ${orderReference(order._id)} / ${orderDate(order.orderDate)}`
              : "Order details are currently unavailable."}
        </DialogDescription>
      </header>
      {loading ? (
        <AdminLoading count={2} />
      ) : error || !order ? (
        <AdminState
          error
          title="This order couldn't be opened."
          description="Try reconnecting to view its details."
          onRetry={onRetry}
        />
      ) : (
        <>
          <div className="admin-order-detail-status">
            <div>
              <span className="admin-eyebrow">CURRENT STATUS</span>
              <AdminStatus value={order.orderStatus} />
            </div>
            <strong>
              {orderMoney(order.totalAmount)}
              <small>ORDER TOTAL</small>
            </strong>
          </div>
          <div className="admin-order-detail-layout">
            <section className="admin-order-items" data-admin-reveal>
              <div className="admin-panel-heading">
                <h3>The chosen pieces.</h3>
                <span>{order.cartItems?.length || 0} items</span>
              </div>
              <ul>
                {(order.cartItems || []).map((item, index) => (
                  <li key={`${item.productId}-${index}`}>
                    <StudioPhoto
                      src={item.image}
                      alt={item.title}
                      sizes="90px"
                    />
                    <div>
                      <h4>{item.title}</h4>
                      <p>
                        Qty {item.quantity} / {orderMoney(item.price)} each
                      </p>
                      {item.variantTitle && <p>{item.variantTitle}</p>}
                    </div>
                    <strong>{orderMoney(orderLineTotal(item))}</strong>
                  </li>
                ))}
              </ul>
              <div className="admin-order-reference">
                <span className="admin-eyebrow">FULL ORDER REFERENCE</span>
                <p>{order._id}</p>
              </div>
            </section>
            <aside className="admin-order-facts" data-admin-reveal>
              <section>
                <h3>
                  <UserRound size={17} />
                  The customer.
                </h3>
                <dl>
                  <div>
                    <dt>Customer ID</dt>
                    <dd>{order.userId || "Not supplied"}</dd>
                  </div>
                  {order.addressInfo?.userName && (
                    <div>
                      <dt>Name</dt>
                      <dd>{order.addressInfo.userName}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Phone</dt>
                    <dd>{order.addressInfo?.phone || "Not supplied"}</dd>
                  </div>
                </dl>
              </section>
              <section>
                <h3>
                  <MapPin size={17} />
                  The destination.
                </h3>
                <address>
                  {order.addressInfo?.address || "Not supplied"}
                  <br />
                  {[order.addressInfo?.city, order.addressInfo?.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </address>
                {order.addressInfo?.notes && (
                  <p className="admin-delivery-notes">
                    {order.addressInfo.notes}
                  </p>
                )}
              </section>
              <section>
                <h3>
                  <CreditCard size={17} />
                  The payment.
                </h3>
                <dl>
                  <div>
                    <dt>Method</dt>
                    <dd>{order.paymentMethod || "Not supplied"}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{order.paymentStatus || "Not supplied"}</dd>
                  </div>
                  {order.paymentId && (
                    <div>
                      <dt>Payment ID</dt>
                      <dd>{order.paymentId}</dd>
                    </div>
                  )}
                  {order.payerId && (
                    <div>
                      <dt>Payer ID</dt>
                      <dd>{order.payerId}</dd>
                    </div>
                  )}
                </dl>
              </section>
            </aside>
          </div>
          <form className="admin-status-editor" onSubmit={submit}>
            <div>
              <span className="admin-eyebrow">KEEP IT MOVING</span>
              <h3>Update this order.</h3>
              {message && (
                <p role="status">
                  <Check size={13} />
                  {message}
                </p>
              )}
            </div>
            <label>
              <span className="sr-only">New order status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={saving}
              >
                {!statuses.some(([value]) => value === status) && (
                  <option value={status}>{status || "Select status"}</option>
                )}
                {statuses.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="admin-button"
              disabled={saving || !status || status === order.orderStatus}
            >
              {saving ? "Updating..." : "Save status"}
              <ArrowRight size={16} />
            </button>
          </form>
        </>
      )}
    </DialogContent>
  );
}
