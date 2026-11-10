import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, X, ArrowUpRight, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import {
  AdminPageHeader,
  AdminState,
  AdminLoading,
  AdminStatus,
  AdminConfirm,
} from "./studio-ui";
import AdminOrderDetailsView from "./order-details";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  deleteOrder,
} from "@/store/admin/order-slice";
import {
  orderMoney,
  orderDate,
  orderReference,
  orderQuantity,
} from "@/lib/order-presentation";
import { useAdminReveal } from "@/hooks/use-admin-reveal";
import { useToast } from "@/components/ui/use-toast";
const statuses = [
  ["pending", "Order placed"],
  ["confirmed", "Confirmed"],
  ["inProcess", "Preparing"],
  ["inShipping", "On the way"],
  ["delivered", "Delivered"],
  ["rejected", "Rejected"],
];
export default function AdminOrdersView() {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("recent");
  const [refresh, setRefresh] = useState(0);
  const root = useRef(null);
  const detailRequest = useRef(null);
  const inspectedId = useRef(null);
  const openedQuery = useRef(null);
  const opener = useRef(null);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const orders = orderList || [];
  useAdminReveal(root, `${loading}-${query}-${status}-${sort}`);
  useEffect(() => {
    let active = true;
    setLoading(true);
    dispatch(getAllOrdersForAdmin()).then((result) => {
      if (active) {
        setLoading(false);
        setError(!result.payload?.success);
      }
    });
    return () => {
      active = false;
    };
  }, [dispatch, refresh]);
  useEffect(() => {
    const id = params.get("order");
    if (id && openedQuery.current !== id) {
      openedQuery.current = id;
      inspect(id);
    }
  }, [params]);
  useEffect(
    () => () => {
      detailRequest.current?.abort();
      detailRequest.current = null;
      dispatch(resetOrderDetails());
    },
    [dispatch],
  );
  function inspect(id, event) {
    inspectedId.current = id;
    if (event) opener.current = event.currentTarget;
    detailRequest.current?.abort();
    dispatch(resetOrderDetails());
    setOpen(true);
    setDetailLoading(true);
    setDetailError(false);
    const request = dispatch(getOrderDetailsForAdmin(id));
    detailRequest.current = request;
    request.then((result) => {
      if (detailRequest.current === request) {
        setDetailLoading(false);
        setDetailError(!result.payload?.success);
      }
    });
  }
  function close() {
    if (detailSaving) return;
    detailRequest.current?.abort();
    detailRequest.current = null;
    dispatch(resetOrderDetails());
    setOpen(false);
    const next = new URLSearchParams(params);
    next.delete("order");
    setParams(next, { replace: true });
  }
  async function remove() {
    if (!removeTarget || deleting) return;
    setDeleting(true);
    const result = await dispatch(deleteOrder(removeTarget._id));
    setDeleting(false);
    if (result.payload?.success) {
      setRemoveTarget(null);
      setRefresh((value) => value + 1);
      toast({ title: "Order removed" });
    } else
      toast({
        title: "The order couldn't be removed. Please try again.",
        variant: "destructive",
      });
  }
  const filtered = orders
    .filter(
      (order) =>
        (!status || order.orderStatus === status) &&
        `${order._id} ${order.userId} ${order.addressInfo?.city || ""} ${(order.cartItems || []).map((item) => item.title).join(" ")}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => {
      const date =
        (Date.parse(b.orderDate) || 0) - (Date.parse(a.orderDate) || 0);
      return sort === "recent" ? date : -date;
    });
  return (
    <div ref={root}>
      <AdminPageHeader
        index="03"
        eyebrow="THE CUSTOMER EDIT"
        title="Every order."
        accent="Every detail."
        description="From a first choice to a favourite piece. Keep each customer's order moving."
      />
      <div className="admin-order-summary-strip">
        <div>
          <strong>{loading ? "..." : error ? "\u2014" : orders.length}</strong>
          <span>Total orders</span>
        </div>
        <div>
          <strong>
            {loading
              ? "..."
              : error
                ? "\u2014"
                : orders.filter((order) =>
                    ["pending", "confirmed", "inProcess"].includes(
                      order.orderStatus,
                    ),
                  ).length}
          </strong>
          <span>Awaiting dispatch</span>
        </div>
        <div>
          <strong>
            {loading
              ? "..."
              : error
                ? "\u2014"
                : orders.filter((order) => order.orderStatus === "inShipping")
                    .length}
          </strong>
          <span>On the way</span>
        </div>
        <div>
          <strong>
            {loading
              ? "..."
              : error
                ? "\u2014"
                : orders.filter((order) => order.orderStatus === "delivered")
                    .length}
          </strong>
          <span>Delivered</span>
        </div>
      </div>
      <div className="admin-catalog-toolbar">
        <label className="admin-search">
          <Search size={16} />
          <span className="sr-only">Search orders</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find an order, customer ID or piece"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear order search"
            >
              <X size={15} />
            </button>
          )}
        </label>
        <label>
          <span className="sr-only">Filter order status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Every status</option>
            {statuses.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort orders</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="recent">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>
      {loading ? (
        <AdminLoading count={3} label="Loading customer orders" />
      ) : error ? (
        <AdminState
          error
          title="A brief interruption."
          description="Your orders couldn't be loaded. Try reconnecting."
          onRetry={() => setRefresh((value) => value + 1)}
        />
      ) : filtered.length ? (
        <section className="admin-orders-panel">
          <div className="admin-table-caption">
            <span>
              {filtered.length} {filtered.length === 1 ? "ORDER" : "ORDERS"} IN
              THIS VIEW
            </span>
            <span>THE LUXAR ORDER BOOK</span>
          </div>
          <div className="admin-order-table-wrap">
            <table className="admin-order-table">
              <caption className="sr-only">
                Customer orders, status, totals and management actions
              </caption>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer / destination</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>
                    <span className="sr-only">Manage order</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>#{orderReference(order._id)}</strong>
                      <small>
                        {orderDate(order.orderDate)} <span>/</span>{" "}
                        {orderQuantity(order)} pieces
                      </small>
                    </td>
                    <td>
                      <span>
                        {order.addressInfo?.userName ||
                          order.addressInfo?.city ||
                          "Customer"}
                      </span>
                      <small title={order.userId}>
                        {order.userId
                          ? `ID ${String(order.userId).slice(-8)}`
                          : "ID not supplied"}
                      </small>
                    </td>
                    <td>
                      <AdminStatus value={order.orderStatus} />
                    </td>
                    <td className="admin-order-amount">
                      {orderMoney(order.totalAmount)}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          onClick={(event) => inspect(order._id, event)}
                          aria-label={`Open order ${orderReference(order._id)}`}
                        >
                          Details <ArrowUpRight size={15} />
                        </button>
                        <button
                          className="admin-icon-button"
                          onClick={() => setRemoveTarget(order)}
                          aria-label={`Remove order ${orderReference(order._id)}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <AdminState
          title={
            orders.length
              ? "Nothing in this edit."
              : "The first order is a new beginning."
          }
          description={
            orders.length
              ? "Try another status or search to find the order you need."
              : "Your customers' orders will appear here when they make a purchase."
          }
          action={
            orders.length > 0 && (
              <button
                className="admin-button secondary"
                onClick={() => {
                  setQuery("");
                  setStatus("");
                }}
              >
                Clear filters
              </button>
            )
          }
        />
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) close();
        }}
      >
        <AdminOrderDetailsView
          orderDetails={orderDetails}
          loading={detailLoading}
          error={detailError}
          onRetry={() => inspect(inspectedId.current)}
          onSavingChange={setDetailSaving}
          opener={opener}
        />
      </Dialog>
      <AdminConfirm
        open={!!removeTarget}
        onOpenChange={(value) => {
          if (!value) setRemoveTarget(null);
        }}
        title="Remove this order?"
        description={`This deletes order ${orderReference(removeTarget?._id)} from your store's order records.`}
        pending={deleting}
        onConfirm={remove}
      />
    </div>
  );
}
