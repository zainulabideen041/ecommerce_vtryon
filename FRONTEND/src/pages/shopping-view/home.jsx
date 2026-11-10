import { CatalogDirectory } from "@/components/shopping-view/local-catalog";
import { LOCAL_CATALOG, editorialProduct } from "@/lib/catalog-source";
import { useCatalogMetadata } from "@/hooks/use-catalog-metadata";
import {
  MoodPortraits,
  ColorStories,
  DetailStudio,
  FashionLookbook,
  FashionManifesto,
  useEditorialLayoutRefresh,
} from "@/components/shopping-view/editorial-sections";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { gsap, useGSAP } from "@/hooks/use-storefront-motion";
import { useReducedMotion } from "@/hooks/use-media-query";
import { imageDelivery } from "@/lib/image-delivery";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { ProductRail } from "@/components/shopping-view/product-rail";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import VirtualFittingFeature from "@/components/shopping-view/virtual-fitting-feature";

function FashionOrbit() {
  const root = useRef(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced) return;
      const spin = gsap.to(root.current, {
        rotation: 360,
        duration: 70,
        ease: "none",
        repeat: -1,
      });
      const observer = new IntersectionObserver(([entry]) => {
        entry.isIntersecting ? spin.play() : spin.pause();
      });
      observer.observe(root.current);
      return () => observer.disconnect();
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );
  return (
    <svg
      ref={root}
      className="fashion-orbit"
      viewBox="0 0 600 600"
      aria-hidden="true"
    >
      <ellipse cx="300" cy="300" rx="280" ry="160" />
      <ellipse
        cx="300"
        cy="300"
        rx="280"
        ry="160"
        transform="rotate(60 300 300)"
      />
      <ellipse
        cx="300"
        cy="300"
        rx="280"
        ry="160"
        transform="rotate(120 300 300)"
      />
      <circle cx="300" cy="300" r="62" />
    </svg>
  );
}

