import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Sparkles,
  TrendingUp,
  ArrowRight,
  User,
  UserCircle,
  Baby,
  Watch,
  Footprints,
  Zap,
  Wind,
  Flame,
  Tag,
  Store,
  ShoppingBag,
  ShirtIcon,
  Star,
} from "lucide-react";

const bannerImages = [
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
    alt: "Women's Collection",
  },
  {
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80",
    alt: "Luxury Fashion",
  },
  {
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    alt: "Fashion Accessories",
  },
  {
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80",
    alt: "Men's Collection",
  },
  {
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea1c8e77?w=1920&q=80",
    alt: "Fashion Boutique",
  },
];

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";

const categoriesWithIcon = [
  {
    id: "men",
    label: "Men",
    icon: User,
    bgImage:
      "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80",
  },
  {
    id: "women",
    label: "Women",
    icon: UserCircle,
    bgImage:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80",
  },
  {
    id: "kids",
    label: "Kids",
    icon: Baby,
    bgImage:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80",
  },
  {
    id: "accessories",
    label: "Accessories",
    icon: Watch,
    bgImage:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80",
  },
  {
    id: "footwear",
    label: "Footwear",
    icon: Footprints,
    bgImage:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80",
  },
];

const brandsWithIcon = [
  {
    id: "nike",
    label: "Nike",
    icon: Zap,
    bgImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
  {
    id: "adidas",
    label: "Adidas",
    icon: Wind,
    bgImage:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80",
  },
  {
    id: "puma",
    label: "Puma",
    icon: Flame,
    bgImage:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
  },
  {
    id: "levi",
    label: "Levi's",
    icon: Tag,
    bgImage:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
  },
  {
    id: "zara",
    label: "Zara",
    icon: Store,
    bgImage:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
  },
  {
    id: "h&m",
    label: "H&M",
    icon: ShoppingBag,
    bgImage:
      "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=800&q=80",
  },
];

/* ── Typewriter ──────────────────────────────────── */
function TypewriterText() {
  const messages = [
    "Try Before You Buy",
    "AI-Powered Virtual Try-On",
    "Shop Smarter, Look Better",
    "See Yourself in Every Style",
  ];
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    const msg = messages[idx];
    const t = setTimeout(
      () => {
        if (!del && text === msg) {
          setTimeout(() => setDel(true), 2000);
          return;
        }
        if (del && text === "") {
          setDel(false);
          setIdx((i) => (i + 1) % messages.length);
          return;
        }
        setText(
          del ? msg.slice(0, text.length - 1) : msg.slice(0, text.length + 1),
        );
      },
      del ? 40 : 80,
    );
    return () => clearTimeout(t);
  }, [text, del, idx]);

  return (
    <p className="text-lg md:text-2xl font-light text-white/80 tracking-wide min-h-[2rem]">
      {text}
      <span className="animate-pulse opacity-70">|</span>
    </p>
  );
}

