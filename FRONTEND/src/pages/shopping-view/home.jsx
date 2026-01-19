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
} from "lucide-react";

// Professional Unsplash images for virtual try-on and fashion e-commerce
const bannerImages = [
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
    alt: "Fashion Shopping - Women's Collection",
  },
  {
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80",
    alt: "Luxury Fashion Store",
  },
  {
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    alt: "Women's Fashion Accessories",
  },
  {
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80",
    alt: "Men's Fashion Collection",
  },
  {
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea1c8e77?w=1920&q=80",
    alt: "Modern Fashion Boutique",
  },
  {
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80",
    alt: "Premium Clothing Display",
  },
  {
    image:
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1920&q=80",
    alt: "Fashion E-commerce Shopping",
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

// Custom Typewriter Component
function TypewriterText() {
  const messages = [
    "Try Before You Buy",
    "AI-Powered Virtual Try-On",
    "Shop Smarter, Look Better",
    "Transform Your Shopping Experience",
    "See Yourself in Every Style",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentMessage = messages[currentMessageIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 500 : 2000;

    const timer = setTimeout(() => {
      if (!isDeleting && currentText === currentMessage) {
        // Pause before deleting
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && currentText === "") {
        // Move to next message
        setIsDeleting(false);
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      } else {
        // Type or delete character
        setCurrentText(
          isDeleting
            ? currentMessage.substring(0, currentText.length - 1)
            : currentMessage.substring(0, currentText.length + 1),
        );
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentMessageIndex]);

  return (
    <div className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white/95 min-h-[3rem] drop-shadow-lg">
      {currentText}
      <span className="animate-pulse">|</span>
    </div>
  );
}

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts,
  );

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Added to cart",
          description: "Product has been added to your cart",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % bannerImages.length);
    }, 5000);

    return () => clearInterval(timer);
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
      {/* Hero Section with Carousel */}
      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        {bannerImages.map((slide, index) => (
          <div
            key={index}
            className={`${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } absolute inset-0 transition-opacity duration-1000`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
            {/* Enhanced Overlay - Gradient with subtle white tint for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-white/10" />
            <div className="absolute inset-0 bg-white/5" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl text-center text-white space-y-8 slide-up">
                  {/* Main Heading with Typewriter */}
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight drop-shadow-2xl">
                      Experience Fashion
                      <span className="block gradient-text from-purple-300 via-pink-300 to-blue-300 mt-2">
                        Virtually
                      </span>
                    </h1>

                    {/* Typewriter Effect - Custom Implementation */}
                    <TypewriterText />
                  </div>

                  {/* Description */}
                  <p className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                    Revolutionize your fashion journey with cutting-edge AI
                    technology. Visualize how clothes look on you before making
                    a purchase.
                  </p>

                  {/* Feature Highlights */}
                  <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm md:text-base text-white/90">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                      <Sparkles className="w-4 h-4 text-purple-300" />
                      <span className="font-medium">AI-Powered</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                      <TrendingUp className="w-4 h-4 text-blue-300" />
                      <span className="font-medium">Latest Trends</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                      <ShirtIcon className="w-4 h-4 text-pink-300" />
                      <span className="font-medium">Premium Brands</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4 justify-center pt-4">
                    <Button
                      size="lg"
                      onClick={() => navigate("/shop/listing")}
                      className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-2xl text-base md:text-lg px-8 py-6"
                    >
                      Shop Now
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 shadow-xl text-base md:text-lg px-8 py-6"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Try Virtual Try-On
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + bannerImages.length) % bannerImages.length,
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 z-10"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % bannerImages.length,
            )
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 z-10"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Shop by Category */}
      <section className="py-5 mt-5 md:py-10 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Discover your style across our curated collections
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categoriesWithIcon.map((categoryItem, index) => (
              <Card
                key={index}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="group cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Image with Overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundImage: `url(${categoryItem.bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

                {/* Content */}
                <CardContent className="relative flex flex-col items-center justify-center p-6 md:p-8 space-y-4 z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 border border-white/30">
                    <categoryItem.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <span className="font-semibold text-base md:text-lg text-white drop-shadow-lg">
                    {categoryItem.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Brand */}
      <section className="py-5 mt-5 md:py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
              Shop by Brand
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Explore top fashion brands all in one place
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {brandsWithIcon.map((brandItem, index) => (
              <Card
                key={index}
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="group cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Image with Overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundImage: `url(${brandItem.bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

                {/* Content */}
                <CardContent className="relative flex flex-col items-center justify-center p-6 space-y-3 z-10">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md shadow-md flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 border border-white/30">
                    <brandItem.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-semibold text-lg text-white drop-shadow-lg">
                    {brandItem.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-5 mt-5 md:py-10 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-16 h-16 text-primary mr-2" />
                <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
                  Trending Products
                </h2>
              </div>
              <p className="text-muted-foreground text-xl text-center">
                Most popular items this week
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/shop/listing")}
              className="hidden md:flex"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.slice(0, 8).map((productItem, index) => (
                  <div
                    key={index}
                    className="fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ShoppingProductTile
                      handleGetProductDetails={handleGetProductDetails}
                      product={productItem}
                      handleAddtoCart={handleAddtoCart}
                    />
                  </div>
                ))
              : null}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button
              variant="outline"
              onClick={() => navigate("/shop/listing")}
              className="w-full sm:w-auto"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
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
