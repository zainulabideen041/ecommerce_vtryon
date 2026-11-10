export default function LoadingScreen() {
  return (
    <div className="loading-page" role="status">
      <span className="wordmark">LUXAR</span>
      <div className="loading-rule" aria-hidden="true" />
      <p>Opening the wardrobe…</p>
    </div>
  );
}