function StyleTicker() {
  const root = useRef(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  return (
    <div ref={root} className="style-ticker">
      <span className="sr-only">Style starts with you. Discover Luxar.</span>
      <div className="style-ticker-window" aria-hidden="true">
        <div
          className="style-ticker-track"
          style={{
            animationPlayState:
              paused || reduced || !visible ? "paused" : "running",
          }}
        >
          {[0, 1, 2, 3].map((index) => (
            <span key={index}>
              STYLE STARTS WITH YOU <span className="ticker-spark">✳</span> THE
              LUXAR EDIT <span className="ticker-spark">✳</span>
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => setPaused((value) => !value)}
        aria-label={
          paused || reduced ? "Play moving text" : "Pause moving text"
        }
        disabled={reduced}
      >
        {paused || reduced ? <Play size={15} /> : <Pause size={15} />}
      </button>
    </div>
  );
}

export default function ShoppingHome() {
  const root = useRef(null);
  const { metadata } = useCatalogMetadata();
  const reduced = useReducedMotion();
  const [campaign, setCampaign] = useState(0);
  const [open, setOpen] = useState(false);
  const { productList, productDetails, isLoading } = useSelector(
    (state) => state.shopProducts,
  );
  useEditorialLayoutRefresh(productList.length);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
        featured: true,
        pageSize: 60,
      }),
    );
  }, [dispatch]);
  useEffect(() => {
    if (productDetails) setOpen(true);
  }, [productDetails]);
  useGSAP(
    () => {
      if (reduced) return;
      const intro = gsap.timeline({
        defaults: { ease: "power3.out", duration: 1 },
      });
      intro
        .fromTo(
          ".campaign-label",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, clearProps: "transform,opacity" },
          0,
        )
        .fromTo(
          ".campaign-line > span",
          { yPercent: 110 },
          { yPercent: 0, stagger: 0.11, clearProps: "transform" },
          0.08,
        )
        .fromTo(
          ".campaign-bottom",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, clearProps: "transform,opacity" },
          0.4,
        )
        .fromTo(
          ".campaign-photo",
          { opacity: 0.1, scale: 1.045 },
          { opacity: 1, scale: 1, clearProps: "transform,opacity" },
          0.05,
        );
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  const campaignPieces = ["Grand Maroon", "Sage", "Royal Teal"]
    .map((title) => editorialProduct(productList, title))
    .filter(Boolean);
  const hero =
    campaignPieces[campaign % Math.max(1, campaignPieces.length)] ||
    productList[0];
  useGSAP(
    () => {
      if (reduced || !hero) return;
      gsap.fromTo(
        ".campaign-photo img",
        { opacity: 0.25, xPercent: 5, scale: 1.035 },
        {
          opacity: 1,
          xPercent: 0,
          scale: 1,
          duration: 0.85,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    },
    { scope: root, dependencies: [hero?.image, reduced], revertOnUpdate: true },
  );

  function detail(id) {
    dispatch(fetchProductDetails(id));
  }
  function add(id, stock) {
    if (!user) {
      toast({ title: "Sign in to add this piece to your bag" });
      navigate("/auth/login");
      return false;
    }
    const existing = cartItems?.items?.find((item) => item.productId === id);
    if (existing && existing.quantity + 1 > stock) {
      toast({ title: "Stock limit reached", variant: "destructive" });
      return false;
    }
    return dispatch(
      addToCart({ userId: user.id, productId: id, quantity: 1 }),
    ).then((result) => {
      if (result?.payload?.success) {
        dispatch(fetchCartItems(user.id));
        toast({ title: "Added to your bag" });
        return true;
      }
      toast({
        title: "This piece couldn't be added. Please try again.",
        variant: "destructive",
      });
      return false;
    });
  }

  return (
    <div className="fashion-home" ref={root}>
      <section className="campaign-hero" aria-label="The Luxar occasion edit">
        <div className="campaign-color">
          <FashionOrbit />
        </div>
        <button
          className="campaign-photo"
          onClick={() => hero && detail(hero._id)}
          disabled={!hero}
          aria-label={hero ? `Explore ${hero.title}` : "Loading the collection"}
        >
          {hero && (
            <img
              key={hero._id}
              {...imageDelivery(hero.image, [700, 1100, 1600])}
              sizes="(max-width: 767px) 100vw, 58vw"
              alt={hero.title}
              fetchPriority="high"
            />
          )}
          <span className="campaign-photo-index">
            THE OCCASION EDIT / {String(campaign + 1).padStart(2, "0")}
          </span>
          <span className="campaign-photo-link">
            <ArrowUpRight size={24} />
          </span>
        </button>
        <div className="campaign-content">
          <p className="campaign-label">
            LUXAR PRESENTS <span>THE OCCASION EDIT</span>
          </p>
          <h1>
            <span className="campaign-line">
              <span>WEAR THE</span>
            </span>
            <span className="campaign-line">
              <span>
                <em>moment.</em>
              </span>
            </span>
          </h1>
          <div className="campaign-bottom">
            <p>
              Some pieces say everything.
              <br />
              Find the one that feels like you.
            </p>
            <Link to="/shop/listing" className="solid-link">
              Explore the collection <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
        <div className="campaign-footer">
          <a href="#the-edit" className="campaign-scroll">
            <ArrowDown size={15} /> SCROLL TO DISCOVER
          </a>
          <div
            className="campaign-selector"
            role="group"
            aria-label="Featured garment"
          >
            {campaignPieces.map((piece, index) => (
              <button
                key={piece._id}
                onClick={() => setCampaign(index)}
                aria-label={`Feature ${piece.title}`}
                aria-pressed={campaign === index}
              >
                0{index + 1}
                <span />
              </button>
            ))}
          </div>
        </div>
      </section>
      <StyleTicker />
      <CatalogDirectory />
      <MoodPortraits products={productList} onInspect={detail} />
      <section className="store-section featured-edit" id="the-edit">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE PIECES. THE POSSIBILITIES.</p>
            <h2>
              Good style.
              <br />
              <em>Great feeling.</em>
            </h2>
          </div>
          <div className="section-heading-aside">
            <p>Distinctive silhouettes. Unmistakably you.</p>
            <Link className="text-link" to="/shop/listing">
              Shop the edit <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <ProductRail
          className="product-grid home-products"
          label="Featured garments"
        >
          {isLoading && !productList.length
            ? [0, 1, 2, 3].map((index) => (
                <div className="product-skeleton" key={index} />
              ))
            : productList
                .slice(0, 4)
                .map((product) => (
                  <ShoppingProductTile
                    key={product._id}
                    product={product}
                    handleGetProductDetails={detail}
                    handleAddtoCart={add}
                  />
                ))}
        </ProductRail>
        {!isLoading && !productList.length && (
          <div className="empty-state">
            <h2>The edit is on its way.</h2>
            <Link className="text-link" to="/shop/listing">
              Explore the collection <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
      <VirtualFittingFeature products={productList} />
      <ColorStories products={productList} onInspect={detail} />
      <DetailStudio products={productList} onInspect={detail} />
      <FashionLookbook products={productList} onInspect={detail} />
      <FashionManifesto />
      <section className="store-section fashion-directory">
        <div>
          <p className="eyebrow">NO RULES. JUST YOUR STYLE.</p>
          <h2>
            Find your
            <br />
            <em>point of view.</em>
          </h2>
        </div>
        <nav aria-label="Explore collections">
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
            <Link
              key={label}
              to={`/shop/listing${id ? `?category=${id}` : ""}`}
              onClick={() => sessionStorage.removeItem("filters")}
            >
              {label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>
      </section>
      <ProductDetailsDialog
        open={open}
        setOpen={setOpen}
        productDetails={productDetails}
      />
    </div>
  );
}
