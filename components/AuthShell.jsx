import Head from 'next/head';
import Link from 'next/link';

export default function AuthShell({ title, description, eyebrow, children, footerText, footerLinkText, footerHref }) {
  return (
    <>
      <Head>
        <title>{title} — Josephdeliverycompany</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="auth-page">
        <section className="auth-brand-panel" aria-label="Josephdeliverycompany">
          <div className="auth-brand-content">
            <Link href="/" className="auth-brand-mark"><span className="auth-brand-dot" /><span>JOSEPH<span>DELIVERY</span></span></Link>
            <div className="auth-brand-copy">
              <p className="auth-kicker">Global logistics, made clear</p>
              <h2>Move what matters.<br /><em>Know where it is.</em></h2>
              <p>One secure workspace for shipments, delivery updates, and the next step in your journey.</p>
            </div>
            <div className="auth-brand-footer"><span><i className="fa-solid fa-shield-halved" /> Secure account access</span><span><i className="fa-solid fa-arrow-right" /> Worldwide reach</span></div>
          </div>
          <div className="auth-grid-glow" aria-hidden="true" />
        </section>
        <section className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-mobile-brand"><Link href="/" className="auth-brand-mark"><span className="auth-brand-dot" /><span>JOSEPH<span>DELIVERY</span></span></Link></div>
            <p className="auth-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="auth-description">{description}</p>
            {children}
            <p className="auth-switch">{footerText}{' '}<Link href={footerHref}>{footerLinkText} <i className="fa-solid fa-arrow-right" /></Link></p>
            <Link href="/" className="auth-back-link"><i className="fa-solid fa-arrow-left" /> Back to website</Link>
          </div>
        </section>
      </main>
    </>
  );
}
