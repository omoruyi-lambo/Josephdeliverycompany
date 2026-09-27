import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Joseph Delivery Company - International Logistics" />
        <meta property="og:description" content="Professional international delivery and logistics services. Track shipments, get quotes, and manage your global shipping needs." />
        <meta property="og:image" content="/images/logo.png" />
        <meta property="og:url" content="https://josephdeliverycompany.com" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Joseph Delivery Company - International Logistics" />
        <meta name="twitter:description" content="Professional international delivery and logistics services. Track shipments, get quotes, and manage your global shipping needs." />
        <meta name="twitter:image" content="/images/logo.png" />
        
        {/* Font Awesome 6 Free */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Inter typeface */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
