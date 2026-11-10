import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowUpRight,
  ArrowRight,
  Package,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Dialog } from "../ui/dialog";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import {
  orderState,
  orderDate,
  orderMoney,
  orderQuantity,
  orderReference,
} from "@/lib/order-presentation";
import { useAccountReveal } from "@/hooks/use-account-reveal";
import ShoppingOrderDetailsView from "./order-details";
import OrderPhoto from "./order-photo";

export default function ShoppingOrders() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [pendingId, setPendingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const root = useRef(null);
  const detailRequest = useRef(null);
  const inspectedId = useRef(null);
  const opener = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const { orderList = [], orderDetails } = useSelector(
    (state) => state.shopOrder,
  );
  const dispatch = useDispatch();
  useAccountReveal(
    root,
    `${loading}-${error}-${filter}-${sort}-${orderList?.length}`,
  );

  useEffect(() => {
    if (!user?.id) return;
    let current = true;
    setLoading(true);
    setError(false);
    const request = dispatch(getAllOrdersByUserId(user.id));
    request.then((result) => {
      if (!current) return;
      setError(!result?.payload?.success);
      setLoading(false);
    });
    return () => {
      current = false;
      request.abort();
    };
  }, [dispatch, user?.id, refresh]);
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
    setPendingId(id);
    setDetailError(false);
    setOpen(true);
    const request = dispatch(getOrderDetails(id));
    detailRequest.current = request;
    request.then((result) => {
      if (detailRequest.current !== request) return;
      setPendingId(null);
      setDetailError(!result?.payload?.success);
    });
  }
  function close() {
    detailRequest.current?.abort();
    detailRequest.current = null;
    setOpen(false);
    setPendingId(null);
    dispatch(resetOrderDetails());
  }
  const orders = Array.isArray(orderList) ? orderList : [];
  const groups = [
    { id: "all", label: "All orders", count: orders.length },
    {
      id: "active",
      label: "In progress",
      count: orders.filter(
        (order) => orderState(order.orderStatus).group === "active",
      ).length,
    },
    {
      id: "delivered",
      label: "Delivered",
      count: orders.filter(
        (order) => orderState(order.orderStatus).group === "delivered",
      ).length,
    },
    {
      id: "other",
      label: "Other",
      count: orders.filter(
        (order) => orderState(order.orderStatus).group === "other",
      ).length,
    },
  ];
  const visibleOrders = orders
    .filter(
      (order) =>
        filter === "all" || orderState(order.orderStatus).group === filter,
    )
    .sort((a, b) => {
      const difference =
        (Date.parse(b.orderDate) || 0) - (Date.parse(a.orderDate) || 0);
      return sort === "recent" ? difference : -difference;
    });
  return (
    <section
      className="wardrobe-orders"
      ref={root}
      aria-labelledby="order-history-title"
    >
      <div className="account-panel-heading" data-account-reveal>
        <div>
          <p className="eyebrow">01 / THE PIECES YOU CHOSE</p>
          <h2 id="order-history-title">
            Your wardrobe
            <br />
            <em>in motion.</em>
          </h2>
          <p>A record of the pieces that caught your eye.</p>
        </div>
        <span className="account-heading-mark" aria-hidden="true">
          <Package size={29} strokeWidth={1} />
        </span>
      </div>
      {loading ? (
        <div className="account-order-skeletons" role="status">
          <span className="sr-only">Opening your order history</span>
          {[0, 1].map((index) => (
            <div
              className="account-order-skeleton"
              key={index}
              aria-hidden="true"
            >
              <div />
              <div />
              <div />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="account-state account-error" role="alert">
          <AlertCircle size={32} strokeWidth={1} />
          <p className="eyebrow">LET'S TRY THAT AGAIN</p>
          <h3>Your orders couldn't be loaded.</h3>
          <p>Your history will appear here once we reconnect.</p>
          <button
            className="account-primary-action"
            onClick={() => setRefresh((value) => value + 1)}
          >
            Try again <RefreshCw size={16} />
          </button>
        </div>
      ) : orders.length ? (
        <>
          <div className="wardrobe-order-controls">
            <div role="group" aria-label="Filter your orders">
              {groups
                .filter((group) => group.id !== "other" || group.count)
                .map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setFilter(group.id)}
                    aria-pressed={filter === group.id}
                  >
                    {group.label}
                    <span>{group.count}</span>
                  </button>
                ))}
            </div>
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
          <p className="sr-only" role="status">
            {visibleOrders.length}{" "}
            {visibleOrders.length === 1 ? "order" : "orders"} shown
          </p>
          {visibleOrders.length ? (
            <div className="wardrobe-order-list">
              {visibleOrders.map((order) => {
                const status = orderState(order.orderStatus);
                const quantity = orderQuantity(order);
                const items = order.cartItems || [];
                return (
                  <article
                    className="wardrobe-order-card"
                    key={order._id}
                    data-account-reveal
                  >
                    <div className="wardrobe-order-top">
                      <div>
                        <span className="eyebrow">
                          ORDER / {orderReference(order._id)}
                        </span>
                        <time dateTime={order.orderDate}>
                          {orderDate(order.orderDate)}
                        </time>
                      </div>
                      <span className={`wardrobe-status tone-${status.tone}`}>
                        <span />
                        {status.label}
                      </span>
                    </div>
                    <div className="wardrobe-order-pieces">
                      {items.slice(0, 3).map((item, index) => (
                        <div key={`${item.productId}-${index}`}>
                          <OrderPhoto item={item} />
                          <div>
                            <h3>{item.title || "Your chosen piece"}</h3>
                            <span>Qty {item.quantity}</span>
                            <strong>
                              {orderMoney(item.price)} <small>each</small>
                            </strong>
                          </div>
                        </div>
                      ))}
                      {!items.length && (
                        <p>Open the receipt to view the order details.</p>
                      )}
                    </div>
                    <div className="wardrobe-order-bottom">
                      <div>
                        <span className="eyebrow">
                          {quantity} {quantity === 1 ? "PIECE" : "PIECES"}
                          {items.length > 3
                            ? ` / +${items.length - 3} MORE IN RECEIPT`
                            : ""}
                        </span>
                        <strong>{orderMoney(order.totalAmount)}</strong>
                      </div>
                      <button
                        onClick={(event) => inspect(order._id, event)}
                        disabled={pendingId === order._id}
                      >
                        View order <ArrowUpRight size={17} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="account-state account-filter-empty">
              <Package size={30} strokeWidth={1} />
              <h3>
                {filter === "delivered"
                  ? "Still a little anticipation."
                  : "Nothing in this chapter."}
              </h3>
              <p>No orders match this view.</p>
              <button className="text-link" onClick={() => setFilter("all")}>
                View all your orders <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="account-state account-first-order" data-account-reveal>
          <div className="account-empty-art" aria-hidden="true">
            <svg viewBox="0 0 220 180" fill="none">
              <path d="M67 67V48a43 43 0 0 1 86 0v19M40 65h140l13 103H27L40 65Z" />
              <path d="M76 74v20m68-20v20M58 128c30 25 74 25 104 0" />
              <path d="M14 35h20M24 25v20M178 17h24M190 5v24" />
            </svg>
            <span>&#10035;</span>
          </div>
          <p className="eyebrow">THE FIRST PAGE IS YOURS</p>
          <h3>
            Something good
            <br />
            <em>starts here.</em>
          </h3>
          <p>
            Your first order will begin your wardrobe story.
            <br />
            Until then, there's a whole collection to explore.
          </p>
          <Link to="/shop/listing" className="account-primary-action">
            Find your first piece <ArrowUpRight size={18} />
          </Link>
        </div>
      )}
      <div className="account-order-help">
        <span>Every order has a story. Need a hand with yours?</span>
        <a href="mailto:admin@myntrixers.com">
          Get in touch <ArrowUpRight size={14} />
        </a>
      </div>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) close();
        }}
      >
        <ShoppingOrderDetailsView
          orderDetails={orderDetails}
          loading={!!pendingId}
          error={detailError}
          onRetry={() => inspect(inspectedId.current)}
          opener={opener}
        />
      </Dialog>
    </section>
  );
}
