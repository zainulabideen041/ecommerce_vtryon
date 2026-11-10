import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
export default function NotFound() {
  return (
    <div>
      <header className="standalone-header">
        <Link className="wordmark" to="/shop/home">
          LUXAR
        </Link>
      </header>
      <main className="status-page">
        <p className="eyebrow">404 / A DIFFERENT DIRECTION</p>
        <h1>
          This page has
          <br />
          <em>slipped away.</em>
        </h1>
        <p>
          Let's find something worth looking for. The collection is a good place
          to start.
        </p>
        <Link className="solid-link" to="/shop/listing">
          Explore the collection <ArrowUpRight size={18} />
        </Link>
      </main>
    </div>
  );
}
