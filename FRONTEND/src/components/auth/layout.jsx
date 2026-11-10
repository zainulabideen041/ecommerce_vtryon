import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
const editorialImage =
  "https://res.cloudinary.com/dnoi1telk/image/upload/v1768837471/tjz1ydmlaydfbvveow08.jpg";
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <aside className="auth-art">
        <img
          src={editorialImage}
          alt="Sage green embroidered ensemble from the Luxar collection"
        />
        <Link to="/shop/home" className="wordmark">
          LUXAR
        </Link>
        <div className="auth-art-copy">
          <h2>
            A wardrobe.
            <br />
            <em>Entirely yours.</em>
          </h2>
          <p>
            Keep your favourite pieces close, your orders in view, and your next
            occasion in mind.
          </p>
        </div>
      </aside>
      <main className="auth-form-panel">
        <Link className="auth-mobile-brand wordmark" to="/shop/home">
          LUXAR
        </Link>
        <Link className="text-link" to="/shop/home">
          <ArrowLeft size={15} /> Back to the store
        </Link>
        <Outlet />
      </main>
    </div>
  );
}
