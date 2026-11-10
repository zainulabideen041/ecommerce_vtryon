import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, X, ArrowUpRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import CommonForm from "@/components/common/form";
import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import {
  AdminPageHeader,
  AdminState,
  AdminLoading,
  AdminConfirm,
} from "@/components/admin-view/studio-ui";
import { addProductFormElements, categoryOptionsMap } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { useAdminReveal } from "@/hooks/use-admin-reveal";
import { LOCAL_CATALOG } from "@/lib/catalog-source";
const blank = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};
export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(blank);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [editedId, setEditedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("title");
  const root = useRef(null);
  const openedQueryId = useRef(null);
  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const products = productList || [];
  const lowOnly = params.get("stock") === "low";
  useAdminReveal(
    root,
    `${loading}-${query}-${category}-${sort}-${lowOnly}-${products.length}`,
  );
  useEffect(() => {
    let active = true;
    setLoading(true);
    dispatch(fetchAllProducts()).then((result) => {
      if (active) {
        setError(!result.payload?.success);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [dispatch, refresh]);
  useEffect(() => {
    const id = params.get("edit");
    if (!loading && id && openedQueryId.current !== id) {
      const product = products.find((item) => item._id === id);
      if (product) {
        openedQueryId.current = id;
        edit(product);
      }
    }
  }, [loading, params, products]);
  function edit(product) {
    setEditedId(product._id);
    setFormData({ ...blank, ...product });
    setImageFile(null);
    setUploadedImageUrl(product.image || "");
    setOpen(true);
  }
  function add() {
    setEditedId(null);
    setFormData(blank);
    setImageFile(null);
    setUploadedImageUrl("");
    setImageLoadingState(false);
    setOpen(true);
  }
  function close() {
    if (saving) return;
    setOpen(false);
    setEditedId(null);
    setFormData(blank);
    setImageFile(null);
    setUploadedImageUrl("");
    setImageLoadingState(false);
    const next = new URLSearchParams(params);
    next.delete("edit");
    setParams(next, { replace: true });
  }
  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = {
      ...formData,
      price: Number(formData.price),
      salePrice: Number(formData.salePrice || 0),
      totalStock: Number(formData.totalStock),
      image: editedId ? formData.image : uploadedImageUrl,
    };
    const result = await dispatch(
      editedId
        ? editProduct({ id: editedId, formData: payload })
        : addNewProduct(payload),
    );
    setSaving(false);
    if (result.payload?.success) {
      toast({
        title: editedId
          ? "Product details updated"
          : "A new piece added to your store",
      });
      setOpen(false);
      setEditedId(null);
      setFormData(blank);
      setImageFile(null);
      setUploadedImageUrl("");
      const next = new URLSearchParams(params);
      next.delete("edit");
      setParams(next, { replace: true });
      setRefresh((value) => value + 1);
    } else
      toast({
        title: "The product couldn't be saved. Please try again.",
        variant: "destructive",
      });
  }
  async function remove() {
    if (!removeTarget || deleting) return;
    setDeleting(true);
    const result = await dispatch(deleteProduct(removeTarget._id));
    setDeleting(false);
    if (result.payload?.success) {
      setRemoveTarget(null);
      setRefresh((value) => value + 1);
      toast({ title: "Product removed from your store" });
    } else
      toast({
        title: "The product couldn't be removed. Please try again.",
        variant: "destructive",
      });
  }
  const valid =
    ["title", "description", "category", "brand"].every((key) =>
      String(formData[key] || "").trim(),
    ) &&
    formData.price !== "" &&
    Number(formData.price) >= 0 &&
    formData.totalStock !== "" &&
    Number(formData.totalStock) >= 0 &&
    (formData.salePrice === "" || Number(formData.salePrice) >= 0) &&
    (editedId || uploadedImageUrl) &&
    !imageLoadingState;
  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];
  const filtered = products
    .filter(
      (product) =>
        (!category || product.category === category) &&
        (!lowOnly ||
          (Number.isFinite(product.totalStock) && product.totalStock < 5)) &&
        `${product.title} ${product.brandLabel || product.brand} ${product.categoryLabel || product.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price-low"
        ? a.price - b.price
        : sort === "price-high"
          ? b.price - a.price
          : (a.title || "").localeCompare(b.title || ""),
    );
  function clear() {
    setQuery("");
    setCategory("");
    const next = new URLSearchParams(params);
    next.delete("stock");
    setParams(next);
  }
  return (
    <div ref={root}>
      <AdminPageHeader
        index="02"
        eyebrow="YOUR COLLECTION"
        title="The pieces."
        accent="The possibilities."
        description="Keep your collection considered, current and ready to be discovered."
        action={
          <button className="admin-button" onClick={add}>
            <Plus size={17} />
            Add a product
          </button>
        }
      />
      <div className="admin-inventory-strip">
        <span>
          {loading
            ? "Opening your collection..."
            : error
              ? "INVENTORY UNAVAILABLE"
              : `${products.length} PRODUCTS IN YOUR STORE`}
        </span>
        <span>
          {error
            ? ""
            : `${products.filter((product) => product.totalStock === 0).length} out of stock`}
        </span>
        {LOCAL_CATALOG && (
          <p>
            Local storefront preview items are separate from this managed
            inventory.
          </p>
        )}
      </div>
      <div className="admin-catalog-toolbar">
        <label className="admin-search">
          <Search size={17} />
          <span className="sr-only">Search products</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a piece, category or brand"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear product search"
            >
              <X size={15} />
            </button>
          )}
        </label>
        <label>
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {categoryOptionsMap[value] || value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort products</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="title">Name A to Z</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>
      {lowOnly && (
        <div className="admin-filter-note">
          Showing products with fewer than five in stock
          <button onClick={clear}>
            Clear filter <X size={13} />
          </button>
        </div>
      )}
      {loading ? (
        <AdminLoading count={6} label="Loading your products" />
      ) : error ? (
        <AdminState
          error
          title="Your collection couldn't be loaded."
          description="Reconnect to bring your product inventory back into view."
          onRetry={() => setRefresh((value) => value + 1)}
        />
      ) : filtered.length ? (
        <>
          <p className="admin-result-count" role="status">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"} in
            this view
          </p>
          <div className="admin-product-grid">
            {filtered.map((product) => (
              <AdminProductTile
                product={product}
                key={product._id}
                onEdit={edit}
                onDelete={setRemoveTarget}
              />
            ))}
          </div>
        </>
      ) : (
        <AdminState
          title={
            products.length
              ? "A little room to refine."
              : "Your next collection starts here."
          }
          description={
            products.length
              ? "Try another search or category to find the piece you need."
              : "Add your first product and give it a place in your store."
          }
          action={
            <button
              className="admin-button"
              onClick={products.length ? clear : add}
            >
              {products.length ? "Clear filters" : "Add a product"}
              <ArrowUpRight size={16} />
            </button>
          }
        />
      )}
      <Sheet
        open={open}
        onOpenChange={(value) => {
          if (!value) close();
        }}
      >
        <SheetContent
          className="admin-editor-sheet"
          onEscapeKeyDown={(event) => {
            if (saving) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (saving) event.preventDefault();
          }}
        >
          <SheetHeader className="admin-editor-header">
            <p className="admin-eyebrow">
              THE COLLECTION / {editedId ? "EDIT" : "NEW PIECE"}
            </p>
            <SheetTitle>
              {editedId
                ? "Refine the details."
                : "Make room for something new."}
            </SheetTitle>
            <SheetDescription>
              {editedId
                ? "Update this piece in your store collection."
                : "Photography first. Then the details that make it yours."}
            </SheetDescription>
          </SheetHeader>
          <div className="admin-editor-body">
            <ProductImageUpload
              title="Product photography"
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              setImageLoadingState={setImageLoadingState}
              imageLoadingState={imageLoadingState}
              isEditMode={!!editedId}
            />
            <fieldset disabled={saving}>
              <CommonForm
                onSubmit={submit}
                formData={formData}
                setFormData={setFormData}
                buttonText={
                  saving
                    ? "Saving..."
                    : editedId
                      ? "Save product changes"
                      : "Add to your collection"
                }
                formControls={addProductFormElements}
                isBtnDisabled={!valid}
                isSubmitting={saving}
              />
            </fieldset>
          </div>
        </SheetContent>
      </Sheet>
      <AdminConfirm
        open={!!removeTarget}
        onOpenChange={(value) => {
          if (!value) setRemoveTarget(null);
        }}
        title="Remove this piece?"
        description={`This removes ${removeTarget?.title || "this product"} from your managed store collection.`}
        pending={deleting}
        onConfirm={remove}
      />
    </div>
  );
}
