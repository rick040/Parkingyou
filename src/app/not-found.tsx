import Link from "next/link";
import { PyButton } from "@/components/py/Button";
import { alleSteden } from "@/lib/content";

/**
 * The header and footer link to the full information architecture from
 * docs/IA.md. Several of those templates are not built yet, so this page is
 * what a visitor hits in the meantime. It is a real 404: correct status, no
 * redirect to the homepage, and a route onward rather than a dead end.
 */
export default function NotFound() {
  return (
    <main className="py-section">
      <div className="py-container" style={{ maxWidth: 680 }}>
        <h1>Deze pagina bestaat niet</h1>
        <p>
          Misschien is de link verouderd of staat er een typefout in het adres.
          Kies hieronder een stad, dan zie je meteen waar je kunt parkeren.
        </p>

        <div className="py-detail-actions" style={{ marginTop: 24 }}>
          <PyButton href="/" variant="primary">
            Naar de homepage
          </PyButton>
          <PyButton href="/klantenservice" variant="outline" icon="phone">
            Vraag hulp
          </PyButton>
        </div>

        <h2 style={{ marginTop: 40 }}>Parkeren per stad</h2>
        <div className="py-payment-grid">
          {alleSteden().map((stad) => (
            <Link
              key={stad.slug}
              href={`/parkeren/${stad.slug}`}
              className="py-payment-badge"
            >
              {stad.naam}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
