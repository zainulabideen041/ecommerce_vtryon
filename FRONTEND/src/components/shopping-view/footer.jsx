import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

function ShoppingFooter() {
  const y = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", to: "/shop/home" },
    { label: "Shop All", to: "/shop/listing" },
    { label: "Men's Fashion", to: "/shop/listing?category=men" },
    { label: "Women's Fashion", to: "/shop/listing?category=women" },
    { label: "Search", to: "/shop/search" },
  ];

  const serviceLinks = [
    "About Us",
    "Contact Us",
    "Shipping & Returns",
    "Privacy Policy",
    "Terms & Conditions",
  ];

  const socials = [
    { Icon: Facebook, href: "https://facebook.com" },
    { Icon: Twitter, href: "https://twitter.com" },
    { Icon: Instagram, href: "https://instagram.com" },
    { Icon: Linkedin, href: "https://linkedin.com" },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border/20 mt-auto">
      {/* Gold top line */}
      <div className="h-[2px] w-full bg-gradient-gold" />

      <div className="container mx-auto px-4 pt-10 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Luxar"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
                <div className="w-8 h-8 rounded-lg bg-gradient-primary hidden items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="font-cinzel font-bold text-lg tracking-[0.12em] text-gradient-gold">
                LUXAR
              </span>
            </div>
            <p className="text-xs text-secondary-foreground/60 leading-relaxed max-w-[200px]">
              AI-powered virtual try-on for the discerning shopper. Experience
              fashion before you buy.
            </p>
            <div className="flex gap-2">
              {socials.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-secondary-foreground/20 flex items-center justify-center hover:bg-gold/20 hover:border-gold/40 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4 text-secondary-foreground/90">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-xs text-secondary-foreground/55 hover:text-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4 text-secondary-foreground/90">
              Support
            </h4>
            <ul className="space-y-2">
              {serviceLinks.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-xs text-secondary-foreground/55 hover:text-gold transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4 text-secondary-foreground/90">
              Contact
            </h4>
            <ul className="space-y-3">
              {[
                {
                  Icon: Mail,
                  text: "admin@myntrixers.com",
                  href: "mailto:admin@myntrixers.com",
                },
                {
                  Icon: Phone,
                  text: "+1 (234) 567-890",
                  href: "tel:+1234567890",
                },
                {
                  Icon: MapPin,
                  text: "123 Fashion Street, NY 10001",
                  href: null,
                },
              ].map(({ Icon, text, href }, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 mt-0.5 text-gold shrink-0" />
                  {href ? (
                    <a
                      href={href}
                      className="text-xs text-secondary-foreground/55 hover:text-gold transition-colors"
                    >
                      {text}
                    </a>
                  ) : (
                    <span className="text-xs text-secondary-foreground/55">
                      {text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-secondary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-secondary-foreground/40">
          <p>© {y} Luxar. All rights reserved.</p>
          <p>
            Developed by{" "}
            <a
              href="https://www.myntrixers.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold hover:opacity-80 transition-opacity"
            >
              Myntrix Technologies
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default ShoppingFooter;
