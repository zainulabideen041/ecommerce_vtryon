import { Link } from "react-router-dom";
export default function UnauthPage() {
  return (
    <div>
      <header className="standalone-header">
        <Link className="wordmark" to="/shop/home">
          LUXAR
        </Link>
      </header>
      <main className="status-page">
        <p className="eyebrow">A PRIVATE SPACE</p>
        <h1>Let's take you back.</h1>
        <p>
          This page isn't available to your account. Your wardrobe awaits in the
          store.
        </p>
        <Link className="solid-link" to="/shop/home">
          Return to Luxar
        </Link>
      </main>
    </div>
  );
}
