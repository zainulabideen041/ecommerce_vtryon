import { LOCAL_CATALOG } from "@/lib/catalog-source";
import { useCatalogMetadata } from "@/hooks/use-catalog-metadata";
import { CatalogPagination } from "@/components/shopping-view/local-catalog";
import { useEditorialLayoutRefresh } from "@/components/shopping-view/editorial-sections";
import {
  CollectionCampaign,
  CollectionInterlude,
  CollectionFittingNote,
} from "@/components/shopping-view/collection-editorial";
import { ProductRail } from "@/components/shopping-view/product-rail";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Columns2, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { categoryOptionsMap, brandOptionsMap, sortOptions } from "@/config";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProductFilter from "@/components/shopping-view/filter";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
export default function ShoppingListing() {
  const [params, setParams] = useSearchParams();
  const { metadata } = useCatalogMetadata();
  const page = Math.max(1, Number.parseInt(params.get("page"), 10) || 1);
  const categoryLabels = {
    ...categoryOptionsMap,
    ...Object.fromEntries(
      [...(metadata?.groups || []), ...(metadata?.categories || [])].map(
        (category) => [category.id, category.label],
      ),
    ),
  };
  const brandLabels = {
    ...brandOptionsMap,
    ...Object.fromEntries(
      (metadata?.brands || []).map((brand) => [brand.id, brand.label]),
    ),
  };
  const [view, setView] = useState("gallery");
  const [sort, setSort] = useState("price-lowtohigh");
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const { productList, productDetails, pagination } = useSelector(
    (s) => s.shopProducts,
  );
  useEditorialLayoutRefresh(`${catalogLoading}-${productList?.length}-${view}`);
  const { user } = useSelector((s) => s.auth);
  const { cartItems } = useSelector((s) => s.shopCart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const category = params.get("category") || "";
  const brand = params.get("brand") || "";
  const filters = {
    category: category.split(",").filter(Boolean),
    brand: brand.split(",").filter(Boolean),
  };
  useEffect(() => {
    let current = true;
    setCatalogLoading(true);
    dispatch(
      fetchAllFilteredProducts({
        filterParams: { category, brand },
        sortParams: sort,
        page,
      }),
    ).then(() => {
      if (current) setCatalogLoading(false);
    });
    return () => {
      current = false;
    };
  }, [dispatch, category, brand, sort, page]);
  useEffect(() => {
    if (productDetails) setOpen(true);
  }, [productDetails]);
  function filter(section, value) {
    const next = {
      ...filters,
      [section]: filters[section].includes(value)
        ? filters[section].filter((v) => v !== value)
        : [...filters[section], value],
    };
    const query = new URLSearchParams();
    Object.entries(next).forEach(([key, values]) => {
      if (values.length) query.set(key, values.join(","));
    });
    sessionStorage.setItem("filters", JSON.stringify(next));
    setParams(query);
  }
  function clear() {
    sessionStorage.removeItem("filters");
    setParams({});
  }
  function add(id, stock) {
    if (!user) {
      toast({ title: "Sign in to save this piece to your bag" });
      navigate("/auth/login");
      return;
    }
    const existing = cartItems?.items?.find((i) => i.productId === id);
    if (existing && existing.quantity + 1 > stock) {
      toast({ title: "Stock limit reached", variant: "destructive" });
      return;
    }
    return dispatch(
      addToCart({ userId: user.id, productId: id, quantity: 1 }),
    ).then((d) => {
      if (d?.payload?.success) {
        dispatch(fetchCartItems(user.id));
        toast({ title: "Added to your bag" });
        return true;
      }
      toast({
        title: "This piece could not be added. Please try again.",
        variant: "destructive",
      });
      return false;
    });
  }
  const count = filters.category.length + filters.brand.length;
  const collectionName =
    filters.category.length === 1 ? categoryLabels[category] || "The" : "The";
  function chooseCategory(value) {
    const query = new URLSearchParams(params);
    query.delete("page");
    if (value) query.set("category", value);
    else query.delete("category");
    sessionStorage.setItem(
      "filters",
      JSON.stringify({ ...filters, category: value ? [value] : [] }),
    );
    setParams(query);
  }
  return (
    <div className="collection-page collection-studio">
      <CollectionCampaign
        total={pagination?.total}
        name={collectionName}
        products={productList || []}
        loading={catalogLoading}
        onInspect={(id) => dispatch(fetchProductDetails(id))}
      />
      <div className="collection-discovery">
        <span>MAKE IT YOUR EDIT</span>
        <nav aria-label="Browse collection categories">
          {(LOCAL_CATALOG
            ? [
                ["", "All pieces"],
                ...(metadata?.groups || []).map((group) => [
                  group.id,
                  group.label,
                ]),
              ]
            : [
                ["", "All pieces"],
                ["women", "Women"],
                ["men", "Men"],
                ["kids", "Kids"],
                ["accessories", "Accessories"],
                ["footwear", "Footwear"],
              ]
          ).map(([id, label]) => (
            <button
              key={label}
              onClick={() => chooseCategory(id)}
              aria-pressed={
                id ? filters.category.includes(id) : !filters.category.length
              }
            >
              {label}
            </button>
          ))}
        </nav>
        <a href="#collection-pieces" className="collection-skip-products">
          Explore the pieces <span aria-hidden="true">&darr;</span>
        </a>
      </div>
      <div className="store-page collection-content" id="collection-pieces">
        <div className="collection-layout">
          <aside className="desktop-filters">
            <ProductFilter
              filters={filters}
              handleFilter={filter}
              onCategoryChange={chooseCategory}
            />
          </aside>
          <div>
            <div className="collection-toolbar">
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <button className="mobile-filter-button">
                    <SlidersHorizontal size={16} /> Filters{" "}
                    {count > 0 ? `(${count})` : ""}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="store-sheet">
                  <SheetTitle>Make it your edit.</SheetTitle>
                  <SheetDescription>
                    Filter by category and brand.
                  </SheetDescription>
                  <ProductFilter
                    filters={filters}
                    handleFilter={filter}
                    onCategoryChange={chooseCategory}
                  />
                  <button
                    className="solid-link w-full mt-6"
                    onClick={() => setFilterOpen(false)}
                  >
                    Show {pagination?.total ?? productList?.length ?? 0} pieces
                  </button>
                  {count > 0 && (
                    <button className="text-link" onClick={clear}>
                      Clear all filters
                    </button>
                  )}
                </SheetContent>
              </Sheet>
              <span className="result-count" role="status">
                {catalogLoading
                  ? "Finding your pieces…"
                  : `${pagination?.total ?? productList?.length ?? 0} pieces`}
              </span>
              <div className="collection-display-controls">
                <div
                  className="collection-view-switch"
                  role="group"
                  aria-label="Product display"
                >
                  <button
                    aria-label="Gallery grid"
                    title="Gallery grid"
                    aria-pressed={view === "gallery"}
                    onClick={() => setView("gallery")}
                  >
                    <LayoutGrid size={17} />
                  </button>
                  <button
                    aria-label="Large editorial grid"
                    title="Large editorial grid"
                    aria-pressed={view === "editorial"}
                    onClick={() => setView("editorial")}
                  >
                    <Columns2 size={17} />
                  </button>
                </div>
                <label htmlFor="collection-sort" className="sr-only">
                  Sort collection
                </label>
                <select
                  id="collection-sort"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    const query = new URLSearchParams(params);
                    query.delete("page");
                    setParams(query, { replace: true });
                  }}
                >
                  {sortOptions.map((o) => (
                    <option value={o.id} key={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {count > 0 && (
              <div className="filter-chips">
                {Object.entries(filters).flatMap(([section, values]) =>
                  values.map((value) => (
                    <button
                      key={`${section}-${value}`}
                      onClick={() => filter(section, value)}
                      aria-label={`Remove ${categoryLabels[value] || brandLabels[value] || value} filter`}
                    >
                      {categoryLabels[value] || brandLabels[value] || value}
                      <X size={12} />
                    </button>
                  )),
                )}
                <button onClick={clear}>Clear all</button>
              </div>
            )}
            {catalogLoading ? (
              <div
                className={`product-grid collection-products view-${view}`}
                aria-busy="true"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <div className="product-skeleton" key={i} />
                ))}
              </div>
            ) : productList?.length ? (
              <ProductRail
                className={`product-grid collection-products view-${view}`}
                label="Garments in the collection"
              >
                {productList.map((p, index) => (
                  <Fragment key={p._id}>
                    <ShoppingProductTile
                      key={p._id}
                      product={p}
                      handleGetProductDetails={(id) =>
                        dispatch(fetchProductDetails(id))
                      }
                      handleAddtoCart={add}
                    />
                    {index === 5 && productList.length > 6 && (
                      <CollectionInterlude
                        product={
                          productList[Math.min(7, productList.length - 1)]
                        }
                        onInspect={(id) => dispatch(fetchProductDetails(id))}
                      />
                    )}
                  </Fragment>
                ))}
              </ProductRail>
            ) : (
              <div className="empty-state">
                <p className="eyebrow">A LITTLE ROOM FOR DISCOVERY</p>
                <h2>No pieces in this edit.</h2>
                <p>
                  {count
                    ? "Try another category or brand to find your next favourite."
                    : "The collection couldn't be loaded. Please try again in a moment."}
                </p>
                <button
                  className="solid-link"
                  onClick={
                    count
                      ? clear
                      : () =>
                          dispatch(
                            fetchAllFilteredProducts({
                              filterParams: {},
                              sortParams: sort,
                            }),
                          )
                  }
                >
                  {count ? "Explore all pieces" : "Try again"}
                </button>
              </div>
            )}
            <CatalogPagination
              pagination={pagination}
              busy={catalogLoading}
              onPage={(next) => {
                const query = new URLSearchParams(params);
                query.set("page", next);
                setParams(query);
                document
                  .getElementById("collection-pieces")
                  ?.scrollIntoView({ block: "start" });
              }}
            />
          </div>
        </div>
        {!catalogLoading && (
          <CollectionFittingNote product={productList?.[0]} />
        )}
      </div>
      <ProductDetailsDialog
        open={open}
        setOpen={setOpen}
        productDetails={productDetails}
      />
    </div>
  );
}
