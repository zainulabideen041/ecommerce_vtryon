import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  Users,
  ArrowRight,
  Plus,
} from "lucide-react";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice";
import {
  AdminState,
  AdminStatus,
  AdminLoading,
} from "@/components/admin-view/studio-ui";
import StudioPhoto from "@/components/admin-view/studio-photo";
import {
  orderMoney,
  orderDate,
  orderReference,
} from "@/lib/order-presentation";
import { useAdminReveal } from "@/hooks/use-admin-reveal";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { productList } = useSelector((state) => state.adminProducts);
  const { orderList } = useSelector((state) => state.adminOrder);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ products: false, orders: false });
  const [refresh, setRefresh] = useState(0);
  const root = useRef(null);
  useAdminReveal(root, `${loading}-${refresh}`);
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      dispatch(fetchAllProducts()),
      dispatch(getAllOrdersForAdmin()),
    ]).then(([products, orders]) => {
      if (!active) return;
      setErrors({
        products: !products.payload?.success,
        orders: !orders.payload?.success,
      });
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [dispatch, refresh]);
  const products = productList || [];
  const orders = orderList || [];
  const revenue = orders.reduce(
    (sum, order) =>
      ["confirmed", "delivered"].includes(order.orderStatus)
        ? sum + (Number(order.totalAmount) || 0)
        : sum,
    0,
  );
  const customers = new Set(orders.map((order) => order.userId).filter(Boolean))
    .size;
  const recent = [...orders]
    .sort(
      (a, b) => (Date.parse(b.orderDate) || 0) - (Date.parse(a.orderDate) || 0),
    )
    .slice(0, 5);
  const stock = products
    .filter(
      (product) =>
        Number.isFinite(product.totalStock) && product.totalStock < 5,
    )
    .sort((a, b) => a.totalStock - b.totalStock)
    .slice(0, 4);
  const categories = Object.entries(
    products.reduce((counts, product) => {
      const category =
        product.categoryLabel || product.category || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const stats = [
    {
      label: "Products",
      value: errors.products ? "\u2014" : products.length,
      note: "Pieces in your store",
      icon: Package,
    },
    {
      label: "Orders",
      value: errors.orders ? "\u2014" : orders.length,
      note: "Across all order statuses",
      icon: ShoppingBag,
    },
    {
      label: "Ordering customers",
      value: errors.orders ? "\u2014" : customers,
      note: "Unique customers in your orders",
      icon: Users,
    },
    {
      label: "Order revenue",
      value: errors.orders ? "\u2014" : orderMoney(revenue),
      note: "Confirmed & delivered orders",
      icon: ArrowUpRight,
    },
  ];
  return (
    <div className="admin-overview" ref={root}>
      <section className="admin-overview-hero" data-admin-reveal>
        <div>
          <p className="admin-eyebrow">01 / THE STUDIO OVERVIEW</p>
          <h1>
            A good day
            <br />
            for <em>good style.</em>
          </h1>
          <p>
            A clear view of your collection, your orders and the details that
            keep your store moving.
          </p>
          <Link to="/admin/products">
            Curate your collection <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="admin-overview-art" aria-hidden="true">
          <span>L.</span>
          <svg viewBox="0 0 400 400" fill="none">
            <ellipse
              cx="200"
              cy="200"
              rx="180"
              ry="95"
              transform="rotate(-30 200 200)"
            />
            <ellipse
              cx="200"
              cy="200"
              rx="180"
              ry="95"
              transform="rotate(40 200 200)"
            />
            <circle cx="200" cy="200" r="140" />
          </svg>
          <small>THE LUXAR POINT OF VIEW</small>
        </div>
      </section>
      {loading ? (
        <AdminLoading label="Loading your store overview" count={4} />
      ) : (
        <div className="admin-stat-grid">
          {stats.map((stat, index) => (
            <article
              key={stat.label}
              className={`admin-stat stat-${index + 1}`}
              data-admin-reveal
            >
              <div>
                <span>{stat.label}</span>
                <stat.icon size={19} strokeWidth={1.25} />
              </div>
              <strong>{stat.value}</strong>
              <p>{stat.note}</p>
            </article>
          ))}
        </div>
      )}
      {!loading && (errors.products || errors.orders) && (
        <div className="admin-inline-error" role="alert">
          <span>
            Some store data couldn't be loaded. Unavailable totals are marked
            with a dash.
          </span>
          <button onClick={() => setRefresh((value) => value + 1)}>
            Retry overview <ArrowRight size={15} />
          </button>
        </div>
      )}
      <div className="admin-overview-panels">
        <section className="admin-panel" data-admin-reveal>
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">THE CUSTOMER EDIT</p>
              <h2>Latest orders.</h2>
            </div>
            <Link to="/admin/orders" aria-label="View all orders">
              <ArrowUpRight size={21} />
            </Link>
          </div>
          {loading ? (
            <AdminLoading count={1} />
          ) : errors.orders ? (
            <AdminState
              error
              title="Orders unavailable"
              description="Refresh the overview to reconnect."
              onRetry={() => setRefresh((value) => value + 1)}
            />
          ) : recent.length ? (
            <div className="admin-recent-orders">
              {recent.map((order) => (
                <Link to={`/admin/orders?order=${order._id}`} key={order._id}>
                  <span className="admin-recent-order-icon">
                    <ShoppingBag size={18} strokeWidth={1.25} />
                  </span>
                  <span>
                    <strong>Order {orderReference(order._id)}</strong>
                    <small>{orderDate(order.orderDate)}</small>
                  </span>
                  <AdminStatus value={order.orderStatus} />
                  <strong>{orderMoney(order.totalAmount)}</strong>
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
          ) : (
            <AdminState
              title="The first chapter awaits."
              description="Customer orders will appear here after a purchase."
            />
          )}
        </section>
        <section className="admin-panel admin-category-panel" data-admin-reveal>
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">YOUR COLLECTION, AT A GLANCE</p>
              <h2>The current mix.</h2>
            </div>
            <Package size={23} strokeWidth={1} />
          </div>
          {loading ? (
            <AdminLoading count={1} />
          ) : errors.products ? (
            <AdminState
              error
              title="Inventory unavailable"
              description="Refresh to view your collection mix."
            />
          ) : categories.length ? (
            <div className="admin-category-bars">
              {categories.map(([category, count], index) => (
                <div key={category}>
                  <div>
                    <span>{category}</span>
                    <strong>
                      {count} <small>{count === 1 ? "piece" : "pieces"}</small>
                    </strong>
                  </div>
                  <span>
                    <span
                      style={{
                        width: `${(count / products.length) * 100}%`,
                        "--bar-color": [
                          "#801831",
                          "#b36e7f",
                          "#889579",
                          "#d7ae96",
                        ][index % 4],
                      }}
                    />
                  </span>
                </div>
              ))}
              <Link to="/admin/products">
                See every piece <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <AdminState
              title="Room for your collection."
              description="Add your first product to begin."
            />
          )}
        </section>
      </div>
      <section className="admin-stock-panel admin-panel" data-admin-reveal>
        <div className="admin-panel-heading">
          <div>
            <p className="admin-eyebrow">A LITTLE ATTENTION</p>
            <h2>Keep the favourites close.</h2>
          </div>
          <Link to="/admin/products?stock=low">
            Review inventory <ArrowUpRight size={17} />
          </Link>
        </div>
        {loading ? (
          <AdminLoading count={2} />
        ) : errors.products ? (
          <p className="admin-muted">Inventory could not be checked.</p>
        ) : stock.length ? (
          <div className="admin-stock-grid">
            {stock.map((product) => (
              <Link
                to={`/admin/products?edit=${product._id}`}
                key={product._id}
              >
                <StudioPhoto
                  src={product.image}
                  alt={product.title}
                  sizes="80px"
                />
                <span>
                  <strong>{product.title}</strong>
                  <small
                    className={product.totalStock === 0 ? "stock-out" : ""}
                  >
                    {product.totalStock === 0
                      ? "Out of stock"
                      : `${product.totalStock} left in stock`}
                  </small>
                </span>
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="admin-stock-clear">
            <span>No low-stock pieces to review.</span>
            <Link to="/admin/products">
              Manage your collection <Plus size={15} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
