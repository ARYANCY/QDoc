import { useEffect } from "react";

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "Q-Rakshak | Page not found";
  }, []);

  return <main className="not-found-page"><div className="not-found-mark">404</div><p className="eyebrow">Page unavailable</p><h1>We could not find that page.</h1><p>The address may be incorrect or the page may have moved.</p><a className="button-primary" href="/">Return to Q-Rakshak</a></main>;
}
