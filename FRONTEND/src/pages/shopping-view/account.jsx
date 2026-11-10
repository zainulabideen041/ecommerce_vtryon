import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowUpRight, MapPin, Package, UserRound, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAccountReveal } from "@/hooks/use-account-reveal";
import "@/account-editorial.css";

export default function ShoppingAccount() {
  const { user } = useSelector((state) => state.auth);
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "address" ? "address" : "orders";
  const desktop = useMediaQuery("(min-width: 1000px)");
  const root = useRef(null);
  const initials = (user?.userName || "Your Luxar")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  useAccountReveal(root, "account");
  return (
    <div className="account-editorial" ref={root}>
      <section
        className="account-welcome"
        aria-labelledby="account-welcome-title"
      >
        <div className="account-welcome-copy" data-account-reveal>
          <p className="eyebrow">YOUR LUXAR / THE PERSONAL EDIT</p>
          <h1 id="account-welcome-title">
            Good to
            <br />
            <em>see you.</em>
          </h1>
          <p>
            Your orders. Your details. A little space for everything you love.
          </p>
          <Link to="/shop/listing">
            Continue the edit <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="account-membership-card" data-account-reveal>
          <div>
            <span>LUXAR</span>
            <UserRound size={18} strokeWidth={1.25} />
          </div>
          <span className="account-monogram" aria-hidden="true">
            {initials}
            <em>.</em>
          </span>
          <p>THE WARDROBE BELONGS TO</p>
          <strong>{user?.userName || "You"}</strong>
          {user?.email && (
            <span className="account-card-email">{user.email}</span>
          )}
          <span className="account-card-line" />
          <span className="account-card-caption">
            YOUR STYLE. ALWAYS PERSONAL.
          </span>
        </div>
        <svg
          className="account-welcome-lines"
          viewBox="0 0 800 520"
          fill="none"
          aria-hidden="true"
        >
          <path d="M55 360C110 40 780 100 640 370S70 560 190 270 740-35 785 95" />
          <path d="M20 385C75 65 745 125 605 395S35 585 155 295 705-10 750 120" />
        </svg>
      </section>
      <Tabs
        value={tab}
        onValueChange={(value) =>
          setParams(value === "address" ? { tab: value } : {})
        }
        orientation={desktop ? "vertical" : "horizontal"}
        className="account-hub"
      >
        <aside className="account-navigation">
          <div className="account-profile">
            <span className="eyebrow">HELLO AGAIN</span>
            <strong>{user?.userName || "Your account"}</strong>
            {user?.email && <span>{user.email}</span>}
          </div>
          <TabsList aria-label="Your account sections">
            <TabsTrigger value="orders">
              <Package size={18} />
              <span>
                Your orders<small>The pieces you chose</small>
              </span>
              <ArrowUpRight size={16} />
            </TabsTrigger>
            <TabsTrigger value="address">
              <MapPin size={18} />
              <span>
                Address book<small>Your delivery details</small>
              </span>
              <ArrowUpRight size={16} />
            </TabsTrigger>
          </TabsList>
          <div className="account-help">
            <span className="account-help-spark" aria-hidden="true">
              &#10035;
            </span>
            <p>
              A question
              <br />
              <em>about your order?</em>
            </p>
            <a href="mailto:admin@myntrixers.com">
              <Mail size={14} />
              Talk to our team <ArrowUpRight size={14} />
            </a>
          </div>
        </aside>
        <div className="account-workspace">
          <TabsContent value="orders">
            <ShoppingOrders />
          </TabsContent>
          <TabsContent value="address">
            <Address />
          </TabsContent>
        </div>
      </Tabs>
      <div className="account-closing">
        <span>LUXAR / YOUR PERSONAL EDIT</span>
        <p>
          Made for <em>your everyday.</em>
        </p>
        <Link to="/shop/listing">
          Find your next favourite <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
