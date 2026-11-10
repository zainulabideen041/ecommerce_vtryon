import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CollectionLinks } from "./header";
export default function ShoppingFooter() {
  return (
    <footer className="store-footer">
      <div className="footer-top">
        <div className="footer-statement">
          <p className="eyebrow">STYLE STARTS WITH YOU.</p>
          <h2>
            GOOD STYLE.
            <br />
            <em>Your rules.</em>
          </h2>
          <Link className="footer-shop-link" to="/shop/listing">
            Find your next look <ArrowUpRight size={21} />
          </Link>
        </div>
        <div className="footer-column">
          <h3>The collection</h3>
          <CollectionLinks />
        </div>
        <div className="footer-column">
          <h3>Here for you</h3>
          <Link to="/shop/account">Account & orders</Link>
          <Link to="/shop/checkout">Your checkout</Link>
          <Link to="/shop/search">Find a piece</Link>
          <a href="mailto:admin@myntrixers.com">
            Get in touch <ArrowUpRight size={14} />
          </a>
          <p className="footer-help">
            A question about fit or delivery?
            <br />
            Let's find your answer.
          </p>
        </div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        LUXAR<span>®</span>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Luxar</span>
        <span>MADE FOR YOUR MOMENT.</span>
        <a href="https://www.myntrixers.com" target="_blank" rel="noreferrer">
          By Myntrix Technologies <ArrowUpRight size={12} />
        </a>
      </div>
    </footer>
  );
}
