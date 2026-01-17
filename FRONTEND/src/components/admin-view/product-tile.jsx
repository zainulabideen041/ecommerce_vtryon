import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Edit, Trash2 } from "lucide-react";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  return (
    <Card className="group overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img
          src={product?.image}
          alt={product?.title}
          className="w-full h-[280px] object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product?.salePrice > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            Sale
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h2 className="text-lg font-bold mb-2 line-clamp-1">
          {product?.title}
        </h2>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`${
              product?.salePrice > 0
                ? "line-through text-muted-foreground text-sm"
                : "text-lg font-bold"
            }`}
          >
            ${product?.price}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-lg font-bold text-green-600">
              ${product?.salePrice}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="px-2 py-1 bg-muted rounded-md">
            {product?.category}
          </span>
          <span className="px-2 py-1 bg-muted rounded-md">
            {product?.brand}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          onClick={() => {
            setOpenCreateProductsDialog(true);
            setCurrentEditedId(product?._id);
            setFormData(product);
          }}
          variant="outline"
          className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 transition-all"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={() => handleDelete(product?._id)}
          variant="outline"
          className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AdminProductTile;
