import { LOCAL_CATALOG } from "@/lib/catalog-source";
import { CatalogPagination } from "@/components/shopping-view/local-catalog";
import { ProductRail } from "@/components/shopping-view/product-rail";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
export default function SearchProducts() {
  const [params, setParams] = useSearchParams();
  const minimumLength = LOCAL_CATALOG ? 2 : 4;
  const [keyword, setKeyword] = useState(params.get("keyword") || "");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const updateUrl = useRef(setParams);
  useEffect(() => {
    updateUrl.current = setParams;
  }, [setParams]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { searchResults, isLoading, pagination } = useSelector(
    (s) => s.shopSearch,
  );
  const { productDetails } = useSelector((s) => s.shopProducts);
  const { user } = useSelector((s) => s.auth);
  const { cartItems } = useSelector((s) => s.shopCart);
  useEffect(() => {
    let request;
    const query = keyword.trim();
    setWaiting(query.length >= minimumLength);
    const timer = setTimeout(() => {
      updateUrl.current(query ? { keyword: query } : {}, { replace: true });
      if (query.length >= minimumLength) {
        request = dispatch(
          getSearchResults({ keyword: encodeURIComponent(query), page }),
        );
        request.then(() => setWaiting(false));
      } else {
        dispatch(resetSearchResults());
        setWaiting(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      request?.abort();
    };
  }, [keyword, dispatch, page, minimumLength]);
  useEffect(() => {
    if (productDetails) setOpen(true);
  }, [productDetails]);
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
  const busy = waiting || isLoading;
  return (
    <div className="store-page search-page">
      <div className="page-intro">
        <p className="eyebrow">A PIECE ON YOUR MIND?</p>
        <h1>Find your favourite.</h1>
        <p>Search by name, colour, category or brand.</p>
      </div>
      <form
        className="search-form"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <Search size={23} />
        <label className="sr-only" htmlFor="store-search">
          Search the collection
        </label>
        <input
          id="store-search"
          type="search"
          value={keyword}
          onChange={(e) => {
            setPage(1);
            setKeyword(e.target.value);
          }}
          placeholder={
            LOCAL_CATALOG
              ? "Try linen, dress or black"
              : "Try ‘embroidered’ or ‘mauve’"
          }
          autoComplete="off"
        />
        {keyword && (
          <button
            type="button"
            className="icon-button"
            onClick={() => setKeyword("")}
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </form>
      <div className="search-suggestions">
        <span>A little inspiration</span>
        {(LOCAL_CATALOG
          ? ["Linen", "Dress", "Black", "Knit"]
          : ["Mauve", "Black", "Pishwas", "Embroidered"]
        ).map((term) => (
          <button
            key={term}
            onClick={() => {
              setPage(1);
              setKeyword(term);
            }}
          >
            {term}
          </button>
        ))}
      </div>
      <p className="search-status" role="status">
        {keyword.trim().length < minimumLength
          ? `Enter at least ${minimumLength} characters to explore the collection.`
          : busy
            ? "Looking through the wardrobe…"
            : `${pagination?.total ?? searchResults.length} pieces for “${keyword.trim()}”`}
      </p>
      {keyword.trim().length >= minimumLength &&
        (busy ? (
          <div className="product-grid home-products" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="product-skeleton" />
            ))}
          </div>
        ) : searchResults.length ? (
          <ProductRail
            className="product-grid home-products"
            label="Matching garments"
          >
            {searchResults.map((p) => (
              <ShoppingProductTile
                key={p._id}
                product={p}
                handleGetProductDetails={(id) =>
                  dispatch(fetchProductDetails(id))
                }
                handleAddtoCart={add}
              />
            ))}
          </ProductRail>
        ) : (
          <div className="empty-state">
            <h2>Not quite the right match.</h2>
            <p>
              Try a different name, colour or brand. Your next favourite might
              be one word away.
            </p>
            <button className="text-link" onClick={() => setKeyword("")}>
              Start a new search
            </button>
          </div>
        ))}
      {keyword.trim().length >= minimumLength && (
        <CatalogPagination
          pagination={pagination}
          busy={busy}
          onPage={(next) => {
            setPage(next);
            document
              .querySelector(".search-form")
              ?.scrollIntoView({ block: "center" });
          }}
        />
      )}
      <ProductDetailsDialog
        open={open}
        setOpen={setOpen}
        productDetails={productDetails}
      />
    </div>
  );
}
