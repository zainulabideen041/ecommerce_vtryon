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
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-muted/30 to-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                Luxar
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Experience the future of online shopping with AI-powered virtual
              try-on technology.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/shop/home"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/listing"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/listing?category=men"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Men's Fashion
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/listing?category=women"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Women's Fashion
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/search"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <a
                  href="mailto:support@luxar.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  support@luxar.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">
                  123 Fashion Street, NY 10001
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Luxar. All rights reserved.</p>
            <p>
              Developed by{" "}
              <a
                href="https://www.myntrixers.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline transition-colors"
              >
                Myntrix Technologies
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ShoppingFooter;
