import { Pencil, Trash2 } from "lucide-react";
import { categoryOptionsMap, brandOptionsMap } from "@/config";
import { orderMoney } from "@/lib/order-presentation";
import StudioPhoto from "./studio-photo";
export default function AdminProductTile({ product, onEdit, onDelete }) {
  const sale = product.salePrice > 0;
  return (
    <article className="admin-product-card" data-admin-reveal>
      <div className="admin-product-image">
        <StudioPhoto
          src={product.image}
          alt={product.title}
          sizes="(max-width: 600px) 44vw, 25vw"
        />
        <span
          className={`admin-stock-tag ${product.totalStock === 0 ? "out" : ""}`}
        >
          {product.totalStock === 0
            ? "OUT OF STOCK"
            : Number.isFinite(product.totalStock)
              ? `${product.totalStock} IN STOCK`
              : "STOCK NOT SET"}
        </span>
      </div>
      <div className="admin-product-copy">
        <p>
          {product.categoryLabel ||
            categoryOptionsMap[product.category] ||
            product.category ||
            "Uncategorized"}
          <span>/</span>
          {product.brandLabel ||
            brandOptionsMap[product.brand] ||
            product.brand}
        </p>
        <h2>{product.title}</h2>
        <div>
          <strong>
            {orderMoney(sale ? product.salePrice : product.price)}
          </strong>
          {sale && <del>{orderMoney(product.price)}</del>}
        </div>
      </div>
      <div className="admin-product-actions">
        <button onClick={() => onEdit(product)}>
          <Pencil size={14} />
          Edit piece
        </button>
        <button
          onClick={() => onDelete(product)}
          aria-label={`Remove ${product.title}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}
