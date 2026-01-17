import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { useState } from "react";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="group w-full max-w-sm mx-auto overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={() => handleGetProductDetails(product?._id)}
        className="relative overflow-hidden"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay on hover */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Quick Actions */}
          <div
            className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              size="icon"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                handleGetProductDetails(product?._id);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg transition-all"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product?.totalStock === 0 ? (
              <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg">
                Out Of Stock
              </Badge>
            ) : product?.totalStock < 10 ? (
              <Badge className="bg-warning text-warning-foreground hover:bg-warning/90 shadow-lg">
                Only {product?.totalStock} left
              </Badge>
            ) : product?.salePrice > 0 ? (
              <Badge className="bg-gradient-primary text-white shadow-lg hover:shadow-xl transition-shadow">
                Sale
              </Badge>
            ) : null}
          </div>

          {/* Discount Badge */}
          {product?.salePrice > 0 && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground shadow-lg">
              -
              {Math.round(
                ((product.price - product.salePrice) / product.price) * 100
              )}
              %
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product?.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-secondary rounded-md">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="px-2 py-1 bg-secondary rounded-md">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {product?.salePrice > 0 ? (
            <>
              <span className="text-xl font-bold text-primary">
                ${product?.salePrice}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ${product?.price}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-primary">
              ${product?.price}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {product?.totalStock === 0 ? (
          <Button className="w-full" disabled variant="outline">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddtoCart(product?._id, product?.totalStock);
            }}
            className="w-full group/btn shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