/* ── Section heading ─────────────────────────────── */
function SectionHeading({ title, subtitle }) {
  return (
    <div className="text-center mb-8 space-y-2">
      <h2 className="font-display font-semibold text-3xl md:text-5xl tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className="flex justify-center mt-3">
        <div className="gold-divider" />
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────── */
function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector((s) => s.shopProducts);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(item, section) {
    sessionStorage.removeItem("filters");
    sessionStorage.setItem("filters", JSON.stringify({ [section]: [item.id] }));
    navigate("/shop/listing");
  }

  function handleGetProductDetails(id) {
    dispatch(fetchProductDetails(id));
  }

  function handleAddtoCart(id) {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }
    dispatch(addToCart({ userId: user.id, productId: id, quantity: 1 })).then(
      (d) => {
        if (d?.payload?.success) {
          dispatch(fetchCartItems(user.id));
          toast({ title: "Added to cart" });
        }
      },
    );
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);
  useEffect(() => {
    const t = setInterval(
      () => setCurrentSlide((s) => (s + 1) % bannerImages.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      }),
    );
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero Carousel ─────────────────────────────── */}
      <div className="relative w-full h-[480px] md:h-[560px] lg:h-[640px] overflow-hidden">
        {bannerImages.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-6 text-center text-white space-y-5 slide-up max-w-3xl">
                {/* Eyebrow */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.25em] uppercase text-gold border border-gold/40 bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full">
                    <Star className="w-3 h-3 fill-gold" />
                    Premium Fashion Store
                  </span>
                </div>

                {/* Main heading */}
                <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tight drop-shadow-2xl">
                  Experience Fashion
                  <span className="block text-gradient-gold italic">
                    Virtually
                  </span>
                </h1>

                <TypewriterText />

                <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                  Revolutionize your shopping journey with cutting-edge AI
                  technology. Visualize how clothes look on you before you buy.
                </p>

                {/* Feature chips */}
                <div className="flex flex-wrap justify-center gap-3 text-xs text-white/80">
                  {[
                    ["Sparkles", "AI-Powered"],
                    ["TrendingUp", "Latest Trends"],
                    ["ShirtIcon", "Premium Brands"],
                  ].map(([, label]) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <Button
                    size="lg"
                    onClick={() => navigate("/shop/listing")}
                    className="bg-white text-foreground hover:bg-white/90 shadow-xl font-semibold px-8 h-12 text-sm"
                  >
                    Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 h-12 text-sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Try Virtual Try-On
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Prev / Next */}
        {[
          {
            dir: "prev",
            cls: "left-4",
            handler: () =>
              setCurrentSlide(
                (s) => (s - 1 + bannerImages.length) % bannerImages.length,
              ),
            Icon: ChevronLeftIcon,
          },
          {
            dir: "next",
            cls: "right-4",
            handler: () =>
              setCurrentSlide((s) => (s + 1) % bannerImages.length),
            Icon: ChevronRightIcon,
          },
        ].map(({ dir, cls, handler, Icon }) => (
          <button
            key={dir}
            onClick={handler}
            className={`absolute top-1/2 ${cls} -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 border border-white/25 text-white hover:bg-white/30 backdrop-blur-sm transition-all flex items-center justify-center`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {bannerImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </div>

      {/* ── Shop by Category ──────────────────────────── */}
      <section className="section-pad bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Shop by Category"
            subtitle="Discover your style across our curated collections"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {categoriesWithIcon.map((cat, i) => (
              <Card
                key={i}
                onClick={() => handleNavigateToListingPage(cat, "category")}
                className="group cursor-pointer border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden relative h-40 md:h-48"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${cat.bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                <CardContent className="relative flex flex-col items-center justify-end pb-5 h-full z-10 p-0">
                  <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:bg-white/25 transition-all border border-white/20 mb-2">
                    <cat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-sm text-white drop-shadow">
                    {cat.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Brand ────────────────────────────── */}
      <section className="section-pad">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Shop by Brand"
            subtitle="The world's finest labels, curated for you"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {brandsWithIcon.map((brand, i) => (
              <Card
                key={i}
                onClick={() => handleNavigateToListingPage(brand, "brand")}
                className="group cursor-pointer border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden relative h-32 md:h-36"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${brand.bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <CardContent className="relative flex flex-col items-center justify-end pb-4 h-full z-10 p-0">
                  <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:bg-white/25 transition-all border border-white/20 mb-1.5">
                    <brand.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-sm text-white drop-shadow">
                    {brand.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Products ─────────────────────────── */}
      <section className="section-pad bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="font-display font-semibold text-3xl md:text-5xl tracking-tight">
                  Trending Now
                </h2>
              </div>
              <p className="text-muted-foreground text-sm ml-9">
                Most popular picks this week
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/shop/listing")}
              className="hidden md:flex gap-2 text-xs"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {productList?.slice(0, 8).map((item, i) => (
              <div
                key={i}
                className="fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ShoppingProductTile
                  handleGetProductDetails={handleGetProductDetails}
                  product={item}
                  handleAddtoCart={handleAddtoCart}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Button
              variant="outline"
              onClick={() => navigate("/shop/listing")}
              className="gap-2 text-sm"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
