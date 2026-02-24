import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { ShoppingCart, Eye } from "lucide-react";
import { useState } from "react";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const discount =
    product?.salePrice > 0
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <Card
      className="group w-full max-w-sm mx-auto overflow-hidden border border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl cursor-pointer bg-card rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div
        onClick={() => handleGetProductDetails(product?._id)}
        className="relative overflow-hidden bg-muted/30"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Dark overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Quick View */}
          <div
            className={`absolute inset-0 flex items-end justify-center pb-5 transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGetProductDetails(product?._id);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full hover:bg-white/30 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          </div>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product?.totalStock === 0 ? (
              <Badge className="text-[10px] px-2 py-0.5 bg-foreground/80 text-background font-medium rounded-sm">
                Sold Out
              </Badge>
            ) : product?.totalStock < 10 ? (
              <Badge className="text-[10px] px-2 py-0.5 bg-amber-500 text-white font-medium rounded-sm">
                Only {product.totalStock} left
              </Badge>
            ) : null}
          </div>

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-2.5 right-2.5 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white text-[10px] font-bold leading-tight text-center">
                {discount}%<br />
                off
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <CardContent className="px-4 pt-3 pb-2 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-[15px] leading-snug line-clamp-1 group-hover:text-primary transition-colors flex-1">
            {product?.title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="px-2 py-0.5 border border-border rounded-sm">
            {categoryOptionsMap[product?.category]}
          </span>
          <span className="px-2 py-0.5 border border-border rounded-sm">
            {brandOptionsMap[product?.brand]}
          </span>
        </div>

        <div className="flex items-baseline gap-2 pt-0.5">
          {product?.salePrice > 0 ? (
            <>
              <span className="text-lg font-bold text-primary font-display">
                ${product.salePrice}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                ${product.price}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary font-display">
              ${product?.price}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        {product?.totalStock === 0 ? (
          <Button className="w-full h-9 text-xs" disabled variant="outline">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddtoCart(product?._id, product?.totalStock);
            }}
            className="w-full h-9 text-xs gap-2 bg-gradient-primary hover:opacity-90 shadow-sm transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
